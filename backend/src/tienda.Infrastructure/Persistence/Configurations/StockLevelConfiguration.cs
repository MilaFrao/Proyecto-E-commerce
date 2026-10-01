using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Inventario;

namespace Tienda.Infraestructura.Persistencia.Configuraciones;

public class ConfiguracionNivelExistencias : IEntityTypeConfiguration<NivelExistencias>
{
    public void Configure(EntityTypeBuilder<NivelExistencias> b)
    {
        b.ToTable("niveles_existencias");
        b.HasKey(s => s.Identificador);

        b.Property(s => s.Ubicacion).HasConversion<int>();

        b.HasOne(s => s.Variante)
            .WithMany(v => v.NivelesExistencias)
            .HasForeignKey(s => s.VarianteProductoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Regla dura: una sola fila por (variante, ubicacion). La base lo garantiza,
        // no el codigo. Cuando entre la segunda sucursal, este indice crece con StoreId.
        b.HasIndex(s => new { s.VarianteProductoId, s.Ubicacion }).IsUnique();
    }
}
