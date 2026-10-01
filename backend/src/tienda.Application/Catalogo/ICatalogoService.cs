using Tienda.Application.Catalogo.Dtos;
using Tienda.Application.Common;

namespace Tienda.Application.Catalogo;

public interface ICatalogoService
{
    /// <summary>Solo productos con al menos una variante surtida. Regla de la seccion 17.</summary>
    Task<PagedResult<ProductoCatalogoDto>> ExplorarAsync(ConsultaCatalogo consulta, CancellationToken cancellationToken = default);

    Task<ProductoCatalogoDto?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<FiltrosCatalogoDto> ObtenerFiltrosAsync(CancellationToken cancellationToken = default);
}

public record ConsultaCatalogo(
    string? Busqueda = null,
    Guid? CategoriaId = null,
    Guid? MarcaId = null,
    string? Color = null,
    string? Talla = null,
    decimal? PrecioMinimo = null,
    decimal? PrecioMaximo = null,
    string OrdenarPor = "nombre",
    int Pagina = 1,
    int ElementosPorPagina = 24);