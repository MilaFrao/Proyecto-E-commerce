namespace Tienda.Application.Abstractions;

/// <summary>Convierte claves en huellas (hash) y las compara. Nunca se guarda la clave en claro.</summary>
public interface IPasswordHasher
{
    string Hash(string password);

    bool Verify(string hash, string password);

    /// <summary>
    /// Huella de una clave que nadie usa. Se compara cuando el correo no existe, para que
    /// el login tarde lo mismo exista o no el usuario (evita descubrir correos por tiempo de respuesta).
    /// </summary>
    string HashFalso { get; }
}
