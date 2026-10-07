using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Tienda.Application.Abstractions;
using Tienda.Domain.Identity;
using Tienda.Infrastructure.Auth;

namespace Tienda.Api.Auth;

public static class AuthExtensions
{
    public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration configuration)
    {
        var jwt = JwtOptions.Desde(configuration);

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                // Los nombres de claim se dejan tal cual vienen en el token ("sub", "role"), sin la traduccion automatica de Microsoft.
                options.MapInboundClaims = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = "name",
                    RoleClaimType = "role"
                };

                options.Events = new JwtBearerEvents
                {
                    // Un token firmado no basta: el usuario debe seguir existiendo y estar activo.
                    // Asi desactivar a alguien le corta el acceso al instante, no cuando expire su token.
                    OnTokenValidated = async context =>
                    {
                        var db = context.HttpContext.RequestServices.GetRequiredService<IAppDbContext>();
                        var activo = Guid.TryParse(context.Principal?.FindFirst("sub")?.Value, out var id)
                            && await db.Usuarios.AnyAsync(u => u.Id == id && u.EstaActivo, context.HttpContext.RequestAborted);

                        if (!activo)
                            context.Fail("Usuario inexistente o desactivado.");
                    }
                };
            });

        services.AddAuthorizationBuilder()
            .AddPolicy(Politicas.Admin, policy => policy.RequireRole(Rol.Administrador))
            .AddPolicy(Politicas.Inventario, policy => policy.RequireRole(Rol.Administrador, Rol.Inventario))
            .AddPolicy(Politicas.Personal, policy => policy.RequireRole(Rol.Administrador, Rol.Inventario, Rol.Vendedor))
            .AddPolicy(Politicas.Cliente, policy => policy.RequireRole(Rol.Cliente));

        return services;
    }
}
