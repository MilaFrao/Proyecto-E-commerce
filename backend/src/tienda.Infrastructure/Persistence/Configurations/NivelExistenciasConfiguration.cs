using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalogo;
using Tienda.Domain.Inventario;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class NivelExistenciasConfiguration : IEntityTypeConfiguration<NivelExistencias>
{
    public void Configure(EntityTypeBuilder<NivelExistencias> b)
    {
        b.ToTable("niveles_existencias");
        b.HasKey(s => s.Id);

        b.Property(s => s.Ubicacion).HasConversion<int>();

        b.HasOne(s => s.Variante)
            .WithMany(v => v.NivelesExistencias)
            .HasForeignKey(s => s.VarianteProductoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Regla dura: una sola fila por (variante, ubicacion). La base lo garantiza,
        // no el codigo. Cuando entre la segunda sucursal, este indice crece con TiendaId.
        b.HasIndex(s => new { s.VarianteProductoId, s.Ubicacion }).IsUnique();
    }
}