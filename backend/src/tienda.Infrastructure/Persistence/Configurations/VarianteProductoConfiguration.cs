using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalogo;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class VarianteProductoConfiguration : IEntityTypeConfiguration<VarianteProducto>
{
    public void Configure(EntityTypeBuilder<VarianteProducto> b)
    {
        b.ToTable("variantes_producto");
        b.HasKey(v => v.Id);

        b.Property(v => v.CodigoSku).HasMaxLength(80).IsRequired();
        b.HasIndex(v => v.CodigoSku).IsUnique();

        b.Property(v => v.Color).HasMaxLength(60).IsRequired();
        b.Property(v => v.ColorHex).HasMaxLength(7).IsRequired();
        b.Property(v => v.Talla).HasMaxLength(30).IsRequired();

        b.Property(v => v.PrecioVentaAlternativo).HasPrecision(18, 2);
        b.Property(v => v.PrecioMayoristaAlternativo).HasPrecision(18, 2);

        // Una sola combinacion color+talla por producto.
        b.HasIndex(v => new { v.ProductoId, v.Color, v.Talla }).IsUnique();
    }
}