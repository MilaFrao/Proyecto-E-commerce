using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Catalog.Dtos;
using Tienda.Application.Common;
using Tienda.Application.Lookups.Dtos;
using Tienda.Domain.Catalog;
using Tienda.Domain.Enums;

namespace Tienda.Application.Catalog;

/// <summary>
/// Servicio de SOLO LECTURA. Si algun dia aparece aqui un SaveChanges,
/// es senal de que algo se monto en la capa equivocada.
///
/// Ojo: todo lo que EF debe traducir a SQL va escrito INLINE dentro de las
/// expresiones (o como una expresion tipada), nunca en metodos normales de C#.
/// Un metodo estatico dentro de un Where no se puede convertir a SQL.
/// </summary>
public class CatalogService : ICatalogService
{
    private readonly IAppDbContext _db;

    public CatalogService(IAppDbContext db) => _db = db;

    /// <summary>Proyeccion a DTO publico. Nada de deposito, movimientos ni precio al mayor.</summary>
    private static readonly Expression<Func<Product, CatalogProductDto>> ToDto = p => new CatalogProductDto(
        p.Id,
        p.Name,
        p.Description,
        p.Category != null ? p.Category.Name : string.Empty,
        p.Brand != null ? p.Brand.Name : null,
        p.RetailPrice,
        p.Images.OrderByDescending(i => i.IsPrimary).ThenBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault(),
        p.Variants
            .Where(v => v.IsActive)
            .Select(v => new CatalogVariantDto(
                v.Id,
                v.Color,
                v.Size,
                v.RetailPriceOverride ?? p.RetailPrice,
                v.StockLevels.Any(s => s.Location == StockLocation.Store && s.Quantity > 0)))
            .ToList());

    public async Task<PagedResult<CatalogProductDto>> BrowseAsync(CatalogQuery query, CancellationToken ct = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var q = BasePublishedQuery();

        var search = string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim().ToLower();
        if (search is not null)
        {
            q = q.Where(p =>
                p.Name.ToLower().Contains(search) ||
                p.Reference.ToLower().Contains(search) ||
                (p.Brand != null && p.Brand.Name.ToLower().Contains(search)));
        }

        var categoryId = query.CategoryId;
        var brandId = query.BrandId;
        var minPrice = query.MinPrice;
        var maxPrice = query.MaxPrice;

        if (categoryId is not null) q = q.Where(p => p.CategoryId == categoryId);
        if (brandId is not null) q = q.Where(p => p.BrandId == brandId);
        if (minPrice is not null) q = q.Where(p => p.RetailPrice >= minPrice);
        if (maxPrice is not null) q = q.Where(p => p.RetailPrice <= maxPrice);

        // Color y talla se evaluan sobre LA MISMA variante: "Negro + M" solo
        // coincide si existe una variante negra talla M con unidades en tienda.
        var color = string.IsNullOrWhiteSpace(query.Color) ? null : query.Color.Trim();
        var size = string.IsNullOrWhiteSpace(query.Size) ? null : query.Size.Trim();

        if (color is not null || size is not null)
        {
            q = q.Where(p => p.Variants.Any(v =>
                v.IsActive
                && (color == null || v.Color == color)
                && (size == null || v.Size == size)
                && v.StockLevels.Any(s => s.Location == StockLocation.Store && s.Quantity > 0)));
        }

        q = query.SortBy switch
        {
            "price_asc" => q.OrderBy(p => p.RetailPrice).ThenBy(p => p.Name),
            "price_desc" => q.OrderByDescending(p => p.RetailPrice).ThenBy(p => p.Name),
            "newest" => q.OrderByDescending(p => p.CreatedAt),
            _ => q.OrderBy(p => p.Name)
        };

        var total = await q.CountAsync(ct);

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ToDto)
            .ToListAsync(ct);

        return new PagedResult<CatalogProductDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<CatalogProductDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await BasePublishedQuery()
            .Where(p => p.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync(ct);

    public async Task<CatalogFiltersDto> GetFiltersAsync(CancellationToken ct = default)
    {
        var categories = await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new LookupItemDto(c.Id, c.Name, c.ParentId))
            .ToListAsync(ct);

        var brands = await _db.Brands
            .AsNoTracking()
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .Select(b => new LookupItemDto(b.Id, b.Name, null))
            .ToListAsync(ct);

        var purchasable = _db.ProductVariants
            .AsNoTracking()
            .Where(v => v.IsActive
                && v.Product!.Status == ProductStatus.Active
                && v.StockLevels.Any(s => s.Location == StockLocation.Store && s.Quantity > 0));

        var colors = await purchasable.Select(v => v.Color).Distinct().OrderBy(c => c).ToListAsync(ct);
        var sizes = await purchasable.Select(v => v.Size).Distinct().ToListAsync(ct);

        return new CatalogFiltersDto(categories, brands, colors, sizes);
    }

    /// <summary>Filtro maestro de publicacion: producto activo + al menos una variante surtida.</summary>
    private IQueryable<Product> BasePublishedQuery()
        => _db.Products
            .AsNoTracking()
            .Where(p => p.Status == ProductStatus.Active
                && p.Variants.Any(v => v.IsActive
                    && v.StockLevels.Any(s => s.Location == StockLocation.Store && s.Quantity > 0)));
}
