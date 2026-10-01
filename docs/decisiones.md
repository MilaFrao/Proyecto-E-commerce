# Decisiones de arquitectura

Registro de las decisiones tomadas y del porqué. Cuando una decisión cambie, se
agrega una entrada nueva en vez de editar la vieja: el historial importa.

---

## 001 — Monorepo con backend y frontend hermanos

**Fecha:** 2026-09-28 · **Estado:** aceptada

Un solo repositorio con `backend/` y `frontend/` en la raíz.

En esta etapa las dos partes evolucionan pegadas: cada cambio de contrato en la
API arrastra un cambio en el cliente. Dos repositorios obligarían a coordinar
commits entre ambos por cada ajuste, sin ganar nada a cambio.

**Consecuencia:** un solo historial de Git y un solo sitio donde mirar. Si algún
día el frontend se despliega por separado, se puede extraer sin drama.

---

## 002 — Backend en cuatro proyectos (arquitectura por capas)

**Fecha:** 2026-09-28 · **Estado:** aceptada

`Tienda.Domain` → `Tienda.Application` → `Tienda.Infrastructure` → `Tienda.Api`,
con las dependencias apuntando siempre hacia adentro.

**Alternativas descartadas:**

- *Dos proyectos (Api + Core).* Más rápido de arrancar, pero la regla de stock
  de tres niveles queda mezclada con EF Core y se vuelve difícil de testear.
- *Un solo proyecto con carpetas.* Lo más veloz; la disciplina depende
  enteramente de quien escribe, sin nada que la haga cumplir.

Se eligió la separación completa porque las reglas de inventario (depósito vs.
surtido vs. disponible) y la de publicación en catálogo son el corazón del
sistema. Tenerlas en un proyecto sin dependencias externas las vuelve
verificables con tests que corren en milisegundos.

**Consecuencia:** más ceremonia al crear un caso de uso nuevo. A cambio, el
compilador impide que la lógica de negocio se filtre a la capa de datos.

---

## 003 — Minimal APIs en vez de Controllers

**Fecha:** 2026-09-28 · **Estado:** aceptada

Endpoints agrupados por módulo en `Tienda.Api/Endpoints/`, registrados con
métodos de extensión (`MapInventoryEndpoints`, `MapCatalogEndpoints`).

Menos ceremonia que los controllers, y es hacia donde apunta el ecosistema .NET.
La contra: buena parte de la documentación y los tutoriales viejos siguen usando
controllers, así que a veces habrá que traducir mentalmente.

---

## 004 — Una sola SPA con dos layouts

**Fecha:** 2026-09-28 · **Estado:** aceptada

Un solo proyecto de frontend con dos árboles de rutas:

- `/` → `PublicLayout` — catálogo, sin autenticación (MVP 2)
- `/admin` → `AdminLayout` — back-office, detrás de login (MVP 1)

**Alternativa descartada:** dos aplicaciones independientes. Conceptualmente más
limpio, pero duplica el build, el deploy y las dependencias compartidas por un
beneficio que a esta escala no se nota.

**Consecuencia:** el bundle público carga código que el cliente nunca usa. Si
llega a pesar, se resuelve con carga diferida por ruta, no partiendo el proyecto.

---

## 005 — Stock modelado por ubicación, no por columnas

**Fecha:** 2026-09-28 · **Estado:** aceptada

En vez de `Variante { CantidadDeposito, CantidadTienda }`, se usa una tabla
`stock_levels` con una fila por cada par `(variante, ubicación)` y un índice
único sobre esa combinación.

Esto sale directo de la sección 6 del documento de requerimientos, pero resuelve
además el punto que quedó pendiente: el modelo asume **una sola tienda física**.
Con filas por ubicación, una segunda sucursal entra agregando una columna
`StoreId` al índice único — no rehaciendo el inventario completo.

**Consecuencia:** consultar el stock de una variante exige agregar filas en vez
de leer dos columnas. El costo es real pero marginal, y el índice único lo cubre.

---

## 006 — Los movimientos de stock son inmutables

**Fecha:** 2026-09-28 · **Estado:** aceptada

`stock_movements` es un libro contable: se escribe, nunca se edita ni se borra.
Un error se corrige registrando un movimiento de ajuste que lo compense.

Cada fila guarda además una foto del stock resultante en ambas ubicaciones, para
poder auditar un momento puntual sin recalcular toda la cadena desde el origen.

