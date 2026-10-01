using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Common;
using Tienda.Application.Lookups.Dtos;
using Tienda.Domain.Catalog;

namespace Tienda.Application.Lookups;

public class LookupService : ILookupService
{
    private readonly IAppDbContext _db;

    public LookupService(IAppDbContext db) => _db = db;

    public async Task<IReadOnlyList<LookupItemDto>> GetCategoriesAsync(CancellationToken ct = default)
        => await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new LookupItemDto(c.Id, c.Name, c.ParentId))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<LookupItemDto>> GetBrandsAsync(CancellationToken ct = default)
        => await _db.Brands
            .AsNoTracking()
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .Select(b => new LookupItemDto(b.Id, b.Name, null))
            .ToListAsync(ct);

    public async Task<Result<LookupItemDto>> CreateCategoryAsync(string name, Guid? parentId, CancellationToken ct = default)
    {
        name = (name ?? string.Empty).Trim();
        if (name.Length == 0) return Result.Failure<LookupItemDto>("El nombre de la categoria es obligatorio.");

        if (parentId is not null && !await _db.Categories.AnyAsync(c => c.Id == parentId, ct))
            return Result.Failure<LookupItemDto>("La categoria padre no existe.");

        var baseSlug = Slug.From(name);
        var slug = baseSlug;
        var attempt = 2;
        while (await _db.Categories.AnyAsync(c => c.Slug == slug, ct))
            slug = $"{baseSlug}-{attempt++}";

        var category = new Category { Name = name, Slug = slug, ParentId = parentId };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);

        return Result.Success(new LookupItemDto(category.Id, category.Name, category.ParentId));
    }

    public async Task<Result<LookupItemDto>> CreateBrandAsync(string name, CancellationToken ct = default)
    {
        name = (name ?? string.Empty).Trim();
        if (name.Length == 0) return Result.Failure<LookupItemDto>("El nombre de la marca es obligatorio.");

        var lowered = name.ToLower();
        if (await _db.Brands.AnyAsync(b => b.Name.ToLower() == lowered, ct))
            return Result.Failure<LookupItemDto>("Esa marca ya existe.");

        var brand = new Brand { Name = name };
        _db.Brands.Add(brand);
        await _db.SaveChangesAsync(ct);

        return Result.Success(new LookupItemDto(brand.Id, brand.Name, null));
    }
}
