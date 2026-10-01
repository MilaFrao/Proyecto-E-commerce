namespace Tienda.Domain.Enums;

/// <summary>
/// Ubicacion fisica de las unidades. La separacion deposito / tienda es la regla
/// central del MVP 1: solo lo que esta en tienda cuenta como disponible para venta.
/// </summary>
public enum StockLocation
{
    Warehouse = 1, // Deposito: existe, pero NO se vende ni se publica
    Store     = 2  // Surtido en tienda: disponible para la venta
}
