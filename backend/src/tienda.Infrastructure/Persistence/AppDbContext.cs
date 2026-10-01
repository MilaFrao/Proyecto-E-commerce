using Microsoft.EntityFrameworkCore;
using Tienda.Aplicacion.Abstracciones;
using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Identidad;
using Tienda.Dominio.Inventario;

namespace Tienda.Infraestructura.Persistencia;

public class ContextoBaseDatos : DbContext, IContextoBaseDatos
{
    public ContextoBaseDatos(DbContextOptions<ContextoBaseDatos> options) : base(options) { }

    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<VarianteProducto> VariantesProducto => Set<VarianteProducto>();
    public DbSet<ImagenProducto> ImagenesProducto => Set<ImagenProducto>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Marca> Marcas => Set<Marca>();
    public DbSet<NivelExistencias> NivelesExistencias => Set<NivelExistencias>();
    public DbSet<MovimientoExistencias> MovimientosExistencias => Set<MovimientoExistencias>();
    public DbSet<UsuarioAplicacion> Usuarios => Set<UsuarioAplicacion>();
    public DbSet<RolAplicacion> Roles => Set<RolAplicacion>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(ContextoBaseDatos).Assembly);
        base.OnModelCreating(builder);
    }
}
