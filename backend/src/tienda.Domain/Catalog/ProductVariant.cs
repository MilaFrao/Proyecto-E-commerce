using Tienda.Domain.Common;
using Tienda.Domain.Inventory;

namespace Tienda.Domain.Catalog;

/// <summary>
/// Combinacion concreta color + talla. Es la unidad real de inventario:
/// todo el stock y todos los movimientos cuelgan de aqui, nunca del Product.
/// </summary>
public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public string Sku { get; set; } = string.Empty; // unico, para codigo de barras
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;

    /// <summary>Si es null, hereda el precio del producto.</summary>
    public decimal? RetailPriceOverride { get; set; }
    public decimal? WholesalePriceOverride { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<StockLevel> StockLevels { get; set; } = new List<StockLevel>();
    public ICollection<StockMovement> Movements { get; set; } = new List<StockMovement>();
}
