using Tienda.Application.Catalog.Dtos;
using Tienda.Application.Common;

namespace Tienda.Application.Catalog;

public interface ICatalogService
{
    /// <summary>Solo productos con al menos una variante surtida. Regla de la seccion 17.</summary>
    Task<PagedResult<CatalogProductDto>> BrowseAsync(CatalogQuery query, CancellationToken ct = default);

    Task<CatalogProductDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<CatalogFiltersDto> GetFiltersAsync(CancellationToken ct = default);
}

public record CatalogQuery(
    string? Search = null,
    Guid? CategoryId = null,
    Guid? BrandId = null,
    string? Color = null,
    string? Size = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string SortBy = "name",
    int Page = 1,
    int PageSize = 24);
