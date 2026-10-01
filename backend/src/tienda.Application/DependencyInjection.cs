using Microsoft.Extensions.DependencyInjection;
using Tienda.Application.Catalog;
using Tienda.Application.Inventory;
using Tienda.Application.Lookups;
using Tienda.Application.Products;

namespace Tienda.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<ICatalogService, CatalogService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ILookupService, LookupService>();
        return services;
    }
}
