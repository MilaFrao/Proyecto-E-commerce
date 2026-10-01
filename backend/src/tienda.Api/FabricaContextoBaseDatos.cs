using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Tienda.Infraestructura.Persistencia;

namespace Tienda.Api;

public sealed class FabricaContextoBaseDatos : IDesignTimeDbContextFactory<ContextoBaseDatos>
{
    public ContextoBaseDatos CreateDbContext(string[] argumentos)
    {
        var configuracion = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var cadenaConexion = configuracion.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Falta la cadena de conexion 'Default'.");

        var opciones = new DbContextOptionsBuilder<ContextoBaseDatos>()
            .UseNpgsql(cadenaConexion)
            .Options;

        return new ContextoBaseDatos(opciones);
    }
}