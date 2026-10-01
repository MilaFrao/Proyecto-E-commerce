using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Tienda.Dominio.Catalogo;
using Tienda.Dominio.Enumeraciones;
using Tienda.Dominio.Inventario;

namespace Tienda.Infraestructura.Persistencia.DatosIniciales;

/// <summary>
/// Solo desarrollo. Aplica las migraciones pendientes y, si la base esta vacia,
/// carga un par de productos para poder probar el catalogo sin teclear todo a mano.
/// </summary>
public static class SembradorDesarrollo
{
    public static async Task CargarDatosPruebaAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ContextoBaseDatos>();

        await db.Database.MigrateAsync(ct);

        if (await db.Categorias.AnyAsync(ct)) return;

        var camisas = new Categoria { Nombre = "Camisas", SegmentoUrl = "camisas", Orden = 1 };
        var pantalones = new Categoria { Nombre = "Pantalones", SegmentoUrl = "pantalones", Orden = 2 };
        var interior = new Categoria { Nombre = "Ropa interior", SegmentoUrl = "ropa-interior", Orden = 3 };
        var calzado = new Categoria { Nombre = "Calzado", SegmentoUrl = "calzado", Orden = 4 };

        var urban = new Marca { Nombre = "Urban Fit" };
        var demo = new Marca { Nombre = "Marca Demo" };

        db.Categorias.AddRange(camisas, pantalones, interior, calzado);
        db.Marcas.AddRange(urban, demo);

        db.Productos.Add(BuildProduct(
            "Camisa deportiva", "CAM-001", "Camisa ligera de secado rapido.",
            camisas, urban, 24.99m, 18m,
            new[] { "Negro", "Blanco" }, new[] { "S", "M", "L" }));

        db.Productos.Add(BuildProduct(
            "Pantalon jogger", "PAN-001", "Jogger de algodon con puno elastico.",
            pantalones, demo, 34.50m, 26m,
            new[] { "Azul", "Gris" }, new[] { "M", "L", "XL" }));

        await db.SaveChangesAsync(ct);
    }

    private static Producto BuildProduct(
        string name, string reference, string description,
        Categoria category, Marca brand, decimal retail, decimal wholesale,
        string[] colors, string[] sizes)
    {
        var product = new Producto
        {
            Nombre = name,
            Referencia = reference,
            Descripcion = description,
            CategoriaId = category.Identificador,
            MarcaId = brand.Identificador,
            PrecioVenta = retail,
            PrecioMayorista = wholesale
        };

        var index = 0;
        foreach (var color in colors)
        {
            foreach (var size in sizes)
            {
                var variant = new VarianteProducto
                {
                    ProductoId = product.Identificador,
                    CodigoSku = $"{reference}-{color[..3].ToUpperInvariant()}-{size}",
                    Color = color,
                    Talla = size
                };

                // Una de cada tres variantes se queda en deposito sin surtir,
                // para ver en el catalogo el caso "existe pero no esta disponible".
                var supplied = index % 3 == 2 ? 0 : 8;
                var warehouse = 20 - supplied;

                variant.NivelesExistencias.Add(new NivelExistencias { VarianteProductoId = variant.Identificador, Ubicacion = UbicacionStock.Deposito, Cantidad = warehouse });
                variant.NivelesExistencias.Add(new NivelExistencias { VarianteProductoId = variant.Identificador, Ubicacion = UbicacionStock.Tienda, Cantidad = supplied });

                variant.Movimientos.Add(new MovimientoExistencias
                {
                    VarianteProductoId = variant.Identificador,
                    Tipo = TipoMovimiento.Entrada,
                    Cantidad = 20,
                    UbicacionDestino = UbicacionStock.Deposito,
                    CantidadResultanteDeposito = 20,
                    CantidadResultanteTienda = 0,
                    OcurridoEn = DateTime.UtcNow.AddDays(-3),
                    Notas = "Carga inicial de datos de prueba"
                });

                if (supplied > 0)
                {
                    variant.Movimientos.Add(new MovimientoExistencias
                    {
                        VarianteProductoId = variant.Identificador,
                        Tipo = TipoMovimiento.Traslado,
                        Cantidad = supplied,
                        UbicacionOrigen = UbicacionStock.Deposito,
                        UbicacionDestino = UbicacionStock.Tienda,
                        CantidadResultanteDeposito = warehouse,
                        CantidadResultanteTienda = supplied,
                        OcurridoEn = DateTime.UtcNow.AddDays(-2),
                        Notas = "Surtido inicial de prueba"
                    });
                }

                product.Variantes.Add(variant);
                index++;
            }
        }

        return product;
    }
}
