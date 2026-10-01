using Tienda.Domain.Common;

namespace Tienda.Domain.Catalog;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}
