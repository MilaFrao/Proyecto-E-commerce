using Tienda.Aplicacion.Comun;
using Tienda.Aplicacion.Listas.Dtos;

namespace Tienda.Aplicacion.Listas;

public interface IServicioListas
{
    Task<IReadOnlyList<ElementoListaDto>> ObtenerCategoriasAsync(CancellationToken tokenCancelacion = default);
    Task<IReadOnlyList<ElementoListaDto>> ObtenerMarcasAsync(CancellationToken tokenCancelacion = default);
    Task<Resultado<ElementoListaDto>> CrearCategoriaAsync(string nombre, Guid? identificadorPadre, CancellationToken tokenCancelacion = default);
    Task<Resultado<ElementoListaDto>> CrearMarcaAsync(string nombre, CancellationToken tokenCancelacion = default);
}
