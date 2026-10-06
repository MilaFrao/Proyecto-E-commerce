# Tienda — E-Commerce y Catálogo

Aplicación web para la gestión de inventario y el catálogo público de una tienda de ropa.

- **MVP 1** — Gestión de productos e inventario (interno)
- **MVP 2** — Catálogo público de productos

La especificación funcional completa está en [`docs/requerimientos.md`](docs/requerimientos.md).
Las decisiones de arquitectura, en [`docs/decisiones.md`](docs/decisiones.md).

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | ASP.NET Core 8 (Minimal APIs) |
| ORM | EF Core 8 |
| Base de datos | PostgreSQL |
| Control de versiones | Git + GitHub |

---

## Estructura

```
tienda-app/
├── backend/
│   ├── Tienda.sln
│   ├── Directory.Build.props        ← versión de .NET, en un solo lugar
│   ├── src/
│   │   ├── Tienda.Domain/          entidades y reglas de negocio puras
│   │   ├── Tienda.Application/       casos de uso, DTOs, interfaces
│   │   ├── Tienda.Infrastructure/  EF Core, PostgreSQL, servicios externos
│   │   └── Tienda.Api/              endpoints HTTP
│   └── tests/
│       └── Tienda.Domain.Tests/
├── frontend/
│   └── src/
│       ├── app/                     router, layouts, providers
│       ├── features/                catalog · products · inventory · auth
│       ├── shared/                  cliente HTTP, tipos y componentes comunes
│       └── styles/
└── docs/
```

### La regla de las dependencias

```
Api  →  Infrastructure  →  Application  →  Domain
```

Las flechas apuntan **hacia adentro**, nunca al revés. Si aparece un
`using Tienda.Infrastructure` dentro de `Tienda.Domain`, algo se torció.

### Convención de nombres

La regla es una sola: **lo que es del negocio va en español; lo que es de la
estructura técnica va en inglés.**

| En español (el negocio) | En inglés (la estructura) |
|---|---|
| Entidades y sus propiedades: `Producto`, `VarianteProducto`, `NivelExistencias`, `PrecioVenta`, `Talla` | Capas y proyectos: `Domain`, `Application`, `Infrastructure`, `Api` |
| Enums y sus valores: `EstadoProducto.Activo`, `TipoMovimiento.Traslado` | Carpetas técnicas: `Common`, `Abstractions`, `Dtos`, `Enums`, `Persistence`, `Endpoints` |
| Casos de uso: `ListarAsync`, `RegistrarEntradaAsync`, `ReabastecerTiendaAsync` | Sufijos y patrones: `Service`, `Dto`, `Request`, `Result`, `Configuration`, `Middleware` |
| Módulos: `Catalogo`, `Inventario`, `Productos`, `Listas` | Base técnica: `BaseEntity`, `DomainException`, `AppDbContext`, `Id`, `CreatedAt` |
| Tablas, rutas, campos JSON y mensajes de error | Parámetros técnicos: `cancellationToken`, `request`, `service` |

Se ve así: `Tienda.Application.Productos.ProductoService`,
`ProductoConfiguration`, `CrearProductoRequest`. Detalle y motivos en la
decisión 011 de [`docs/decisiones.md`](docs/decisiones.md).

---

## Arranque

### 1. Base de datos

Se necesita un PostgreSQL escuchando en `localhost:5432`. Con Docker:

```bash
docker run --name tienda-db -e POSTGRES_USER=app -e POSTGRES_PASSWORD=1234 -e POSTGRES_DB=ecommerce -p 5432:5432 -d postgres:16
```

Sin Docker, instalar PostgreSQL y crear la base `ecommerce` con el usuario `app`.
En desarrollo la cadena de conexión sale de `appsettings.Development.json`;
la de `appsettings.json` es solo una plantilla que se sobreescribe en cada entorno.

### 2. Backend

```bash
cd backend
dotnet restore
dotnet tool install --global dotnet-ef        # una sola vez

# Configuración local: appsettings.Development.json NO se commitea (tiene la clave del JWT).
# Cópialo desde el ejemplo y ajusta la cadena de conexión si hace falta:
cp src/Tienda.Api/appsettings.Development.example.json src/Tienda.Api/appsettings.Development.json

# Las migraciones ya están en el repo (Migrations/). Si cambias el modelo, agrega una nueva:
#   dotnet ef migrations add NombreDelCambio -p src/Tienda.Infrastructure -s src/Tienda.Api --output-dir Migrations

# En desarrollo la API aplica las migraciones sola al arrancar.
# Si prefieres hacerlo a mano:
dotnet ef database update -p src/Tienda.Infrastructure -s src/Tienda.Api

dotnet run --project src/Tienda.Api
```

