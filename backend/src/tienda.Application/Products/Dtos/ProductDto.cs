using Tienda.Dominio.Enumeraciones;

namespace Tienda.Aplicacion.Productos.Dtos;

public record ProductoDto(
    Guid Identificador,
    string Nombre,
    string Referencia,
    string? Descripcion,
    string NombreCategoria,
    string? NombreMarca,
    decimal PrecioVenta,
    decimal PrecioMayorista,
    EstadoProducto Estado,
    int CantidadVariantes);
