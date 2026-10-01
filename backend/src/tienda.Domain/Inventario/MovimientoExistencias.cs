using Tienda.Domain.Catalogo;
using Tienda.Domain.Common;
using Tienda.Domain.Enums;

namespace Tienda.Domain.Inventario;

/// <summary>
/// Asiento inmutable del historial de inventario. Nunca se edita ni se borra:
/// si algo salio mal, se registra un movimiento de ajuste que lo compense.
/// </summary>
public class MovimientoExistencias : BaseEntity
{
    public Guid VarianteProductoId { get; set; }
    public VarianteProducto? Variante { get; set; }

    public TipoMovimiento Tipo { get; set; }

    /// <summary>Positivo o negativo segun el tipo. En un traslado se registra el monto movido.</summary>
    public int Cantidad { get; set; }

    public UbicacionStock? UbicacionOrigen { get; set; }
    public UbicacionStock? UbicacionDestino { get; set; }

    /// <summary>Foto del stock despues del movimiento, para auditar sin recalcular toda la cadena.</summary>
    public int CantidadResultanteDeposito { get; set; }
    public int CantidadResultanteTienda { get; set; }

    public DateTime OcurridoEn { get; set; } = DateTime.UtcNow;
    public Guid? RealizadoPorUsuarioId { get; set; }
    public string? Referencia { get; set; }
    public string? Notas { get; set; }
}