using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Dominio.Catalogo;

namespace Tienda.Infraestructura.Persistencia.Configuraciones;

public class ConfiguracionMarca : IEntityTypeConfiguration<Marca>
{
    public void Configure(EntityTypeBuilder<Marca> b)
    {
        b.ToTable("marcas");
        b.HasKey(x => x.Identificador);
        b.Property(x => x.Nombre).HasMaxLength(120).IsRequired();
        b.HasIndex(x => x.Nombre).IsUnique();
    }
}
