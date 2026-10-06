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
    private const int LargoMaximoNotas = 500;
    private const int MaximoElementosLote = 200;

    private const string MensajeConcurrencia =
        "El stock de esta prenda cambio mientras registrabas el movimiento. Revisa los numeros actualizados e intentalo de nuevo.";

    private readonly IAppDbContext _db;
    private readonly IDateTimeProvider _clock;
    private readonly IUsuarioActual _usuarioActual;

    public InventarioService(IAppDbContext db, IDateTimeProvider clock, IUsuarioActual usuarioActual)
    {
        _db = db;
        _clock = clock;
        _usuarioActual = usuarioActual;
    }

    // ================================================================ movimientos

    public async Task<Result<ResumenExistenciasDto>> RegistrarEntradaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0) return Result.Failure<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");
        if (!NotasValidas(notas, out var errorNotas)) return Result.Failure<ResumenExistenciasDto>(errorNotas);

        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        if (variante is null) return Result.Failure<ResumenExistenciasDto>("La variante no existe.");

        ObtenerOCrearNivel(variante, UbicacionStock.Deposito).Aumentar(cantidad);
        RegistrarMovimiento(variante, TipoMovimiento.Entrada, cantidad, null, UbicacionStock.Deposito, notas);

        return await GuardarAsync(() => ResumirExistencias(variante), cancellationToken);
    }

    public async Task<Result<ResumenExistenciasDto>> ReabastecerTiendaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0) return Result.Failure<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");
        if (!NotasValidas(notas, out var errorNotas)) return Result.Failure<ResumenExistenciasDto>(errorNotas);

        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        if (variante is null) return Result.Failure<ResumenExistenciasDto>("La variante no existe.");

        var error = Surtir(variante, cantidad, notas);
        if (error is not null) return Result.Failure<ResumenExistenciasDto>(error);

        return await GuardarAsync(() => ResumirExistencias(variante), cancellationToken);
    }

    public async Task<Result<IReadOnlyList<ResumenExistenciasDto>>> SurtirLoteAsync(SurtirLoteRequest request, CancellationToken cancellationToken = default)
    {
        var elementos = request.Elementos ?? Array.Empty<ElementoSurtidoRequest>();
        if (elementos.Count == 0)
            return Result.Failure<IReadOnlyList<ResumenExistenciasDto>>("No hay nada que surtir.");
        if (elementos.Count > MaximoElementosLote)
            return Result.Failure<IReadOnlyList<ResumenExistenciasDto>>($"Maximo {MaximoElementosLote} variantes por operacion.");
        if (!NotasValidas(request.Notas, out var errorNotas))
            return Result.Failure<IReadOnlyList<ResumenExistenciasDto>>(errorNotas);
        if (elementos.Select(e => e.VarianteId).Distinct().Count() != elementos.Count)
            return Result.Failure<IReadOnlyList<ResumenExistenciasDto>>("Hay variantes repetidas en el surtido.");

        var ids = elementos.Select(e => e.VarianteId).ToList();
        var variantes = await _db.VariantesProducto
            .Include(v => v.NivelesExistencias)
            .Where(v => ids.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        // Se valida y aplica todo en memoria; un solo SaveChanges = una sola transaccion.
        foreach (var elemento in elementos)
        {
            if (!variantes.TryGetValue(elemento.VarianteId, out var variante))
                return Result.Failure<IReadOnlyList<ResumenExistenciasDto>>("Una de las variantes ya no existe. Recarga la lista.");

            if (elemento.Cantidad <= 0)
                return Result.Failure<IReadOnlyList<ResumenExistenciasDto>>($"{variante.CodigoSku}: la cantidad debe ser mayor que cero.");

            var error = Surtir(variante, elemento.Cantidad, request.Notas);
            if (error is not null)
                return Result.Failure<IReadOnlyList<ResumenExistenciasDto>>($"{variante.CodigoSku}: {error}");
        }

        return await GuardarAsync<IReadOnlyList<ResumenExistenciasDto>>(
            () => elementos.Select(e => ResumirExistencias(variantes[e.VarianteId])).ToList(),
            cancellationToken);
    }

    public async Task<Result<ResumenExistenciasDto>> RegistrarVentaAsync(Guid varianteId, int cantidad, string? notas, CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0) return Result.Failure<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");
        if (!NotasValidas(notas, out var errorNotas)) return Result.Failure<ResumenExistenciasDto>(errorNotas);

        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        if (variante is null) return Result.Failure<ResumenExistenciasDto>("La variante no existe.");

        var tienda = ObtenerOCrearNivel(variante, UbicacionStock.Tienda);
        if (tienda.Cantidad < cantidad)
            return Result.Failure<ResumenExistenciasDto>($"No hay unidades surtidas suficientes: hay {tienda.Cantidad}, se piden {cantidad}.");

        tienda.Disminuir(cantidad);
        RegistrarMovimiento(variante, TipoMovimiento.Venta, -cantidad, UbicacionStock.Tienda, null, notas);

        return await GuardarAsync(() => ResumirExistencias(variante), cancellationToken);
    }

    public async Task<Result<ResumenExistenciasDto>> AjustarAsync(Guid varianteId, UbicacionStock ubicacion, int cantidadContada, string? notas, CancellationToken cancellationToken = default)
    {
        if (!Enum.IsDefined(ubicacion)) return Result.Failure<ResumenExistenciasDto>("Ubicacion no valida.");
        if (cantidadContada < 0) return Result.Failure<ResumenExistenciasDto>("La cantidad contada no puede ser negativa.");
        if (string.IsNullOrWhiteSpace(notas)) return Result.Failure<ResumenExistenciasDto>("Indica el motivo del ajuste.");
        if (!NotasValidas(notas, out var errorNotas)) return Result.Failure<ResumenExistenciasDto>(errorNotas);

        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        if (variante is null) return Result.Failure<ResumenExistenciasDto>("La variante no existe.");

        var nivel = ObtenerOCrearNivel(variante, ubicacion);
        var diferencia = cantidadContada - nivel.Cantidad;
        if (diferencia == 0)
            return Result.Failure<ResumenExistenciasDto>($"El conteo coincide con el sistema ({nivel.Cantidad}): no hay nada que ajustar.");

        if (diferencia > 0) nivel.Aumentar(diferencia);
        else nivel.Disminuir(-diferencia);

        // Sobrante: entra a la ubicacion. Faltante: sale de ella.
        RegistrarMovimiento(variante, TipoMovimiento.Ajuste, diferencia,
            diferencia < 0 ? ubicacion : null,
            diferencia > 0 ? ubicacion : null,
            notas);

        return await GuardarAsync(() => ResumirExistencias(variante), cancellationToken);
    }

    public async Task<Result<ResumenExistenciasDto>> RegistrarMermaAsync(Guid varianteId, UbicacionStock ubicacion, int cantidad, string? notas, CancellationToken cancellationToken = default)
    {
        if (!Enum.IsDefined(ubicacion)) return Result.Failure<ResumenExistenciasDto>("Ubicacion no valida.");
        if (cantidad <= 0) return Result.Failure<ResumenExistenciasDto>("La cantidad debe ser mayor que cero.");
        if (string.IsNullOrWhiteSpace(notas)) return Result.Failure<ResumenExistenciasDto>("Indica el motivo de la merma (dano, perdida...).");
        if (!NotasValidas(notas, out var errorNotas)) return Result.Failure<ResumenExistenciasDto>(errorNotas);

        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        if (variante is null) return Result.Failure<ResumenExistenciasDto>("La variante no existe.");

        var nivel = ObtenerOCrearNivel(variante, ubicacion);
        if (nivel.Cantidad < cantidad)
            return Result.Failure<ResumenExistenciasDto>($"No hay tantas unidades en {NombreUbicacion(ubicacion)}: hay {nivel.Cantidad}, se piden {cantidad}.");

        nivel.Disminuir(cantidad);
        RegistrarMovimiento(variante, TipoMovimiento.Merma, -cantidad, ubicacion, null, notas);

        return await GuardarAsync(() => ResumirExistencias(variante), cancellationToken);
    }

    // ================================================================ consultas

    public async Task<Result<ResumenExistenciasDto>> ObtenerExistenciasAsync(Guid varianteId, CancellationToken cancellationToken = default)
    {
        var variante = await CargarVarianteAsync(varianteId, cancellationToken);
        return variante is null
            ? Result.Failure<ResumenExistenciasDto>("La variante no existe.")
            : Result.Success(ResumirExistencias(variante));
    }

    public async Task<PagedResult<ExistenciasVarianteDto>> BuscarVariantesAsync(string? busqueda, string? estado, int pagina, int elementosPorPagina, CancellationToken cancellationToken = default)
    {
        pagina = Math.Max(pagina, 1);
        elementosPorPagina = Math.Clamp(elementosPorPagina, 1, 100);

        var consultaVariantes = _db.VariantesProducto
            .AsNoTracking()
            .Where(v => v.EstaActiva && v.Producto!.Estado == EstadoProducto.Activo);

        var terminoBusqueda = string.IsNullOrWhiteSpace(busqueda) ? null : busqueda.Trim().ToLower();
        if (terminoBusqueda is not null)
        {
            consultaVariantes = consultaVariantes.Where(v =>
                v.CodigoSku.ToLower().Contains(terminoBusqueda) ||
                v.Color.ToLower().Contains(terminoBusqueda) ||
                v.Producto!.Nombre.ToLower().Contains(terminoBusqueda) ||
                v.Producto.Referencia.ToLower().Contains(terminoBusqueda));
        }

        // Primero se calculan los saldos; despues se filtra y ordena por ellos.
        var conSaldos = consultaVariantes.Select(v => new
        {
            Variante = v,
            Deposito = v.NivelesExistencias.Where(s => s.Ubicacion == UbicacionStock.Deposito).Sum(s => s.Cantidad),
            Tienda = v.NivelesExistencias.Where(s => s.Ubicacion == UbicacionStock.Tienda).Sum(s => s.Cantidad),
            UltimoMovimiento = v.Movimientos.Max(m => (DateTime?)m.OcurridoEn)
        });

        var filtro = (estado ?? EstadoExistencias.Todos).Trim().ToLowerInvariant();
        conSaldos = filtro switch
        {
            EstadoExistencias.Disponible => conSaldos.Where(x => x.Tienda > 0),
            EstadoExistencias.SoloDeposito => conSaldos.Where(x => x.Tienda == 0 && x.Deposito > 0),
            EstadoExistencias.Agotado => conSaldos.Where(x => x.Tienda == 0 && x.Deposito == 0),
            EstadoExistencias.PorSurtir => conSaldos.Where(x => x.Deposito > 0),
            _ => conSaldos
        };

        var cantidadTotal = await conSaldos.CountAsync(cancellationToken);

        // En "por surtir" van primero las que no tienen nada en tienda: son las que no se estan vendiendo.
        var ordenadas = filtro == EstadoExistencias.PorSurtir
            ? conSaldos.OrderBy(x => x.Tienda > 0).ThenBy(x => x.Variante.Producto!.Nombre)
            : conSaldos.OrderBy(x => x.Variante.Producto!.Nombre);

        var elementos = await ordenadas
            .ThenBy(x => x.Variante.Color).ThenBy(x => x.Variante.Talla)
            .ThenBy(x => x.Variante.Id) // desempate estable: sin esto una pagina puede repetir o saltarse filas
            .Skip((pagina - 1) * elementosPorPagina)
            .Take(elementosPorPagina)
            .Select(x => new ExistenciasVarianteDto(
                x.Variante.Id,
                x.Variante.Producto!.Nombre,
                x.Variante.Producto.Referencia,
                x.Variante.CodigoSku,
                x.Variante.Color,
                x.Variante.ColorHex,
                x.Variante.Talla,
                x.Deposito,
                x.Tienda,
                x.UltimoMovimiento))
            .ToListAsync(cancellationToken);

        return new PagedResult<ExistenciasVarianteDto>
        {
            Elementos = elementos,
            Pagina = pagina,
            ElementosPorPagina = elementosPorPagina,
            CantidadTotal = cantidadTotal
        };
    }

    public async Task<ResumenInventarioDto> ObtenerResumenAsync(DateTime desde, CancellationToken cancellationToken = default)
    {
        var niveles = _db.NivelesExistencias.AsNoTracking()
            .Where(n => n.Variante!.EstaActiva && n.Variante.Producto!.Estado == EstadoProducto.Activo);

        var unidadesDeposito = await niveles.Where(n => n.Ubicacion == UbicacionStock.Deposito).SumAsync(n => n.Cantidad, cancellationToken);
        var unidadesTienda = await niveles.Where(n => n.Ubicacion == UbicacionStock.Tienda).SumAsync(n => n.Cantidad, cancellationToken);

        var variantes = _db.VariantesProducto.AsNoTracking()
            .Where(v => v.EstaActiva && v.Producto!.Estado == EstadoProducto.Activo)
            .Select(v => new
            {
                Deposito = v.NivelesExistencias.Where(s => s.Ubicacion == UbicacionStock.Deposito).Sum(s => s.Cantidad),
                Tienda = v.NivelesExistencias.Where(s => s.Ubicacion == UbicacionStock.Tienda).Sum(s => s.Cantidad)
            });

        var activas = await variantes.CountAsync(cancellationToken);
        var sinSurtir = await variantes.CountAsync(x => x.Deposito > 0 && x.Tienda == 0, cancellationToken);
        var agotadas = await variantes.CountAsync(x => x.Deposito == 0 && x.Tienda == 0, cancellationToken);

        var movimientos = _db.MovimientosExistencias.AsNoTracking().Where(m => m.OcurridoEn >= desde);
        var entradas = await movimientos.Where(m => m.Tipo == TipoMovimiento.Entrada).SumAsync(m => m.Cantidad, cancellationToken);
        var surtidas = await movimientos.Where(m => m.Tipo == TipoMovimiento.Traslado).SumAsync(m => m.Cantidad, cancellationToken);
        var vendidas = await movimientos.Where(m => m.Tipo == TipoMovimiento.Venta).SumAsync(m => -m.Cantidad, cancellationToken);

        return new ResumenInventarioDto(unidadesDeposito, unidadesTienda, activas, sinSurtir, agotadas, desde, entradas, surtidas, vendidas);
    }

    public async Task<IReadOnlyList<MovimientoExistenciasDto>> ObtenerHistorialMovimientosAsync(Guid varianteId, CancellationToken cancellationToken = default)
        => await ProyectarMovimientos(ConsultaMovimientos().Where(x => x.Movimiento.VarianteProductoId == varianteId))
            .ToListAsync(cancellationToken);

    public async Task<PagedResult<MovimientoExistenciasDto>> ListarMovimientosAsync(string? busqueda, TipoMovimiento? tipo, int pagina, int elementosPorPagina, CancellationToken cancellationToken = default)
    {
        pagina = Math.Max(pagina, 1);
        elementosPorPagina = Math.Clamp(elementosPorPagina, 1, 100);

        var consulta = ConsultaMovimientos();

        if (tipo is not null)
            consulta = consulta.Where(x => x.Movimiento.Tipo == tipo);

        var terminoBusqueda = string.IsNullOrWhiteSpace(busqueda) ? null : busqueda.Trim().ToLower();
        if (terminoBusqueda is not null)
        {
            consulta = consulta.Where(x =>
                x.Movimiento.Variante!.CodigoSku.ToLower().Contains(terminoBusqueda) ||
                x.Movimiento.Variante.Producto!.Nombre.ToLower().Contains(terminoBusqueda) ||
                x.Movimiento.Variante.Producto.Referencia.ToLower().Contains(terminoBusqueda) ||
                (x.Movimiento.Notas != null && x.Movimiento.Notas.ToLower().Contains(terminoBusqueda)));
        }

        var cantidadTotal = await consulta.CountAsync(cancellationToken);
        var elementos = await ProyectarMovimientos(consulta)
            .Skip((pagina - 1) * elementosPorPagina)
            .Take(elementosPorPagina)
            .ToListAsync(cancellationToken);

        return new PagedResult<MovimientoExistenciasDto>
        {
            Elementos = elementos,
            Pagina = pagina,
            ElementosPorPagina = elementosPorPagina,
            CantidadTotal = cantidadTotal
        };
    }

    // ================================================================ helpers

    // Clase con propiedades (no record posicional): EF solo puede seguir componendo la consulta
    // (Where, OrderBy) sobre proyecciones hechas con inicializador de objeto, no con constructor.
    private sealed class MovimientoConUsuario
    {
        public MovimientoExistencias Movimiento { get; init; } = null!;
        public string? NombreUsuario { get; init; }
    }

    /// <summary>Movimientos con el nombre de quien los hizo (left join: los de la semilla no tienen usuario).</summary>
    private IQueryable<MovimientoConUsuario> ConsultaMovimientos()
        => from m in _db.MovimientosExistencias.AsNoTracking()
           join u in _db.Usuarios.AsNoTracking() on m.RealizadoPorUsuarioId equals (Guid?)u.Id into usuarios
           from u in usuarios.DefaultIfEmpty()
           select new MovimientoConUsuario { Movimiento = m, NombreUsuario = u != null ? u.NombreCompleto : null };

    private static IQueryable<MovimientoExistenciasDto> ProyectarMovimientos(IQueryable<MovimientoConUsuario> consulta)
        => consulta
            .OrderByDescending(x => x.Movimiento.OcurridoEn)
            .ThenByDescending(x => x.Movimiento.Id) // un surtido en lote deja varios con la misma hora
            .Select(x => new MovimientoExistenciasDto(
                x.Movimiento.Id,
                x.Movimiento.VarianteProductoId,
                x.Movimiento.Variante!.Producto!.Nombre,
                x.Movimiento.Variante.CodigoSku,
                x.Movimiento.Variante.Color,
                x.Movimiento.Variante.ColorHex,
                x.Movimiento.Variante.Talla,
                x.Movimiento.Tipo,
                x.Movimiento.Cantidad,
                x.Movimiento.UbicacionOrigen,
                x.Movimiento.UbicacionDestino,
                x.Movimiento.CantidadResultanteDeposito,
                x.Movimiento.CantidadResultanteTienda,
                x.Movimiento.OcurridoEn,
                x.Movimiento.Notas,
                x.NombreUsuario));

    /// <summary>Deposito -> tienda sobre una variante ya cargada. Devuelve el error o null.</summary>
    private string? Surtir(VarianteProducto variante, int cantidad, string? notas)
    {
        var deposito = ObtenerOCrearNivel(variante, UbicacionStock.Deposito);
        if (deposito.Cantidad < cantidad)
            return $"Stock insuficiente en deposito: hay {deposito.Cantidad}, se piden {cantidad}.";

        deposito.Disminuir(cantidad);
        ObtenerOCrearNivel(variante, UbicacionStock.Tienda).Aumentar(cantidad);
        RegistrarMovimiento(variante, TipoMovimiento.Traslado, cantidad, UbicacionStock.Deposito, UbicacionStock.Tienda, notas);
        return null;
    }

    /// <summary>
    /// Guarda y traduce los choques de concurrencia (dos personas moviendo la misma prenda a la vez)
    /// a un mensaje para el usuario, en vez de un 500.
    /// </summary>
    private async Task<Result<T>> GuardarAsync<T>(Func<T> resultado, CancellationToken cancellationToken)
    {
        try
        {
            await _db.SaveChangesAsync(cancellationToken);
            return Result.Success(resultado());
        }
        catch (DbUpdateConcurrencyException)
        {
            return Result.Failure<T>(MensajeConcurrencia);
        }
        catch (DbUpdateException ex) when (EsChoqueDeDatos(ex))
        {
            // 23505: dos peticiones crearon a la vez el primer nivel de la misma ubicacion (indice unico).
            // 23514: el CHECK de stock no negativo. Cualquier otro error sigue su camino y queda en el log.
            return Result.Failure<T>(MensajeConcurrencia);
        }
    }

    /// <summary>Npgsql antepone el codigo SQLSTATE al mensaje ("23505: ..."); asi Application no depende de Npgsql.</summary>
    private static bool EsChoqueDeDatos(DbUpdateException ex)
    {
        var mensaje = ex.InnerException?.Message ?? string.Empty;
        return mensaje.StartsWith("23505") || mensaje.StartsWith("23514");
    }

    private static bool NotasValidas(string? notas, out string error)
    {
        error = string.Empty;
        if (notas is not null && notas.Trim().Length > LargoMaximoNotas)
        {
            error = $"Las notas admiten hasta {LargoMaximoNotas} caracteres.";
            return false;
        }
        return true;
    }

    private static string NombreUbicacion(UbicacionStock ubicacion)
        => ubicacion == UbicacionStock.Deposito ? "deposito" : "tienda";

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
        // Se marcan TODOS los niveles de la variante como modificados: asi el control de concurrencia (xmin)
        // cubre tambien el que no cambio, y la foto de saldos que guarda el movimiento nunca queda vieja.
        // Efecto: dos movimientos simultaneos sobre la misma prenda no pueden pasar los dos; el segundo reintenta.
        foreach (var nivel in variante.NivelesExistencias)
            nivel.UpdatedAt = _clock.UtcNow;

        var saldoDeposito = variante.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Deposito)?.Cantidad ?? 0;
        var saldoTienda = variante.NivelesExistencias.FirstOrDefault(s => s.Ubicacion == UbicacionStock.Tienda)?.Cantidad ?? 0;

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
            RealizadoPorUsuarioId = _usuarioActual.Id,
            Notas = string.IsNullOrWhiteSpace(notas) ? null : notas.Trim()
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
