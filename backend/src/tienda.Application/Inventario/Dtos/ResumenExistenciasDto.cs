namespace Tienda.Application.Inventario.Dtos;

/// <summary>Los tres numeros de la seccion 6 del documento de requerimientos.</summary>
public record ResumenExistenciasDto(
    Guid VarianteId,
    string CodigoSku,
    string Color,
    string Talla,
    int CantidadDeposito,
    int CantidadTienda)
{
    /// <summary>Disponible para venta == lo que esta surtido en tienda. Nunca el total.</summary>
    public int DisponibleParaVenta => CantidadTienda;
    public int CantidadTotal => CantidadDeposito + CantidadTienda;
}