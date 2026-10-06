namespace Tienda.Api.Auth;

/// <summary>
/// Nombres de las politicas de autorizacion. Cada una se define por rol en AuthExtensions.
/// Se usan asi: group.RequireAuthorization(Politicas.Inventario)
/// </summary>
public static class Politicas
{
    /// <summary>Solo administradores.</summary>
    public const string Admin = "Admin";

    /// <summary>Administradores e inventario: crean productos y mueven stock.</summary>
    public const string Inventario = "Inventario";

    /// <summary>Todo el personal (admin, inventario y vendedor): consulta.</summary>
    public const string Personal = "Personal";
}
