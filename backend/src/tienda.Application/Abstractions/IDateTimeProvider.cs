namespace Tienda.Application.Abstractions;

/// <summary>Reloj inyectable: sin esto los tests de movimientos son imposibles de fijar.</summary>
public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}