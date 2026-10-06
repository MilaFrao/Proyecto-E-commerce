using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Tienda.Application.Abstractions;
using Tienda.Domain.Identity;

namespace Tienda.Infrastructure.Persistence.Seed;

/// <summary>
/// Corre en TODOS los entornos. Garantiza que existan los roles y, si todavia no hay ningun
/// administrador, crea el primero con las credenciales de la seccion "Admin" de la configuracion.
/// Sin esa seccion no crea nada: asi nunca hay un admin con clave por defecto en produccion.
/// </summary>
public static class IdentitySeeder
{
    private static readonly (string Nombre, string Descripcion)[] RolesBase =
    {
        (Rol.Administrador, "Acceso total al sistema"),
        (Rol.Inventario, "Productos, precios y existencias"),
        (Rol.Vendedor, "Consulta comercial de productos"),
        (Rol.Cliente, "Comprador del catalogo publico")
    };

    public static async Task EnsureAsync(IServiceProvider services, IConfiguration configuration, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("IdentitySeeder");

        var existentes = await context.Roles.Select(r => r.Nombre).ToListAsync(cancellationToken);
        foreach (var (nombre, descripcion) in RolesBase.Where(r => !existentes.Contains(r.Nombre)))
            context.Roles.Add(new Rol { Nombre = nombre, Descripcion = descripcion });
        await context.SaveChangesAsync(cancellationToken);

        var correo = configuration["Admin:Correo"]?.Trim().ToLowerInvariant();
        var clave = configuration["Admin:Clave"];
        if (string.IsNullOrWhiteSpace(correo) || string.IsNullOrEmpty(clave))
            return;

        var hayAdmin = await context.Usuarios.AnyAsync(
            u => u.Roles.Any(r => r.Rol!.Nombre == Rol.Administrador), cancellationToken);
        if (hayAdmin)
            return;

        var rolAdmin = await context.Roles.FirstAsync(r => r.Nombre == Rol.Administrador, cancellationToken);
        var admin = new Usuario
        {
            NombreCompleto = configuration["Admin:Nombre"] ?? "Administrador",
            CorreoElectronico = correo,
            HuellaContrasena = hasher.Hash(clave)
        };
        admin.Roles.Add(new UsuarioRol { UsuarioId = admin.Id, RolId = rolAdmin.Id });
        context.Usuarios.Add(admin);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogWarning("Se creo el administrador inicial {Correo}. Cambia su clave apenas entres.", correo);
    }
}
