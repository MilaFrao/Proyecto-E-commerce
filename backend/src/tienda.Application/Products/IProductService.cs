using Tienda.Aplicacion.Comun;
using Tienda.Aplicacion.Productos.Dtos;

namespace Tienda.Aplicacion.Productos;

public interface IServicioProducto
{
    Task<ResultadoPaginado<ProductoDto>> ListarAsync(string? busqueda, bool incluirInactivos, int pagina, int elementosPorPagina, CancellationToken tokenCancelacion = default);

    /// <summary>Crea el producto junto con todas sus variantes en una sola operacion. Sin stock: eso entra por inventario.</summary>
    Task<Resultado<ProductoDto>> CrearAsync(SolicitudCrearProducto solicitud, CancellationToken tokenCancelacion = default);

    /// <summary>Los productos no se borran: se desactivan y conservan su historial (seccion 8).</summary>
    Task<Resultado> DesactivarAsync(Guid identificador, string? motivo, CancellationToken tokenCancelacion = default);

    Task<Resultado> ActivarAsync(Guid identificador, CancellationToken tokenCancelacion = default);
}
