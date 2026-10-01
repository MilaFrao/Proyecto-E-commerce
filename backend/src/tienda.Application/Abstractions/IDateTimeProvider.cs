namespace Tienda.Aplicacion.Abstracciones;

/// <summary>Reloj inyectable: sin esto los tests de movimientos son imposibles de fijar.</summary>
public interface IProveedorFechaHora
{
    DateTime AhoraUtc { get; }
}
