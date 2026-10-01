using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tienda.Application.Abstractions;
using Tienda.Infrastructure.Persistence;
using Tienda.Infrastructure.Services;

namespace Tienda.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Falta la cadena de conexion 'Default'.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npg => npg.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }
}
