namespace Tienda.Application.Productos.Dtos;

public record CrearProductoRequest(
    string Nombre,
    string Referencia,
    string? Descripcion,
    Guid CategoriaId,
    Guid? MarcaId,
    decimal PrecioVenta,
    decimal PrecioMayorista,
    string? UrlImagen,
    IReadOnlyList<CrearVarianteRequest> Variantes);

public record CrearVarianteRequest(
    string CodigoSku,
    string Color,
    string Talla,
    string ColorHex,
    int CantidadInicial = 0,
    decimal? PrecioVentaAlternativo = null,
    decimal? PrecioMayoristaAlternativo = null);