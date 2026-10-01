using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalogo;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class ImagenProductoConfiguration : IEntityTypeConfiguration<ImagenProducto>
{
    public void Configure(EntityTypeBuilder<ImagenProducto> b)
    {
        b.ToTable("imagenes_producto");
        b.HasKey(i => i.Id);
        b.Property(i => i.DireccionUrl).HasMaxLength(500).IsRequired();
        b.Property(i => i.TextoAlternativo).HasMaxLength(200);
    }
}