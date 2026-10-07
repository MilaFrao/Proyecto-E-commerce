using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Common;
using Tienda.Application.Usuarios.Dtos;
using Tienda.Domain.Identity;

namespace Tienda.Application.Usuarios;

public class UsuarioService : IUsuarioService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IDateTimeProvider _clock;

    public UsuarioService(IAppDbContext db, IPasswordHasher hasher, IDateTimeProvider clock)
    {
        _db = db;
        _hasher = hasher;
        _clock = clock;
    }

    public async Task<IReadOnlyList<UsuarioDto>> ListarAsync(CancellationToken cancellationToken = default)
    {
        var usuarios = await _db.Usuarios
            .AsNoTracking()
            .Include(u => u.Roles).ThenInclude(r => r.Rol)
            // Los clientes no son personal: no aparecen en la gestion de accesos del panel.
            .Where(u => u.Roles.Any(r => Rol.DePersonal.Contains(r.Rol!.Nombre)))
            .OrderBy(u => u.NombreCompleto)
            .ToListAsync(cancellationToken);

        return usuarios.Select(UsuarioDto.Desde).ToList();
    }

    public async Task<Result<UsuarioDto>> CrearAsync(CrearUsuarioRequest request, CancellationToken cancellationToken = default)
    {
        var nombre = request.Nombre?.Trim() ?? string.Empty;
        var correo = request.Correo?.Trim().ToLowerInvariant() ?? string.Empty;
        var clave = request.Clave ?? string.Empty;
        var nombreRol = request.Rol?.Trim().ToLowerInvariant() ?? string.Empty;

        if (nombre.Length < 2 || nombre.Length > 100)
            return Result.Failure<UsuarioDto>("El nombre debe tener entre 2 y 100 caracteres.");

        if (correo.Length > 200 || !ReglasCuenta.CorreoValido(correo))
            return Result.Failure<UsuarioDto>("El correo no es valido.");

        var errorClave = ReglasCuenta.ValidarClave(clave);
        if (errorClave is not null)
            return Result.Failure<UsuarioDto>(errorClave);

        // El rol "cliente" existe pero no se crea desde aqui: los clientes se registran solos (MVP 3).
        if (!Rol.DePersonal.Contains(nombreRol))
            return Result.Failure<UsuarioDto>("El rol debe ser admin, inventario o vendedor.");

        var rol = await _db.Roles.FirstOrDefaultAsync(r => r.Nombre == nombreRol, cancellationToken);
        if (rol is null)
            return Result.Failure<UsuarioDto>("El rol no existe en la base de datos.");

        if (await _db.Usuarios.AnyAsync(u => u.CorreoElectronico == correo, cancellationToken))
            return Result.Failure<UsuarioDto>("Ya existe un usuario con ese correo.");

        var usuario = new Usuario
        {
            NombreCompleto = nombre,
            CorreoElectronico = correo,
            HuellaContrasena = _hasher.Hash(clave),
            CreatedAt = _clock.UtcNow
        };
        usuario.Roles.Add(new UsuarioRol { UsuarioId = usuario.Id, RolId = rol.Id });

        _db.Usuarios.Add(usuario);
        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Dos altas simultaneas con el mismo correo: gana la primera, la otra cae en el indice unico.
            return Result.Failure<UsuarioDto>("Ya existe un usuario con ese correo.");
        }

        // Rol cargado a mano para no repetir la consulta
        usuario.Roles.First().Rol = rol;
        return Result.Success(UsuarioDto.Desde(usuario));
    }

    public async Task<Result> CambiarEstadoAsync(Guid id, bool activo, Guid actorId, CancellationToken cancellationToken = default)
    {
        if (!activo && id == actorId)
            return Result.Failure("No puedes desactivar tu propia cuenta.");

        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (usuario is null)
            return Result.Failure("El usuario no existe.");

        usuario.EstaActivo = activo;
        usuario.UpdatedAt = _clock.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
