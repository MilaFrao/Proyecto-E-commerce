using Tienda.Dominio.Comun;

namespace Tienda.Dominio.Identidad;

/// <summary>
/// Placeholder del MVP de autenticacion. Cuando decidas el mecanismo definitivo
/// (ASP.NET Identity o JWT propio) esta clase es el punto de entrada.
/// </summary>
public class UsuarioAplicacion : EntidadBase
{
    public string CorreoElectronico { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string HuellaContrasena { get; set; } = string.Empty;
    public bool EstaActivo { get; set; } = true;

    public ICollection<RolUsuarioAplicacion> Roles { get; set; } = new List<RolUsuarioAplicacion>();
}
