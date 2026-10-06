using Tienda.Application.Common;

namespace Tienda.Application.Abstractions;

/// <summary>
/// Donde se guardan las fotos de los productos. Hoy es una carpeta del servidor;
/// mañana puede ser S3 u otro servicio cambiando solo la implementacion.
/// </summary>
public interface IAlmacenImagenes
{
    /// <summary>Valida el archivo (tipo real y tamano) y lo guarda. Devuelve la URL publica, relativa al sitio.</summary>
    Task<Result<string>> GuardarAsync(Stream contenido, CancellationToken cancellationToken = default);
}
