namespace Tienda.Domain.Enums;

public enum MovementType
{
    Entry      = 1, // Entrada de mercancia al deposito
    Transfer   = 2, // Surtido: deposito -> tienda
    Sale       = 3, // Venta desde tienda
    Return     = 4, // Devolucion del cliente
    Adjustment = 5, // Ajuste por inventario fisico
    Removal    = 6  // Merma, dano, perdida
}
