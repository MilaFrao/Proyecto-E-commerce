namespace Tienda.Application.Abstractions;

/// <summary>Quien hace la peticion. Application lo usa para firmar los movimientos sin saber nada de HTTP.</summary>
public interface IUsuarioActual
{
    /// <summary>Null si la peticion no trae sesion (procesos internos, semillas).</summary>
    Guid? Id { get; }
}
