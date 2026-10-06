using Tienda.Application.Usuarios.Dtos;

namespace Tienda.Application.Auth.Dtos;

public record LoginRequest(string Correo, string Clave);

public record LoginResponse(string Token, DateTime ExpiraEn, UsuarioDto Usuario);
