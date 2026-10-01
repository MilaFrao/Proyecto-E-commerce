using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Tienda.Domain.Catalogo;
using Tienda.Domain.Enums;
using Tienda.Domain.Inventario;

namespace Tienda.Infrastructure.Persistence.Seed;

/// <summary>
/// Solo desarrollo. Aplica las migraciones pendientes y, si la base esta vacia,
/// carga un par de productos para poder probar el catalogo sin teclear todo a mano.
/// </summary>
public static class DevSeeder
{
    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var ambito = services.CreateScope();
        var context = ambito.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.MigrateAsync(cancellationToken);

        if (await context.Categorias.AnyAsync(cancellationToken)) return;

        var camisas = new Categoria { Nombre = "Camisas", Slug = "camisas", Orden = 1 };
        var pantalones = new Categoria { Nombre = "Pantalones", Slug = "pantalones", Orden = 2 };
        var interior = new Categoria { Nombre = "Ropa interior", Slug = "ropa-interior", Orden = 3 };
        var calzado = new Categoria { Nombre = "Calzado", Slug = "calzado", Orden = 4 };

        var marcaUrbana = new Marca { Nombre = "Urban Fit" };
        var marcaDemostracion = new Marca { Nombre = "Marca Demo" };

        context.Categorias.AddRange(camisas, pantalones, interior, calzado);
        context.Marcas.AddRange(marcaUrbana, marcaDemostracion);

        context.Productos.Add(ConstruirProducto(
            "Camisa deportiva", "CAM-001", "Camisa ligera de secado rapido.",
            camisas, marcaUrbana, 24.99m, 18m,
            new[] { "Negro", "Blanco" }, new[] { "S", "M", "L" }));

        context.Productos.Add(ConstruirProducto(
            "Pantalon jogger", "PAN-001", "Jogger de algodon con puno elastico.",
            pantalones, marcaDemostracion, 34.50m, 26m,
            new[] { "Azul", "Gris" }, new[] { "M", "L", "XL" }));

        await context.SaveChangesAsync(cancellationToken);
    }

    private static readonly Dictionary<string, string> HexPorColor = new()
    {
        ["Negro"] = "#1A1A1A", ["Blanco"] = "#F5F5F5", ["Gris"] = "#9CA3AF",
        ["Azul"] = "#2563EB", ["Rojo"] = "#C0392B", ["Verde"] = "#4A5E3A"
    };

    private static Producto ConstruirProducto(
        string nombre, string referencia, string descripcion,
        Categoria categoria, Marca marca, decimal precioVenta, decimal precioMayorista,
        string[] colores, string[] tallas)
    {
        var producto = new Producto
        {
            Nombre = nombre,
            Referencia = referencia,
            Descripcion = descripcion,
            CategoriaId = categoria.Id,
            MarcaId = marca.Id,
            PrecioVenta = precioVenta,
            PrecioMayorista = precioMayorista
        };

        var indice = 0;
        foreach (var color in colores)
        {
            foreach (var talla in tallas)
            {
                var variante = new VarianteProducto
                {
                    ProductoId = producto.Id,
                    CodigoSku = $"{referencia}-{color[..3].ToUpperInvariant()}-{talla}",
                    Color = color,
                    ColorHex = HexPorColor.GetValueOrDefault(color, "#9CA3AF"),
                    Talla = talla
                };

                // Una de cada tres variantes se queda en deposito sin surtir,
                // para ver en el catalogo el caso "existe pero no esta disponible".
                var cantidadSurtida = indice % 3 == 2 ? 0 : 8;
                var cantidadDeposito = 20 - cantidadSurtida;

                variante.NivelesExistencias.Add(new NivelExistencias { VarianteProductoId = variante.Id, Ubicacion = UbicacionStock.Deposito, Cantidad = cantidadDeposito });
                variante.NivelesExistencias.Add(new NivelExistencias { VarianteProductoId = variante.Id, Ubicacion = UbicacionStock.Tienda, Cantidad = cantidadSurtida });

                variante.Movimientos.Add(new MovimientoExistencias
                {
                    VarianteProductoId = variante.Id,
                    Tipo = TipoMovimiento.Entrada,
                    Cantidad = 20,
                    UbicacionDestino = UbicacionStock.Deposito,
                    CantidadResultanteDeposito = 20,
                    CantidadResultanteTienda = 0,
                    OcurridoEn = DateTime.UtcNow.AddDays(-3),
                    Notas = "Carga inicial de datos de prueba"
                });

                if (cantidadSurtida > 0)
                {
                    variante.Movimientos.Add(new MovimientoExistencias
                    {
                        VarianteProductoId = variante.Id,
                        Tipo = TipoMovimiento.Traslado,
                        Cantidad = cantidadSurtida,
                        UbicacionOrigen = UbicacionStock.Deposito,
                        UbicacionDestino = UbicacionStock.Tienda,
                        CantidadResultanteDeposito = cantidadDeposito,
                        CantidadResultanteTienda = cantidadSurtida,
                        OcurridoEn = DateTime.UtcNow.AddDays(-2),
                        Notas = "Surtido inicial de prueba"
                    });
                }

                producto.Variantes.Add(variante);
                indice++;
            }
        }

        return producto;
    }
}