using Tienda.Domain.Enums;

namespace Tienda.Application.Products.Dtos;

public record ProductDto(
    Guid Id,
    string Name,
    string Reference,
    string? Description,
    string CategoryName,
    string? BrandName,
    decimal RetailPrice,
    decimal WholesalePrice,
    ProductStatus Status,
    int VariantCount);