La relación con la variante usa `DeleteBehavior.Restrict`: el historial
sobrevive aunque la variante se desactive. Esto respalda la sección 8 del
documento — los productos se marcan inactivos, no se eliminan.

---

## 007 — Los precios viven en el producto, con override por variante

**Fecha:** 2026-09-28 · **Estado:** aceptada

`Product.RetailPrice` y `Product.WholesalePrice` son los precios base.
`ProductVariant` tiene `RetailPriceOverride` y `WholesalePriceOverride`,
ambos nulos por defecto.

El caso normal de una tienda de ropa es que todas las tallas de una camisa
cuesten lo mismo. Pero la talla XXL o un color especial a veces cuestan más, y
duplicar el producto para eso sería absurdo.

**Consecuencia:** el precio efectivo es `variante.override ?? producto.base`.
Esa expresión tiene que estar en un solo lugar, no repartida por el código.

---

## 008 — Todo el código del backend en español

**Fecha:** 2026-10-01 · **Estado:** reemplazada en parte por la 011 (los nombres de capas y de piezas técnicas vuelven al inglés; lo del negocio sigue en español)

Clases, propiedades, métodos, parámetros, variables, tablas y columnas se
escriben en español. Se conservan en inglés solo los nombres que impone el
framework (`Middleware`, `DbContext`, `SaveChangesAsync`, `InvokeAsync`,
`IEntityTypeConfiguration`, `Program.cs`).

Los proyectos pasan a llamarse `Tienda.Dominio`, `Tienda.Aplicacion`,
`Tienda.Infraestructura` y `Tienda.Api`; las pruebas, `Tienda.Dominio.Pruebas`.
Esta decisión **reemplaza los nombres** de las entradas 002, 003, 005, 006 y 007;
la lógica de esas decisiones no cambia.

| Antes | Ahora |
|---|---|
| `Product`, `ProductVariant` | `Producto`, `VarianteProducto` |
| `StockLevel`, `StockMovement` | `NivelExistencias`, `MovimientoExistencias` |
| tablas `stock_levels`, `stock_movements` | `niveles_existencias`, `movimientos_existencias` |
| `Product.RetailPrice` / `WholesalePrice` | `Producto.PrecioVenta` / `PrecioMayorista` |
| `ProductVariant.RetailPriceOverride` | `VarianteProducto.PrecioVentaAlternativo` |
| `MapInventoryEndpoints`, `MapCatalogEndpoints` | `MapearRutasInventario`, `MapearRutasCatalogo` |
| `TipoMovimiento.Return` / `Removal` | `Devolucion` / `Merma` |

**Regla práctica:** la carpeta y el namespace coinciden siempre
(`Tienda.Aplicacion.Catalogo.Datos` vive en `Catalogo/Datos/`), y el nombre del
archivo es el de la clase que contiene.

**Consecuencia:** las rutas y los campos JSON de la API también quedan en
español (`/api/catalogo/productos`, `NombreCategoria`, `EstaDisponible`). El
frontend debe consumirlos con esos nombres.

---

## 009 — Se reinicia el historial de migraciones

**Fecha:** 2026-10-01 · **Estado:** aceptada

Mientras la base solo existe en desarrollo, no hay datos que conservar. El
renombrado a español se había intentado como una migración aparte
(`RenombrarEsquemaEspanol`), pero convivía con la migración inicial en inglés y
con duplicados. Se descartan todas y se genera una sola, `CreacionInicial`, que
ya crea el esquema en español.

**Consecuencia:** hay que borrar la base local una vez
(`dotnet ef database drop`) y generar la migración. **Desde que exista una base
con datos reales, este atajo deja de valer:** el esquema solo cambia con
migraciones nuevas, nunca regenerando la inicial.

---

## 010 — Puntos del contrato entre frontend y backend

**Fecha:** 2026-10-01 · **Estado:** aceptada · color hex, stock inicial y `Referencia` ya aplicados; concurrencia y endpoints, pendientes

Al contrastar el prototipo del frontend con el backend aparecieron desajustes.
Se resuelven así:

- **Color con hex.** La variante guarda el nombre del color **y su código hex**
  (`ColorHex`, `#RRGGBB`, validado en el servicio), porque la vista pública dibuja muestras de color.
- **Stock inicial al crear producto.** `SolicitudCrearProducto` acepta
  `CantidadInicial` por variante (por defecto 0); si es mayor que cero, se registra un movimiento
  de `Entrada` hacia depósito en la misma transacción. Así el stock nunca nace sin
  historial (decisión 006).
