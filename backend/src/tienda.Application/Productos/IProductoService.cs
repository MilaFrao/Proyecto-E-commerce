using Tienda.Application.Common;
using Tienda.Application.Productos.Dtos;

namespace Tienda.Application.Productos;

public interface IProductoService
{
    Task<PagedResult<ProductoDto>> ListarAsync(string? busqueda, bool incluirInactivos, int pagina, int elementosPorPagina, CancellationToken cancellationToken = default);

    /// <summary>Crea el producto junto con todas sus variantes en una sola operacion. Sin stock: eso entra por inventario.</summary>
    Task<Result<ProductoDto>> CrearAsync(CrearProductoRequest request, CancellationToken cancellationToken = default);

    /// <summary>Los productos no se borran: se desactivan y conservan su historial (seccion 8).</summary>
    Task<Result> DesactivarAsync(Guid id, string? motivo, CancellationToken cancellationToken = default);

    Task<Result> ActivarAsync(Guid id, CancellationToken cancellationToken = default);
}