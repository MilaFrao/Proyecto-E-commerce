using Microsoft.EntityFrameworkCore;
using Tienda.Domain.Catalogo;
using Tienda.Domain.Identity;
using Tienda.Domain.Inventario;

namespace Tienda.Application.Abstractions;

/// <summary>
/// Contrato del contexto de datos. Application depende de esta interfaz,
/// no de la clase concreta: asi se puede testear sin base de datos real.
/// </summary>
public interface IAppDbContext
{
    DbSet<Producto> Productos { get; }
    DbSet<VarianteProducto> VariantesProducto { get; }
    DbSet<ImagenProducto> ImagenesProducto { get; }
    DbSet<Categoria> Categorias { get; }
    DbSet<Marca> Marcas { get; }
    DbSet<NivelExistencias> NivelesExistencias { get; }
    DbSet<MovimientoExistencias> MovimientosExistencias { get; }
    DbSet<Usuario> Usuarios { get; }
    DbSet<Rol> Roles { get; }
    DbSet<Cliente> Clientes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}