La API queda en `http://localhost:5080`, con Swagger en `/swagger`.

> **Rebanada de inventario (decisión 015):** el modelo cambió (control de concurrencia,
> regla «el stock nunca es negativo» e índice del historial). Desde `backend`:
>
> ```bash
> dotnet ef migrations add Inventario -p src/Tienda.Infrastructure -s src/Tienda.Api --output-dir Migrations
> ```
>
> Al arrancar en desarrollo se aplica sola. Esta vez **no** hace falta borrar la base.

### Autenticación en desarrollo

Al arrancar en desarrollo se crea un administrador con las credenciales de
`appsettings.Development.json`:

| Correo | Clave |
|---|---|
| `admin@tienda.local` | `Admin12345` |

Para probar la API desde Swagger: `POST /api/auth/login` → copia el `token` →
botón **Authorize** → pega solo el token (Swagger agrega `Bearer`) → ya puedes
llamar a las rutas protegidas.

**En producción** nada de esto se commitea. Se configura por variables de entorno:

```
Jwt__Key=<mínimo 32 caracteres aleatorios>
Admin__Correo=<correo del primer administrador>
Admin__Clave=<clave inicial; cámbiala apenas exista cómo>
ConnectionStrings__Default=<cadena de producción>
```

Si `Jwt__Key` falta o es corta, la API no arranca. Es a propósito.

> **Versión de .NET:** el esqueleto apunta a `net8.0`. Si tu SDK es más nuevo,
> cambia `<TargetFramework>` en `backend/Directory.Build.props` — una sola línea
> para toda la solución — y ajusta las versiones de los paquetes en los `.csproj`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Queda en `http://localhost:5173`. Vite redirige `/api` (y `/media`, las fotos) al
backend en `http://localhost:5080`, así que no hay que pelear con CORS en desarrollo.

Entra con el administrador de la sección anterior.

---

## Endpoints implementados

Las respuestas viajan con nombres en español y los enums como texto
(`"Entrada"`, `"Traslado"`, `"Venta"`, `"Devolucion"`, `"Ajuste"`, `"Merma"`).

### Sistema

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/salud` | Comprobación de que la API está viva |

### Autenticación

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público (5 intentos/min por IP) | `{ correo, clave }` → `{ token, expiraEn, usuario }` |
| `GET` | `/api/auth/yo` | Con sesión | Perfil del usuario; el front lo usa para confirmar la sesión al recargar |

### Usuarios — solo administrador

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/usuarios` | Lista de usuarios |
| `POST` | `/api/usuarios` | Crea un usuario (`nombre`, `correo`, `clave`, `rol`: `admin` · `inventario` · `vendedor`) |
| `POST` | `/api/usuarios/{id}/desactivar` · `/activar` | Corta o devuelve el acceso (nadie puede desactivarse a sí mismo) |

### Quién puede qué

| | Catálogo público | Consultar inventario y listas | Gestión de productos y escribir (entradas, surtido, ventas, listas) | Usuarios |
|---|---|---|---|---|
| Sin sesión | ✔ | — | — | — |
| `vendedor` | ✔ | ✔ | — | — |
| `inventario` | ✔ | ✔ | ✔ | — |
| `admin` | ✔ | ✔ | ✔ | ✔ |

El listado interno de productos (`/api/productos`) es de Inventario/admin; la consulta
comercial del vendedor se apoya en `/api/inventario/variantes`.

Sin token las rutas protegidas responden **401**; con token sin el rol suficiente, **403**.

### Productos — MVP 1 (interno)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/productos` | Listado con búsqueda y paginación (`busqueda`, `incluirInactivos`, `pagina`, `elementosPorPagina`) |
| `POST` | `/api/productos` | Crea el producto con todas sus variantes y su stock inicial (entra al depósito) |
| `POST` | `/api/productos/imagenes` | Sube la foto (`multipart/form-data`, campo `archivo`; JPG, PNG o WebP, máx. 5 MB) y devuelve `{ url }` para usarla en `urlImagen` |
| `POST` | `/api/productos/{id}/desactivar` | Desactiva (no se borra) |
| `POST` | `/api/productos/{id}/activar` | Reactiva |

