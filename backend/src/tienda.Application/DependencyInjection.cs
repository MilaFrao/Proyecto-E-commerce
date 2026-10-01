using Microsoft.Extensions.DependencyInjection;
using Tienda.Aplicacion.Catalogo;
using Tienda.Aplicacion.Inventario;
using Tienda.Aplicacion.Listas;
using Tienda.Aplicacion.Productos;

namespace Tienda.Aplicacion;

public static class InyeccionDependencias
{
    public static IServiceCollection AgregarAplicacion(this IServiceCollection services)
    {
        services.AddScoped<IServicioInventario, ServicioInventario>();
        services.AddScoped<IServicioCatalogo, ServicioCatalogo>();
        services.AddScoped<IServicioProducto, ServicioProducto>();
        services.AddScoped<IServicioListas, ServicioListas>();
        return services;
    }
}
