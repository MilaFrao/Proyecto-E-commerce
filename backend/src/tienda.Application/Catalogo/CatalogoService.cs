using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Catalogo.Dtos;
using Tienda.Application.Common;
using Tienda.Application.Listas.Dtos;
using Tienda.Domain.Catalogo;
using Tienda.Domain.Enums;

namespace Tienda.Application.Catalogo;

/// <summary>
/// Servicio de SOLO LECTURA. Si algun dia aparece aqui un SaveChanges,
/// es senal de que algo se monto en la capa equivocada.
///
/// Ojo: todo lo que EF debe traducir a SQL va escrito INLINE dentro de las
/// expresiones (o como una expresion tipada), nunca en metodos normales de C#.
/// Un metodo estatico dentro de un Where no se puede convertir a SQL.
/// </summary>
public class CatalogoService : ICatalogoService
{
    private readonly IAppDbContext _db;

    public CatalogoService(IAppDbContext db) => _db = db;

    /// <summary>Proyeccion a DTO publico. Nada de deposito, movimientos ni precio al mayor.</summary>
    private static readonly Expression<Func<Producto, ProductoCatalogoDto>> ProyectarProductoDto = p => new ProductoCatalogoDto(
        p.Id,
        p.Nombre,
        p.Descripcion,
        p.Categoria != null ? p.Categoria.Nombre : string.Empty,
        p.Marca != null ? p.Marca.Nombre : null,
        p.PrecioVenta,
        p.Imagenes.OrderByDescending(i => i.EsPrincipal).ThenBy(i => i.Orden).Select(i => i.DireccionUrl).FirstOrDefault(),
        p.Variantes
            .Where(v => v.EstaActiva)
            .Select(v => new VarianteCatalogoDto(
                v.Id,
                v.Color,
                v.ColorHex,
                v.Talla,
                v.PrecioVentaAlternativo ?? p.PrecioVenta,
                v.NivelesExistencias.Any(s => s.Ubicacion == UbicacionStock.Tienda && s.Cantidad > 0)))
            .ToList());

    public async Task<PagedResult<ProductoCatalogoDto>> ExplorarAsync(ConsultaCatalogo consulta, CancellationToken cancellationToken = default)
    {
        var pagina = Math.Max(consulta.Pagina, 1);
        var elementosPorPagina = Math.Clamp(consulta.ElementosPorPagina, 1, 100);

        var consultaProductos = ConsultarProductosPublicados();

        var busqueda = string.IsNullOrWhiteSpace(consulta.Busqueda) ? null : consulta.Busqueda.Trim().ToLower();
        if (busqueda is not null)
        {
            consultaProductos = consultaProductos.Where(p =>
                p.Nombre.ToLower().Contains(busqueda) ||
                p.Referencia.ToLower().Contains(busqueda) ||
                (p.Marca != null && p.Marca.Nombre.ToLower().Contains(busqueda)));
        }

        var categoriaId = consulta.CategoriaId;
        var marcaId = consulta.MarcaId;
        var precioMinimo = consulta.PrecioMinimo;
        var precioMaximo = consulta.PrecioMaximo;

        if (categoriaId is not null) consultaProductos = consultaProductos.Where(p => p.CategoriaId == categoriaId);
        if (marcaId is not null) consultaProductos = consultaProductos.Where(p => p.MarcaId == marcaId);
        if (precioMinimo is not null) consultaProductos = consultaProductos.Where(p => p.PrecioVenta >= precioMinimo);
        if (precioMaximo is not null) consultaProductos = consultaProductos.Where(p => p.PrecioVenta <= precioMaximo);

        // Color y talla se evaluan sobre LA MISMA variante: "Negro + M" solo
        // coincide si existe una variante negra talla M con unidades en tienda.
        var color = string.IsNullOrWhiteSpace(consulta.Color) ? null : consulta.Color.Trim();
        var talla = string.IsNullOrWhiteSpace(consulta.Talla) ? null : consulta.Talla.Trim();

        if (color is not null || talla is not null)
        {
            consultaProductos = consultaProductos.Where(p => p.Variantes.Any(v =>
                v.EstaActiva
                && (color == null || v.Color == color)
                && (talla == null || v.Talla == talla)
                && v.NivelesExistencias.Any(s => s.Ubicacion == UbicacionStock.Tienda && s.Cantidad > 0)));
        }

        consultaProductos = consulta.OrdenarPor switch
        {
            "precio_ascendente" => consultaProductos.OrderBy(p => p.PrecioVenta).ThenBy(p => p.Nombre),
            "precio_descendente" => consultaProductos.OrderByDescending(p => p.PrecioVenta).ThenBy(p => p.Nombre),
            "recientes" => consultaProductos.OrderByDescending(p => p.CreatedAt),
            _ => consultaProductos.OrderBy(p => p.Nombre)
        };

        var cantidadTotal = await consultaProductos.CountAsync(cancellationToken);

        var elementos = await consultaProductos
            .Skip((pagina - 1) * elementosPorPagina)
            .Take(elementosPorPagina)
            .Select(ProyectarProductoDto)
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductoCatalogoDto>
        {
            Elementos = elementos,
            Pagina = pagina,
            ElementosPorPagina = elementosPorPagina,
            CantidadTotal = cantidadTotal
        };
    }

    public async Task<ProductoCatalogoDto?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await ConsultarProductosPublicados()
            .Where(p => p.Id == id)
            .Select(ProyectarProductoDto)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<FiltrosCatalogoDto> ObtenerFiltrosAsync(CancellationToken cancellationToken = default)
    {
        var categorias = await _db.Categorias
            .AsNoTracking()
            .Where(c => c.EstaActiva)
            .OrderBy(c => c.Orden).ThenBy(c => c.Nombre)
            .Select(c => new ElementoListaDto(c.Id, c.Nombre, c.PadreId))
            .ToListAsync(cancellationToken);

        var marcas = await _db.Marcas
            .AsNoTracking()
            .Where(b => b.EstaActiva)
            .OrderBy(b => b.Nombre)
            .Select(b => new ElementoListaDto(b.Id, b.Nombre, null))
            .ToListAsync(cancellationToken);

        var variantesDisponibles = _db.VariantesProducto
            .AsNoTracking()
            .Where(v => v.EstaActiva
                && v.Producto!.Estado == EstadoProducto.Activo
                && v.NivelesExistencias.Any(s => s.Ubicacion == UbicacionStock.Tienda && s.Cantidad > 0));

        var colores = await variantesDisponibles.Select(v => v.Color).Distinct().OrderBy(c => c).ToListAsync(cancellationToken);
        var tallas = await variantesDisponibles.Select(v => v.Talla).Distinct().ToListAsync(cancellationToken);

        return new FiltrosCatalogoDto(categorias, marcas, colores, tallas);
    }

    /// <summary>Filtro maestro de publicacion: producto activo + al menos una variante surtida.</summary>
    private IQueryable<Producto> ConsultarProductosPublicados()
        => _db.Productos
            .AsNoTracking()
            .Where(p => p.Estado == EstadoProducto.Activo
                && p.Variantes.Any(v => v.EstaActiva
                    && v.NivelesExistencias.Any(s => s.Ubicacion == UbicacionStock.Tienda && s.Cantidad > 0)));
}