using Tienda.Dominio.Comun;
using Tienda.Dominio.Inventario;

namespace Tienda.Dominio.Catalogo;

/// <summary>
/// Combinacion concreta color + talla. Es la unidad real de inventario:
/// todo el stock y todos los movimientos cuelgan de aqui, nunca del Product.
/// </summary>
public class VarianteProducto : EntidadBase
{
    public Guid ProductoId { get; set; }
    public Producto? Producto { get; set; }

    public string CodigoSku { get; set; } = string.Empty; // unico, para codigo de barras
    public string Color { get; set; } = string.Empty;
    public string Talla { get; set; } = string.Empty;

    /// <summary>Si es null, hereda el precio del producto.</summary>
    public decimal? PrecioVentaAlternativo { get; set; }
    public decimal? PrecioMayoristaAlternativo { get; set; }

    public bool EstaActiva { get; set; } = true;

    public ICollection<NivelExistencias> NivelesExistencias { get; set; } = new List<NivelExistencias>();
    public ICollection<MovimientoExistencias> Movimientos { get; set; } = new List<MovimientoExistencias>();
}
