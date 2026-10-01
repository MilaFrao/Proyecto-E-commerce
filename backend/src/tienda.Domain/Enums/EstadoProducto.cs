namespace Tienda.Domain.Enums;

/// <summary>Los productos no se borran: se desactivan, para conservar el historial.</summary>
public enum EstadoProducto
{
    Activo   = 1,
    Inactivo = 2
}