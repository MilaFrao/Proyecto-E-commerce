using Tienda.Application.Abstractions;
using Tienda.Domain.Identity;

namespace Tienda.Infrastructure.Auth;

/// <summary>
/// Usa el PasswordHasher de ASP.NET (PBKDF2 con sal aleatoria por clave), que ya esta probado:
/// inventar un hash propio es la peor idea en seguridad.
/// </summary>
public sealed class PasswordHasherAdapter : IPasswordHasher
{
    private static readonly Usuario Anonimo = new();
    private readonly Microsoft.AspNetCore.Identity.PasswordHasher<Usuario> _hasher = new();
    private readonly Lazy<string> _hashFalso;

    public PasswordHasherAdapter()
    {
        _hashFalso = new Lazy<string>(() => _hasher.HashPassword(Anonimo, Guid.NewGuid().ToString("N")));
    }

    public string HashFalso => _hashFalso.Value;

    public string Hash(string password) => _hasher.HashPassword(Anonimo, password);

    public bool Verify(string hash, string password)
        => _hasher.VerifyHashedPassword(Anonimo, hash, password)
            != Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed;
}
