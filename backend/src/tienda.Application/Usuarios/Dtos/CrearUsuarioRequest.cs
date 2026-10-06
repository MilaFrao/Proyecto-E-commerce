namespace Tienda.Application.Usuarios.Dtos;

/// <param name="Rol">"admin", "inventario" o "vendedor".</param>
public record CrearUsuarioRequest(string Nombre, string Correo, string Clave, string Rol);
