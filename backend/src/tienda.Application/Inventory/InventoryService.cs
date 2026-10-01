using Microsoft.EntityFrameworkCore;
using Tienda.Aplicacion.Abstracciones;
using Tienda.Aplicacion.Comun;
using Tienda.Aplicacion.Inventario.Dtos;
using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Enumeraciones;
using Tienda.Dominio.Inventario;

namespace Tienda.Aplicacion.Inventario;

/// <summary>
/// Corazon del MVP 1. Toda alteracion de stock pasa por aqui y deja
/// su rastro en StockMovement: no se toca StockLevel desde ningun otro lado.
/// </summary>
public class ServicioInventario : IServicioInventario
{
    private readonly IContextoBaseDatos _db;
    private readonly IProveedorFechaHora _clock;

    public ServicioInventario(IContextoBaseDatos db, IProveedorFechaHora clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<Resultado<ResumenExistenciasDto>> RegistrarEntradaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken tokenCancelacion = default)
    {
        if (cantidad <= 0) return Resultado.Fallo<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");

        var variant = await LoadVariantAsync(varianteId, tokenCancelacion);
        if (variant is null) return Resultado.Fallo<ResumenExistenciasDto>("La variante no existe.");

        var warehouse = GetOrCreateLevel(variant, UbicacionStock.Deposito);
        warehouse.Aumentar(cantidad);

        RecordMovement(variant, TipoMovimiento.Entrada, cantidad, null, UbicacionStock.Deposito, notas);

        await _db.SaveChangesAsync(tokenCancelacion);
        return Resultado.Exito(Summarize(variant));
    }

