namespace Tienda.Application.Inventory.Dtos;

/// <summary>Una variante con su producto y sus tres numeros de stock. Alimenta la pantalla de inventario.</summary>
public record VariantStockDto(
    Guid VariantId,
    string ProductName,
    string Reference,
    string Sku,
    string Color,
    string Size,
    int WarehouseQuantity,
    int StoreQuantity)
{
    public int AvailableForSale => StoreQuantity;
    public int TotalQuantity => WarehouseQuantity + StoreQuantity;
}
