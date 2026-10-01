using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Comun;
using Tienda.Dominio.Enumeraciones;

namespace Tienda.Dominio.Inventario;

/// <summary>
/// Cantidad de una variante en UNA ubicacion. Una fila por (variante, ubicacion).
///
/// Este modelo por-ubicacion es lo que permite que manana entre una segunda
/// sucursal agregando una sola columna (StoreId) en vez de rehacer el inventario.
/// </summary>
public class NivelExistencias : EntidadBase
{
    public Guid VarianteProductoId { get; set; }
    public VarianteProducto? Variante { get; set; }

    public UbicacionStock Ubicacion { get; set; }
    public int Cantidad { get; set; }

    public void Aumentar(int amount)
    {
        if (amount <= 0) throw new ExcepcionDominio("La cantidad a sumar debe ser mayor que cero.");
        Cantidad += amount;
        ActualizadoEn = DateTime.UtcNow;
    }

    public void Disminuir(int amount)
    {
        if (amount <= 0) throw new ExcepcionDominio("La cantidad a restar debe ser mayor que cero.");
        if (amount > Cantidad)
            throw new ExcepcionDominio($"Stock insuficiente en {Ubicacion}: hay {Cantidad}, se piden {amount}.");
        Cantidad -= amount;
        ActualizadoEn = DateTime.UtcNow;
    }
}
