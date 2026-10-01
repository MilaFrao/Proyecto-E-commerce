namespace Tienda.Dominio.Comun;

/// <summary>Violacion de una regla de negocio. La captura el middleware de la Api y la traduce a 400.</summary>
public sealed class ExcepcionDominio : Exception
{
    public ExcepcionDominio(string message) : base(message) { }
}
