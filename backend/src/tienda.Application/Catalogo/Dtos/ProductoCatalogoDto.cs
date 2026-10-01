namespace Tienda.Application.Catalogo.Dtos;

/// <summary>
/// Vista publica. Ojo con lo que NO esta aqui: nada de deposito, nada de
/// movimientos, nada de precio al mayor. Esa omision es intencional.
/// </summary>
public record ProductoCatalogoDto(
    Guid Id,
    string Nombre,
    string? Descripcion,
    string NombreCategoria,
    string? NombreMarca,
    decimal Precio,
    string? UrlImagenPrincipal,
    IReadOnlyList<VarianteCatalogoDto> Variantes);

public record VarianteCatalogoDto(
    Guid Id,
    string Color,
    string ColorHex,
    string Talla,
    decimal Precio,
    bool EstaDisponible);