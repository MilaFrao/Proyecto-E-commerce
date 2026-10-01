using Tienda.Domain.Enums;

namespace Tienda.Application.Inventario.Dtos;

public record MovimientoExistenciasDto(
    Guid Id,
    Guid VarianteId,
    TipoMovimiento Tipo,
    int Cantidad,
    UbicacionStock? UbicacionOrigen,
    UbicacionStock? UbicacionDestino,
    int CantidadResultanteDeposito,
    int CantidadResultanteTienda,
    DateTime OcurridoEn,
    string? Notas);