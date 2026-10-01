using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Tienda.Domain.Catalog;
using Tienda.Domain.Enums;
using Tienda.Domain.Inventory;

namespace Tienda.Infrastructure.Persistence.Seed;

/// <summary>
/// Solo desarrollo. Aplica las migraciones pendientes y, si la base esta vacia,
/// carga un par de productos para poder probar el catalogo sin teclear todo a mano.
/// </summary>
public static class DevSeeder
{
    public static async Task SeedAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.MigrateAsync(ct);

        if (await db.Categories.AnyAsync(ct)) return;

        var camisas = new Category { Name = "Camisas", Slug = "camisas", SortOrder = 1 };
        var pantalones = new Category { Name = "Pantalones", Slug = "pantalones", SortOrder = 2 };
        var interior = new Category { Name = "Ropa interior", Slug = "ropa-interior", SortOrder = 3 };
        var calzado = new Category { Name = "Calzado", Slug = "calzado", SortOrder = 4 };

        var urban = new Brand { Name = "Urban Fit" };
        var demo = new Brand { Name = "Marca Demo" };

        db.Categories.AddRange(camisas, pantalones, interior, calzado);
        db.Brands.AddRange(urban, demo);

        db.Products.Add(BuildProduct(
            "Camisa deportiva", "CAM-001", "Camisa ligera de secado rapido.",
            camisas, urban, 24.99m, 18m,
            new[] { "Negro", "Blanco" }, new[] { "S", "M", "L" }));

        db.Products.Add(BuildProduct(
            "Pantalon jogger", "PAN-001", "Jogger de algodon con puno elastico.",
            pantalones, demo, 34.50m, 26m,
            new[] { "Azul", "Gris" }, new[] { "M", "L", "XL" }));

        await db.SaveChangesAsync(ct);
    }

    private static Product BuildProduct(
        string name, string reference, string description,
        Category category, Brand brand, decimal retail, decimal wholesale,
        string[] colors, string[] sizes)
    {
        var product = new Product
        {
            Name = name,
            Reference = reference,
            Description = description,
            CategoryId = category.Id,
            BrandId = brand.Id,
            RetailPrice = retail,
            WholesalePrice = wholesale
        };

        var index = 0;
        foreach (var color in colors)
        {
            foreach (var size in sizes)
            {
                var variant = new ProductVariant
                {
                    ProductId = product.Id,
                    Sku = $"{reference}-{color[..3].ToUpperInvariant()}-{size}",
                    Color = color,
                    Size = size
                };

                // Una de cada tres variantes se queda en deposito sin surtir,
                // para ver en el catalogo el caso "existe pero no esta disponible".
                var supplied = index % 3 == 2 ? 0 : 8;
                var warehouse = 20 - supplied;

                variant.StockLevels.Add(new StockLevel { ProductVariantId = variant.Id, Location = StockLocation.Warehouse, Quantity = warehouse });
                variant.StockLevels.Add(new StockLevel { ProductVariantId = variant.Id, Location = StockLocation.Store, Quantity = supplied });

                variant.Movements.Add(new StockMovement
                {
                    ProductVariantId = variant.Id,
                    Type = MovementType.Entry,
                    Quantity = 20,
                    ToLocation = StockLocation.Warehouse,
                    ResultingWarehouseQuantity = 20,
                    ResultingStoreQuantity = 0,
                    OccurredAt = DateTime.UtcNow.AddDays(-3),
                    Notes = "Carga inicial de datos de prueba"
                });

                if (supplied > 0)
                {
                    variant.Movements.Add(new StockMovement
                    {
                        ProductVariantId = variant.Id,
                        Type = MovementType.Transfer,
                        Quantity = supplied,
                        FromLocation = StockLocation.Warehouse,
                        ToLocation = StockLocation.Store,
                        ResultingWarehouseQuantity = warehouse,
                        ResultingStoreQuantity = supplied,
                        OccurredAt = DateTime.UtcNow.AddDays(-2),
                        Notes = "Surtido inicial de prueba"
                    });
                }

                product.Variants.Add(variant);
                index++;
            }
        }

        return product;
    }
}
