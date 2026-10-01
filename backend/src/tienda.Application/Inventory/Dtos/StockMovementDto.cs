using Tienda.Domain.Enums;

namespace Tienda.Application.Inventory.Dtos;

public record StockMovementDto(
    Guid Id,
    Guid VariantId,
    MovementType Type,
    int Quantity,
    StockLocation? FromLocation,
    StockLocation? ToLocation,
    int ResultingWarehouseQuantity,
    int ResultingStoreQuantity,
    DateTime OccurredAt,
    string? Notes);
