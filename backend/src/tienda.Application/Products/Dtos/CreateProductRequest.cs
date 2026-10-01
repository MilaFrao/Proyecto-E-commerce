namespace Tienda.Application.Products.Dtos;

public record CreateProductRequest(
    string Name,
    string Reference,
    string? Description,
    Guid CategoryId,
    Guid? BrandId,
    decimal RetailPrice,
    decimal WholesalePrice,
    string? ImageUrl,
    IReadOnlyList<VariantInput> Variants);

public record VariantInput(
    string Sku,
    string Color,
    string Size,
    decimal? RetailPriceOverride = null,
    decimal? WholesalePriceOverride = null);
