namespace Tienda.Domain.Identity;

/// <summary>
/// Perfil del comprador. Es hija 1 a 1 de <see cref="Usuario"/> (decision 018): la identidad
/// (correo, clave, activo, rol) vive en Usuario y aqui solo lo propio del cliente.
/// Su clave primaria ES la del usuario, asi no puede haber un Cliente sin Usuario.
/// </summary>
public class Cliente
{
    public Guid UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public string? Telefono { get; set; }
    public DateTime AceptoTerminosEn { get; set; }
}
