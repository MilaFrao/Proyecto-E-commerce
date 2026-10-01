using FluentAssertions;
using Tienda.Domain.Catalogo;
using Tienda.Domain.Common;
using Tienda.Domain.Enums;
using Tienda.Domain.Inventario;
using Xunit;

namespace Tienda.Domain.Tests;

public class NivelExistenciasTests
{
    [Fact]
    public void Aumentar_suma_al_stock_existente()
    {
        var nivel = new NivelExistencias { Ubicacion = UbicacionStock.Deposito, Cantidad = 5 };

        nivel.Aumentar(10);

        nivel.Cantidad.Should().Be(15); // el 5 + 10 = 15 del documento
    }

    [Fact]
    public void Disminuir_no_permite_dejar_el_stock_negativo()
    {
        var nivel = new NivelExistencias { Ubicacion = UbicacionStock.Tienda, Cantidad = 3 };

        var action = () => nivel.Disminuir(5);

        action.Should().Throw<DomainException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-4)]
    public void Aumentar_rechaza_cantidades_no_positivas(int cantidad)
    {
        var nivel = new NivelExistencias { Ubicacion = UbicacionStock.Deposito, Cantidad = 1 };

        var action = () => nivel.Aumentar(cantidad);

        action.Should().Throw<DomainException>();
    }
}