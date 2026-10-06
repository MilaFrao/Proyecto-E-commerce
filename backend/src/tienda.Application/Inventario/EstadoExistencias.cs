namespace Tienda.Application.Inventario;

/// <summary>Filtros del listado de variantes. Llegan como texto en la URL (?estado=por-surtir).</summary>
public static class EstadoExistencias
{
    public const string Todos = "todos";
    public const string Disponible = "disponible";       // hay unidades en tienda
    public const string SoloDeposito = "solo-deposito";  // hay en deposito, nada en tienda
    public const string Agotado = "agotado";             // nada en ningun lado
    public const string PorSurtir = "por-surtir";        // hay en deposito (se puede surtir)
}
