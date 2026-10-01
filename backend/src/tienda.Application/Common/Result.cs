namespace Tienda.Aplicacion.Comun;

/// <summary>Resultado explicito en vez de excepciones para los flujos esperados.</summary>
public class Resultado
{
    public bool EsExitoso { get; }
    public string? Error { get; }
    public bool HaFallado => !EsExitoso;

    protected Resultado(bool isSuccess, string? error)
    {
        EsExitoso = isSuccess;
        Error = error;
    }

    public static Resultado Exito() => new(true, null);
    public static Resultado Fallo(string error) => new(false, error);
    public static Resultado<T> Exito<T>(T value) => new(value, true, null);
    public static Resultado<T> Fallo<T>(string error) => new(default, false, error);
}

public class Resultado<T> : Resultado
{
    public T? Valor { get; }

    internal Resultado(T? value, bool isSuccess, string? error) : base(isSuccess, error)
        => Valor = value;
}
