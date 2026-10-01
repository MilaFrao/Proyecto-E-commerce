using Tienda.Domain.Catalog;
using Tienda.Domain.Common;
using Tienda.Domain.Enums;

namespace Tienda.Domain.Inventory;

/// <summary>
/// Cantidad de una variante en UNA ubicacion. Una fila por (variante, ubicacion).
///
/// Este modelo por-ubicacion es lo que permite que manana entre una segunda
/// sucursal agregando una sola columna (StoreId) en vez de rehacer el inventario.
/// </summary>
public class StockLevel : BaseEntity
{
    public Guid ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    public StockLocation Location { get; set; }
    public int Quantity { get; set; }

    public void Increase(int amount)
    {
        if (amount <= 0) throw new DomainException("La cantidad a sumar debe ser mayor que cero.");
        Quantity += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Decrease(int amount)
    {
        if (amount <= 0) throw new DomainException("La cantidad a restar debe ser mayor que cero.");
        if (amount > Quantity)
            throw new DomainException($"Stock insuficiente en {Location}: hay {Quantity}, se piden {amount}.");
        Quantity -= amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
