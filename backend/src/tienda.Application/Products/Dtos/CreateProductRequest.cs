namespace Tienda.Aplicacion.Productos.Dtos;

public record SolicitudCrearProducto(
    string Nombre,
    string Referencia,
    string? Descripcion,
    Guid CategoriaId,
    Guid? MarcaId,
    decimal PrecioVenta,
    decimal PrecioMayorista,
    string? UrlImagen,
    IReadOnlyList<EntradaVariante> Variantes);

public record EntradaVariante(
    string CodigoSku,
    string Color,
    string Talla,
    decimal? PrecioVentaAlternativo = null,
    decimal? PrecioMayoristaAlternativo = null);
