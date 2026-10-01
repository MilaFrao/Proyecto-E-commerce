namespace Tienda.Domain.Enums;

/// <summary>Los valores numericos se guardan en la base: no reordenar ni reutilizar.</summary>
public enum TipoMovimiento
{
    Entrada    = 1, // Entrada de mercancia al deposito
    Traslado   = 2, // Surtido: deposito -> tienda
    Venta      = 3, // Venta desde tienda
    Devolucion = 4, // Devolucion del cliente
    Ajuste     = 5, // Ajuste por inventario fisico
    Merma      = 6  // Dano, perdida o vencimiento
}
