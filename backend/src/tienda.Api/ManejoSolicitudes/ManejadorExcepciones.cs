using System.Net;
using System.Text.Json;
using Tienda.Dominio.Comun;

namespace Tienda.Api.ManejoSolicitudes;

public class MiddlewareManejoExcepciones
{
    private readonly RequestDelegate _siguiente;
    private readonly ILogger<MiddlewareManejoExcepciones> _registrador;

    public MiddlewareManejoExcepciones(RequestDelegate siguiente, ILogger<MiddlewareManejoExcepciones> registrador)
    {
        _siguiente = siguiente;
        _registrador = registrador;
    }

    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await _siguiente(contexto);
        }
        catch (ExcepcionDominio excepcion)
        {
            _registrador.LogWarning(excepcion, "Regla de negocio violada");
            await EscribirRespuestaAsync(contexto, HttpStatusCode.BadRequest, excepcion.Message);
        }
        catch (Exception excepcion)
        {
            _registrador.LogError(excepcion, "Error no controlado");
            await EscribirRespuestaAsync(contexto, HttpStatusCode.InternalServerError, "Ocurrio un error inesperado.");
        }
    }

    private static Task EscribirRespuestaAsync(HttpContext contexto, HttpStatusCode codigoEstado, string mensaje)
    {
        contexto.Response.StatusCode = (int)codigoEstado;
        contexto.Response.ContentType = "application/json";
        return contexto.Response.WriteAsync(JsonSerializer.Serialize(new { error = mensaje }));
    }
}
