using Tienda.Domain.Common;

namespace Tienda.Domain.Identity;

/// <summary>
/// Placeholder del MVP de autenticacion. Cuando decidas el mecanismo definitivo
/// (ASP.NET Identity o JWT propio) esta clase es el punto de entrada.
/// </summary>
public class AppUser : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<AppUserRole> Roles { get; set; } = new List<AppUserRole>();
}
