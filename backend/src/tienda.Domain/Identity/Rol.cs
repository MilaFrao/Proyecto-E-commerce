using Tienda.Domain.Common;

namespace Tienda.Domain.Identity;

public class Rol : BaseEntity
{
    public const string Administrador     = "admin";
    public const string Inventario = "inventario";
    public const string Vendedor    = "vendedor";
    public const string Cliente  = "cliente";

    /// <summary>Roles que pueden entrar al panel interno (el cliente no).</summary>
    public static readonly string[] DePersonal = { Administrador, Inventario, Vendedor };

    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<UsuarioRol> Usuarios { get; set; } = new List<UsuarioRol>();
}