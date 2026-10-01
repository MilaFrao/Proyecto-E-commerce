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
│   │   ├── Tienda.Domain/           entidades y reglas de negocio puras
│   │   ├── Tienda.Application/      casos de uso, DTOs, interfaces
│   │   ├── Tienda.Infrastructure/   EF Core, PostgreSQL, servicios externos
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

# Primera migración
dotnet ef migrations add InitialCreate -p src/Tienda.Infrastructure -s src/Tienda.Api
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

### Inventario — MVP 1 (interno)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/inventory/variants/{id}/stock` | Depósito, tienda y disponible para venta |
| `GET` | `/api/inventory/variants/{id}/movements` | Historial de movimientos |
| `POST` | `/api/inventory/variants/{id}/entries` | Entrada de mercancía al depósito |
| `POST` | `/api/inventory/variants/{id}/supply` | Surtido: depósito → tienda |
| `POST` | `/api/inventory/variants/{id}/sales` | Venta (descuenta de tienda) |

### Catálogo — MVP 2 (público, sin autenticación)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/catalog/products` | Lista con búsqueda, filtros, orden y paginación |
| `GET` | `/api/catalog/products/{id}` | Ficha del producto con sus variantes |

---

## Lo que todavía falta

- Endpoints de administración de productos (crear, editar, desactivar)
- Módulo de autenticación y roles — la estructura está lista, falta decidir entre
  ASP.NET Identity y JWT propio
- Pantalla de vendedores (consulta rápida por código de barras)
- Promociones
- Carga y almacenamiento de imágenes
- Pantallas del back-office: hoy son solo el esqueleto
