namespace Tienda.Aplicacion.Listas.Dtos;

/// <summary>Elemento de una lista desplegable (categoria o marca).</summary>
public record ElementoListaDto(Guid Identificador, string Nombre, Guid? IdentificadorPadre);
