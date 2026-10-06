using System.Net;
using System.Text.Json;
using Tienda.Domain.Common;

namespace Tienda.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
        catch (BadHttpRequestException exception)
        {
            // Datos que no se pueden leer: ?pagina=abc, una fecha mal escrita, un enum desconocido en el JSON...
            _logger.LogWarning(exception, "Peticion con formato invalido");
            await WriteResponseAsync(context, (HttpStatusCode)exception.StatusCode, "La peticion tiene datos con un formato que no se puede leer.");
        }
        catch (DomainException exception)
        {
            _logger.LogWarning(exception, "Regla de negocio violada");
            await WriteResponseAsync(context, HttpStatusCode.BadRequest, exception.Message);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Error no controlado");
            await WriteResponseAsync(context, HttpStatusCode.InternalServerError, "Ocurrio un error inesperado.");
        }
    }

    private static Task WriteResponseAsync(HttpContext context, HttpStatusCode statusCode, string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(new { error = message }));
    }
}
