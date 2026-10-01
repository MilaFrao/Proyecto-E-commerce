namespace Tienda.Domain.Enums;

/// <summary>Los productos no se borran: se desactivan, para conservar el historial.</summary>
public enum ProductStatus
{
    Active   = 1,
    Inactive = 2
}
