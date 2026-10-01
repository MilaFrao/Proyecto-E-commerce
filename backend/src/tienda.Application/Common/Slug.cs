using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Tienda.Aplicacion.Comun;

public static class GeneradorSegmentosUrl
{
    /// <summary>"Ropa Interior" -> "ropa-interior". Quita tildes y simbolos.</summary>
    public static string Generar(string text)
    {
        var normalized = text.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark) continue;
            sb.Append(char.IsLetterOrDigit(c) ? c : '-');
        }

        var slug = Regex.Replace(sb.ToString(), "-{2,}", "-").Trim('-');
        return slug.Length == 0 ? "categoria" : slug;
    }
}
