using Tienda.Dominio.Comun;
using Tienda.Dominio.Enumeraciones;

namespace Tienda.Dominio.Catalogo;

/// <summary>
/// Producto general. NO tiene stock propio: el stock vive en cada variante.
/// Los precios base viven aqui y cada variante puede sobreescribirlos si hace falta.
/// </summary>
public class Producto : EntidadBase
{
    public string Nombre { get; set; } = string.Empty;
    public string Referencia { get; set; } = string.Empty; // codigo interno, unico
    public string? Descripcion { get; set; }

    public Guid CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public Guid? MarcaId { get; set; }
    public Marca? Marca { get; set; }

    public decimal PrecioVenta { get; set; }
    public decimal PrecioMayorista { get; set; }

    public EstadoProducto Estado { get; set; } = EstadoProducto.Activo;
    public DateTime? DesactivadoEn { get; set; }
    public string? MotivoDesactivacion { get; set; }

    public ICollection<VarianteProducto> Variantes { get; set; } = new List<VarianteProducto>();
    public ICollection<ImagenProducto> Imagenes { get; set; } = new List<ImagenProducto>();
}
