using Tienda.Application.Lookups.Dtos;

namespace Tienda.Application.Catalog.Dtos;

/// <summary>Opciones reales para los filtros: solo colores y tallas que hoy se pueden comprar.</summary>
public record CatalogFiltersDto(
    IReadOnlyList<LookupItemDto> Categories,
    IReadOnlyList<LookupItemDto> Brands,
    IReadOnlyList<string> Colors,
    IReadOnlyList<string> Sizes);
