namespace Tienda.Application.Inventario.Dtos;

/// <summary>Una variante con su producto y sus tres numeros de stock. Alimenta las pantallas de inventario y surtido.</summary>
public record ExistenciasVarianteDto(
    Guid VarianteId,
    string NombreProducto,
    string Referencia,
    string CodigoSku,
    string Color,
    string ColorHex,
    string Talla,
    int CantidadDeposito,
    int CantidadTienda,
    DateTime? UltimoMovimientoEn)
{
    public int DisponibleParaVenta => CantidadTienda;
    public int CantidadTotal => CantidadDeposito + CantidadTienda;
}
