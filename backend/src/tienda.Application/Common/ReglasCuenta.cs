namespace Tienda.Application.Common;

/// <summary>Reglas de correo y clave compartidas por el alta de personal y el registro de clientes.</summary>
public static class ReglasCuenta
{
    public static bool CorreoValido(string correo)
    {
        var arroba = correo.IndexOf('@');
        return arroba > 0
            && arroba == correo.LastIndexOf('@')
            && correo.IndexOf('.', arroba) > arroba + 1
            && !correo.EndsWith('.')
            && !correo.Contains(' ');
    }

    /// <summary>Regla minima: 8 a 100 caracteres, con al menos una letra y un numero.</summary>
    public static string? ValidarClave(string clave)
    {
        if (clave.Length < 8) return "La clave debe tener al menos 8 caracteres.";
        if (clave.Length > 100) return "La clave no puede pasar de 100 caracteres.";
        if (!clave.Any(char.IsLetter) || !clave.Any(char.IsDigit)) return "La clave debe incluir letras y numeros.";
        return null;
    }
}
