using Tienda.Domain.Common;

namespace Tienda.Domain.Identity;

public class AppRole : BaseEntity
{
    public const string Admin     = "admin";
    public const string Inventory = "inventario";
    public const string Seller    = "vendedor";
    public const string Customer  = "cliente";

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<AppUserRole> Users { get; set; } = new List<AppUserRole>();
}
