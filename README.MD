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
docker run --name tienda-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tienda -p 5432:5432 -d postgres:16
```

Sin Docker, instalar PostgreSQL y crear la base `tienda`. La cadena de conexión
vive en `backend/src/Tienda.Api/appsettings.json`.

### 2. Backend

```bash
cd backend
dotnet restore
dotnet tool install --global dotnet-ef        # una sola vez

# Crear la migración inicial (el esquema ya sale en español)
dotnet ef migrations add CreacionInicial -p src/Tienda.Infrastructure -s src/Tienda.Api --output-dir Migrations

# En desarrollo la API aplica las migraciones sola al arrancar.
# Si prefieres hacerlo a mano:
dotnet ef database update -p src/Tienda.Infrastructure -s src/Tienda.Api

dotnet run --project src/Tienda.Api
```

La API queda en `http://localhost:5080`, con Swagger en `/swagger`.

> **Versión de .NET:** el esqueleto apunta a `net8.0`. Si tu SDK es más nuevo,
> cambia `<TargetFramework>` en `backend/Directory.Build.props` — una sola línea
> para toda la solución — y ajusta las versiones de los paquetes en los `.csproj`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Queda en `http://localhost:5173`. Vite redirige `/api` al backend, así que no hay
que pelear con CORS en desarrollo.

---

## Endpoints implementados

Las respuestas viajan con nombres en español y los enums como texto
(`"Entrada"`, `"Traslado"`, `"Venta"`, `"Devolucion"`, `"Ajuste"`, `"Merma"`).

### Sistema

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/salud` | Comprobación de que la API está viva |

### Productos — MVP 1 (interno)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/productos` | Listado con búsqueda y paginación (`busqueda`, `incluirInactivos`, `pagina`, `elementosPorPagina`) |
| `POST` | `/api/productos` | Crea el producto con todas sus variantes |
| `POST` | `/api/productos/{id}/desactivar` | Desactiva (no se borra) |
| `POST` | `/api/productos/{id}/activar` | Reactiva |

### Inventario — MVP 1 (interno)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/inventario/variantes?busqueda=` | Busca variantes con su stock (máx. 50) |
| `GET` | `/api/inventario/variantes/{varianteId}/existencias` | Depósito, tienda y disponible para venta |
| `GET` | `/api/inventario/variantes/{varianteId}/movimientos` | Historial de movimientos |
| `POST` | `/api/inventario/variantes/{varianteId}/entradas` | Entrada de mercancía al depósito |
| `POST` | `/api/inventario/variantes/{varianteId}/surtido` | Surtido: depósito → tienda |
| `POST` | `/api/inventario/variantes/{varianteId}/ventas` | Venta (descuenta de tienda) |

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

- Editar producto y ver su detalle interno (crear y desactivar ya existen)
- Módulo de autenticación y roles — la estructura está lista, falta decidir entre
  ASP.NET Identity y JWT propio
- Pantalla de vendedores (consulta rápida por código de barras)
- Promociones
- Carga y almacenamiento de imágenes
- Pantallas del back-office: hoy son solo el esqueleto