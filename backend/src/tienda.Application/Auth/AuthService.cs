using Microsoft.EntityFrameworkCore;
using Tienda.Application.Abstractions;
using Tienda.Application.Auth.Dtos;
using Tienda.Application.Common;
using Tienda.Application.Usuarios.Dtos;

namespace Tienda.Application.Auth;

public class AuthService : IAuthService
{
    // Un solo mensaje para todo fallo: no se revela si el correo existe, si la clave fallo o si la cuenta esta desactivada.
    private const string MensajeCredenciales = "Correo o clave incorrectos.";

    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokens;
    private readonly IDateTimeProvider _clock;

    public AuthService(IAppDbContext db, IPasswordHasher hasher, ITokenService tokens, IDateTimeProvider clock)
    {
        _db = db;
        _hasher = hasher;
        _tokens = tokens;
        _clock = clock;
    }

    public async Task<Result<LoginResponse>> LoginAsync(string correo, string clave, CancellationToken cancellationToken = default)
    {
        var correoNormalizado = correo?.Trim().ToLowerInvariant() ?? string.Empty;
        if (correoNormalizado.Length == 0 || string.IsNullOrEmpty(clave))
            return Result.Failure<LoginResponse>(MensajeCredenciales);

        var usuario = await _db.Usuarios
            .Include(u => u.Roles).ThenInclude(r => r.Rol)
            .FirstOrDefaultAsync(u => u.CorreoElectronico == correoNormalizado, cancellationToken);

        // Se verifica SIEMPRE una huella, aunque el usuario no exista, para que el tiempo de respuesta no delate nada.
        var claveCorrecta = _hasher.Verify(usuario?.HuellaContrasena ?? _hasher.HashFalso, clave);

        if (usuario is null || !claveCorrecta || !usuario.EstaActivo)
            return Result.Failure<LoginResponse>(MensajeCredenciales);

        usuario.UltimoAccesoEn = _clock.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        var roles = usuario.Roles.Select(r => r.Rol!.Nombre).ToList();
        var emitido = _tokens.Crear(usuario, roles);

        return Result.Success(new LoginResponse(emitido.Token, emitido.ExpiraEn, UsuarioDto.Desde(usuario)));
    }

    public async Task<Result<UsuarioDto>> ObtenerPerfilAsync(Guid usuarioId, CancellationToken cancellationToken = default)
    {
        var usuario = await _db.Usuarios
            .AsNoTracking()
            .Include(u => u.Roles).ThenInclude(r => r.Rol)
            .FirstOrDefaultAsync(u => u.Id == usuarioId, cancellationToken);

        return usuario is null || !usuario.EstaActivo
            ? Result.Failure<UsuarioDto>("La sesion ya no es valida.")
            : Result.Success(UsuarioDto.Desde(usuario));
    }
}
