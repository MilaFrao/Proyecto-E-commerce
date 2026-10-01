using Microsoft.EntityFrameworkCore;
using Tienda.Domain.Catalog;
using Tienda.Domain.Identity;
using Tienda.Domain.Inventory;

namespace Tienda.Application.Abstractions;

/// <summary>
/// Contrato del contexto de datos. Application depende de esta interfaz,
/// no de la clase concreta: asi se puede testear sin base de datos real.
/// </summary>
public interface IAppDbContext
{
    DbSet<Product> Products { get; }
    DbSet<ProductVariant> ProductVariants { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<Category> Categories { get; }
    DbSet<Brand> Brands { get; }
    DbSet<StockLevel> StockLevels { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<AppUser> Users { get; }
    DbSet<AppRole> Roles { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
