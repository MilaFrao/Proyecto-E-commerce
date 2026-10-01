using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tienda.Aplicacion.Abstracciones;
using Tienda.Infraestructura.Persistencia;
using Tienda.Infraestructura.Servicios;

namespace Tienda.Infraestructura;

public static class InyeccionDependencias
{
    public static IServiceCollection AgregarInfraestructura(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Falta la cadena de conexion 'Default'.");

        services.AddDbContext<ContextoBaseDatos>(options =>
            options.UseNpgsql(connectionString, npg => npg.MigrationsAssembly(typeof(ContextoBaseDatos).Assembly.FullName)));

        services.AddScoped<IContextoBaseDatos>(sp => sp.GetRequiredService<ContextoBaseDatos>());
        services.AddSingleton<IProveedorFechaHora, ProveedorFechaHora>();

        return services;
    }
}
