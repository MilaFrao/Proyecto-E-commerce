using Microsoft.EntityFrameworkCore;
using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Identidad;
using Tienda.Dominio.Inventario;

namespace Tienda.Aplicacion.Abstracciones;

/// <summary>
/// Contrato del contexto de datos. Application depende de esta interfaz,
/// no de la clase concreta: asi se puede testear sin base de datos real.
/// </summary>
public interface IContextoBaseDatos
{
    DbSet<Producto> Productos { get; }
    DbSet<VarianteProducto> VariantesProducto { get; }
    DbSet<ImagenProducto> ImagenesProducto { get; }
    DbSet<Categoria> Categorias { get; }
    DbSet<Marca> Marcas { get; }
    DbSet<NivelExistencias> NivelesExistencias { get; }
    DbSet<MovimientoExistencias> MovimientosExistencias { get; }
    DbSet<UsuarioAplicacion> Usuarios { get; }
    DbSet<RolAplicacion> Roles { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
