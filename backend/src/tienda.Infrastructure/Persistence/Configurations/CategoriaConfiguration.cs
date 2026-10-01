using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalogo;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> b)
    {
        b.ToTable("categorias");
        b.HasKey(c => c.Id);

        b.Property(c => c.Nombre).HasMaxLength(120).IsRequired();
        b.Property(c => c.Slug).HasMaxLength(140).IsRequired();
        b.HasIndex(c => c.Slug).IsUnique();

        b.HasOne(c => c.CategoriaPadre)
            .WithMany(c => c.Subcategorias)
            .HasForeignKey(c => c.PadreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}