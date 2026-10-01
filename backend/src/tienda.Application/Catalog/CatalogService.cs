using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Tienda.Aplicacion.Abstracciones;
using Tienda.Aplicacion.Catalogo.Dtos;
using Tienda.Aplicacion.Comun;
using Tienda.Aplicacion.Listas.Dtos;
using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Enumeraciones;

namespace Tienda.Aplicacion.Catalogo;

/// <summary>
/// Servicio de SOLO LECTURA. Si algun dia aparece aqui un SaveChanges,
/// es senal de que algo se monto en la capa equivocada.
///
/// Ojo: todo lo que EF debe traducir a SQL va escrito INLINE dentro de las
/// expresiones (o como una expresion tipada), nunca en metodos normales de C#.
/// Un metodo estatico dentro de un Where no se puede convertir a SQL.
/// </summary>
public class ServicioCatalogo : IServicioCatalogo
{
    private readonly IContextoBaseDatos _db;

    public ServicioCatalogo(IContextoBaseDatos db) => _db = db;

    /// <summary>Proyeccion a DTO publico. Nada de deposito, movimientos ni precio al mayor.</summary>
    private static readonly Expression<Func<Producto, ProductoCatalogoDto>> ToDto = p => new ProductoCatalogoDto(
        p.Identificador,
        p.Nombre,
        p.Descripcion,
        p.Categoria != null ? p.Categoria.Nombre : string.Empty,
        p.Marca != null ? p.Marca.Nombre : null,
        p.PrecioVenta,
        p.Imagenes.OrderByDescending(i => i.EsPrincipal).ThenBy(i => i.Orden).Select(i => i.DireccionUrl).FirstOrDefault(),
        p.Variantes
            .Where(v => v.EstaActiva)
            .Select(v => new VarianteCatalogoDto(
                v.Identificador,
                v.Color,
                v.Talla,
                v.PrecioVentaAlternativo ?? p.PrecioVenta,
                v.NivelesExistencias.Any(s => s.Ubicacion == UbicacionStock.Tienda && s.Cantidad > 0)))
            .ToList());

    public async Task<ResultadoPaginado<ProductoCatalogoDto>> ExplorarAsync(ConsultaCatalogo consulta, CancellationToken tokenCancelacion = default)
    {
        var page = Math.Max(consulta.Pagina, 1);
        var pageSize = Math.Clamp(consulta.ElementosPorPagina, 1, 100);

        var q = BasePublishedQuery();

        var search = string.IsNullOrWhiteSpace(consulta.Busqueda) ? null : consulta.Busqueda.Trim().ToLower();
        if (search is not null)
        {
            q = q.Where(p =>
                p.Nombre.ToLower().Contains(search) ||
                p.Referencia.ToLower().Contains(search) ||
                (p.Marca != null && p.Marca.Nombre.ToLower().Contains(search)));
        }

        var categoryId = consulta.CategoriaId;
        var brandId = consulta.MarcaId;
        var minPrice = consulta.PrecioMinimo;
        var maxPrice = consulta.PrecioMaximo;

        if (categoryId is not null) q = q.Where(p => p.CategoriaId == categoryId);
        if (brandId is not null) q = q.Where(p => p.MarcaId == brandId);
        if (minPrice is not null) q = q.Where(p => p.PrecioVenta >= minPrice);
        if (maxPrice is not null) q = q.Where(p => p.PrecioVenta <= maxPrice);

        // Color y talla se evaluan sobre LA MISMA variante: "Negro + M" solo
        // coincide si existe una variante negra talla M con unidades en tienda.
        var color = string.IsNullOrWhiteSpace(consulta.Color) ? null : consulta.Color.Trim();
        var size = string.IsNullOrWhiteSpace(consulta.Talla) ? null : consulta.Talla.Trim();

        if (color is not null || size is not null)
        {
            q = q.Where(p => p.Variantes.Any(v =>
                v.EstaActiva
                && (color == null || v.Color == color)
                && (size == null || v.Talla == size)
                && v.NivelesExistencias.Any(s => s.Ubicacion == UbicacionStock.Tienda && s.Cantidad > 0)));
        }

        q = consulta.OrdenarPor switch
        {
            "price_asc" => q.OrderBy(p => p.PrecioVenta).ThenBy(p => p.Nombre),
            "price_desc" => q.OrderByDescending(p => p.PrecioVenta).ThenBy(p => p.Nombre),
            "newest" => q.OrderByDescending(p => p.CreadoEn),
            _ => q.OrderBy(p => p.Nombre)
        };

        var total = await q.CountAsync(tokenCancelacion);

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ToDto)
            .ToListAsync(tokenCancelacion);

        return new ResultadoPaginado<ProductoCatalogoDto>
        {
            Elementos = items,
            Pagina = page,
            ElementosPorPagina = pageSize,
            CantidadTotal = total
        };
    }

    public async Task<ProductoCatalogoDto?> ObtenerPorIdAsync(Guid identificador, CancellationToken tokenCancelacion = default)
        => await BasePublishedQuery()
            .Where(p => p.Identificador == identificador)
            .Select(ToDto)
            .FirstOrDefaultAsync(tokenCancelacion);

    public async Task<FiltrosCatalogoDto> ObtenerFiltrosAsync(CancellationToken tokenCancelacion = default)
    {
        var categories = await _db.Categorias
            .AsNoTracking()
            .Where(c => c.EstaActiva)
            .OrderBy(c => c.Orden).ThenBy(c => c.Nombre)
            .Select(c => new ElementoListaDto(c.Identificador, c.Nombre, c.IdentificadorPadre))
            .ToListAsync(tokenCancelacion);

        var brands = await _db.Marcas
            .AsNoTracking()
            .Where(b => b.EstaActiva)
            .OrderBy(b => b.Nombre)
            .Select(b => new ElementoListaDto(b.Identificador, b.Nombre, null))
            .ToListAsync(tokenCancelacion);

        var purchasable = _db.VariantesProducto
            .AsNoTracking()
            .Where(v => v.EstaActiva
                && v.Producto!.Estado == EstadoProducto.Activo
                && v.NivelesExistencias.Any(s => s.Ubicacion == UbicacionStock.Tienda && s.Cantidad > 0));

        var colors = await purchasable.Select(v => v.Color).Distinct().OrderBy(c => c).ToListAsync(tokenCancelacion);
        var sizes = await purchasable.Select(v => v.Talla).Distinct().ToListAsync(tokenCancelacion);

        return new FiltrosCatalogoDto(categories, brands, colors, sizes);
    }

    /// <summary>Filtro maestro de publicacion: producto activo + al menos una variante surtida.</summary>
    private IQueryable<Producto> BasePublishedQuery()
        => _db.Productos
            .AsNoTracking()
            .Where(p => p.Estado == EstadoProducto.Activo
                && p.Variantes.Any(v => v.EstaActiva
                    && v.NivelesExistencias.Any(s => s.Ubicacion == UbicacionStock.Tienda && s.Cantidad > 0)));
}