Las fotos subidas se guardan en `backend/src/Tienda.Api/uploads/` (cambia la ruta con
`Imagenes:Carpeta`) y la API las sirve bajo `/media/...`. La carpeta no se commitea.

### Inventario — MVP 1 (interno)

| Método | Ruta | Qué hace |
|---|---|---|
Consultar: todo el personal. Mover stock (`POST`): solo inventario y admin.

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/inventario/variantes` | Variantes con su stock y último movimiento. Filtros: `busqueda`, `estado` (`todos`, `disponible`, `solo-deposito`, `agotado`, `por-surtir`, `critico`), `umbral` (solo con `critico`; por defecto 3), `pagina`, `elementosPorPagina` |
| `GET` | `/api/inventario/resumen?desde=&umbral=` | Totales (depósito, tienda, variantes sin surtir, agotadas y críticas) y unidades entradas, surtidas y vendidas desde `desde` (ISO con zona; por defecto, últimas 24 h) |
| `GET` | `/api/inventario/actividad?desde=&dias=7` | Unidades entradas, surtidas y vendidas por día: `dias` bloques de 24 h desde `desde` (la medianoche local del primer día) |
| `GET` | `/api/inventario/movimientos` | Historial de todas las variantes, del más reciente al más viejo, con quién lo hizo. Filtros: `busqueda`, `tipo` (`Entrada`, `Traslado`, `Venta`, `Ajuste`, `Merma`), `pagina` |
| `GET` | `/api/inventario/variantes/{varianteId}/existencias` | Depósito, tienda y disponible para venta |
| `GET` | `/api/inventario/variantes/{varianteId}/movimientos` | Historial de una variante |
| `POST` | `/api/inventario/variantes/{varianteId}/entradas` | Entrada de mercancía al depósito `{ cantidad, notas }` |
| `POST` | `/api/inventario/variantes/{varianteId}/surtido` | Surtido: depósito → tienda `{ cantidad, notas }` |
| `POST` | `/api/inventario/surtido` | Surtido de varias variantes, todo o nada `{ elementos: [{ varianteId, cantidad }], notas }` |
| `POST` | `/api/inventario/variantes/{varianteId}/ventas` | Venta (descuenta de tienda) `{ cantidad, notas }` |
| `POST` | `/api/inventario/variantes/{varianteId}/ajustes` | Ajuste por conteo físico `{ ubicacion: "Deposito" \| "Tienda", cantidadContada, notas }` (motivo obligatorio) |
| `POST` | `/api/inventario/variantes/{varianteId}/mermas` | Unidades dañadas o perdidas `{ ubicacion, cantidad, notas }` (motivo obligatorio) |

Si dos personas mueven la misma prenda a la vez, la segunda recibe un 400 pidiendo
reintentar con los números nuevos; el stock nunca queda negativo ni se pisa.

### Listas compartidas

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/listas/categorias` · `/api/listas/marcas` | Para los desplegables |
| `POST` | `/api/listas/categorias` · `/api/listas/marcas` | Crear una nueva |

### Catálogo — MVP 2 (público, sin autenticación)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/catalogo/productos` | Búsqueda, filtros, orden (`nombre`, `precio_ascendente`, `precio_descendente`, `recientes`) y paginación |
| `GET` | `/api/catalogo/productos/{id}` | Ficha del producto con sus variantes |
| `GET` | `/api/catalogo/filtros` | Categorías, marcas, colores y tallas que hoy se pueden comprar |

---

## Lo que todavía falta

- Editar producto y ver su detalle interno (crear y desactivar ya existen); con *Editar* llega el «Borrador»
- Limpieza de fotos que quedaron subidas sin producto
- Cambio y recuperación de contraseña (hoy solo el administrador crea cuentas)
- Cambiar el rol de un usuario existente
- Pruebas automáticas de `AuthService` y de las políticas de autorización
- Pantalla de vendedores (Consulta comercial; hoy con datos de ejemplo)
- Devoluciones de clientes (el tipo existe en el modelo; falta decidir si vuelven a tienda o a depósito)
- Decidir el umbral de «stock crítico» (hoy global y provisional: 3 unidades; falta saber si es por producto)
- Promociones
