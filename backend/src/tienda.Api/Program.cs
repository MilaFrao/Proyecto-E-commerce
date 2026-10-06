using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using Tienda.Api.Auth;
using Tienda.Api.Endpoints;
using Tienda.Api.Middleware;
using Tienda.Application;
using Tienda.Application.Abstractions;
using Tienda.Infrastructure;
using Tienda.Infrastructure.Persistence.Seed;
using Tienda.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.ContentRootPath);
builder.Services.AddJwtAuth(builder.Configuration);

// Quien hace cada peticion: firma los movimientos de inventario (MovimientoExistencias.RealizadoPorUsuarioId).
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUsuarioActual, UsuarioActualHttp>();

// Los enums viajan como texto ("Entrada", "Activo"), no como numeros.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Swagger lee estas opciones (las de MVC), no las de arriba: sin esto mostraria los enums como numeros.
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Boton "Authorize" en Swagger: pega el token que devuelve /api/auth/login (sin la palabra Bearer).
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Pega solo el token, sin la palabra Bearer."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

const string FrontendCorsPolicy = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCorsPolicy, policy => policy
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

// Limite de intentos de login por direccion IP. Detras de un proxy inverso habra que configurar ForwardedHeaders
// para que RemoteIpAddress sea la del cliente real y no la del proxy.
var intentosLogin = int.TryParse(builder.Configuration["RateLimit:LoginPorMinuto"], out var limite) && limite > 0 ? limite : 5;
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(AuthEndpoints.PoliticaLimiteLogin, context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "desconocida",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = intentosLogin, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Aplica migraciones pendientes y carga datos de prueba si la base esta vacia.
    await DevSeeder.SeedAsync(app.Services);
}

// Roles y primer administrador (solo si hay seccion "Admin" en la configuracion). Va despues de las migraciones.
await IdentitySeeder.EnsureAsync(app.Services, app.Configuration);

// El orden importa: CORS -> limite -> quien eres (Authentication) -> que puedes hacer (Authorization) -> rutas.
app.UseCors(FrontendCorsPolicy);

// Fotos de productos: publicas, con nombre aleatorio (nunca cambian, por eso la cache larga).
var opcionesImagenes = app.Services.GetRequiredService<OpcionesImagenes>();
Directory.CreateDirectory(opcionesImagenes.Carpeta);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(opcionesImagenes.Carpeta),
    RequestPath = OpcionesImagenes.RutaPublica,
    OnPrepareResponse = contexto =>
    {
        contexto.Context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        contexto.Context.Response.Headers.CacheControl = "public,max-age=31536000,immutable";
    }
});

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/salud", () => Results.Ok(new { estado = "correcto", fechaHora = DateTime.UtcNow }))
   .WithTags("Sistema")
   .AllowAnonymous();

app.MapAuthEndpoints();

// MVP 1 - interno (protegido por rol)
app.MapProductoEndpoints();
app.MapInventarioEndpoints();
app.MapUsuariosEndpoints();

// Listas compartidas (categorias, marcas)
app.MapListasEndpoints();

// MVP 2 - publico
app.MapCatalogoEndpoints();

app.Run();
