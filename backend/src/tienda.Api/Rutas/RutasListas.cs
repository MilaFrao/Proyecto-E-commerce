using Tienda.Aplicacion.Listas;

namespace Tienda.Api.Rutas;

public static class RutasListas
{
    public record SolicitudCrearCategoria(string Nombre, Guid? IdentificadorPadre);
    public record SolicitudCrearMarca(string Nombre);

    public static void MapearRutasListas(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/listas").WithTags("Listas");

        grupo.MapGet("/categorias", async (IServicioListas servicio, CancellationToken tokenCancelacion)
            => Results.Ok(await servicio.ObtenerCategoriasAsync(tokenCancelacion)));

        grupo.MapGet("/marcas", async (IServicioListas servicio, CancellationToken tokenCancelacion)
            => Results.Ok(await servicio.ObtenerMarcasAsync(tokenCancelacion)));

        grupo.MapPost("/categorias", async (SolicitudCrearCategoria solicitud, IServicioListas servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.CrearCategoriaAsync(solicitud.Nombre, solicitud.IdentificadorPadre, tokenCancelacion);
            return resultado.EsExitoso ? Results.Ok(resultado.Valor) : Results.BadRequest(new { error = resultado.Error });
        });

        grupo.MapPost("/marcas", async (SolicitudCrearMarca solicitud, IServicioListas servicio, CancellationToken tokenCancelacion) =>
        {
            var resultado = await servicio.CrearMarcaAsync(solicitud.Nombre, tokenCancelacion);
            return resultado.EsExitoso ? Results.Ok(resultado.Valor) : Results.BadRequest(new { error = resultado.Error });
        });
    }
}