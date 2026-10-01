namespace Tienda.Application.Inventario.Dtos;

/// <summary>Una variante con su producto y sus tres numeros de stock. Alimenta la pantalla de inventario.</summary>
public record ExistenciasVarianteDto(
    Guid VarianteId,
    string NombreProducto,
    string Referencia,
    string CodigoSku,
    string Color,
    string Talla,
    int CantidadDeposito,
    int CantidadTienda)
{
    public int DisponibleParaVenta => CantidadTienda;
    public int CantidadTotal => CantidadDeposito + CantidadTienda;
}