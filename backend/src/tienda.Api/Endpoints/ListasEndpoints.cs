using Tienda.Api.Auth;
using Tienda.Application.Listas;

namespace Tienda.Api.Endpoints;

public static class ListasEndpoints
{
    public record CrearCategoriaRequest(string Nombre, Guid? PadreId);
    public record CrearMarcaRequest(string Nombre);

    public static void MapListasEndpoints(this IEndpointRouteBuilder app)
    {
        // Leer las listas: todo el personal. Crear categorias o marcas: inventario y admin.
        var group = app.MapGroup("/api/listas").WithTags("Listas")
            .RequireAuthorization(Politicas.Personal);

        group.MapGet("/categorias", async (IListasService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ObtenerCategoriasAsync(cancellationToken)));

        group.MapGet("/marcas", async (IListasService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ObtenerMarcasAsync(cancellationToken)));

        group.MapPost("/categorias", async (CrearCategoriaRequest request, IListasService service, CancellationToken cancellationToken) =>
        {
            var result = await service.CrearCategoriaAsync(request.Nombre, request.PadreId, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
            .RequireAuthorization(Politicas.Inventario);

        group.MapPost("/marcas", async (CrearMarcaRequest request, IListasService service, CancellationToken cancellationToken) =>
        {
            var result = await service.CrearMarcaAsync(request.Nombre, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
            .RequireAuthorization(Politicas.Inventario);
    }
}