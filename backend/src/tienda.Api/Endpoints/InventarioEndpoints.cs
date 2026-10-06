using Tienda.Api.Auth;
using Tienda.Application.Inventario;
using Tienda.Application.Inventario.Dtos;
using Tienda.Domain.Enums;

namespace Tienda.Api.Endpoints;

public static class InventarioEndpoints
{
    public record CantidadRequest(int Cantidad, string? Notas);
    public record AjusteRequest(UbicacionStock Ubicacion, int CantidadContada, string? Notas);
    public record MermaRequest(UbicacionStock Ubicacion, int Cantidad, string? Notas);

    public static void MapInventarioEndpoints(this IEndpointRouteBuilder app)
    {
        // Consultar: todo el personal (el vendedor mira existencias). Mover stock: solo inventario y admin.
        var group = app.MapGroup("/api/inventario").WithTags("Inventario")
            .RequireAuthorization(Politicas.Personal);

        // ---- consultas

        // ?busqueda=&estado=todos|disponible|solo-deposito|agotado|por-surtir|critico&umbral=&pagina=&elementosPorPagina=
        group.MapGet("/variantes", async (string? busqueda, string? estado, int? umbral, int? pagina, int? elementosPorPagina, IInventarioService service, CancellationToken cancellationToken)
            => Results.Ok(await service.BuscarVariantesAsync(busqueda, estado, pagina ?? 1, elementosPorPagina ?? 50, umbral, cancellationToken)));

        // ?desde=2026-10-05T04:00:00Z (con zona horaria). Sin "desde": ultimas 24 horas.
        // ?umbral= (opcional) es el maximo de unidades en total para contar una variante como "critica".
        group.MapGet("/resumen", async (DateTimeOffset? desde, int? umbral, IInventarioService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ObtenerResumenAsync((desde?.UtcDateTime) ?? DateTime.UtcNow.AddDays(-1), umbral, cancellationToken)));

        // ?desde=<medianoche local del primer dia, con zona>&dias=7 : unidades entradas/surtidas/vendidas por dia.
        group.MapGet("/actividad", async (DateTimeOffset? desde, int? dias, IInventarioService service, CancellationToken cancellationToken) =>
        {
            var n = Math.Clamp(dias ?? 7, 1, 31);
            var inicio = (desde?.UtcDateTime) ?? DateTime.UtcNow.Date.AddDays(1 - n);
            return Results.Ok(await service.ObtenerActividadAsync(inicio, n, cancellationToken));
        });

        // ?busqueda=&tipo=Entrada|Traslado|Venta|Ajuste|Merma&pagina=&elementosPorPagina=
        group.MapGet("/movimientos", async (string? busqueda, string? tipo, int? pagina, int? elementosPorPagina, IInventarioService service, CancellationToken cancellationToken) =>
        {
            TipoMovimiento? filtroTipo = null;
            if (!string.IsNullOrWhiteSpace(tipo))
            {
                if (!Enum.TryParse<TipoMovimiento>(tipo, ignoreCase: true, out var t) || !Enum.IsDefined(t))
                    return Results.BadRequest(new { error = $"Tipo de movimiento desconocido: {tipo}." });
                filtroTipo = t;
            }
            return Results.Ok(await service.ListarMovimientosAsync(busqueda, filtroTipo, pagina ?? 1, elementosPorPagina ?? 50, cancellationToken));
        });

        group.MapGet("/variantes/{varianteId:guid}/existencias", async (Guid varianteId, IInventarioService service, CancellationToken cancellationToken) =>
        {
            var result = await service.ObtenerExistenciasAsync(varianteId, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.Error });
        });

        group.MapGet("/variantes/{varianteId:guid}/movimientos", async (Guid varianteId, IInventarioService service, CancellationToken cancellationToken)
            => Results.Ok(await service.ObtenerHistorialMovimientosAsync(varianteId, cancellationToken)));

        // ---- movimientos (solo inventario y admin)

        group.MapPost("/variantes/{varianteId:guid}/entradas", async (Guid varianteId, CantidadRequest request, IInventarioService service, CancellationToken cancellationToken)
            => Responder(await service.RegistrarEntradaAsync(varianteId, request.Cantidad, request.Notas, cancellationToken)))
            .RequireAuthorization(Politicas.Inventario);

        group.MapPost("/variantes/{varianteId:guid}/surtido", async (Guid varianteId, CantidadRequest request, IInventarioService service, CancellationToken cancellationToken)
            => Responder(await service.ReabastecerTiendaAsync(varianteId, request.Cantidad, request.Notas, cancellationToken)))
            .RequireAuthorization(Politicas.Inventario);

        // Surtido de varias variantes de una vez (pantalla Surtido, "Surtir todo")
        group.MapPost("/surtido", async (SurtirLoteRequest request, IInventarioService service, CancellationToken cancellationToken) =>
        {
            var result = await service.SurtirLoteAsync(request, cancellationToken);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
            .RequireAuthorization(Politicas.Inventario);

        group.MapPost("/variantes/{varianteId:guid}/ventas", async (Guid varianteId, CantidadRequest request, IInventarioService service, CancellationToken cancellationToken)
            => Responder(await service.RegistrarVentaAsync(varianteId, request.Cantidad, request.Notas, cancellationToken)))
            .RequireAuthorization(Politicas.Inventario);

        group.MapPost("/variantes/{varianteId:guid}/ajustes", async (Guid varianteId, AjusteRequest request, IInventarioService service, CancellationToken cancellationToken)
            => Responder(await service.AjustarAsync(varianteId, request.Ubicacion, request.CantidadContada, request.Notas, cancellationToken)))
            .RequireAuthorization(Politicas.Inventario);

        group.MapPost("/variantes/{varianteId:guid}/mermas", async (Guid varianteId, MermaRequest request, IInventarioService service, CancellationToken cancellationToken)
            => Responder(await service.RegistrarMermaAsync(varianteId, request.Ubicacion, request.Cantidad, request.Notas, cancellationToken)))
            .RequireAuthorization(Politicas.Inventario);
    }

    private static IResult Responder(Tienda.Application.Common.Result<ResumenExistenciasDto> result)
        => result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
}
