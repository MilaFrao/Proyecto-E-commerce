using System.Security.Claims;
using Tienda.Application.Auth;
using Tienda.Application.Auth.Dtos;

namespace Tienda.Api.Endpoints;

public static class AuthEndpoints
{
    public const string PoliticaLimiteLogin = "login";

    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        // Publico, pero con limite de intentos por IP para frenar adivinadores de claves.
        group.MapPost("/login", async (LoginRequest request, IAuthService service, CancellationToken cancellationToken) =>
        {
            var result = await service.LoginAsync(request.Correo, request.Clave, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Json(new { error = result.Error }, statusCode: StatusCodes.Status401Unauthorized);
        })
        .AllowAnonymous()
        .RequireRateLimiting(PoliticaLimiteLogin);

        // "¿Quien soy?": el front lo usa al recargar la pagina para confirmar que la sesion sigue valida.
        group.MapGet("/yo", async (ClaimsPrincipal user, IAuthService service, CancellationToken cancellationToken) =>
        {
            if (!Guid.TryParse(user.FindFirst("sub")?.Value, out var id))
                return Results.Unauthorized();

            var result = await service.ObtenerPerfilAsync(id, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.Unauthorized();
        })
        .RequireAuthorization();
    }
}
