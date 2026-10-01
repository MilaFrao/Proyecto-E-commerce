using Tienda.Application.Common;
using Tienda.Application.Products.Dtos;

namespace Tienda.Application.Products;

public interface IProductService
{
    Task<PagedResult<ProductDto>> ListAsync(string? search, bool includeInactive, int page, int pageSize, CancellationToken ct = default);

    /// <summary>Crea el producto junto con todas sus variantes en una sola operacion. Sin stock: eso entra por inventario.</summary>
    Task<Result<ProductDto>> CreateAsync(CreateProductRequest request, CancellationToken ct = default);

    /// <summary>Los productos no se borran: se desactivan y conservan su historial (seccion 8).</summary>
    Task<Result> DeactivateAsync(Guid id, string? reason, CancellationToken ct = default);

    Task<Result> ActivateAsync(Guid id, CancellationToken ct = default);
}
