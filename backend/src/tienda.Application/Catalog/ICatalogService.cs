using Tienda.Aplicacion.Catalogo.Dtos;
using Tienda.Aplicacion.Comun;

namespace Tienda.Aplicacion.Catalogo;

public interface IServicioCatalogo
{
    /// <summary>Solo productos con al menos una variante surtida. Regla de la seccion 17.</summary>
    Task<ResultadoPaginado<ProductoCatalogoDto>> ExplorarAsync(ConsultaCatalogo consulta, CancellationToken tokenCancelacion = default);

    Task<ProductoCatalogoDto?> ObtenerPorIdAsync(Guid identificador, CancellationToken tokenCancelacion = default);

    Task<FiltrosCatalogoDto> ObtenerFiltrosAsync(CancellationToken tokenCancelacion = default);
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