    public async Task<Resultado<ResumenExistenciasDto>> ReabastecerTiendaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken tokenCancelacion = default)
    {
        if (cantidad <= 0) return Resultado.Fallo<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");

        var variant = await LoadVariantAsync(varianteId, tokenCancelacion);
        if (variant is null) return Resultado.Fallo<ResumenExistenciasDto>("La variante no existe.");

        var warehouse = GetOrCreateLevel(variant, UbicacionStock.Deposito);
        var store     = GetOrCreateLevel(variant, UbicacionStock.Tienda);

        if (warehouse.Cantidad < cantidad)
            return Resultado.Fallo<ResumenExistenciasDto>($"Stock insuficiente en deposito: hay {warehouse.Cantidad}, se piden {cantidad}.");

        warehouse.Disminuir(cantidad);
        store.Aumentar(cantidad);

        RecordMovement(variant, TipoMovimiento.Traslado, cantidad, UbicacionStock.Deposito, UbicacionStock.Tienda, notas);

        await _db.SaveChangesAsync(tokenCancelacion);
        return Resultado.Exito(Summarize(variant));
    }

    public async Task<Resultado<ResumenExistenciasDto>> RegistrarVentaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken tokenCancelacion = default)
    {
        if (cantidad <= 0) return Resultado.Fallo<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");

        var variant = await LoadVariantAsync(varianteId, tokenCancelacion);
        if (variant is null) return Resultado.Fallo<ResumenExistenciasDto>("La variante no existe.");

        var store = GetOrCreateLevel(variant, UbicacionStock.Tienda);
        if (store.Cantidad < cantidad)
            return Resultado.Fallo<ResumenExistenciasDto>($"No hay unidades surtidas suficientes: hay {store.Cantidad}, se piden {cantidad}.");

        store.Disminuir(cantidad);
        RecordMovement(variant, TipoMovimiento.Venta, -cantidad, UbicacionStock.Tienda, null, notas);

        await _db.SaveChangesAsync(tokenCancelacion);
        return Resultado.Exito(Summarize(variant));
    }

    public async Task<Resultado<ResumenExistenciasDto>> ObtenerExistenciasAsync(Guid varianteId, CancellationToken tokenCancelacion = default)
    {
        var variant = await LoadVariantAsync(varianteId, tokenCancelacion);
        return variant is null
            ? Resultado.Fallo<ResumenExistenciasDto>("La variante no existe.")
            : Resultado.Exito(Summarize(variant));
    }

    public async Task<IReadOnlyList<MovimientoExistenciasDto>> ObtenerHistorialMovimientosAsync(Guid varianteId, CancellationToken tokenCancelacion = default)
        => await _db.MovimientosExistencias
            .Where(m => m.VarianteProductoId == varianteId)
            .OrderByDescending(m => m.OcurridoEn)
            .Select(m => new MovimientoExistenciasDto(
                m.Identificador, m.VarianteProductoId, m.Tipo, m.Cantidad,
                m.UbicacionOrigen, m.UbicacionDestino,
                m.CantidadResultanteDeposito, m.CantidadResultanteTienda,
                m.OcurridoEn, m.Notas))
            .ToListAsync(tokenCancelacion);

    public async Task<IReadOnlyList<ExistenciasVarianteDto>> BuscarVariantesAsync(string? busqueda, CancellationToken tokenCancelacion = default)
    {
        var q = _db.VariantesProducto
            .AsNoTracking()
            .Where(v => v.EstaActiva && v.Producto!.Estado == EstadoProducto.Activo);

        var term = string.IsNullOrWhiteSpace(busqueda) ? null : busqueda.Trim().ToLower();
        if (term is not null)
        {
            q = q.Where(v =>
                v.CodigoSku.ToLower().Contains(term) ||
                v.Producto!.Nombre.ToLower().Contains(term) ||
                v.Producto.Referencia.ToLower().Contains(term));
        }

        return await q
            .OrderBy(v => v.Producto!.Nombre).ThenBy(v => v.Color).ThenBy(v => v.Talla)
            .Take(50)
            .Select(v => new ExistenciasVarianteDto(
                v.Identificador,
                v.Producto!.Nombre,
                v.Producto.Referencia,
                v.CodigoSku,
                v.Color,
                v.Talla,
                v.NivelesExistencias.Where(s => s.Ubicacion == UbicacionStock.Deposito).Sum(s => s.Cantidad),
                v.NivelesExistencias.Where(s => s.Ubicacion == UbicacionStock.Tienda).Sum(s => s.Cantidad)))
            .ToListAsync(tokenCancelacion);
    }

    // ---------------------------------------------------------------- helpers

    private Task<VarianteProducto?> LoadVariantAsync(Guid id, CancellationToken ct)
        => _db.VariantesProducto
            .Include(v => v.NivelesExistencias)
            .FirstOrDefaultAsync(v => v.Identificador == id, ct);

    private NivelExistencias GetOrCreateLevel(VarianteProducto variant, UbicacionStock location)
    {
        var level = variant.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == location);
        if (level is not null) return level;

        level = new NivelExistencias
        {
            VarianteProductoId = variant.Identificador,
            Ubicacion = location,
            Cantidad = 0
        };
        variant.NivelesExistencias.Add(level);
        _db.NivelesExistencias.Add(level);
        return level;
    }

    private void RecordMovement(VarianteProducto variant, TipoMovimiento type, int quantity,
        UbicacionStock? from, UbicacionStock? to, string? notes)
    {
        var warehouse = variant.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Deposito)?.Cantidad ?? 0;
        var store     = variant.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Tienda)?.Cantidad ?? 0;

        _db.MovimientosExistencias.Add(new MovimientoExistencias
        {
            VarianteProductoId = variant.Identificador,
            Tipo = type,
            Cantidad = quantity,
            UbicacionOrigen = from,
            UbicacionDestino = to,
            CantidadResultanteDeposito = warehouse,
            CantidadResultanteTienda = store,
            OcurridoEn = _clock.AhoraUtc,
            Notas = notes
        });
    }

    private static ResumenExistenciasDto Summarize(VarianteProducto variant) => new(
        variant.Identificador,
        variant.CodigoSku,
        variant.Color,
        variant.Talla,
        variant.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Deposito)?.Cantidad ?? 0,
        variant.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Tienda)?.Cantidad ?? 0);
}
