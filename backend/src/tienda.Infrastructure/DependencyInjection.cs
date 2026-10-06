using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tienda.Application.Abstractions;
using Tienda.Infrastructure.Auth;
using Tienda.Infrastructure.Persistence;
using Tienda.Infrastructure.Services;

namespace Tienda.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, string contentRootPath)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Falta la cadena de conexion 'Default'.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions => npgsqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IAppDbContext>(serviceProvider => serviceProvider.GetRequiredService<AppDbContext>());
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        // Autenticacion: falla al arrancar si falta la clave del JWT, no al primer login.
        services.AddSingleton(JwtOptions.Desde(configuration));
        services.AddSingleton<IPasswordHasher, PasswordHasherAdapter>();
        services.AddSingleton<ITokenService, JwtTokenService>();

        // Fotos de productos: carpeta local detras de una interfaz, para poder pasar a S3 sin tocar el resto.
        services.AddSingleton(OpcionesImagenes.Desde(configuration, contentRootPath));
        services.AddSingleton<IAlmacenImagenes, AlmacenImagenesLocal>();

        return services;
    }
}