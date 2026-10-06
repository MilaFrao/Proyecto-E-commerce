using Tienda.Application.Common;
using Tienda.Application.Usuarios.Dtos;

namespace Tienda.Application.Usuarios;

public interface IUsuarioService
{
    Task<IReadOnlyList<UsuarioDto>> ListarAsync(CancellationToken cancellationToken = default);

    Task<Result<UsuarioDto>> CrearAsync(CrearUsuarioRequest request, CancellationToken cancellationToken = default);

    /// <summary>Los usuarios no se borran: se desactivan, igual que los productos.</summary>
    Task<Result> CambiarEstadoAsync(Guid id, bool activo, Guid actorId, CancellationToken cancellationToken = default);
}
