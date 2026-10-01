using Tienda.Domain.Common;

namespace Tienda.Domain.Identity;

/// <summary>
/// Placeholder del MVP de autenticacion. Cuando decidas el mecanismo definitivo
/// (ASP.NET Identity o JWT propio) esta clase es el punto de entrada.
/// </summary>
public class Usuario : BaseEntity
{
    public string CorreoElectronico { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string HuellaContrasena { get; set; } = string.Empty;
    public bool EstaActivo { get; set; } = true;

    public ICollection<UsuarioRol> Roles { get; set; } = new List<UsuarioRol>();
}