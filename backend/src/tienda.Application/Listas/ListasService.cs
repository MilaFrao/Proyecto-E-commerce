using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Common;
using Tienda.Application.Listas.Dtos;
using Tienda.Domain.Catalogo;

namespace Tienda.Application.Listas;

public class ListasService : IListasService
{
    private readonly IAppDbContext _db;

    public ListasService(IAppDbContext db) => _db = db;

    public async Task<IReadOnlyList<ElementoListaDto>> ObtenerCategoriasAsync(CancellationToken cancellationToken = default)
        => await _db.Categorias
            .AsNoTracking()
            .Where(c => c.EstaActiva)
            .OrderBy(c => c.Orden).ThenBy(c => c.Nombre)
            .Select(c => new ElementoListaDto(c.Id, c.Nombre, c.PadreId))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ElementoListaDto>> ObtenerMarcasAsync(CancellationToken cancellationToken = default)
        => await _db.Marcas
            .AsNoTracking()
            .Where(b => b.EstaActiva)
            .OrderBy(b => b.Nombre)
            .Select(b => new ElementoListaDto(b.Id, b.Nombre, null))
            .ToListAsync(cancellationToken);

    public async Task<Result<ElementoListaDto>> CrearCategoriaAsync(string nombre, Guid? padreId, CancellationToken cancellationToken = default)
    {
        nombre = (nombre ?? string.Empty).Trim();
        if (nombre.Length == 0) return Result.Failure<ElementoListaDto>("El nombre de la categoria es obligatorio.");

        if (padreId is not null && !await _db.Categorias.AnyAsync(c => c.Id == padreId, cancellationToken))
            return Result.Failure<ElementoListaDto>("La categoria padre no existe.");

        var slugBase = Slug.Generate(nombre);
        var slug = slugBase;
        var intento = 2;
        while (await _db.Categorias.AnyAsync(c => c.Slug == slug, cancellationToken))
            slug = $"{slugBase}-{intento++}";

        var categoria = new Categoria { Nombre = nombre, Slug = slug, PadreId = padreId };
        _db.Categorias.Add(categoria);
        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success(new ElementoListaDto(categoria.Id, categoria.Nombre, categoria.PadreId));
    }

    public async Task<Result<ElementoListaDto>> CrearMarcaAsync(string nombre, CancellationToken cancellationToken = default)
    {
        nombre = (nombre ?? string.Empty).Trim();
        if (nombre.Length == 0) return Result.Failure<ElementoListaDto>("El nombre de la marca es obligatorio.");

        var nombreNormalizado = nombre.ToLower();
        if (await _db.Marcas.AnyAsync(b => b.Nombre.ToLower() == nombreNormalizado, cancellationToken))
            return Result.Failure<ElementoListaDto>("Esa marca ya existe.");

        var marca = new Marca { Nombre = nombre };
        _db.Marcas.Add(marca);
        await _db.SaveChangesAsync(cancellationToken);

        return Result.Success(new ElementoListaDto(marca.Id, marca.Nombre, null));
    }
}