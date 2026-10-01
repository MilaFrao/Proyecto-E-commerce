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
        catch (DomainException ex)
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
