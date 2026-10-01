using Tienda.Aplicacion.Listas.Dtos;

namespace Tienda.Aplicacion.Catalogo.Dtos;

/// <summary>Opciones reales para los filtros: solo colores y tallas que hoy se pueden comprar.</summary>
public record FiltrosCatalogoDto(
    IReadOnlyList<ElementoListaDto> Categorias,
    IReadOnlyList<ElementoListaDto> Marcas,
    IReadOnlyList<string> Colores,
    IReadOnlyList<string> Tallas);
