using Tienda.Domain.Common;
using Tienda.Domain.Enums;

namespace Tienda.Domain.Catalog;

/// <summary>
/// Producto general. NO tiene stock propio: el stock vive en cada variante.
/// Los precios base viven aqui y cada variante puede sobreescribirlos si hace falta.
/// </summary>
public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty; // codigo interno, unico
    public string? Description { get; set; }

    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }

    public decimal RetailPrice { get; set; }
    public decimal WholesalePrice { get; set; }

    public ProductStatus Status { get; set; } = ProductStatus.Active;
    public DateTime? DeactivatedAt { get; set; }
    public string? DeactivationReason { get; set; }

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}
