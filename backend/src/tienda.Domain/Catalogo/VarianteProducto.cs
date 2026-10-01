using Tienda.Domain.Common;
using Tienda.Domain.Inventario;

namespace Tienda.Domain.Catalogo;

/// <summary>
/// Combinacion concreta color + talla. Es la unidad real de inventario:
/// todo el stock y todos los movimientos cuelgan de aqui, nunca del Producto.
/// </summary>
public class VarianteProducto : BaseEntity
{
    public Guid ProductoId { get; set; }
    public Producto? Producto { get; set; }

    public string CodigoSku { get; set; } = string.Empty; // unico, para codigo de barras
    public string Color { get; set; } = string.Empty;

    /// <summary>Codigo #RRGGBB del color, para dibujar la muestra en el catalogo.</summary>
    public string ColorHex { get; set; } = "#9CA3AF";

    public string Talla { get; set; } = string.Empty;

    /// <summary>Si es null, hereda el precio del producto.</summary>
    public decimal? PrecioVentaAlternativo { get; set; }
    public decimal? PrecioMayoristaAlternativo { get; set; }

    public bool EstaActiva { get; set; } = true;

    public ICollection<NivelExistencias> NivelesExistencias { get; set; } = new List<NivelExistencias>();
    public ICollection<MovimientoExistencias> Movimientos { get; set; } = new List<MovimientoExistencias>();
}