namespace Tienda.Application.Inventario.Dtos;

/// <summary>
/// Foto general del inventario (solo variantes activas de productos activos) y lo movido desde una fecha.
/// Sirve a las tarjetas del panel y al reporte diario de n8n (decision 013).
/// </summary>
public record ResumenInventarioDto(
    int UnidadesDeposito,
    int UnidadesTienda,
    int VariantesActivas,
    int VariantesSinSurtir,   // hay unidades en deposito pero ninguna en tienda: no se estan vendiendo
    int VariantesAgotadas,    // cero en deposito y cero en tienda
    int VariantesCriticas,    // quedan entre 1 y el umbral en total (deposito + tienda)
    DateTime Desde,
    int UnidadesEntradas,
    int UnidadesSurtidas,
    int UnidadesVendidas);
