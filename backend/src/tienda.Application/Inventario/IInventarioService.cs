using Tienda.Application.Common;
using Tienda.Application.Inventario.Dtos;
using Tienda.Domain.Enums;

namespace Tienda.Application.Inventario;

public interface IInventarioService
{
    /// <summary>Entrada de mercancia. Siempre ingresa al deposito, nunca directo a tienda.</summary>
    Task<Result<ResumenExistenciasDto>> RegistrarEntradaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default);

    /// <summary>Surtido: mueve unidades de deposito a tienda. Aqui es donde nace la disponibilidad.</summary>
    Task<Result<ResumenExistenciasDto>> ReabastecerTiendaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default);

    /// <summary>Surtido de varias variantes en una sola transaccion: o se surten todas o ninguna.</summary>
    Task<Result<IReadOnlyList<ResumenExistenciasDto>>> SurtirLoteAsync(SurtirLoteRequest request, CancellationToken cancellationToken = default);

    /// <summary>Venta: descuenta de tienda. Falla si no hay surtido suficiente.</summary>
    Task<Result<ResumenExistenciasDto>> RegistrarVentaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default);

    /// <summary>Ajuste por conteo fisico: deja la ubicacion en lo contado y registra la diferencia. El motivo es obligatorio.</summary>
    Task<Result<ResumenExistenciasDto>> AjustarAsync(Guid varianteId, UbicacionStock ubicacion, int cantidadContada, string? notas, CancellationToken cancellationToken = default);

    /// <summary>Merma: unidades que salen por dano, perdida o similar. El motivo es obligatorio.</summary>
    Task<Result<ResumenExistenciasDto>> RegistrarMermaAsync(Guid varianteId, UbicacionStock ubicacion, int cantidad, string? notas, CancellationToken cancellationToken = default);

    Task<Result<ResumenExistenciasDto>> ObtenerExistenciasAsync(Guid varianteId, CancellationToken cancellationToken = default);

    /// <summary>Variantes activas con su stock, filtrables por texto y por estado (ver EstadoExistencias). Paginado.</summary>
    Task<PagedResult<ExistenciasVarianteDto>> BuscarVariantesAsync(string? busqueda, string? estado, int pagina, int elementosPorPagina, CancellationToken cancellationToken = default);

    /// <summary>Totales del inventario y unidades movidas desde una fecha (UTC).</summary>
    Task<ResumenInventarioDto> ObtenerResumenAsync(DateTime desde, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MovimientoExistenciasDto>> ObtenerHistorialMovimientosAsync(Guid varianteId, CancellationToken cancellationToken = default);

    /// <summary>Historial de todas las variantes, del mas reciente al mas viejo. Paginado.</summary>
    Task<PagedResult<MovimientoExistenciasDto>> ListarMovimientosAsync(string? busqueda, TipoMovimiento? tipo, int pagina, int elementosPorPagina, CancellationToken cancellationToken = default);
}
