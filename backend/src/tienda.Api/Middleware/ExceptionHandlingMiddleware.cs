using System.Net;
using System.Text.Json;
using Tienda.Dominio.Comun;

namespace Tienda.Api.ManejoSolicitudes;

public class MiddlewareManejoExcepciones
{
    private readonly RequestDelegate _next;
    private readonly ILogger<MiddlewareManejoExcepciones> _logger;

    public MiddlewareManejoExcepciones(RequestDelegate next, ILogger<MiddlewareManejoExcepciones> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ExcepcionDominio ex)
        {
            _logger.LogWarning(ex, "Regla de negocio violada");
            await WriteAsync(context, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado");
            await WriteAsync(context, HttpStatusCode.InternalServerError, "Ocurrio un error inesperado.");
        }
    }

    private static Task WriteAsync(HttpContext context, HttpStatusCode code, string message)
    {
        context.Response.StatusCode = (int)code;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(new { error = message }));
    }
}
