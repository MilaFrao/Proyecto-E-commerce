namespace Tienda.Domain.Common;

/// <summary>Violacion de una regla de negocio. La captura el middleware de la Api y la traduce a 400.</summary>
public sealed class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}