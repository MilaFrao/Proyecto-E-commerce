using Tienda.Domain.Common;

namespace Tienda.Domain.Catalog;

/// <summary>
/// Categoria auto-referenciada: soporta subcategorias sin cambiar el esquema
/// (Ropa -> Camisas -> Manga larga). ParentId nulo = categoria raiz.
/// </summary>
public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public Category? Parent { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<Category> Children { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
