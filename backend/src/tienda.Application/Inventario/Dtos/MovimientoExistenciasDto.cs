using Tienda.Domain.Enums;

namespace Tienda.Application.Inventario.Dtos;

/// <summary>Un asiento del historial, con lo necesario para mostrarlo sin otra consulta: que prenda, quien y cuando.</summary>
public record MovimientoExistenciasDto(
    Guid Id,
    Guid VarianteId,
    string NombreProducto,
    string CodigoSku,
    string Color,
    string ColorHex,
    string Talla,
    TipoMovimiento Tipo,
    int Cantidad,
    UbicacionStock? UbicacionOrigen,
    UbicacionStock? UbicacionDestino,
    int CantidadResultanteDeposito,
    int CantidadResultanteTienda,
    DateTime OcurridoEn,
    string? Notas,
    string? NombreUsuario);
