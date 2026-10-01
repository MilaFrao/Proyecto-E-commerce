using Tienda.Application.Lookups;

namespace Tienda.Api.Endpoints;

public static class LookupEndpoints
{
    public record CreateCategoryRequest(string Name, Guid? ParentId);
    public record CreateBrandRequest(string Name);

    public static void MapLookupEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/lookups").WithTags("Listas");

        group.MapGet("/categories", async (ILookupService svc, CancellationToken ct)
            => Results.Ok(await svc.GetCategoriesAsync(ct)));

        group.MapGet("/brands", async (ILookupService svc, CancellationToken ct)
            => Results.Ok(await svc.GetBrandsAsync(ct)));

        group.MapPost("/categories", async (CreateCategoryRequest body, ILookupService svc, CancellationToken ct) =>
        {
            var result = await svc.CreateCategoryAsync(body.Name, body.ParentId, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/brands", async (CreateBrandRequest body, ILookupService svc, CancellationToken ct) =>
        {
            var result = await svc.CreateBrandAsync(body.Name, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        });
    }
}
