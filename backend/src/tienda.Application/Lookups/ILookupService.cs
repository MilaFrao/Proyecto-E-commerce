using Tienda.Application.Common;
using Tienda.Application.Lookups.Dtos;

namespace Tienda.Application.Lookups;

public interface ILookupService
{
    Task<IReadOnlyList<LookupItemDto>> GetCategoriesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<LookupItemDto>> GetBrandsAsync(CancellationToken ct = default);
    Task<Result<LookupItemDto>> CreateCategoryAsync(string name, Guid? parentId, CancellationToken ct = default);
    Task<Result<LookupItemDto>> CreateBrandAsync(string name, CancellationToken ct = default);
}
