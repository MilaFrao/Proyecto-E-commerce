using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalogo;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class ProductoConfiguration : IEntityTypeConfiguration<Producto>
{
    public void Configure(EntityTypeBuilder<Producto> b)
    {
        b.ToTable("productos");
        b.HasKey(p => p.Id);

        b.Property(p => p.Nombre).HasMaxLength(200).IsRequired();
        b.Property(p => p.Referencia).HasMaxLength(60).IsRequired();
        b.HasIndex(p => p.Referencia).IsUnique();

        b.Property(p => p.Descripcion).HasMaxLength(2000);
        b.Property(p => p.PrecioVenta).HasPrecision(18, 2);
        b.Property(p => p.PrecioMayorista).HasPrecision(18, 2);
        b.Property(p => p.Estado).HasConversion<int>();

        b.HasOne(p => p.Categoria)
            .WithMany(categoria => categoria.Productos)
            .HasForeignKey(p => p.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(p => p.Marca)
            .WithMany(marca => marca.Productos)
            .HasForeignKey(p => p.MarcaId)
            .OnDelete(DeleteBehavior.SetNull);

        b.HasMany(p => p.Variantes)
            .WithOne(v => v.Producto)
            .HasForeignKey(v => v.ProductoId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasMany(p => p.Imagenes)
            .WithOne(i => i.Producto)
            .HasForeignKey(i => i.ProductoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}