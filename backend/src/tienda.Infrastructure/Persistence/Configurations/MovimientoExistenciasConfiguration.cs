using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalogo;
using Tienda.Domain.Inventario;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class MovimientoExistenciasConfiguration : IEntityTypeConfiguration<MovimientoExistencias>
{
    public void Configure(EntityTypeBuilder<MovimientoExistencias> b)
    {
        b.ToTable("movimientos_existencias");
        b.HasKey(m => m.Id);

        b.Property(m => m.Tipo).HasConversion<int>();
        b.Property(m => m.UbicacionOrigen).HasConversion<int?>();
        b.Property(m => m.UbicacionDestino).HasConversion<int?>();
        b.Property(m => m.Referencia).HasMaxLength(120);
        b.Property(m => m.Notas).HasMaxLength(500);

        b.HasOne(m => m.Variante)
            .WithMany(v => v.Movimientos)
            .HasForeignKey(m => m.VarianteProductoId)
            .OnDelete(DeleteBehavior.Restrict); // el historial sobrevive a la variante

        b.HasIndex(m => new { m.VarianteProductoId, m.OcurridoEn });
    }
}