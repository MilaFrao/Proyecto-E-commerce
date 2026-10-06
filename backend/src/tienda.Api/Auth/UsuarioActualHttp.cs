using Tienda.Application.Abstractions;

namespace Tienda.Api.Auth;

/// <summary>Lee el usuario del token JWT de la peticion en curso (claim "sub").</summary>
public sealed class UsuarioActualHttp : IUsuarioActual
{
    private readonly IHttpContextAccessor _accessor;

    public UsuarioActualHttp(IHttpContextAccessor accessor) => _accessor = accessor;

    public Guid? Id =>
        Guid.TryParse(_accessor.HttpContext?.User.FindFirst("sub")?.Value, out var id) ? id : null;
}
