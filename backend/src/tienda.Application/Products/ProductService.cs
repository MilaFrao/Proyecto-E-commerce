using Microsoft.EntityFrameworkCore;
using Tienda.Aplicacion.Abstracciones;
using Tienda.Aplicacion.Comun;
using Tienda.Aplicacion.Productos.Dtos;
using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Enumeraciones;

namespace Tienda.Aplicacion.Productos;

public class ServicioProducto : IServicioProducto
{
    private readonly IContextoBaseDatos _db;
    private readonly IProveedorFechaHora _clock;

    public ServicioProducto(IContextoBaseDatos db, IProveedorFechaHora clock)
    {
        _db = db;
        _clock = clock;
    }

    public async Task<ResultadoPaginado<ProductoDto>> ListarAsync(string? busqueda, bool incluirInactivos, int pagina, int elementosPorPagina, CancellationToken tokenCancelacion = default)
    {
        pagina = Math.Max(pagina, 1);
        elementosPorPagina = Math.Clamp(elementosPorPagina, 1, 100);

        IQueryable<Producto> q = _db.Productos.AsNoTracking();

        if (!incluirInactivos)
            q = q.Where(p => p.Estado == EstadoProducto.Activo);

        var term = string.IsNullOrWhiteSpace(busqueda) ? null : busqueda.Trim().ToLower();
        if (term is not null)
        {
            q = q.Where(p =>
                p.Nombre.ToLower().Contains(term) ||
                p.Referencia.ToLower().Contains(term) ||
                (p.Marca != null && p.Marca.Nombre.ToLower().Contains(term)));
        }

        var total = await q.CountAsync(tokenCancelacion);

        var items = await q
            .OrderBy(p => p.Nombre)
            .Skip((pagina - 1) * elementosPorPagina)
            .Take(elementosPorPagina)
            .Select(p => new ProductoDto(
                p.Identificador,
                p.Nombre,
                p.Referencia,
                p.Descripcion,
                p.Categoria!.Nombre,
                p.Marca != null ? p.Marca.Nombre : null,
                p.PrecioVenta,
                p.PrecioMayorista,
                p.Estado,
                p.Variantes.Count))
            .ToListAsync(tokenCancelacion);

        return new ResultadoPaginado<ProductoDto>
        {
            Elementos = items,
            Pagina = pagina,
            ElementosPorPagina = elementosPorPagina,
            CantidadTotal = total
        };
    }

    public async Task<Resultado<ProductoDto>> CrearAsync(SolicitudCrearProducto solicitud, CancellationToken tokenCancelacion = default)
    {
        var name = solicitud.Nombre?.Trim() ?? string.Empty;
        var reference = solicitud.Referencia?.Trim() ?? string.Empty;

        if (name.Length == 0) return Resultado.Fallo<ProductoDto>("El nombre es obligatorio.");
        if (reference.Length == 0) return Resultado.Fallo<ProductoDto>("La referencia es obligatoria.");
        if (solicitud.PrecioVenta < 0 || solicitud.PrecioMayorista < 0)
            return Resultado.Fallo<ProductoDto>("Los precios no pueden ser negativos.");

        if (solicitud.Variantes is null || solicitud.Variantes.Count == 0)
            return Resultado.Fallo<ProductoDto>("Agrega al menos una variante (color y talla).");

        var category = await _db.Categorias.AsNoTracking().FirstOrDefaultAsync(c => c.Identificador == solicitud.CategoriaId, tokenCancelacion);
        if (category is null) return Resultado.Fallo<ProductoDto>("La categoria no existe.");

        string? brandName = null;
        if (solicitud.MarcaId is not null)
        {
            brandName = await _db.Marcas.AsNoTracking()
                .Where(b => b.Identificador == solicitud.MarcaId)
                .Select(b => b.Nombre)
                .FirstOrDefaultAsync(tokenCancelacion);

            if (brandName is null) return Resultado.Fallo<ProductoDto>("La marca no existe.");
        }

        if (await _db.Productos.AnyAsync(p => p.Referencia == reference, tokenCancelacion))
            return Resultado.Fallo<ProductoDto>("Ya existe un producto con esa referencia.");

        // ---- variantes: validar antes de tocar la base
        var variants = new List<VarianteProducto>();
        var seenSkus = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var seenCombos = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var input in solicitud.Variantes)
        {
            var sku = input.CodigoSku?.Trim() ?? string.Empty;
            var color = input.Color?.Trim() ?? string.Empty;
            var size = input.Talla?.Trim() ?? string.Empty;

            if (sku.Length == 0 || color.Length == 0 || size.Length == 0)
                return Resultado.Fallo<ProductoDto>("Cada variante necesita SKU, color y talla.");

            if (!seenSkus.Add(sku))
                return Resultado.Fallo<ProductoDto>($"El SKU '{sku}' esta repetido dentro del producto.");

            if (!seenCombos.Add($"{color}|{size}"))
                return Resultado.Fallo<ProductoDto>($"La combinacion {color} / {size} esta repetida.");

            variants.Add(new VarianteProducto
            {
                CodigoSku = sku,
                Color = color,
                Talla = size,
                PrecioVentaAlternativo = input.PrecioVentaAlternativo,
                PrecioMayoristaAlternativo = input.PrecioMayoristaAlternativo
            });
        }

