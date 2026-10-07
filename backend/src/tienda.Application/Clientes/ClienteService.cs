using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Auth.Dtos;
using Tienda.Application.Clientes.Dtos;
using Tienda.Application.Common;
using Tienda.Application.Usuarios.Dtos;
using Tienda.Domain.Identity;

namespace Tienda.Application.Clientes;

public class ClienteService : IClienteService
{
    // Un solo mensaje para todo fallo de login, igual que en el panel (decision 012).
    private const string MensajeCredenciales = "Correo o clave incorrectos.";

    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokens;
    private readonly IDateTimeProvider _clock;

    public ClienteService(IAppDbContext db, IPasswordHasher hasher, ITokenService tokens, IDateTimeProvider clock)
    {
        _db = db;
        _hasher = hasher;
        _tokens = tokens;
        _clock = clock;
    }

    public async Task<Result<LoginResponse>> RegistrarAsync(RegistrarClienteRequest request, CancellationToken cancellationToken = default)
    {
        var nombre = request.Nombre?.Trim() ?? string.Empty;
        var correo = request.Correo?.Trim().ToLowerInvariant() ?? string.Empty;
        var clave = request.Clave ?? string.Empty;

        if (nombre.Length < 2 || nombre.Length > 100)
            return Result.Failure<LoginResponse>("El nombre debe tener entre 2 y 100 caracteres.");

        if (correo.Length > 200 || !ReglasCuenta.CorreoValido(correo))
            return Result.Failure<LoginResponse>("El correo no es valido.");

        var errorClave = ReglasCuenta.ValidarClave(clave);
        if (errorClave is not null)
            return Result.Failure<LoginResponse>(errorClave);

        if (!request.AceptaTerminos)
            return Result.Failure<LoginResponse>("Debes aceptar los terminos para crear la cuenta.");

        var rol = await _db.Roles.FirstOrDefaultAsync(r => r.Nombre == Rol.Cliente, cancellationToken);
        if (rol is null)
            return Result.Failure<LoginResponse>("El rol de cliente no existe en la base de datos.");

        // Version simple: se avisa si el correo ya esta tomado. Revelar quien tiene cuenta es una
        // concesion consciente de esta etapa (decision 018); se cierra junto con la verificacion por correo.
        if (await _db.Usuarios.AnyAsync(u => u.CorreoElectronico == correo, cancellationToken))
            return Result.Failure<LoginResponse>("Ya existe una cuenta con ese correo.");

        var ahora = _clock.UtcNow;
        var usuario = new Usuario
        {
            NombreCompleto = nombre,
            CorreoElectronico = correo,
            HuellaContrasena = _hasher.Hash(clave),
            CreatedAt = ahora,
            UltimoAccesoEn = ahora
        };
        usuario.Roles.Add(new UsuarioRol { UsuarioId = usuario.Id, RolId = rol.Id });

        _db.Usuarios.Add(usuario);
        _db.Clientes.Add(new Cliente { UsuarioId = usuario.Id, AceptoTerminosEn = ahora });

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Dos registros simultaneos con el mismo correo: gana el primero, el otro cae en el indice unico.
            return Result.Failure<LoginResponse>("Ya existe una cuenta con ese correo.");
        }

        usuario.Roles.First().Rol = rol;
        var emitido = _tokens.Crear(usuario, new[] { Rol.Cliente });
        return Result.Success(new LoginResponse(emitido.Token, emitido.ExpiraEn, UsuarioDto.Desde(usuario)));
    }

    public async Task<Result<LoginResponse>> LoginAsync(string correo, string clave, CancellationToken cancellationToken = default)
    {
        var correoNormalizado = correo?.Trim().ToLowerInvariant() ?? string.Empty;
        if (correoNormalizado.Length == 0 || string.IsNullOrEmpty(clave))
            return Result.Failure<LoginResponse>(MensajeCredenciales);

        var usuario = await _db.Usuarios
            .Include(u => u.Roles).ThenInclude(r => r.Rol)
            .FirstOrDefaultAsync(u => u.CorreoElectronico == correoNormalizado, cancellationToken);

        // Siempre se verifica una huella, exista o no el usuario, para que el tiempo de respuesta no delate nada.
        var claveCorrecta = _hasher.Verify(usuario?.HuellaContrasena ?? _hasher.HashFalso, clave);

        if (usuario is null || !claveCorrecta || !usuario.EstaActivo
            || !usuario.Roles.Any(r => r.Rol!.Nombre == Rol.Cliente))
            return Result.Failure<LoginResponse>(MensajeCredenciales);

        usuario.UltimoAccesoEn = _clock.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        var emitido = _tokens.Crear(usuario, new[] { Rol.Cliente });
        return Result.Success(new LoginResponse(emitido.Token, emitido.ExpiraEn, UsuarioDto.Desde(usuario)));
    }

    public async Task<Result<UsuarioDto>> ObtenerPerfilAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var usuario = await _db.Usuarios
            .AsNoTracking()
            .Include(u => u.Roles).ThenInclude(r => r.Rol)
            .FirstOrDefaultAsync(u => u.Id == usuarioId, cancellationToken);

        return usuario is null || !usuario.EstaActivo || !usuario.Roles.Any(r => r.Rol!.Nombre == Rol.Cliente)
            ? Result.Failure<UsuarioDto>("La sesion ya no es valida.")
            : Result.Success(UsuarioDto.Desde(usuario));
    }
}
