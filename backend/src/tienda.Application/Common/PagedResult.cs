namespace Tienda.Application.Common;

public class PagedResult<T>
{
    public IReadOnlyList<T> Elementos { get; init; } = Array.Empty<T>();
    public int Pagina { get; init; }
    public int ElementosPorPagina { get; init; }
    public int CantidadTotal { get; init; }
    public int PaginasTotales => ElementosPorPagina == 0 ? 0 : (int)Math.Ceiling(CantidadTotal / (double)ElementosPorPagina);
}