using Microsoft.Extensions.DependencyInjection;
using Tienda.Application.Catalogo;
using Tienda.Application.Inventario;
using Tienda.Application.Listas;
using Tienda.Application.Productos;

namespace Tienda.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IInventarioService, InventarioService>();
        services.AddScoped<ICatalogoService, CatalogoService>();
        services.AddScoped<IProductoService, ProductoService>();
        services.AddScoped<IListasService, ListasService>();
        return services;
    }
}