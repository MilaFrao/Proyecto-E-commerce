namespace Tienda.Application.Inventario.Dtos;

/// <summary>Varias variantes de deposito a tienda en una sola operacion: o se surten todas o ninguna.</summary>
public record SurtirLoteRequest(IReadOnlyList<ElementoSurtidoRequest> Elementos, string? Notas);
