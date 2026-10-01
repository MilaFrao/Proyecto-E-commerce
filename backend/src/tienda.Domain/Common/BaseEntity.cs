namespace Tienda.Dominio.Comun;

/// <summary>Raiz comun de toda entidad persistida.</summary>
public abstract class EntidadBase
{
    public Guid Identificador { get; set; } = Guid.NewGuid();
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime? ActualizadoEn { get; set; }
}
