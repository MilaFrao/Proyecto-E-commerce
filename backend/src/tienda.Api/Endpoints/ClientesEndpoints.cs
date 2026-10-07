using System.Security.Claims;
using Tienda.Api.Auth;
using Tienda.Application.Auth.Dtos;
using Tienda.Application.Clientes;
using Tienda.Application.Clientes.Dtos;

namespace Tienda.Api.Endpoints;

/// <summary>Cuenta del comprador (decision 018): registro, entrada y "quien soy". Todo bajo /api/clientes.</summary>
public static class ClientesEndpoints
{
    public static void MapClientesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/clientes").WithTags("Clientes");

        // Registro abierto salvo que se cierre con Clientes:RegistroAbierto = false.
        group.MapPost("/registro", async (RegistrarClienteRequest request, IClienteService service, IConfiguration configuration, CancellationToken cancellationToken) =>
        {
            if (!bool.TryParse(configuration["Clientes:RegistroAbierto"], out var abierto)) abierto = true;
            if (!abierto)
                return Results.Json(new { error = "El registro de clientes esta cerrado por ahora." }, statusCode: StatusCodes.Status403Forbidden);

            var result = await service.RegistrarAsync(request, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .AllowAnonymous()
        .RequireRateLimiting(AuthEndpoints.PoliticaLimiteLogin);

        group.MapPost("/auth/login", async (LoginRequest request, IClienteService service, CancellationToken cancellationToken) =>
        {
            var result = await service.LoginAsync(request.Correo, request.Clave, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Json(new { error = result.Error }, statusCode: StatusCodes.Status401Unauthorized);
        })
        .AllowAnonymous()
        .RequireRateLimiting(AuthEndpoints.PoliticaLimiteLogin);

        group.MapGet("/yo", async (ClaimsPrincipal user, IClienteService service, CancellationToken cancellationToken) =>
        {
            if (!Guid.TryParse(user.FindFirst("sub")?.Value, out var id))
                return Results.Unauthorized();

            var result = await service.ObtenerPerfilAsync(id, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.Unauthorized();
        })
        .RequireAuthorization(Politicas.Cliente);
    }
}
