using Microsoft.Extensions.Configuration;

namespace Tienda.Infrastructure.Auth;

/// <summary>
/// Configuracion del JWT. La clave NUNCA va en el repositorio de produccion:
/// en desarrollo viene en appsettings.Development.json; en produccion, variable de entorno Jwt__Key.
/// </summary>
public sealed class JwtOptions
{
    public const int LongitudMinimaClave = 32;

    public string Key { get; init; } = string.Empty;
    public string Issuer { get; init; } = "tienda-api";
    public string Audience { get; init; } = "tienda-interfaz";
    public int ExpiraMinutos { get; init; } = 480;

    public static JwtOptions Desde(IConfiguration configuration)
    {
        var key = configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(key) || key.Length < LongitudMinimaClave)
            throw new InvalidOperationException(
                $"Falta Jwt:Key o es muy corta (minimo {LongitudMinimaClave} caracteres). " +
                "En desarrollo viene en appsettings.Development.json; en produccion defínela con la variable de entorno Jwt__Key.");

        var expira = int.TryParse(configuration["Jwt:ExpiraMinutos"], out var minutos) && minutos > 0 ? minutos : 480;

        return new JwtOptions
        {
            Key = key,
            Issuer = configuration["Jwt:Issuer"] ?? "tienda-api",
            Audience = configuration["Jwt:Audience"] ?? "tienda-interfaz",
            ExpiraMinutos = expira
        };
    }
}
