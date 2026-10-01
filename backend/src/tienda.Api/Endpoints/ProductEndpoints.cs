using Tienda.Application.Products;
using Tienda.Application.Products.Dtos;

namespace Tienda.Api.Endpoints;

public static class ProductEndpoints
{
    public record DeactivateRequest(string? Reason);

    public static void MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products").WithTags("Productos");
        // TODO: .RequireAuthorization("inventario") cuando entre el modulo de roles.

        group.MapGet("/", async (string? search, bool? includeInactive, int? page, int? pageSize, IProductService svc, CancellationToken ct)
            => Results.Ok(await svc.ListAsync(search, includeInactive ?? false, page ?? 1, pageSize ?? 20, ct)));

        group.MapPost("/", async (CreateProductRequest body, IProductService svc, CancellationToken ct) =>
        {
            var result = await svc.CreateAsync(body, ct);
            return result.IsSuccess
                ? Results.Created($"/api/products/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/{id:guid}/deactivate", async (Guid id, DeactivateRequest? body, IProductService svc, CancellationToken ct) =>
        {
            var result = await svc.DeactivateAsync(id, body?.Reason, ct);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });

        group.MapPost("/{id:guid}/activate", async (Guid id, IProductService svc, CancellationToken ct) =>
        {
            var result = await svc.ActivateAsync(id, ct);
            return result.IsSuccess ? Results.NoContent() : Results.NotFound(new { error = result.Error });
        });
    }
}
