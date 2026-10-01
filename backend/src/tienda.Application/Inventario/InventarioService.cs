using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Common;
using Tienda.Application.Inventario.Dtos;
using Tienda.Domain.Catalogo;
using Tienda.Domain.Enums;
using Tienda.Domain.Inventario;

namespace Tienda.Application.Inventario;

/// <summary>
/// Corazon del MVP 1. Toda alteracion de stock pasa por aqui y deja
/// su rastro en MovimientoExistencias: no se toca NivelExistencias desde ningun otro lado.
/// </summary>
public class InventarioService : IInventarioService
{
    private readonly IAppDbContext _db;
    private readonly IDateTimeProvider _clock;

    public InventarioService(IAppDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<Result<ResumenExistenciasDto>> RegistrarEntradaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0) return Result.Failure<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");

        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        if (variante is null) return Result.Failure<ResumenExistenciasDto>("La variante no existe.");

        var deposito = ObtenerOCrearNivel(variante, UbicacionStock.Deposito);
        deposito.Aumentar(cantidad);

        RegistrarMovimiento(variante, TipoMovimiento.Entrada, cantidad, null, UbicacionStock.Deposito, notas);

        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success(ResumirExistencias(variante));
    }

    public async Task<Result<ResumenExistenciasDto>> ReabastecerTiendaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0) return Result.Failure<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");

        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        if (variante is null) return Result.Failure<ResumenExistenciasDto>("La variante no existe.");

        var deposito = ObtenerOCrearNivel(variante, UbicacionStock.Deposito);
        var tienda     = ObtenerOCrearNivel(variante, UbicacionStock.Tienda);

        if (deposito.Cantidad < cantidad)
            return Result.Failure<ResumenExistenciasDto>($"Stock insuficiente en deposito: hay {deposito.Cantidad}, se piden {cantidad}.");

        deposito.Disminuir(cantidad);
        tienda.Aumentar(cantidad);

        RegistrarMovimiento(variante, TipoMovimiento.Traslado, cantidad, UbicacionStock.Deposito, UbicacionStock.Tienda, notas);

        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success(ResumirExistencias(variante));
    }

    public async Task<Result<ResumenExistenciasDto>> RegistrarVentaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0) return Result.Failure<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");

        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        if (variante is null) return Result.Failure<ResumenExistenciasDto>("La variante no existe.");

        var tienda = ObtenerOCrearNivel(variante, UbicacionStock.Tienda);
        if (tienda.Cantidad < cantidad)
            return Result.Failure<ResumenExistenciasDto>($"No hay unidades surtidas suficientes: hay {tienda.Cantidad}, se piden {cantidad}.");

        tienda.Disminuir(cantidad);
        RegistrarMovimiento(variante, TipoMovimiento.Venta, -cantidad, UbicacionStock.Tienda, null, notas);

        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success(ResumirExistencias(variante));
    }

    public async Task<Result<ResumenExistenciasDto>> ObtenerExistenciasAsync(Guid varianteId, CancellationToken cancellationToken = default)
    {
        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        return variante is null
            ? Result.Failure<ResumenExistenciasDto>("La variante no existe.")
            : Result.Success(ResumirExistencias(variante));
    }

    public async Task<IReadOnlyList<MovimientoExistenciasDto>> ObtenerHistorialMovimientosAsync(Guid varianteId, CancellationToken cancellationToken = default)
        => await _db.MovimientosExistencias
            .Where(m => m.VarianteProductoId == varianteId)
            .OrderByDescending(m => m.OcurridoEn)
            .Select(m => new MovimientoExistenciasDto(
                m.Id, m.VarianteProductoId, m.Tipo, m.Cantidad,
                m.UbicacionOrigen, m.UbicacionDestino,
                m.CantidadResultanteDeposito, m.CantidadResultanteTienda,
                m.OcurridoEn, m.Notas))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ExistenciasVarianteDto>> BuscarVariantesAsync(string? busqueda, CancellationToken cancellationToken = default)
    {
        var consultaVariantes = _db.VariantesProducto
            .AsNoTracking()
            .Where(v => v.EstaActiva && v.Producto!.Estado == EstadoProducto.Activo);

        var terminoBusqueda = string.IsNullOrWhiteSpace(busqueda) ? null : busqueda.Trim().ToLower();
        if (terminoBusqueda is not null)
        {
            consultaVariantes = consultaVariantes.Where(v =>
                v.CodigoSku.ToLower().Contains(terminoBusqueda) ||
                v.Producto!.Nombre.ToLower().Contains(terminoBusqueda) ||
                v.Producto.Referencia.ToLower().Contains(terminoBusqueda));
        }

        return await consultaVariantes
            .OrderBy(v => v.Producto!.Nombre).ThenBy(v => v.Color).ThenBy(v => v.Talla)
            .Take(50)
            .Select(v => new ExistenciasVarianteDto(
                v.Id,
                v.Producto!.Nombre,
                v.Producto.Referencia,
                v.CodigoSku,
                v.Color,
                v.Talla,
                v.NivelesExistencias.Where(s => s.Ubicacion == UbicacionStock.Deposito).Sum(s => s.Cantidad),
                v.NivelesExistencias.Where(s => s.Ubicacion == UbicacionStock.Tienda).Sum(s => s.Cantidad)))
            .ToListAsync(cancellationToken);
    }

    // ---------------------------------------------------------------- helpers

    private Task<VarianteProducto?> CargarVarianteAsync(Guid id, CancellationToken cancellationToken)
        => _db.VariantesProducto
            .Include(v => v.NivelesExistencias)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);

    private NivelExistencias ObtenerOCrearNivel(VarianteProducto variante, UbicacionStock ubicacion)
    {
        var nivel = variante.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == ubicacion);
        if (nivel is not null) return nivel;

        nivel = new NivelExistencias
        {
            VarianteProductoId = variante.Id,
            Ubicacion = ubicacion,
            Cantidad = 0
        };
        variante.NivelesExistencias.Add(nivel);
        _db.NivelesExistencias.Add(nivel);
        return nivel;
    }

    private void RegistrarMovimiento(VarianteProducto variante, TipoMovimiento tipoMovimiento, int cantidad,
        UbicacionStock? ubicacionOrigen, UbicacionStock? ubicacionDestino, string? notas)
    {
        var saldoDeposito = variante.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Deposito)?.Cantidad ?? 0;
        var saldoTienda     = variante.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Tienda)?.Cantidad ?? 0;

        _db.MovimientosExistencias.Add(new MovimientoExistencias
        {
            VarianteProductoId = variante.Id,
            Tipo = tipoMovimiento,
            Cantidad = cantidad,
            UbicacionOrigen = ubicacionOrigen,
            UbicacionDestino = ubicacionDestino,
            CantidadResultanteDeposito = saldoDeposito,
            CantidadResultanteTienda = saldoTienda,
            OcurridoEn = _clock.UtcNow,
            Notas = notas
        });
    }

    private static ResumenExistenciasDto ResumirExistencias(VarianteProducto variante) => new(
        variante.Id,
        variante.CodigoSku,
        variante.Color,
        variante.Talla,
        variante.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Deposito)?.Cantidad ?? 0,
        variante.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Tienda)?.Cantidad ?? 0);
}