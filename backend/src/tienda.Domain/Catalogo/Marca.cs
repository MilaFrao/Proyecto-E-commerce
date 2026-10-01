using Tienda.Domain.Common;

namespace Tienda.Domain.Catalogo;

public class Marca : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public bool EstaActiva { get; set; } = true;

    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}