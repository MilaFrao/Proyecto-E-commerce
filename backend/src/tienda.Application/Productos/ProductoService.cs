using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Common;
using Tienda.Application.Productos.Dtos;
using Tienda.Domain.Catalogo;
using Tienda.Domain.Enums;
using Tienda.Domain.Inventario;

namespace Tienda.Application.Productos;

public class ProductoService : IProductoService
{
    private static readonly Regex PatronColorHex = new("^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled);

    private readonly IAppDbContext _db;
    private readonly IDateTimeProvider _clock;

    public ProductoService(IAppDbContext db, IDateTimeProvider clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<PagedResult<ProductoDto>> ListarAsync(string? busqueda, bool incluirInactivos, int pagina, int elementosPorPagina, CancellationToken cancellationToken = default)
    {
        pagina = Math.Max(pagina, 1);
        elementosPorPagina = Math.Clamp(elementosPorPagina, 1, 100);

        IQueryable<Producto> consultaProductos = _db.Productos.AsNoTracking();

        if (!incluirInactivos)
            consultaProductos = consultaProductos.Where(p => p.Estado == EstadoProducto.Activo);

        var terminoBusqueda = string.IsNullOrWhiteSpace(busqueda) ? null : busqueda.Trim().ToLower();
        if (terminoBusqueda is not null)
        {
            consultaProductos = consultaProductos.Where(p =>
                p.Nombre.ToLower().Contains(terminoBusqueda) ||
                p.Referencia.ToLower().Contains(terminoBusqueda) ||
                (p.Marca != null && p.Marca.Nombre.ToLower().Contains(terminoBusqueda)));
        }

        var cantidadTotal = await consultaProductos.CountAsync(cancellationToken);

        var elementos = await consultaProductos
            .OrderBy(p => p.Nombre)
            .Skip((pagina - 1) * elementosPorPagina)
            .Take(elementosPorPagina)
            .Select(p => new ProductoDto(
                p.Id,
                p.Nombre,
                p.Referencia,
                p.Descripcion,
                p.Categoria!.Nombre,
                p.Marca != null ? p.Marca.Nombre : null,
                p.PrecioVenta,
                p.PrecioMayorista,
                p.Estado,
                p.Variantes.Count,
                p.Variantes.SelectMany(v => v.NivelesExistencias)
                    .Where(n => n.Ubicacion == UbicacionStock.Deposito).Sum(n => (int?)n.Cantidad) ?? 0,
                p.Variantes.SelectMany(v => v.NivelesExistencias)
                    .Where(n => n.Ubicacion == UbicacionStock.Tienda).Sum(n => (int?)n.Cantidad) ?? 0,
                p.Imagenes.OrderByDescending(i => i.EsPrincipal).ThenBy(i => i.Orden).Select(i => i.DireccionUrl).FirstOrDefault()))
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductoDto>
        {
            Elementos = elementos,
            Pagina = pagina,
            ElementosPorPagina = elementosPorPagina,
            CantidadTotal = cantidadTotal
        };
    }

    public async Task<Result<ProductoDto>> CrearAsync(CrearProductoRequest request, CancellationToken cancellationToken = default)
    {
        var nombre = request.Nombre?.Trim() ?? string.Empty;
        var referencia = request.Referencia?.Trim() ?? string.Empty;

        if (nombre.Length == 0) return Result.Failure<ProductoDto>("El nombre es obligatorio.");
        if (referencia.Length == 0) return Result.Failure<ProductoDto>("La referencia es obligatoria.");
        if (request.PrecioVenta < 0 || request.PrecioMayorista < 0)
            return Result.Failure<ProductoDto>("Los precios no pueden ser negativos.");

        if (request.Variantes is null || request.Variantes.Count == 0)
            return Result.Failure<ProductoDto>("Agrega al menos una variante (color y talla).");

        var categoria = await _db.Categorias.AsNoTracking().FirstOrDefaultAsync(c => c.Id == request.CategoriaId, cancellationToken);
        if (categoria is null) return Result.Failure<ProductoDto>("La categoria no existe.");

        string? nombreMarca = null;
        if (request.MarcaId is not null)
        {
            nombreMarca = await _db.Marcas.AsNoTracking()
                .Where(b => b.Id == request.MarcaId)
                .Select(b => b.Nombre)
                .FirstOrDefaultAsync(cancellationToken);

            if (nombreMarca is null) return Result.Failure<ProductoDto>("La marca no existe.");
        }

        if (await _db.Productos.AnyAsync(p => p.Referencia == referencia, cancellationToken))
            return Result.Failure<ProductoDto>("Ya existe un producto con esa referencia.");

        // ---- variantes: validar antes de tocar la base
        var variantes = new List<VarianteProducto>();
        var codigosSkuVistos = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var combinacionesVistas = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var entrada in request.Variantes)
        {
            var codigoSku = entrada.CodigoSku?.Trim() ?? string.Empty;
            var color = entrada.Color?.Trim() ?? string.Empty;
            var talla = entrada.Talla?.Trim() ?? string.Empty;

            if (codigoSku.Length == 0 || color.Length == 0 || talla.Length == 0)
                return Result.Failure<ProductoDto>("Cada variante necesita SKU, color y talla.");

            var colorHex = entrada.ColorHex?.Trim() ?? string.Empty;
            if (!PatronColorHex.IsMatch(colorHex))
                return Result.Failure<ProductoDto>($"El color '{color}' necesita un codigo hex valido (#RRGGBB).");

            if (entrada.CantidadInicial < 0)
                return Result.Failure<ProductoDto>($"La cantidad inicial de {color} / {talla} no puede ser negativa.");

            if (!codigosSkuVistos.Add(codigoSku))
                return Result.Failure<ProductoDto>($"El SKU '{codigoSku}' esta repetido dentro del producto.");

            if (!combinacionesVistas.Add($"{color}|{talla}"))
                return Result.Failure<ProductoDto>($"La combinacion {color} / {talla} esta repetida.");

            variantes.Add(new VarianteProducto
            {
                CodigoSku = codigoSku,
                Color = color,
                ColorHex = colorHex.ToUpperInvariant(),
                Talla = talla,
                PrecioVentaAlternativo = entrada.PrecioVentaAlternativo,
                PrecioMayoristaAlternativo = entrada.PrecioMayoristaAlternativo
            });
        }

        var listaCodigosSku = variantes.Select(v => v.CodigoSku).ToList();
        var codigoSkuEnUso = await _db.VariantesProducto
            .Where(v => listaCodigosSku.Contains(v.CodigoSku))
            .Select(v => v.CodigoSku)
            .FirstOrDefaultAsync(cancellationToken);

        if (codigoSkuEnUso is not null)
            return Result.Failure<ProductoDto>($"El SKU '{codigoSkuEnUso}' ya esta en uso por otra variante.");

        // ---- crear
        var producto = new Producto
        {
            Nombre = nombre,
            Referencia = referencia,
            Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim(),
            CategoriaId = categoria.Id,
            MarcaId = request.MarcaId,
            PrecioVenta = request.PrecioVenta,
            PrecioMayorista = request.PrecioMayorista
        };

        // El stock inicial nace con historial: una Entrada a deposito por variante (decision 006).
        // Todo se guarda en un solo SaveChanges, asi que es una unica transaccion.
        for (var i = 0; i < variantes.Count; i++)
        {
            var variante = variantes[i];
            var cantidadInicial = request.Variantes[i].CantidadInicial;
            variante.ProductoId = producto.Id;
            producto.Variantes.Add(variante);

            if (cantidadInicial == 0) continue;

            variante.NivelesExistencias.Add(new NivelExistencias
            {
                VarianteProductoId = variante.Id,
                Ubicacion = UbicacionStock.Deposito,
                Cantidad = cantidadInicial
            });
            variante.Movimientos.Add(new MovimientoExistencias
            {
                VarianteProductoId = variante.Id,
                Tipo = TipoMovimiento.Entrada,
                Cantidad = cantidadInicial,
                UbicacionDestino = UbicacionStock.Deposito,
                CantidadResultanteDeposito = cantidadInicial,
                CantidadResultanteTienda = 0,
                OcurridoEn = _clock.UtcNow,
                Notas = "Stock inicial al registrar el producto"
            });
        }

        if (!string.IsNullOrWhiteSpace(request.UrlImagen))
        {
            producto.Imagenes.Add(new ImagenProducto
            {
                ProductoId = producto.Id,
                DireccionUrl = request.UrlImagen.Trim(),
                TextoAlternativo = nombre,
                EsPrincipal = true
            });
        }

        _db.Productos.Add(producto);
        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success(new ProductoDto(
            producto.Id, producto.Nombre, producto.Referencia, producto.Descripcion,
            categoria.Nombre, nombreMarca,
            producto.PrecioVenta, producto.PrecioMayorista,
            producto.Estado, variantes.Count,
            request.Variantes.Sum(v => v.CantidadInicial), 0,
            producto.Imagenes.FirstOrDefault()?.DireccionUrl));
    }

    public async Task<Result> DesactivarAsync(Guid id, string? motivo, CancellationToken cancellationToken = default)
    {
        var producto = await _db.Productos.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (producto is null) return Result.Failure("El producto no existe.");

        producto.Estado = EstadoProducto.Inactivo;
        producto.DesactivadoEn = _clock.UtcNow;
        producto.MotivoDesactivacion = string.IsNullOrWhiteSpace(motivo) ? null : motivo.Trim();
        producto.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> ActivarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var producto = await _db.Productos.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (producto is null) return Result.Failure("El producto no existe.");

        producto.Estado = EstadoProducto.Activo;
        producto.DesactivadoEn = null;
        producto.MotivoDesactivacion = null;
        producto.UpdatedAt = _clock.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}