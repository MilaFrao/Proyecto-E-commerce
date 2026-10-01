using Microsoft.EntityFrameworkCore;
using Tienda.Aplicacion.Abstracciones;
using Tienda.Aplicacion.Comun;
using Tienda.Aplicacion.Listas.Dtos;
using Tienda.Dominio.Catalogo;

namespace Tienda.Aplicacion.Listas;

public class ServicioListas : IServicioListas
{
    private readonly IContextoBaseDatos _db;

    public ServicioListas(IContextoBaseDatos db) => _db = db;

    public async Task<IReadOnlyList<ElementoListaDto>> ObtenerCategoriasAsync(CancellationToken tokenCancelacion = default)
        => await _db.Categorias
            .AsNoTracking()
            .Where(c => c.EstaActiva)
            .OrderBy(c => c.Orden).ThenBy(c => c.Nombre)
            .Select(c => new ElementoListaDto(c.Identificador, c.Nombre, c.IdentificadorPadre))
            .ToListAsync(tokenCancelacion);

    public async Task<IReadOnlyList<ElementoListaDto>> ObtenerMarcasAsync(CancellationToken tokenCancelacion = default)
        => await _db.Marcas
            .AsNoTracking()
            .Where(b => b.EstaActiva)
            .OrderBy(b => b.Nombre)
            .Select(b => new ElementoListaDto(b.Identificador, b.Nombre, null))
            .ToListAsync(tokenCancelacion);

    public async Task<Resultado<ElementoListaDto>> CrearCategoriaAsync(string nombre, Guid? identificadorPadre, CancellationToken tokenCancelacion = default)
    {
        nombre = (nombre ?? string.Empty).Trim();
        if (nombre.Length == 0) return Resultado.Fallo<ElementoListaDto>("El nombre de la categoria es obligatorio.");

        if (identificadorPadre is not null && !await _db.Categorias.AnyAsync(c => c.Identificador == identificadorPadre, tokenCancelacion))
            return Resultado.Fallo<ElementoListaDto>("La categoria padre no existe.");

        var baseSlug = GeneradorSegmentosUrl.Generar(nombre);
        var slug = baseSlug;
        var attempt = 2;
        while (await _db.Categorias.AnyAsync(c => c.SegmentoUrl == slug, tokenCancelacion))
            slug = $"{baseSlug}-{attempt++}";

        var category = new Categoria { Nombre = nombre, SegmentoUrl = slug, IdentificadorPadre = identificadorPadre };
        _db.Categorias.Add(category);
        await _db.SaveChangesAsync(tokenCancelacion);

        return Resultado.Exito(new ElementoListaDto(category.Identificador, category.Nombre, category.IdentificadorPadre));
    }

    public async Task<Resultado<ElementoListaDto>> CrearMarcaAsync(string nombre, CancellationToken tokenCancelacion = default)
    {
        nombre = (nombre ?? string.Empty).Trim();
        if (nombre.Length == 0) return Resultado.Fallo<ElementoListaDto>("El nombre de la marca es obligatorio.");

        var lowered = nombre.ToLower();
        if (await _db.Marcas.AnyAsync(b => b.Nombre.ToLower() == lowered, tokenCancelacion))
            return Resultado.Fallo<ElementoListaDto>("Esa marca ya existe.");

        var brand = new Marca { Nombre = nombre };
        _db.Marcas.Add(brand);
        await _db.SaveChangesAsync(tokenCancelacion);

        return Resultado.Exito(new ElementoListaDto(brand.Identificador, brand.Nombre, null));
    }
}
