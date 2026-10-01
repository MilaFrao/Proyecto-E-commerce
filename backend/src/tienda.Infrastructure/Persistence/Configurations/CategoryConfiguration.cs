using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tienda.Domain.Catalog;

namespace Tienda.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> b)
    {
        b.ToTable("categories");
        b.HasKey(c => c.Id);

        b.Property(c => c.Name).HasMaxLength(120).IsRequired();
        b.Property(c => c.Slug).HasMaxLength(140).IsRequired();
        b.HasIndex(c => c.Slug).IsUnique();

        b.HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
