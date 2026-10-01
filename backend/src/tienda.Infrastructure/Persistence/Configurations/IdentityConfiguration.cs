using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Identity;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> b)
    {
        b.ToTable("users");
        b.HasKey(u => u.Id);
        b.Property(u => u.Email).HasMaxLength(200).IsRequired();
        b.HasIndex(u => u.Email).IsUnique();
        b.Property(u => u.FullName).HasMaxLength(200).IsRequired();
    }
}

public class AppRoleConfiguration : IEntityTypeConfiguration<AppRole>
{
    public void Configure(EntityTypeBuilder<AppRole> b)
    {
        b.ToTable("roles");
        b.HasKey(r => r.Id);
        b.Property(r => r.Name).HasMaxLength(60).IsRequired();
        b.HasIndex(r => r.Name).IsUnique();
    }
}

public class AppUserRoleConfiguration : IEntityTypeConfiguration<AppUserRole>
{
    public void Configure(EntityTypeBuilder<AppUserRole> b)
    {
        b.ToTable("user_roles");
        b.HasKey(ur => new { ur.UserId, ur.RoleId });

        b.HasOne(ur => ur.User).WithMany(u => u.Roles).HasForeignKey(ur => ur.UserId);
        b.HasOne(ur => ur.Role).WithMany(r => r.Users).HasForeignKey(ur => ur.RoleId);
    }
}
