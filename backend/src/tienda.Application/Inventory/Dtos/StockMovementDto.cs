using Tienda.Dominio.Enumeraciones;

namespace Tienda.Aplicacion.Inventario.Dtos;

public record MovimientoExistenciasDto(
    Guid Identificador,
    Guid VarianteId,
    TipoMovimiento Tipo,
    int Cantidad,
    UbicacionStock? UbicacionOrigen,
    UbicacionStock? UbicacionDestino,
    int CantidadResultanteDeposito,
    int CantidadResultanteTienda,
    DateTime OcurridoEn,
    string? Notas);
