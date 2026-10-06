namespace Tienda.Application.Inventario.Dtos;

/// <summary>Unidades movidas en un dia (bloque de 24 h que empieza en <paramref name="Inicio"/>, UTC). Alimenta la grafica del panel.</summary>
public record ActividadDiaDto(DateTime Inicio, int Entradas, int Surtidas, int Vendidas);
