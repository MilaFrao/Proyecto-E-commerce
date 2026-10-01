using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Tienda.Application.Common;

public static class Slug
{
    /// <summary>"Ropa Interior" -> "ropa-interior". Quita tildes y simbolos.</summary>
    public static string Generate(string text)
    {
        var normalized = text.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();

        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark) continue;
            builder.Append(char.IsLetterOrDigit(c) ? c : '-');
        }

        var segment = Regex.Replace(builder.ToString(), "-{2,}", "-").Trim('-');
        return segment.Length == 0 ? "categoria" : segment;
    }
}