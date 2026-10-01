using Tienda.Application.Catalog;

namespace Tienda.Api.Endpoints;

public static class CatalogEndpoints
{
    public static void MapCatalogEndpoints(this IEndpointRouteBuilder app)
    {
        // Publico y sin autenticacion: es la regla de la seccion 15.
        var group = app.MapGroup("/api/catalog").WithTags("Catalogo");

        group.MapGet("/filters", async (ICatalogService svc, CancellationToken ct)
            => Results.Ok(await svc.GetFiltersAsync(ct)));

        group.MapGet("/products", async (
            string? search, Guid? categoryId, Guid? brandId,
            string? color, string? size,
            decimal? minPrice, decimal? maxPrice,
            string? sortBy, int? page, int? pageSize,
            ICatalogService svc, CancellationToken ct) =>
        {
            var query = new CatalogQuery(
                search, categoryId, brandId, color, size, minPrice, maxPrice,
                sortBy ?? "name", page ?? 1, Math.Clamp(pageSize ?? 24, 1, 100));

            return Results.Ok(await svc.BrowseAsync(query, ct));
        });

        group.MapGet("/products/{id:guid}", async (Guid id, ICatalogService svc, CancellationToken ct) =>
        {
            var product = await svc.GetByIdAsync(id, ct);
            return product is null ? Results.NotFound() : Results.Ok(product);
        });
    }
}
