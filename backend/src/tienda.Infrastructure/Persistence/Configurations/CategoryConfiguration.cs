using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Dominio.Catalogo;

namespace Tienda.Infraestructura.Persistencia.Configuraciones;

public class ConfiguracionCategoria : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> b)
    {
        b.ToTable("categorias");
        b.HasKey(c => c.Identificador);

        b.Property(c => c.Nombre).HasMaxLength(120).IsRequired();
        b.Property(c => c.SegmentoUrl).HasMaxLength(140).IsRequired();
        b.HasIndex(c => c.SegmentoUrl).IsUnique();

        b.HasOne(c => c.CategoriaPadre)
            .WithMany(c => c.Subcategorias)
            .HasForeignKey(c => c.IdentificadorPadre)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
