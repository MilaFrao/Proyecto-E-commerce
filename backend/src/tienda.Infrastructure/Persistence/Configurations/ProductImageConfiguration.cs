using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Dominio.Catalogo;

namespace Tienda.Infraestructura.Persistencia.Configuraciones;

public class ConfiguracionImagenProducto : IEntityTypeConfiguration<ImagenProducto>
{
    public void Configure(EntityTypeBuilder<ImagenProducto> b)
    {
        b.ToTable("imagenes_producto");
        b.HasKey(i => i.Identificador);
        b.Property(i => i.DireccionUrl).HasMaxLength(500).IsRequired();
        b.Property(i => i.TextoAlternativo).HasMaxLength(200);
    }
}
