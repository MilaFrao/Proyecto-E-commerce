using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalog;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("products");
        b.HasKey(p => p.Id);

        b.Property(p => p.Name).HasMaxLength(200).IsRequired();
        b.Property(p => p.Reference).HasMaxLength(60).IsRequired();
        b.HasIndex(p => p.Reference).IsUnique();

        b.Property(p => p.Description).HasMaxLength(2000);
        b.Property(p => p.RetailPrice).HasPrecision(18, 2);
        b.Property(p => p.WholesalePrice).HasPrecision(18, 2);
        b.Property(p => p.Status).HasConversion<int>();

        b.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(p => p.Brand)
            .WithMany(br => br.Products)
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.SetNull);

        b.HasMany(p => p.Variants)
            .WithOne(v => v.Product)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
