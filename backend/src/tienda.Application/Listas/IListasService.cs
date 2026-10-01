using Tienda.Application.Common;
using Tienda.Application.Listas.Dtos;

namespace Tienda.Application.Listas;

public interface IListasService
{
    Task<IReadOnlyList<ElementoListaDto>> ObtenerCategoriasAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ElementoListaDto>> ObtenerMarcasAsync(CancellationToken cancellationToken = default);
    Task<Result<ElementoListaDto>> CrearCategoriaAsync(string nombre, Guid? padreId, CancellationToken cancellationToken = default);
    Task<Result<ElementoListaDto>> CrearMarcaAsync(string nombre, CancellationToken cancellationToken = default);
}