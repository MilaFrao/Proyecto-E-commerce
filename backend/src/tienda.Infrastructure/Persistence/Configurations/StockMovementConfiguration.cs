using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalog;
using Tienda.Domain.Inventory;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> b)
    {
        b.ToTable("stock_movements");
        b.HasKey(m => m.Id);

        b.Property(m => m.Type).HasConversion<int>();
        b.Property(m => m.FromLocation).HasConversion<int?>();
        b.Property(m => m.ToLocation).HasConversion<int?>();
        b.Property(m => m.Reference).HasMaxLength(120);
        b.Property(m => m.Notes).HasMaxLength(500);

        b.HasOne(m => m.ProductVariant)
            .WithMany(v => v.Movements)
            .HasForeignKey(m => m.ProductVariantId)
            .OnDelete(DeleteBehavior.Restrict); // el historial sobrevive a la variante

        b.HasIndex(m => new { m.ProductVariantId, m.OccurredAt });
    }
}
