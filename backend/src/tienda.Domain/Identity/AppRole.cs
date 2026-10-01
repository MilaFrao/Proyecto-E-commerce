using Tienda.Dominio.Comun;

namespace Tienda.Dominio.Identidad;

public class RolAplicacion : EntidadBase
{
    public const string Administrador     = "admin";
    public const string Inventario = "inventario";
    public const string Vendedor    = "vendedor";
    public const string Cliente  = "cliente";

    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<RolUsuarioAplicacion> Usuarios { get; set; } = new List<RolUsuarioAplicacion>();
}
