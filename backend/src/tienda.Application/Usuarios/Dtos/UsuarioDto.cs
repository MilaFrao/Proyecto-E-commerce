using Tienda.Domain.Identity;

namespace Tienda.Application.Usuarios.Dtos;

/// <summary>Lo que se muestra de un usuario. Nunca incluye la huella de la clave.</summary>
public record UsuarioDto(
    Guid Id,
    string Nombre,
    string Correo,
    IReadOnlyList<string> Roles,
    bool EstaActivo,
    DateTime? UltimoAcceso)
{
    /// <summary>Requiere que Roles y Rol esten cargados (Include/ThenInclude).</summary>
    public static UsuarioDto Desde(Usuario usuario) => new(
        usuario.Id,
        usuario.NombreCompleto,
        usuario.CorreoElectronico,
        usuario.Roles.Select(r => r.Rol!.Nombre).OrderBy(nombre => nombre).ToList(),
        usuario.EstaActivo,
        usuario.UltimoAccesoEn);
}
