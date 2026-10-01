using Tienda.Domain.Common;

namespace Tienda.Domain.Catalogo;

/// <summary>
/// Categoria auto-referenciada: soporta subcategorias sin cambiar el esquema
/// (Ropa -> Camisas -> Manga larga). PadreId nulo = categoria raiz.
/// </summary>
public class Categoria : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid? PadreId { get; set; }
    public Categoria? CategoriaPadre { get; set; }
    public bool EstaActiva { get; set; } = true;
    public int Orden { get; set; }

    public ICollection<Categoria> Subcategorias { get; set; } = new List<Categoria>();
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}