namespace Tienda.Application.Inventario;

/// <summary>Filtros del listado de variantes. Llegan como texto en la URL (?estado=por-surtir).</summary>
public static class EstadoExistencias
{
    public const string Todos = "todos";
    public const string Disponible = "disponible";       // hay unidades en tienda
    public const string SoloDeposito = "solo-deposito";  // hay en deposito, nada en tienda
    public const string Agotado = "agotado";             // nada en ningun lado
    public const string PorSurtir = "por-surtir";        // hay en deposito (se puede surtir)
    public const string Critico = "critico";             // quedan pocas unidades EN TOTAL (deposito + tienda), pero no cero

    /// <summary>
    /// Umbral provisional y global de "stock critico": una variante es critica si le quedan entre 1 y este
    /// numero de unidades sumando deposito y tienda. Cuando se decida si el umbral es por producto,
    /// este valor pasa a la configuracion (ver pendientes de decision).
    /// </summary>
    public const int UmbralCriticoPorDefecto = 3;
}
