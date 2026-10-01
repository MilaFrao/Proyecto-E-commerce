namespace Tienda.Application.Catalog.Dtos;

/// <summary>
/// Vista publica. Ojo con lo que NO esta aqui: nada de deposito, nada de
/// movimientos, nada de precio al mayor. Esa omision es intencional.
/// </summary>
public record CatalogProductDto(
    Guid Id,
    string Name,
    string? Description,
    string CategoryName,
    string? BrandName,
    decimal Price,
    string? PrimaryImageUrl,
    IReadOnlyList<CatalogVariantDto> Variants);

public record CatalogVariantDto(
    Guid Id,
    string Color,
    string Size,
    decimal Price,
    bool IsAvailable);
