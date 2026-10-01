using Tienda.Domain.Common;

namespace Tienda.Domain.Catalog;

public class Brand : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
