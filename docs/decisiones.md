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

## Pendientes de decisión

| Tema | Bloquea a |
|---|---|
| Mecanismo de autenticación (ASP.NET Identity vs. JWT propio) | Back-office, pantalla de vendedores |
| Modalidad de promociones (precio promocional, % de descuento, por categoría) | MVP 3 |
| Profundidad de la jerarquía de categorías | Navegación del catálogo |
| Búsqueda: `ILIKE` simple vs. full-text de PostgreSQL | Rendimiento del catálogo |
| Almacenamiento de imágenes (disco local vs. S3 o equivalente) | Registro de productos |
