namespace Tienda.Domain.Identity;

public class AppUserRole
{
    public Guid UserId { get; set; }
    public AppUser? User { get; set; }

    public Guid RoleId { get; set; }
    public AppRole? Role { get; set; }
}
