namespace Tienda.Dominio.Enumeraciones;

public enum TipoMovimiento
{
    Entrada      = 1, // Entrada de mercancia al deposito
    Traslado   = 2, // Surtido: deposito -> tienda
    Venta       = 3, // Venta desde tienda
    Return     = 4, // Devolucion del cliente
    Ajuste = 5, // Ajuste por inventario fisico
    Removal    = 6  // Merma, dano, perdida
}
