using Tienda.Domain.Catalog;
using Tienda.Domain.Common;
using Tienda.Domain.Enums;

namespace Tienda.Domain.Inventory;

/// <summary>
/// Asiento inmutable del historial de inventario. Nunca se edita ni se borra:
/// si algo salio mal, se registra un movimiento de ajuste que lo compense.
/// </summary>
public class StockMovement : BaseEntity
{
    public Guid ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    public MovementType Type { get; set; }

    /// <summary>Positivo o negativo segun el tipo. En un traslado se registra el monto movido.</summary>
    public int Quantity { get; set; }

    public StockLocation? FromLocation { get; set; }
    public StockLocation? ToLocation { get; set; }

    /// <summary>Foto del stock despues del movimiento, para auditar sin recalcular toda la cadena.</summary>
    public int ResultingWarehouseQuantity { get; set; }
    public int ResultingStoreQuantity { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public Guid? PerformedByUserId { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}
