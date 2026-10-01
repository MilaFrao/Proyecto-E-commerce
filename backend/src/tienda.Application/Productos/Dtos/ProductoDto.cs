using Tienda.Domain.Enums;

namespace Tienda.Application.Productos.Dtos;

public record ProductoDto(
    Guid Id,
    string Nombre,
    string Referencia,
    string? Descripcion,
    string NombreCategoria,
    string? NombreMarca,
    decimal PrecioVenta,
    decimal PrecioMayorista,
    EstadoProducto Estado,
    int CantidadVariantes);