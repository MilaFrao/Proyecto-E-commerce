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
    public DateTime? UltimoAccesoEn { get; set; }

    /// <summary>Nulo hasta verificar el correo. Hoy no se exige: ver decision 018 (verificacion por etapas).</summary>
    public DateTime? CorreoVerificadoEn { get; set; }

    public ICollection<UsuarioRol> Roles { get; set; } = new List<UsuarioRol>();
}