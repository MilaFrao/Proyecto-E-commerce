namespace Tienda.Application.Lookups.Dtos;

/// <summary>Elemento de una lista desplegable (categoria o marca).</summary>
public record LookupItemDto(Guid Id, string Name, Guid? ParentId);
