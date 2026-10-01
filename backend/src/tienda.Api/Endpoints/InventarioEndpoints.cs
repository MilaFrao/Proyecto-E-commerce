using Tienda.Application.Inventario;

namespace Tienda.Api.Endpoints;

public static class InventarioEndpoints
{
    public record CantidadRequest(int Cantidad, string? Notas);

    public static void MapInventarioEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/inventario").WithTags("Inventario");
        // TODO: .RequireAuthorization("inventario") cuando entre el modulo de roles.

        // Buscador de variantes con su stock (pantalla de inventario)
        group.MapGet("/variantes", async (string? busqueda, IInventarioService service, CancellationToken cancellationToken)
            => Results.Ok(await service.BuscarVariantesAsync(busqueda, cancellationToken)));

        group.MapGet("/variantes/{varianteId:guid}/existencias", async (Guid varianteId, IInventarioService service, CancellationToken cancellationToken) =>
        {
            var result = await service.ObtenerExistenciasAsync(varianteId, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        group.MapGet("/variantes/{varianteId:guid}/movimientos", async (Guid varianteId, IInventarioService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ObtenerHistorialMovimientosAsync(varianteId, cancellationToken)));

        group.MapPost("/variantes/{varianteId:guid}/entradas", async (Guid varianteId, CantidadRequest request, IInventarioService service, CancellationToken cancellationToken) =>
        {
            var result = await service.RegistrarEntradaAsync(varianteId, request.Cantidad, request.Notas, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/variantes/{varianteId:guid}/surtido", async (Guid varianteId, CantidadRequest request, IInventarioService service, CancellationToken cancellationToken) =>
        {
            var result = await service.ReabastecerTiendaAsync(varianteId, request.Cantidad, request.Notas, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/variantes/{varianteId:guid}/ventas", async (Guid varianteId, CantidadRequest request, IInventarioService service, CancellationToken cancellationToken) =>
        {
            var result = await service.RegistrarVentaAsync(varianteId, request.Cantidad, request.Notas, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        });
    }
}