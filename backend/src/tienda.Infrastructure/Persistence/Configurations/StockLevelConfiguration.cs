using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalog;
using Tienda.Domain.Inventory;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class StockLevelConfiguration : IEntityTypeConfiguration<StockLevel>
{
    public void Configure(EntityTypeBuilder<StockLevel> b)
    {
        b.ToTable("stock_levels");
        b.HasKey(s => s.Id);

        b.Property(s => s.Location).HasConversion<int>();

        b.HasOne(s => s.ProductVariant)
            .WithMany(v => v.StockLevels)
            .HasForeignKey(s => s.ProductVariantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Regla dura: una sola fila por (variante, ubicacion). La base lo garantiza,
        // no el codigo. Cuando entre la segunda sucursal, este indice crece con StoreId.
        b.HasIndex(s => new { s.ProductVariantId, s.Location }).IsUnique();
    }
}
