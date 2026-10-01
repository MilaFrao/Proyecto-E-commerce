namespace Tienda.Application.Inventory.Dtos;

/// <summary>Los tres numeros de la seccion 6 del documento de requerimientos.</summary>
public record StockSummaryDto(
    Guid VariantId,
    string Sku,
    string Color,
    string Size,
    int WarehouseQuantity,
    int StoreQuantity)
{
    /// <summary>Disponible para venta == lo que esta surtido en tienda. Nunca el total.</summary>
    public int AvailableForSale => StoreQuantity;
    public int TotalQuantity => WarehouseQuantity + StoreQuantity;
}
