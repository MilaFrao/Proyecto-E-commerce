namespace Tienda.Application.Clientes.Dtos;

public record RegistrarClienteRequest(string Nombre, string Correo, string Clave, bool AceptaTerminos);
