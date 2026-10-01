using FluentAssertions;
using Tienda.Domain.Catalog;
using Tienda.Domain.Common;
using Tienda.Domain.Enums;
using Xunit;
using Tienda.Domain.Inventory;

namespace Tienda.Domain.Tests;

public class StockLevelTests
{
    [Fact]
    public void Increase_suma_al_stock_existente()
    {
        var level = new StockLevel { Location = StockLocation.Warehouse, Quantity = 5 };

        level.Increase(10);

        level.Quantity.Should().Be(15); // el 5 + 10 = 15 del documento
    }

    [Fact]
    public void Decrease_no_permite_dejar_el_stock_negativo()
    {
        var level = new StockLevel { Location = StockLocation.Store, Quantity = 3 };

        var act = () => level.Decrease(5);

        act.Should().Throw<DomainException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-4)]
    public void Increase_rechaza_cantidades_no_positivas(int amount)
    {
        var level = new StockLevel { Location = StockLocation.Warehouse, Quantity = 1 };

        var act = () => level.Increase(amount);

        act.Should().Throw<DomainException>();
    }
}
