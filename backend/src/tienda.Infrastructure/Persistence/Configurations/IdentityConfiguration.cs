using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Dominio.Identidad;

namespace Tienda.Infraestructura.Persistencia.Configuraciones;

public class ConfiguracionUsuarioAplicacion : IEntityTypeConfiguration<UsuarioAplicacion>
{
    public void Configure(EntityTypeBuilder<UsuarioAplicacion> b)
    {
        b.ToTable("usuarios");
        b.HasKey(u => u.Identificador);
        b.Property(u => u.CorreoElectronico).HasMaxLength(200).IsRequired();
        b.HasIndex(u => u.CorreoElectronico).IsUnique();
        b.Property(u => u.NombreCompleto).HasMaxLength(200).IsRequired();
    }
}

public class ConfiguracionRolAplicacion : IEntityTypeConfiguration<RolAplicacion>
{
    public void Configure(EntityTypeBuilder<RolAplicacion> b)
    {
        b.ToTable("roles");
        b.HasKey(r => r.Identificador);
        b.Property(r => r.Nombre).HasMaxLength(60).IsRequired();
        b.HasIndex(r => r.Nombre).IsUnique();
    }
}

public class ConfiguracionRolUsuario : IEntityTypeConfiguration<RolUsuarioAplicacion>
{
    public void Configure(EntityTypeBuilder<RolUsuarioAplicacion> b)
    {
        b.ToTable("usuarios_roles");
        b.HasKey(ur => new { ur.UsuarioId, ur.RolId });

        b.HasOne(ur => ur.Usuario).WithMany(u => u.Roles).HasForeignKey(ur => ur.UsuarioId);
        b.HasOne(ur => ur.Rol).WithMany(r => r.Usuarios).HasForeignKey(ur => ur.RolId);
    }
}
