using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalogo;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class MarcaConfiguration : IEntityTypeConfiguration<Marca>
{
    public void Configure(EntityTypeBuilder<Marca> b)
    {
        b.ToTable("marcas");
        b.HasKey(x => x.Id);
        b.Property(x => x.Nombre).HasMaxLength(120).IsRequired();
        b.HasIndex(x => x.Nombre).IsUnique();
    }
}