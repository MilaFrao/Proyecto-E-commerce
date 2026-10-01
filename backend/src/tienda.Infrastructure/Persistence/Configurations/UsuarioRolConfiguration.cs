using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Identity;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class UsuarioRolConfiguration : IEntityTypeConfiguration<UsuarioRol>
{
    public void Configure(EntityTypeBuilder<UsuarioRol> b)
    {
        b.ToTable("usuarios_roles");
        b.HasKey(ur => new { ur.UsuarioId, ur.RolId });

        b.HasOne(ur => ur.Usuario).WithMany(u => u.Roles).HasForeignKey(ur => ur.UsuarioId);
        b.HasOne(ur => ur.Rol).WithMany(r => r.Usuarios).HasForeignKey(ur => ur.RolId);
    }
}
