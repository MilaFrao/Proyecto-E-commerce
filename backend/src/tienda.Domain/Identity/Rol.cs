using Tienda.Domain.Common;

namespace Tienda.Domain.Identity;

public class Rol : BaseEntity
{
    public const string Administrador     = "admin";
    public const string Inventario = "inventario";
    public const string Vendedor    = "vendedor";
    public const string Cliente  = "cliente";

    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<UsuarioRol> Usuarios { get; set; } = new List<UsuarioRol>();
}