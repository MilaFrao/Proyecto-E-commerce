namespace Tienda.Application.Listas.Dtos;

/// <summary>Elemento de una lista desplegable (categoria o marca).</summary>
public record ElementoListaDto(Guid Id, string Nombre, Guid? PadreId);