using Tienda.Aplicacion.Productos;
using Tienda.Aplicacion.Productos.Datos;

namespace Tienda.Api.Rutas;

public static class RutasProducto
{
    public record SolicitudDesactivacion(string? Motivo);

    public static void MapearRutasProducto(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/productos").WithTags("Productos");
        // TODO: .RequireAuthorization("inventario") cuando entre el modulo de roles.

        grupo.MapGet("/", async (string? busqueda, bool? incluirInactivos, int? pagina, int? elementosPorPagina, IServicioProducto servicio, CancellationToken tokenCancelacion)
            => Results.Ok(await servicio.ListarAsync(busqueda, incluirInactivos ?? false, pagina ?? 1, elementosPorPagina ?? 20, tokenCancelacion)));

        grupo.MapPost("/", async (SolicitudCrearProducto solicitud, IServicioProducto servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.CrearAsync(solicitud, tokenCancelacion);
            return resultado.EsExitoso
                ? Results.Created($"/api/productos/{resultado.Valor!.Identificador}", resultado.Valor)
                : Results.BadRequest(new { error = resultado.Error });
        });

        grupo.MapPost("/{identificador:guid}/desactivar", async (Guid identificador, SolicitudDesactivacion? solicitud, IServicioProducto servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.DesactivarAsync(identificador, solicitud?.Motivo, tokenCancelacion);
            return resultado.EsExitoso ? Results.NoContent() : Results.NotFound(new { error = resultado.Error });
        });

        grupo.MapPost("/{identificador:guid}/activar", async (Guid identificador, IServicioProducto servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.ActivarAsync(identificador, tokenCancelacion);
            return resultado.EsExitoso ? Results.NoContent() : Results.NotFound(new { error = resultado.Error });
        });
    }
}