using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalog;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> b)
    {
        b.ToTable("product_images");
        b.HasKey(i => i.Id);
        b.Property(i => i.Url).HasMaxLength(500).IsRequired();
        b.Property(i => i.AltText).HasMaxLength(200);
    }
}
