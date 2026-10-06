using Tienda.Domain.Identity;

namespace Tienda.Application.Abstractions;

public record TokenEmitido(string Token, DateTime ExpiraEn);

/// <summary>Emite el JWT de sesion. La implementacion (firma, claves) vive en Infrastructure.</summary>
public interface ITokenService
{
    TokenEmitido Crear(Usuario usuario, IReadOnlyCollection<string> roles);
}
