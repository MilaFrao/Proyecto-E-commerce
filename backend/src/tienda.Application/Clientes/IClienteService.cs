using Tienda.Application.Auth.Dtos;
using Tienda.Application.Common;
using Tienda.Application.Usuarios.Dtos;

namespace Tienda.Application.Clientes;

public interface IClienteService
{
    /// <summary>Crea Usuario (rol cliente) + Cliente en una sola transaccion y deja la sesion iniciada.</summary>
    Task<Result<LoginResponse>> RegistrarAsync(Dtos.RegistrarClienteRequest request, CancellationToken cancellationToken = default);

    /// <summary>Login de clientes. Una cuenta de personal no entra por aqui.</summary>
    Task<Result<LoginResponse>> LoginAsync(string correo, string clave, CancellationToken cancellationToken = default);

    Task<Result<UsuarioDto>> ObtenerPerfilAsync(Guid usuarioId, CancellationToken cancellationToken = default);
}
