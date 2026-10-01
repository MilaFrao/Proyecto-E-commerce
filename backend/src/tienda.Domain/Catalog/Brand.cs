using Tienda.Dominio.Comun;

namespace Tienda.Dominio.Catalogo;

public class Marca : EntidadBase
{
    public string Nombre { get; set; } = string.Empty;
    public bool EstaActiva { get; set; } = true;

    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
