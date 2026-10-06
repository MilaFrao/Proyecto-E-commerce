using Tienda.Application.Auth.Dtos;
using Tienda.Application.Common;
using Tienda.Application.Usuarios.Dtos;

namespace Tienda.Application.Auth;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(string correo, string clave, CancellationToken cancellationToken = default);

    /// <summary>Datos frescos del usuario del token. Falla si ya no existe o fue desactivado.</summary>
    Task<Result<UsuarioDto>> ObtenerPerfilAsync(Guid usuarioId, CancellationToken cancellationToken = default);
}
