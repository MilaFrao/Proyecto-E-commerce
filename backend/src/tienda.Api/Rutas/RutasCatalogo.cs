using Tienda.Aplicacion.Catalogo;

namespace Tienda.Api.Rutas;

public static class RutasCatalogo
{
    public static void MapearRutasCatalogo(this IEndpointRouteBuilder app)
    {
        // Publico y sin autenticacion: es la regla de la seccion 15.
        var grupo = app.MapGroup("/api/catalogo").WithTags("Catalogo");

        grupo.MapGet("/filtros", async (IServicioCatalogo servicio, CancellationToken tokenCancelacion)
            => Results.Ok(await servicio.ObtenerFiltrosAsync(tokenCancelacion)));

        grupo.MapGet("/productos", async (
            string? busqueda, Guid? categoriaId, Guid? marcaId,
            string? color, string? talla,
            decimal? precioMinimo, decimal? precioMaximo,
            string? ordenarPor, int? pagina, int? elementosPorPagina,
            IServicioCatalogo servicio, CancellationToken tokenCancelacion) =>
        {
            var consulta = new ConsultaCatalogo(
                busqueda, categoriaId, marcaId, color, talla, precioMinimo, precioMaximo,
                ordenarPor ?? "nombre", pagina ?? 1, Math.Clamp(elementosPorPagina ?? 24, 1, 100));

            return Results.Ok(await servicio.ExplorarAsync(consulta, tokenCancelacion));
        });

        grupo.MapGet("/productos/{identificador:guid}", async (Guid identificador, IServicioCatalogo servicio, CancellationToken tokenCancelacion) =>
        {
            var producto = await servicio.ObtenerPorIdAsync(identificador, tokenCancelacion);
            return producto is null ? Results.NotFound() : Results.Ok(producto);
        });
    }
}