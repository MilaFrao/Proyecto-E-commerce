namespace Tienda.Dominio.Identidad;

public class RolUsuarioAplicacion
{
    public Guid UsuarioId { get; set; }
    public UsuarioAplicacion? Usuario { get; set; }

    public Guid RolId { get; set; }
    public RolAplicacion? Rol { get; set; }
}
