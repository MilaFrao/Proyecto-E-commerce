using Tienda.Aplicacion.Abstracciones;

namespace Tienda.Infraestructura.Servicios;

public class ProveedorFechaHora : IProveedorFechaHora
{
    public DateTime AhoraUtc => DateTime.UtcNow;
}
