using FluentAssertions;
using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Comun;
using Tienda.Dominio.Enumeraciones;
using Tienda.Dominio.Inventario;
using Xunit;

namespace Tienda.Dominio.Pruebas;

public class PruebasNivelExistencias
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

        var accion = () => nivel.Disminuir(5);

        accion.Should().Throw<ExcepcionDominio>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-4)]
    public void Aumentar_rechaza_cantidades_no_positivas(int cantidad)
    {
        var nivel = new NivelExistencias { Ubicacion = UbicacionStock.Deposito, Cantidad = 1 };

        var accion = () => nivel.Aumentar(cantidad);

        accion.Should().Throw<ExcepcionDominio>();
    }
}