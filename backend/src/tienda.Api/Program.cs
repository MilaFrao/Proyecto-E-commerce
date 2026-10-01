using System.Text.Json.Serialization;
using Tienda.Api.Rutas;
using Tienda.Api.ManejoSolicitudes;
using Tienda.Aplicacion;
using Tienda.Infraestructura;
using Tienda.Infraestructura.Persistencia.DatosIniciales;

var constructor = WebApplication.CreateBuilder(args);

constructor.Services.AgregarAplicacion();
constructor.Services.AgregarInfraestructura(constructor.Configuration);

// Los enums viajan como texto ("Entrada", "Activo"), no como numeros.
constructor.Services.ConfigureHttpJsonOptions(opciones =>
    opciones.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

constructor.Services.AddEndpointsApiExplorer();
constructor.Services.AddSwaggerGen();

const string PoliticaCorsInterfaz = "interfaz";
constructor.Services.AddCors(opciones =>
    opciones.AddPolicy(PoliticaCorsInterfaz, politica => politica
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var aplicacion = constructor.Build();

aplicacion.UseMiddleware<MiddlewareManejoExcepciones>();

if (aplicacion.Environment.IsDevelopment())
{
    aplicacion.UseSwagger();
    aplicacion.UseSwaggerUI();

    // Aplica migraciones pendientes y carga datos de prueba si la base esta vacia.
    await SembradorDesarrollo.CargarDatosPruebaAsync(aplicacion.Services);
}

aplicacion.UseCors(PoliticaCorsInterfaz);

aplicacion.MapGet("/salud", () => Results.Ok(new { estado = "correcto", fechaHora = DateTime.UtcNow }))
   .WithTags("Sistema");

// MVP 1 - interno
aplicacion.MapearRutasProducto();
aplicacion.MapearRutasInventario();

// Listas compartidas (categorias, marcas)
aplicacion.MapearRutasListas();

// MVP 2 - publico
aplicacion.MapearRutasCatalogo();

aplicacion.Run();