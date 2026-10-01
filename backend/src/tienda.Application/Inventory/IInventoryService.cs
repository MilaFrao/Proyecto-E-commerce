using Tienda.Application.Common;
using Tienda.Application.Inventory.Dtos;

namespace Tienda.Application.Inventory;

public interface IInventoryService
{
    /// <summary>Entrada de mercancia. Siempre ingresa al deposito, nunca directo a tienda.</summary>
    Task<Result<StockSummaryDto>> RegisterEntryAsync(Guid variantId, int quantity, string? notes, CancellationToken ct = default);

    /// <summary>Surtido: mueve unidades de deposito a tienda. Aqui es donde nace la disponibilidad.</summary>
    Task<Result<StockSummaryDto>> SupplyToStoreAsync(Guid variantId, int quantity, string? notes, CancellationToken ct = default);

    /// <summary>Venta: descuenta de tienda. Falla si no hay surtido suficiente.</summary>
    Task<Result<StockSummaryDto>> RegisterSaleAsync(Guid variantId, int quantity, string? notes, CancellationToken ct = default);

    Task<Result<StockSummaryDto>> GetStockAsync(Guid variantId, CancellationToken ct = default);

    /// <summary>Busca variantes activas por nombre, referencia o SKU y devuelve su stock. Maximo 50.</summary>
    Task<IReadOnlyList<VariantStockDto>> SearchVariantsAsync(string? search, CancellationToken ct = default);

    Task<IReadOnlyList<StockMovementDto>> GetMovementHistoryAsync(Guid variantId, CancellationToken ct = default);
}
