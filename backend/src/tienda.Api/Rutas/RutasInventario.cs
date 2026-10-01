using Tienda.Aplicacion.Inventario;

namespace Tienda.Api.Rutas;

public static class RutasInventario
{
    public record SolicitudCantidad(int Cantidad, string? Notas);

    public static void MapearRutasInventario(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/inventario").WithTags("Inventario");
        // TODO: .RequireAuthorization("inventario") cuando entre el modulo de roles.

        // Buscador de variantes con su stock (pantalla de inventario)
        grupo.MapGet("/variantes", async (string? busqueda, IServicioInventario servicio, CancellationToken tokenCancelacion)
            => Results.Ok(await servicio.BuscarVariantesAsync(busqueda, tokenCancelacion)));

        grupo.MapGet("/variantes/{varianteId:guid}/existencias", async (Guid varianteId, IServicioInventario servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.ObtenerExistenciasAsync(varianteId, tokenCancelacion);
            return resultado.EsExitoso ? Results.Ok(resultado.Valor) : Results.NotFound(new { error = resultado.Error });
        });

        grupo.MapGet("/variantes/{varianteId:guid}/movimientos", async (Guid varianteId, IServicioInventario servicio, CancellationToken tokenCancelacion)
            => Results.Ok(await servicio.ObtenerHistorialMovimientosAsync(varianteId, tokenCancelacion)));

        grupo.MapPost("/variantes/{varianteId:guid}/entradas", async (Guid varianteId, SolicitudCantidad solicitud, IServicioInventario servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.RegistrarEntradaAsync(varianteId, solicitud.Cantidad, solicitud.Notas, tokenCancelacion);
            return resultado.EsExitoso ? Results.Ok(resultado.Valor) : Results.BadRequest(new { error = resultado.Error });
        });

        grupo.MapPost("/variantes/{varianteId:guid}/surtido", async (Guid varianteId, SolicitudCantidad solicitud, IServicioInventario servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.ReabastecerTiendaAsync(varianteId, solicitud.Cantidad, solicitud.Notas, tokenCancelacion);
            return resultado.EsExitoso ? Results.Ok(resultado.Valor) : Results.BadRequest(new { error = resultado.Error });
        });

        grupo.MapPost("/variantes/{varianteId:guid}/ventas", async (Guid varianteId, SolicitudCantidad solicitud, IServicioInventario servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.RegistrarVentaAsync(varianteId, solicitud.Cantidad, solicitud.Notas, tokenCancelacion);
            return resultado.EsExitoso ? Results.Ok(resultado.Valor) : Results.BadRequest(new { error = resultado.Error });
        });
    }
}