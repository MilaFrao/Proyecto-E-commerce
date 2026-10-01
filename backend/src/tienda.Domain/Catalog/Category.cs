using Tienda.Dominio.Comun;

namespace Tienda.Dominio.Catalogo;

/// <summary>
/// Categoria auto-referenciada: soporta subcategorias sin cambiar el esquema
/// (Ropa -> Camisas -> Manga larga). ParentId nulo = categoria raiz.
/// </summary>
public class Categoria : EntidadBase
{
    public string Nombre { get; set; } = string.Empty;
    public string SegmentoUrl { get; set; } = string.Empty;
    public Guid? IdentificadorPadre { get; set; }
    public Categoria? CategoriaPadre { get; set; }
    public bool EstaActiva { get; set; } = true;
    public int Orden { get; set; }

    public ICollection<Categoria> Subcategorias { get; set; } = new List<Categoria>();
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
