using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Common;
using Tienda.Application.Products.Dtos;
using Tienda.Domain.Catalog;
using Tienda.Domain.Enums;

namespace Tienda.Application.Products;

public class ProductService : IProductService
{
    private readonly IAppDbContext _db;
    private readonly IDateTimeProvider _clock;

    public ProductService(IAppDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<PagedResult<ProductDto>> ListAsync(string? search, bool includeInactive, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        IQueryable<Product> q = _db.Products.AsNoTracking();

        if (!includeInactive)
            q = q.Where(p => p.Status == ProductStatus.Active);

        var term = string.IsNullOrWhiteSpace(search) ? null : search.Trim().ToLower();
        if (term is not null)
        {
            q = q.Where(p =>
                p.Name.ToLower().Contains(term) ||
                p.Reference.ToLower().Contains(term) ||
                (p.Brand != null && p.Brand.Name.ToLower().Contains(term)));
        }

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto(
                p.Id,
                p.Name,
                p.Reference,
                p.Description,
                p.Category!.Name,
                p.Brand != null ? p.Brand.Name : null,
                p.RetailPrice,
                p.WholesalePrice,
                p.Status,
                p.Variants.Count))
            .ToListAsync(ct);

        return new PagedResult<ProductDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<Result<ProductDto>> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        var name = request.Name?.Trim() ?? string.Empty;
        var reference = request.Reference?.Trim() ?? string.Empty;

        if (name.Length == 0) return Result.Failure<ProductDto>("El nombre es obligatorio.");
        if (reference.Length == 0) return Result.Failure<ProductDto>("La referencia es obligatoria.");
        if (request.RetailPrice < 0 || request.WholesalePrice < 0)
            return Result.Failure<ProductDto>("Los precios no pueden ser negativos.");

        if (request.Variants is null || request.Variants.Count == 0)
            return Result.Failure<ProductDto>("Agrega al menos una variante (color y talla).");

        var category = await _db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == request.CategoryId, ct);
        if (category is null) return Result.Failure<ProductDto>("La categoria no existe.");

        string? brandName = null;
        if (request.BrandId is not null)
        {
            brandName = await _db.Brands.AsNoTracking()
                .Where(b => b.Id == request.BrandId)
                .Select(b => b.Name)
                .FirstOrDefaultAsync(ct);

            if (brandName is null) return Result.Failure<ProductDto>("La marca no existe.");
        }

        if (await _db.Products.AnyAsync(p => p.Reference == reference, ct))
            return Result.Failure<ProductDto>("Ya existe un producto con esa referencia.");

        // ---- variantes: validar antes de tocar la base
        var variants = new List<ProductVariant>();
        var seenSkus = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var seenCombos = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var input in request.Variants)
        {
            var sku = input.Sku?.Trim() ?? string.Empty;
            var color = input.Color?.Trim() ?? string.Empty;
            var size = input.Size?.Trim() ?? string.Empty;

            if (sku.Length == 0 || color.Length == 0 || size.Length == 0)
                return Result.Failure<ProductDto>("Cada variante necesita SKU, color y talla.");

            if (!seenSkus.Add(sku))
                return Result.Failure<ProductDto>($"El SKU '{sku}' esta repetido dentro del producto.");

            if (!seenCombos.Add($"{color}|{size}"))
                return Result.Failure<ProductDto>($"La combinacion {color} / {size} esta repetida.");

            variants.Add(new ProductVariant
            {
                Sku = sku,
                Color = color,
                Size = size,
                RetailPriceOverride = input.RetailPriceOverride,
                WholesalePriceOverride = input.WholesalePriceOverride
            });
        }

        var skuList = variants.Select(v => v.Sku).ToList();
        var takenSku = await _db.ProductVariants
            .Where(v => skuList.Contains(v.Sku))
            .Select(v => v.Sku)
            .FirstOrDefaultAsync(ct);

        if (takenSku is not null)
            return Result.Failure<ProductDto>($"El SKU '{takenSku}' ya esta en uso por otra variante.");

        // ---- crear
        var product = new Product
        {
            Name = name,
            Reference = reference,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            CategoryId = category.Id,
            BrandId = request.BrandId,
            RetailPrice = request.RetailPrice,
            WholesalePrice = request.WholesalePrice
        };

        foreach (var variant in variants)
        {
            variant.ProductId = product.Id;
            product.Variants.Add(variant);
        }

        if (!string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            product.Images.Add(new ProductImage
            {
                ProductId = product.Id,
                Url = request.ImageUrl.Trim(),
                AltText = name,
                IsPrimary = true
            });
        }

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);

        return Result.Success(new ProductDto(
            product.Id, product.Name, product.Reference, product.Description,
            category.Name, brandName,
            product.RetailPrice, product.WholesalePrice,
            product.Status, variants.Count));
    }

    public async Task<Result> DeactivateAsync(Guid id, string? reason, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (product is null) return Result.Failure("El producto no existe.");

        product.Status = ProductStatus.Inactive;
        product.DeactivatedAt = _clock.UtcNow;
        product.DeactivationReason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
        product.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> ActivateAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (product is null) return Result.Failure("El producto no existe.");

        product.Status = ProductStatus.Active;
        product.DeactivatedAt = null;
        product.DeactivationReason = null;
        product.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}
