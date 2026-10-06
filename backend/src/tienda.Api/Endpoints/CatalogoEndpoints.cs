using Tienda.Application.Catalogo;

namespace Tienda.Api.Endpoints;

public static class CatalogoEndpoints
{
    public static void MapCatalogoEndpoints(this IEndpointRouteBuilder app)
    {
        // Publico y sin autenticacion: es la regla de la seccion 15.
        var group = app.MapGroup("/api/catalogo").WithTags("Catalogo").AllowAnonymous();

        group.MapGet("/filtros", async (ICatalogoService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ObtenerFiltrosAsync(cancellationToken)));

        group.MapGet("/productos", async (
            string? busqueda, Guid? categoriaId, Guid? marcaId,
            string? color, string? talla,
            decimal? precioMinimo, decimal? precioMaximo,
            string? ordenarPor, int? pagina, int? elementosPorPagina,
            ICatalogoService service, CancellationToken cancellationToken) =>
        {
            var consulta = new ConsultaCatalogo(
                busqueda, categoriaId, marcaId, color, talla, precioMinimo, precioMaximo,
                ordenarPor ?? "nombre", pagina ?? 1, Math.Clamp(elementosPorPagina ?? 24, 1, 100));

            return Results.Ok(await service.ExplorarAsync(consulta, cancellationToken));
        });

        group.MapGet("/productos/{id:guid}", async (Guid id, ICatalogoService service, CancellationToken cancellationToken) =>
        {
            var producto = await service.ObtenerPorIdAsync(id, cancellationToken);
            return producto is null ? Results.NotFound() : Results.Ok(producto);
        });
    }
}