using Tienda.Domain.Catalogo;
using Tienda.Domain.Common;
using Tienda.Domain.Enums;

namespace Tienda.Domain.Inventario;

/// <summary>
/// Cantidad de una variante en UNA ubicacion. Una fila por (variante, ubicacion).
///
/// Este modelo por-ubicacion es lo que permite que manana entre una segunda
/// sucursal agregando una sola columna (TiendaId) en vez de rehacer el inventario.
/// </summary>
public class NivelExistencias : BaseEntity
{
    public Guid VarianteProductoId { get; set; }
    public VarianteProducto? Variante { get; set; }

    public UbicacionStock Ubicacion { get; set; }
    public int Cantidad { get; set; }

    /// <summary>
    /// Control de concurrencia: si dos movimientos leen el mismo saldo a la vez, el segundo en guardar
    /// falla en vez de pisar al primero. En PostgreSQL se mapea a la columna de sistema xmin.
    /// </summary>
    public uint Version { get; set; }

    public void Aumentar(int unidades)
    {
        if (unidades <= 0) throw new DomainException("La cantidad a sumar debe ser mayor que cero.");
        Cantidad += unidades;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Disminuir(int unidades)
    {
        if (unidades <= 0) throw new DomainException("La cantidad a restar debe ser mayor que cero.");
        if (unidades > Cantidad)
            throw new DomainException($"Stock insuficiente en {Ubicacion}: hay {Cantidad}, se piden {unidades}.");
        Cantidad -= unidades;
        UpdatedAt = DateTime.UtcNow;
    }
}
