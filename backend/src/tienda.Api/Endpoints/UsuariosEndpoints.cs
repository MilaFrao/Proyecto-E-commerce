using System.Security.Claims;
using Tienda.Api.Auth;
using Tienda.Application.Usuarios;
using Tienda.Application.Usuarios.Dtos;

namespace Tienda.Api.Endpoints;

public static class UsuariosEndpoints
{
    public static void MapUsuariosEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/usuarios").WithTags("Usuarios").RequireAuthorization(Politicas.Admin);

        group.MapGet("/", async (IUsuarioService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ListarAsync(cancellationToken)));

        group.MapPost("/", async (CrearUsuarioRequest request, IUsuarioService service, CancellationToken cancellationToken) =>
        {
            var result = await service.CrearAsync(request, cancellationToken);
            return result.IsSuccess
                ? Results.Created($"/api/usuarios/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        });

        group.MapPost("/{id:guid}/activar", (Guid id, ClaimsPrincipal user, IUsuarioService service, CancellationToken cancellationToken)
            => CambiarEstado(id, true, user, service, cancellationToken));

        group.MapPost("/{id:guid}/desactivar", (Guid id, ClaimsPrincipal user, IUsuarioService service, CancellationToken cancellationToken)
            => CambiarEstado(id, false, user, service, cancellationToken));
    }

    private static async Task<IResult> CambiarEstado(Guid id, bool activo, ClaimsPrincipal user, IUsuarioService service, CancellationToken cancellationToken)
    {
        Guid.TryParse(user.FindFirst("sub")?.Value, out var actorId);
        var result = await service.CambiarEstadoAsync(id, activo, actorId, cancellationToken);
        return result.IsSuccess ? Results.NoContent() : Results.BadRequest(new { error = result.Error });
    }
}
