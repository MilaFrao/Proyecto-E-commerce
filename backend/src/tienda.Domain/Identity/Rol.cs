using Tienda.Domain.Common;

namespace Tienda.Domain.Identity;

public class Rol : BaseEntity
{
    public const string Administrador     = "admin";
    public const string Inventario = "inventario";
    public const string Vendedor    = "vendedor";
    public const string Cliente  = "cliente";

    /// <summary>
    /// Roles que pueden entrar al panel interno (el cliente no).
    /// Es IReadOnlyList y no un arreglo a proposito: con C# 14, <c>arreglo.Contains(x)</c> se resuelve a
    /// <c>MemoryExtensions.Contains</c> (ReadOnlySpan) y EF Core 8 revienta al traducir la consulta.
    /// Ver decision 019.
    /// </summary>
    public static readonly IReadOnlyList<string> DePersonal = new[] { Administrador, Inventario, Vendedor };

    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<UsuarioRol> Usuarios { get; set; } = new List<UsuarioRol>();
}