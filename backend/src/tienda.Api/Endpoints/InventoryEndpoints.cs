using Tienda.Application.Inventory;

namespace Tienda.Api.Endpoints;

public static class InventoryEndpoints
{
    public record QuantityRequest(int Quantity, string? Notes);

    public static void MapInventoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/inventory").WithTags("Inventario");
        // TODO: .RequireAuthorization("inventario") cuando entre el modulo de roles.

        // Buscador de variantes con su stock (pantalla de inventario)
        group.MapGet("/variants", async (string? search, IInventoryService svc, CancellationToken ct)
            => Results.Ok(await svc.SearchVariantsAsync(search, ct)));

        group.MapGet("/variants/{variantId:guid}/stock", async (Guid variantId, IInventoryService svc, CancellationToken ct) =>
        {
            var result = await svc.GetStockAsync(variantId, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        group.MapGet("/variants/{variantId:guid}/movements", async (Guid variantId, IInventoryService svc, CancellationToken ct)
            => Results.Ok(await svc.GetMovementHistoryAsync(variantId, ct)));

        group.MapPost("/variants/{variantId:guid}/entries", async (Guid variantId, QuantityRequest body, IInventoryService svc, CancellationToken ct) =>
        {
            var result = await svc.RegisterEntryAsync(variantId, body.Quantity, body.Notes, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/variants/{variantId:guid}/supply", async (Guid variantId, QuantityRequest body, IInventoryService svc, CancellationToken ct) =>
        {
            var result = await svc.SupplyToStoreAsync(variantId, body.Quantity, body.Notes, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/variants/{variantId:guid}/sales", async (Guid variantId, QuantityRequest body, IInventoryService svc, CancellationToken ct) =>
        {
            var result = await svc.RegisterSaleAsync(variantId, body.Quantity, body.Notes, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        });
    }
}