        var skuList = variants.Select(v => v.CodigoSku).ToList();
        var takenSku = await _db.VariantesProducto
            .Where(v => skuList.Contains(v.CodigoSku))
            .Select(v => v.CodigoSku)
            .FirstOrDefaultAsync(tokenCancelacion);

        if (takenSku is not null)
            return Resultado.Fallo<ProductoDto>($"El SKU '{takenSku}' ya esta en uso por otra variante.");

        // ---- crear
        var product = new Producto
        {
            Nombre = name,
            Referencia = reference,
            Descripcion = string.IsNullOrWhiteSpace(solicitud.Descripcion) ? null : solicitud.Descripcion.Trim(),
            CategoriaId = category.Identificador,
            MarcaId = solicitud.MarcaId,
            PrecioVenta = solicitud.PrecioVenta,
            PrecioMayorista = solicitud.PrecioMayorista
        };

        foreach (var variant in variants)
        {
            variant.ProductoId = product.Identificador;
            product.Variantes.Add(variant);
        }

        if (!string.IsNullOrWhiteSpace(solicitud.UrlImagen))
        {
            product.Imagenes.Add(new ImagenProducto
            {
                ProductoId = product.Identificador,
                DireccionUrl = solicitud.UrlImagen.Trim(),
                TextoAlternativo = name,
                EsPrincipal = true
            });
        }

        _db.Productos.Add(product);
        await _db.SaveChangesAsync(tokenCancelacion);

        return Resultado.Exito(new ProductoDto(
            product.Identificador, product.Nombre, product.Referencia, product.Descripcion,
            category.Nombre, brandName,
            product.PrecioVenta, product.PrecioMayorista,
            product.Estado, variants.Count));
    }

    public async Task<Resultado> DesactivarAsync(Guid identificador, string? motivo, CancellationToken tokenCancelacion = default)
    {
        var product = await _db.Productos.FirstOrDefaultAsync(p => p.Identificador == identificador, tokenCancelacion);
        if (product is null) return Resultado.Fallo("El producto no existe.");

        product.Estado = EstadoProducto.Inactivo;
        product.DesactivadoEn = _clock.AhoraUtc;
        product.MotivoDesactivacion = string.IsNullOrWhiteSpace(motivo) ? null : motivo.Trim();
        product.ActualizadoEn = _clock.AhoraUtc;

        await _db.SaveChangesAsync(tokenCancelacion);
        return Resultado.Exito();
    }

    public async Task<Resultado> ActivarAsync(Guid identificador, CancellationToken tokenCancelacion = default)
    {
        var product = await _db.Productos.FirstOrDefaultAsync(p => p.Identificador == identificador, tokenCancelacion);
        if (product is null) return Resultado.Fallo("El producto no existe.");

        product.Estado = EstadoProducto.Activo;
        product.DesactivadoEn = null;
        product.MotivoDesactivacion = null;
        product.ActualizadoEn = _clock.AhoraUtc;

        await _db.SaveChangesAsync(tokenCancelacion);
        return Resultado.Exito();
    }
}
