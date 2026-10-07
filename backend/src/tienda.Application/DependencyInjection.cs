using Microsoft.Extensions.DependencyInjection;
using Tienda.Application.Auth;
using Tienda.Application.Catalogo;
using Tienda.Application.Clientes;
using Tienda.Application.Inventario;
using Tienda.Application.Listas;
using Tienda.Application.Productos;
using Tienda.Application.Usuarios;

namespace Tienda.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IInventarioService, InventarioService>();
        services.AddScoped<ICatalogoService, CatalogoService>();
        services.AddScoped<IProductoService, ProductoService>();
        services.AddScoped<IListasService, ListasService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUsuarioService, UsuarioService>();
        services.AddScoped<IClienteService, ClienteService>();
        return services;
    }
}