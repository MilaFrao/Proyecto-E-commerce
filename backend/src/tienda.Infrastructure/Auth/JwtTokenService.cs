using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Tienda.Application.Abstractions;
using Tienda.Domain.Identity;

namespace Tienda.Infrastructure.Auth;

public sealed class JwtTokenService : ITokenService
{
    private readonly JwtOptions _options;
    private readonly IDateTimeProvider _clock;
    private readonly SigningCredentials _credentials;

    public JwtTokenService(JwtOptions options, IDateTimeProvider clock)
    {
        _options = options;
        _clock = clock;
        _credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key)),
            SecurityAlgorithms.HmacSha256);
    }

    public TokenEmitido Crear(Usuario usuario, IReadOnlyCollection<string> roles)
    {
        var ahora = _clock.UtcNow;
        var expira = ahora.AddMinutes(_options.ExpiraMinutos);

        // Nombres de claim cortos y estandar. El rol va como "role": la API lo lee con RoleClaimType = "role".
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.CorreoElectronico),
            new(JwtRegisteredClaimNames.Name, usuario.NombreCompleto),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        claims.AddRange(roles.Select(rol => new Claim("role", rol)));

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: ahora,
            expires: expira,
            signingCredentials: _credentials);

        return new TokenEmitido(new JwtSecurityTokenHandler().WriteToken(token), expira);
    }
}
