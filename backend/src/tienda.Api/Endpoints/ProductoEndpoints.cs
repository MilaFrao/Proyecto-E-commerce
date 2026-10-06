using Microsoft.AspNetCore.Mvc;
using Tienda.Api.Auth;
using Tienda.Application.Abstractions;
using Tienda.Application.Productos;
using Tienda.Application.Productos.Dtos;

namespace Tienda.Api.Endpoints;

public static class ProductoEndpoints
{
    public record DesactivarProductoRequest(string? Motivo);

    public static void MapProductoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/productos").WithTags("Productos")
            .RequireAuthorization(Politicas.Inventario);

        group.MapGet("/", async (string? busqueda, bool? incluirInactivos, int? pagina, int? elementosPorPagina, IProductoService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ListarAsync(busqueda, incluirInactivos ?? false, pagina ?? 1, elementosPorPagina ?? 20, cancellationToken)));

        group.MapPost("/", async (CrearProductoRequest request, IProductoService service, CancellationToken cancellationToken) =>
        {
            var result = await service.CrearAsync(request, cancellationToken);
            return result.IsSuccess
                ? Results.Created($"/api/productos/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        // Sube la foto y devuelve su URL; el front la manda luego en CrearProductoRequest.UrlImagen.
        group.MapPost("/imagenes", async (IFormFile archivo, IAlmacenImagenes almacen, CancellationToken cancellationToken) =>
        {
            await using var contenido = archivo.OpenReadStream();
            var result = await almacen.GuardarAsync(contenido, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(new { url = result.Value })
                : Results.BadRequest(new { error = result.Error });
        })
            .DisableAntiforgery() // La API usa Bearer en una cabecera, no cookies: no hay sesion que falsificar.
            .WithMetadata(new RequestSizeLimitAttribute(8 * 1024 * 1024));

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