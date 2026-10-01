using System.Text.Json.Serialization;
using Tienda.Api.Endpoints;
using Tienda.Api.Middleware;
using Tienda.Application;
using Tienda.Infrastructure;
using Tienda.Infrastructure.Persistence.Seed;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Los enums viajan como texto ("Entry", "Active"), no como numeros: el front los lee tal cual.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

const string FrontendCors = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCors, policy => policy
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Aplica migraciones pendientes y carga datos de prueba si la base esta vacia.
    await DevSeeder.SeedAsync(app.Services);
}

app.UseCors(FrontendCors);

app.MapGet("/health", () => Results.Ok(new { status = "ok", at = DateTime.UtcNow }))
   .WithTags("Sistema");

// MVP 1 - interno
app.MapProductEndpoints();
app.MapInventoryEndpoints();

// Listas compartidas (categorias, marcas)
app.MapLookupEndpoints();

// MVP 2 - publico
app.MapCatalogEndpoints();

app.Run();