- **`Referencia` fuera de la vista pública.** El DTO público no la expone, y el
  frontend dejó de mostrar "Ref." al cliente. Es dato interno.
- **Concurrencia en existencias.** `NivelExistencias` necesita un token de
  concurrencia para evitar pérdidas de actualización cuando dos ventas tocan la
  misma variante.

**Endpoints que el frontend ya asume y aún no existen:** lista de surtido
pendiente, historial global de movimientos, resumen del panel, detalle y edición
de producto, usuarios/autenticación, umbral de stock bajo.

---

## 011 — Negocio en español, estructura técnica en inglés

**Fecha:** 2026-10-01 · **Estado:** aceptada

La 008 tradujo todo, y traducir `Domain` como `Dominio` o `Service` como
`Servicio` no ayuda: son términos de arquitectura que en cualquier documentación,
tutorial o mensaje de error aparecen en inglés. Se corrige el criterio:

- **Español:** lo que pertenece al negocio de la tienda — entidades y sus
  propiedades, enums, casos de uso, módulos (`Catalogo`, `Inventario`,
  `Productos`, `Listas`), tablas, rutas, campos JSON y mensajes al usuario.
- **Inglés:** lo que pertenece a la estructura — capas y proyectos, carpetas
  técnicas, sufijos de patrón (`Service`, `Dto`, `Request`, `Result`,
  `Configuration`, `Middleware`) y parámetros técnicos (`cancellationToken`).

| Antes (008) | Ahora |
|---|---|
| `Tienda.Dominio` / `Aplicacion` / `Infraestructura` | `Tienda.Domain` / `Application` / `Infrastructure` |
| `Tienda.Dominio.Pruebas` | `Tienda.Domain.Tests` |
| carpetas `Comun`, `Abstracciones`, `Datos`, `Persistencia`, `Configuraciones`, `DatosIniciales`, `Servicios`, `Rutas`, `ManejoSolicitudes`, `Identidad` | `Common`, `Abstractions`, `Dtos`, `Persistence`, `Configurations`, `Seed`, `Services`, `Endpoints`, `Middleware`, `Identity` |
| `EntidadBase`, `ExcepcionDominio` | `BaseEntity`, `DomainException` |
| `Identificador`, `CreadoEn`, `ActualizadoEn` | `Id`, `CreatedAt`, `UpdatedAt` |
| `Resultado` / `ResultadoPaginado` | `Result` / `PagedResult` (`IsSuccess`, `Value`, `Success()`, `Failure()`) |
| `ContextoBaseDatos`, `IProveedorFechaHora` | `AppDbContext`, `IDateTimeProvider` |
| `ServicioProducto`, `IServicioProducto` | `ProductoService`, `IProductoService` |
| `ConfiguracionProducto` | `ProductoConfiguration` |
| `RutasProducto` / `MapearRutasProducto` | `ProductoEndpoints` / `MapProductoEndpoints` |
| `SolicitudCrearProducto` | `CrearProductoRequest` |
| `UsuarioAplicacion`, `RolAplicacion` | `Usuario`, `Rol` |
| `GeneradorSegmentosUrl`, `SegmentoUrl` | `Slug` |

**Sin cambios:** las entidades de negocio (`Producto`, `VarianteProducto`,
`NivelExistencias`, `MovimientoExistencias`…), las tablas, las rutas y los
campos JSON. El frontend no se toca. Lo único que cambia hacia afuera es
`identificador` → `id` en el JSON.

**Regla práctica:** carpeta = namespace = nombre del archivo, y las migraciones
vuelven a llamarse como las genera EF (`Migrations/`).

---

## Pendientes de decisión

| Tema | Bloquea a |
|---|---|
| Mecanismo de autenticación (ASP.NET Identity vs. JWT propio) | Back-office, pantalla de vendedores |
| Modalidad de promociones (precio promocional, % de descuento, por categoría) | MVP 3 |
| Profundidad de la jerarquía de categorías (el filtro del catálogo hoy no incluye subcategorías) | Navegación del catálogo |
| Búsqueda: `ILIKE` simple vs. full-text de PostgreSQL | Rendimiento del catálogo |
| Almacenamiento de imágenes (disco local vs. S3 o equivalente) | Registro de productos |
| Umbral de "stock bajo": global o por producto | Panel y alertas |
| Moneda de la tienda (hoy el front asume USD, centralizado en `money.ts`) | Precios en el catálogo |
