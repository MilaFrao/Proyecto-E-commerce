using Tienda.Application.Abstractions;
using Tienda.Application.Common;

namespace Tienda.Infrastructure.Services;

public sealed class AlmacenImagenesLocal : IAlmacenImagenes
{
    private readonly OpcionesImagenes _opciones;

    public AlmacenImagenesLocal(OpcionesImagenes opciones) => _opciones = opciones;

    public async Task<Result<string>> GuardarAsync(Stream contenido, CancellationToken cancellationToken = default)
    {
        // Se lee con tope: un archivo enorme se corta apenas pasa el limite, sin cargarlo entero.
        using var memoria = new MemoryStream();
        var buffer = new byte[81920];
        int leidos;
        while ((leidos = await contenido.ReadAsync(buffer, cancellationToken)) > 0)
        {
            memoria.Write(buffer, 0, leidos);
            if (memoria.Length > _opciones.TamanoMaximoBytes)
                return Result.Failure<string>($"La imagen pesa mas de {_opciones.TamanoMaximoBytes / (1024 * 1024)} MB.");
        }

        if (memoria.Length == 0)
            return Result.Failure<string>("El archivo esta vacio.");

        // El tipo se decide por el contenido real, no por el nombre ni el Content-Type que declare el cliente.
        var bytes = memoria.ToArray();
        var extension = DetectarExtension(bytes);
        if (extension is null)
            return Result.Failure<string>("Formato no valido. Usa JPG, PNG o WebP.");

        // Nombre generado por el servidor: nada que venga del cliente forma parte de la ruta.
        var carpetaProductos = Path.Combine(_opciones.Carpeta, "productos");
        Directory.CreateDirectory(carpetaProductos);

        var nombreArchivo = $"{Guid.NewGuid():N}{extension}";
        await File.WriteAllBytesAsync(Path.Combine(carpetaProductos, nombreArchivo), bytes, cancellationToken);

        return Result.Success($"{OpcionesImagenes.RutaPublica}/productos/{nombreArchivo}");
    }

    /// <summary>Reconoce JPEG, PNG y WebP por sus primeros bytes. SVG queda fuera a proposito: puede llevar scripts.</summary>
    private static string? DetectarExtension(byte[] b)
    {
        if (b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF)
            return ".jpg";

        if (b.Length >= 8 && b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47
            && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A)
            return ".png";

        // WebP: "RIFF" + 4 bytes de tamano + "WEBP"
        if (b.Length >= 12 && b[0] == 0x52 && b[1] == 0x49 && b[2] == 0x46 && b[3] == 0x46
            && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50)
            return ".webp";

        return null;
    }
}
