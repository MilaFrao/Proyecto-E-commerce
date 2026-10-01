using Tienda.Application.Common;
using Tienda.Application.Inventario.Dtos;

namespace Tienda.Application.Inventario;

public interface IInventarioService
{
    /// <summary>Entrada de mercancia. Siempre ingresa al deposito, nunca directo a tienda.</summary>
    Task<Result<ResumenExistenciasDto>> RegistrarEntradaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default);

    /// <summary>Surtido: mueve unidades de deposito a tienda. Aqui es donde nace la disponibilidad.</summary>
    Task<Result<ResumenExistenciasDto>> ReabastecerTiendaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default);

    /// <summary>Venta: descuenta de tienda. Falla si no hay surtido suficiente.</summary>
    Task<Result<ResumenExistenciasDto>> RegistrarVentaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default);

    Task<Result<ResumenExistenciasDto>> ObtenerExistenciasAsync(Guid varianteId, CancellationToken cancellationToken = default);

    /// <summary>Busca variantes activas por nombre, referencia o SKU y devuelve su stock. Maximo 50.</summary>
    Task<IReadOnlyList<ExistenciasVarianteDto>> BuscarVariantesAsync(string? busqueda, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MovimientoExistenciasDto>> ObtenerHistorialMovimientosAsync(Guid varianteId, CancellationToken cancellationToken = default);
}