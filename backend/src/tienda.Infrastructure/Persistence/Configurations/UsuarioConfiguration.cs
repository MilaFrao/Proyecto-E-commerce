using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Identity;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> b)
    {
        b.ToTable("usuarios");
        b.HasKey(u => u.Id);
        b.Property(u => u.CorreoElectronico).HasMaxLength(200).IsRequired();
        b.HasIndex(u => u.CorreoElectronico).IsUnique();
        b.Property(u => u.NombreCompleto).HasMaxLength(200).IsRequired();
    }
}
