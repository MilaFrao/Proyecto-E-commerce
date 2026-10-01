using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalog;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> b)
    {
        b.ToTable("product_variants");
        b.HasKey(v => v.Id);

        b.Property(v => v.Sku).HasMaxLength(80).IsRequired();
        b.HasIndex(v => v.Sku).IsUnique();

        b.Property(v => v.Color).HasMaxLength(60).IsRequired();
        b.Property(v => v.Size).HasMaxLength(30).IsRequired();

        b.Property(v => v.RetailPriceOverride).HasPrecision(18, 2);
        b.Property(v => v.WholesalePriceOverride).HasPrecision(18, 2);

        // Una sola combinacion color+talla por producto.
        b.HasIndex(v => new { v.ProductId, v.Color, v.Size }).IsUnique();
    }
}
