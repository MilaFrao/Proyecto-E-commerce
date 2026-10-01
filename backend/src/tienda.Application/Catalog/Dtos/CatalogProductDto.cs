namespace Tienda.Aplicacion.Catalogo.Dtos;

/// <summary>
/// Vista publica. Ojo con lo que NO esta aqui: nada de deposito, nada de
/// movimientos, nada de precio al mayor. Esa omision es intencional.
/// </summary>
public record ProductoCatalogoDto(
    Guid Identificador,
    string Nombre,
    string? Descripcion,
    string NombreCategoria,
    string? NombreMarca,
    decimal Precio,
    string? UrlImagenPrincipal,
    IReadOnlyList<VarianteCatalogoDto> Variantes);

public record VarianteCatalogoDto(
    Guid Identificador,
    string Color,
    string Talla,
    decimal Precio,
    bool EstaDisponible);
