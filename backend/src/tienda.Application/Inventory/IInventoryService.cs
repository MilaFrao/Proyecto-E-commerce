using Tienda.Aplicacion.Comun;
using Tienda.Aplicacion.Inventario.Dtos;

namespace Tienda.Aplicacion.Inventario;

public interface IServicioInventario
{
    /// <summary>Entrada de mercancia. Siempre ingresa al deposito, nunca directo a tienda.</summary>
    Task<Resultado<ResumenExistenciasDto>> RegistrarEntradaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken tokenCancelacion = default);

    /// <summary>Surtido: mueve unidades de deposito a tienda. Aqui es donde nace la disponibilidad.</summary>
    Task<Resultado<ResumenExistenciasDto>> ReabastecerTiendaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken tokenCancelacion = default);

    /// <summary>Venta: descuenta de tienda. Falla si no hay surtido suficiente.</summary>
    Task<Resultado<ResumenExistenciasDto>> RegistrarVentaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken tokenCancelacion = default);

    Task<Resultado<ResumenExistenciasDto>> ObtenerExistenciasAsync(Guid varianteId, CancellationToken tokenCancelacion = default);

    /// <summary>Busca variantes activas por nombre, referencia o SKU y devuelve su stock. Maximo 50.</summary>
    Task<IReadOnlyList<ExistenciasVarianteDto>> BuscarVariantesAsync(string? busqueda, CancellationToken tokenCancelacion = default);

    Task<IReadOnlyList<MovimientoExistenciasDto>> ObtenerHistorialMovimientosAsync(Guid varianteId, CancellationToken tokenCancelacion = default);
}
