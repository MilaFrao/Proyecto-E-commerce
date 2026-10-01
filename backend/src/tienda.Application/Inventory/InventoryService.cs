using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Common;
using Tienda.Application.Inventory.Dtos;
using Tienda.Domain.Catalog;
using Tienda.Domain.Enums;
using Tienda.Domain.Inventory;

namespace Tienda.Application.Inventory;

/// <summary>
/// Corazon del MVP 1. Toda alteracion de stock pasa por aqui y deja
/// su rastro en StockMovement: no se toca StockLevel desde ningun otro lado.
/// </summary>
public class InventoryService : IInventoryService
{
    private readonly IAppDbContext _db;
    private readonly IDateTimeProvider _clock;

    public InventoryService(IAppDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<Result<StockSummaryDto>> RegisterEntryAsync(Guid variantId, int quantity, string? notes, CancellationToken ct = default)
    {
        if (quantity <= 0) return Result.Failure<StockSummaryDto>("La cantidad debe ser mayor que cero.");

        var variant = await LoadVariantAsync(variantId, ct);
        if (variant is null) return Result.Failure<StockSummaryDto>("La variante no existe.");

        var warehouse = GetOrCreateLevel(variant, StockLocation.Warehouse);
        warehouse.Increase(quantity);

        RecordMovement(variant, MovementType.Entry, quantity, null, StockLocation.Warehouse, notes);

        await _db.SaveChangesAsync(ct);
        return Result.Success(Summarize(variant));
    }

    public async Task<Result<StockSummaryDto>> SupplyToStoreAsync(Guid variantId, int quantity, string? notes, CancellationToken ct = default)
    {
        if (quantity <= 0) return Result.Failure<StockSummaryDto>("La cantidad debe ser mayor que cero.");

        var variant = await LoadVariantAsync(variantId, ct);
        if (variant is null) return Result.Failure<StockSummaryDto>("La variante no existe.");

        var warehouse = GetOrCreateLevel(variant, StockLocation.Warehouse);
        var store     = GetOrCreateLevel(variant, StockLocation.Store);

        if (warehouse.Quantity < quantity)
            return Result.Failure<StockSummaryDto>($"Stock insuficiente en deposito: hay {warehouse.Quantity}, se piden {quantity}.");

        warehouse.Decrease(quantity);
        store.Increase(quantity);

        RecordMovement(variant, MovementType.Transfer, quantity, StockLocation.Warehouse, StockLocation.Store, notes);

        await _db.SaveChangesAsync(ct);
        return Result.Success(Summarize(variant));
    }

    public async Task<Result<StockSummaryDto>> RegisterSaleAsync(Guid variantId, int quantity, string? notes, CancellationToken ct = default)
    {
        if (quantity <= 0) return Result.Failure<StockSummaryDto>("La cantidad debe ser mayor que cero.");

        var variant = await LoadVariantAsync(variantId, ct);
        if (variant is null) return Result.Failure<StockSummaryDto>("La variante no existe.");

        var store = GetOrCreateLevel(variant, StockLocation.Store);
        if (store.Quantity < quantity)
            return Result.Failure<StockSummaryDto>($"No hay unidades surtidas suficientes: hay {store.Quantity}, se piden {quantity}.");

        store.Decrease(quantity);
        RecordMovement(variant, MovementType.Sale, -quantity, StockLocation.Store, null, notes);

        await _db.SaveChangesAsync(ct);
        return Result.Success(Summarize(variant));
    }

    public async Task<Result<StockSummaryDto>> GetStockAsync(Guid variantId, CancellationToken ct = default)
    {
        var variant = await LoadVariantAsync(variantId, ct);
        return variant is null
            ? Result.Failure<StockSummaryDto>("La variante no existe.")
            : Result.Success(Summarize(variant));
    }

    public async Task<IReadOnlyList<StockMovementDto>> GetMovementHistoryAsync(Guid variantId, CancellationToken ct = default)
        => await _db.StockMovements
            .Where(m => m.ProductVariantId == variantId)
            .OrderByDescending(m => m.OccurredAt)
            .Select(m => new StockMovementDto(
                m.Id, m.ProductVariantId, m.Type, m.Quantity,
                m.FromLocation, m.ToLocation,
                m.ResultingWarehouseQuantity, m.ResultingStoreQuantity,
                m.OccurredAt, m.Notes))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<VariantStockDto>> SearchVariantsAsync(string? search, CancellationToken ct = default)
    {
        var q = _db.ProductVariants
            .AsNoTracking()
            .Where(v => v.IsActive && v.Product!.Status == ProductStatus.Active);

        var term = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLower();
        if (term is not null)
        {
            q = q.Where(v =>
                v.Sku.ToLower().Contains(term) ||
                v.Product!.Name.ToLower().Contains(term) ||
                v.Product.Reference.ToLower().Contains(term));
        }

        return await q
            .OrderBy(v => v.Product!.Name).ThenBy(v => v.Color).ThenBy(v => v.Size)
            .Take(50)
            .Select(v => new VariantStockDto(
                v.Id,
                v.Product!.Name,
                v.Product.Reference,
                v.Sku,
                v.Color,
                v.Size,
                v.StockLevels.Where(s => s.Location == StockLocation.Warehouse).Sum(s => s.Quantity),
                v.StockLevels.Where(s => s.Location == StockLocation.Store).Sum(s => s.Quantity)))
            .ToListAsync(ct);
    }

    // ---------------------------------------------------------------- helpers

    private Task<ProductVariant?> LoadVariantAsync(Guid id, CancellationToken ct)
        => _db.ProductVariants
            .Include(v => v.StockLevels)
            .FirstOrDefaultAsync(v => v.Id == id, ct);

    private StockLevel GetOrCreateLevel(ProductVariant variant, StockLocation location)
    {
        var level = variant.StockLevels.FirstOrDefault(s => s.Location == location);
        if (level is not null) return level;

        level = new StockLevel
        {
            ProductVariantId = variant.Id,
            Location = location,
            Quantity = 0
        };
        variant.StockLevels.Add(level);
        _db.StockLevels.Add(level);
        return level;
    }

    private void RecordMovement(ProductVariant variant, MovementType type, int quantity,
        StockLocation? from, StockLocation? to, string? notes)
    {
        var warehouse = variant.StockLevels.FirstOrDefault(s => s.Location == StockLocation.Warehouse)?.Quantity ?? 0;
        var store     = variant.StockLevels.FirstOrDefault(s => s.Location == StockLocation.Store)?.Quantity ?? 0;

        _db.StockMovements.Add(new StockMovement
        {
            ProductVariantId = variant.Id,
            Type = type,
            Quantity = quantity,
            FromLocation = from,
            ToLocation = to,
            ResultingWarehouseQuantity = warehouse,
            ResultingStoreQuantity = store,
            OccurredAt = _clock.UtcNow,
            Notes = notes
        });
    }

    private static StockSummaryDto Summarize(ProductVariant variant) => new(
        variant.Id,
        variant.Sku,
        variant.Color,
        variant.Size,
        variant.StockLevels.FirstOrDefault(s => s.Location == StockLocation.Warehouse)?.Quantity ?? 0,
        variant.StockLevels.FirstOrDefault(s => s.Location == StockLocation.Store)?.Quantity ?? 0);
}
