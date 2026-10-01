using Tienda.Application.Productos;
using Tienda.Application.Productos.Dtos;

namespace Tienda.Api.Endpoints;

public static class ProductoEndpoints
{
    public record DesactivarProductoRequest(string? Motivo);

    public static void MapProductoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/productos").WithTags("Productos");
        // TODO: .RequireAuthorization("inventario") cuando entre el modulo de roles.

        group.MapGet("/", async (string? busqueda, bool? incluirInactivos, int? pagina, int? elementosPorPagina, IProductoService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ListarAsync(busqueda, incluirInactivos ?? false, pagina ?? 1, elementosPorPagina ?? 20, cancellationToken)));

        group.MapPost("/", async (CrearProductoRequest request, IProductoService service, CancellationToken cancellationToken) =>
        {
            var result = await service.CrearAsync(request, cancellationToken);
            return result.IsSuccess
                ? Results.Created($"/api/productos/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/{id:guid}/desactivar", async (Guid id, DesactivarProductoRequest? request, IProductoService service, CancellationToken cancellationToken) =>
        {
            var result = await service.DesactivarAsync(id, request?.Motivo, cancellationToken);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });

        group.MapPost("/{id:guid}/activar", async (Guid id, IProductoService service, CancellationToken cancellationToken) =>
        {
            var result = await service.ActivarAsync(id, cancellationToken);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });
    }
}