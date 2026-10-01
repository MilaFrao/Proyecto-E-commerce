using Tienda.Dominio.Comun;

namespace Tienda.Dominio.Catalogo;

public class ImagenProducto : EntidadBase
{
    public Guid ProductoId { get; set; }
    public Producto? Producto { get; set; }

    public string DireccionUrl { get; set; } = string.Empty;
    public string? TextoAlternativo { get; set; }
    public bool EsPrincipal { get; set; }
    public int Orden { get; set; }
}
