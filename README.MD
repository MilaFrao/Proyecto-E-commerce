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
│   │   ├── Tienda.Dominio/          entidades y reglas de negocio puras
│   │   ├── Tienda.Aplicacion/       casos de uso, DTOs, interfaces
│   │   ├── Tienda.Infraestructura/  EF Core, PostgreSQL, servicios externos
│   │   └── Tienda.Api/              endpoints HTTP
│   └── tests/
│       └── Tienda.Dominio.Pruebas/
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
Api  →  Infraestructura  →  Aplicacion  →  Dominio
```

Las flechas apuntan **hacia adentro**, nunca al revés. Si aparece un
`using Tienda.Infraestructura` dentro de `Tienda.Dominio`, algo se torció.

### Convención de nombres

Todo el código del backend está en español: clases, propiedades, métodos,
parámetros, variables, tablas y columnas. Se conservan en inglés solo los
términos del propio framework (`Controller`, `Middleware`, `DbContext`,
`SaveChangesAsync`, `InvokeAsync`, `IEntityTypeConfiguration`...). Detalle en
la decisión 008 de [`docs/decisiones.md`](docs/decisiones.md).

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
dotnet ef migrations add CreacionInicial -p src/Tienda.Infraestructura -s src/Tienda.Api --output-dir Migraciones

# En desarrollo la API aplica las migraciones sola al arrancar.
# Si prefieres hacerlo a mano:
dotnet ef database update -p src/Tienda.Infraestructura -s src/Tienda.Api

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
| `POST` | `/api/productos/{identificador}/desactivar` | Desactiva (no se borra) |
| `POST` | `/api/productos/{identificador}/activar` | Reactiva |

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
| `GET` | `/api/catalogo/productos/{identificador}` | Ficha del producto con sus variantes |
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