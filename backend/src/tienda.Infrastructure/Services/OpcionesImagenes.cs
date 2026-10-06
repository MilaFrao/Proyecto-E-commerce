using Microsoft.Extensions.Configuration;

namespace Tienda.Infrastructure.Services;

/// <summary>Configuracion del almacen local de imagenes (seccion "Imagenes" de appsettings).</summary>
public sealed class OpcionesImagenes
{
    /// <summary>Ruta bajo la que la API sirve los archivos guardados.</summary>
    public const string RutaPublica = "/media";

    /// <summary>Carpeta absoluta donde se guardan los archivos.</summary>
    public string Carpeta { get; }

    public long TamanoMaximoBytes { get; }

    public OpcionesImagenes(string carpeta, long tamanoMaximoBytes)
    {
        Carpeta = carpeta;
        TamanoMaximoBytes = tamanoMaximoBytes;
    }

    /// <summary>
    /// Imagenes:Carpeta puede ser absoluta o relativa a la carpeta del proyecto de la API (por defecto "uploads").
    /// Imagenes:TamanoMaximoMb por defecto 5.
    /// </summary>
    public static OpcionesImagenes Desde(IConfiguration configuration, string raizContenido)
    {
        var carpeta = configuration["Imagenes:Carpeta"];
        if (string.IsNullOrWhiteSpace(carpeta)) carpeta = "uploads";

        var megas = int.TryParse(configuration["Imagenes:TamanoMaximoMb"], out var m) && m > 0 ? m : 5;

        return new OpcionesImagenes(Path.GetFullPath(Path.Combine(raizContenido, carpeta)), megas * 1024L * 1024L);
    }
}
