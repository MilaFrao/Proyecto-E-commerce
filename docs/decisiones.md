# Decisiones de arquitectura

Registro de las decisiones tomadas y del porqué. Cuando una decisión cambie, se
agrega una entrada nueva en vez de editar la vieja: el historial importa.

**Stack:** React + TypeScript + Vite · ASP.NET Core 8 (Minimal APIs) · EF Core 8 · PostgreSQL · Docker · Git + GitHub

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

## 012 — Autenticación con JWT propio

**Fecha:** 2026-10-02 · **Estado:** implementada (back y front)

Resuelve el pendiente de autenticación. Login con correo y clave; el back emite
un token JWT firmado con los roles dentro (`admin`, `inventario`, `vendedor`) y
las rutas internas lo exigen con políticas por rol. El catálogo público
(`/api/catalogo/*`) sigue sin autenticación.

**Alternativa descartada:** ASP.NET Identity. Trae más tablas y ceremonia de la
que esta tienda necesita hoy, y un JWT simple es más fácil de llamar desde
herramientas externas como n8n (decisión 013).

**Cómo quedó**

- **Token:** HS256, 480 min por defecto (`Jwt:ExpiraMinutos`). Claims `sub`, `email`,
  `name`, `jti` y un claim `role` por cada rol. Se valida emisor, audiencia, firma y
  vencimiento, con 30 s de tolerancia de reloj.
- **Clave de firma:** `Jwt:Key`, mínimo 32 caracteres; si falta o es corta, la API
  no arranca. En producción va por variable de entorno (`Jwt__Key`), nunca en un
  archivo del repositorio. La de `appsettings.Development.json` es solo de desarrollo.
- **Contraseñas:** PBKDF2 (`PasswordHasher` de `Microsoft.Extensions.Identity.Core`,
  sin adoptar Identity completo). Mínimo 8 caracteres con letra y número.
- **Un solo mensaje de error** en el login (`Correo o clave incorrectos.`) para
  correo inexistente, clave mala o cuenta desactivada. Si el usuario no existe se
  verifica igual una huella falsa, para que el tiempo de respuesta no lo delate.
- **Desactivar corta el acceso al instante:** en cada petición el back comprueba
  que el usuario siga existiendo y activo (`OnTokenValidated`). Cuesta una consulta
  por petición; a esta escala es aceptable y evita tener que revocar tokens.
- **Límite de intentos:** `POST /api/auth/login` admite 5 por minuto y por IP
  (`RateLimit:LoginPorMinuto`; 20 en desarrollo). Respuesta 429.
- **Políticas:** `Admin`; `Inventario` (admin + inventario); `Personal` (los tres).
  Las ventas (`POST …/ventas`) son solo de Inventario/admin; el vendedor consulta.
- **Primer administrador:** `IdentitySeeder` lo crea al arrancar si no existe
  ninguno y están configurados `Admin:Correo` y `Admin:Clave`. Los roles se
  crean siempre.
- **Front:** `AuthProvider` guarda la sesión en `localStorage` (`tienda.sesion`),
  al recargar la confirma con `GET /api/auth/yo`, adjunta `Authorization: Bearer` a
  cada petición salvo las públicas, y ante un 401 o al vencer el token vuelve al
  login con aviso. Roles del back → panel: `admin`→`super`, `inventario`→`inventory`,
  `vendedor`→`seller` (gana el de mayor poder). Las cuentas `cliente` no entran al panel.

**Concesiones conocidas**

- **Sin refresh token.** Al vencer (8 h) hay que volver a entrar. Para un panel de
  tienda es razonable; se revisa si molesta.
- **El token vive en `localStorage`**, legible por cualquier script de la página: un
  XSS lo robaría. La alternativa es una cookie `httpOnly` + protección CSRF, más
  segura pero más trabajo y menos cómoda para n8n. Se mantiene hasta que el panel
  esté expuesto a internet; en ese momento se reevalúa.
- **Los roles viajan dentro del token:** cambiar el rol de alguien no surte efecto
  hasta su próximo login. Hoy no hay endpoint para cambiar roles; cuando exista,
  habrá que decidir si se invalida la sesión.
- **Sin cambio ni recuperación de contraseña.** El administrador crea las cuentas y
  entrega la clave inicial. Es la deuda más visible de esta pieza.
- **Limitador por IP** detrás de un proxy inverso necesita configurar
  `ForwardedHeaders`, o todos los intentos parecerán venir de la misma IP.
- **Swashbuckle fijado en 6.9.0** (la 10.x usa otra API de OpenAPI que no pude
  verificar sin compilar). Subirlo es una tarea aparte.

---

## 013 — La app es el banco de pruebas para herramientas nuevas

**Fecha:** 2026-10-02 · **Estado:** aceptada

Este proyecto sirve también para practicar herramientas que se vayan conociendo.
La primera es **n8n**. Casos previstos, en orden de dificultad:

1. **Producto nuevo publicado:** la API avisa por webhook cuando se crea o activa un producto.
2. **Alerta de stock bajo:** aviso cuando una variante baja de un umbral.
3. **Reporte diario:** n8n consulta la API cada día y arma un resumen de ventas y stock.
4. **Chatbot de atención** que consulta el catálogo y aporta a las métricas.

**Regla:** la app emite eventos y expone endpoints; la lógica de automatización
vive en n8n, no dentro del back. Así la app sigue funcionando si n8n no está.

**Consecuencia:** hay que construir endpoints de lectura para métricas, un
mecanismo de webhooks salientes y un umbral de stock bajo (pendiente de decidir).

---

## 014 — Registro de productos: sin «Borrador» y fotos en disco local

**Fecha:** 2026-10-02 · **Estado:** implementada

**Sin estado «Borrador» (por ahora).** El mockup tenía «Guardar borrador», pero el
back solo conoce `Activo` e `Inactivo` y un borrador que no se puede retomar no
sirve de nada: retomarlo exige la pantalla de *Editar producto*. «Crear producto»
registra el producto completo; ya queda fuera del catálogo público hasta que tenga
unidades surtidas en tienda (regla de la decisión 005), así que cubre la necesidad
real. El borrador entra junto con *Editar producto*, y entonces se decide si es un
estado del producto o algo que vive solo en el cliente.

**Fotos en disco local, detrás de una interfaz.** `POST /api/productos/imagenes`
(solo Inventario/admin) recibe el archivo, lo valida y devuelve una URL pública
(`/media/productos/<guid>.jpg`) que el front manda luego en `urlImagen`.

- `IAlmacenImagenes` (Application) y `AlmacenImagenesLocal` (Infrastructure): pasar a S3
  o similar es escribir otra implementación, sin tocar endpoints ni servicios.
- **El tipo se decide por el contenido** (JPEG, PNG o WebP por sus primeros bytes), no por
  la extensión ni el `Content-Type` que declare el cliente. SVG queda fuera a propósito:
  puede llevar scripts.
- **El nombre lo genera el servidor** (GUID): nada que mande el cliente forma parte de la ruta.
- Máximo 5 MB (`Imagenes:TamanoMaximoMb`). Carpeta en `Imagenes:Carpeta`
  (por defecto `uploads/` junto al proyecto de la API; está en `.gitignore`).
- Se sirven con `X-Content-Type-Options: nosniff` y caché larga (los nombres nunca se reutilizan).
- El front sube la foto **al guardar**, no al elegirla, para no dejar archivos de formularios
  abandonados; y si crear el producto falla, el reintento no vuelve a subir la misma foto.

**Marcas escritas a mano.** El campo Marca sugiere las existentes; si se escribe una nueva
se crea al guardar (`POST /api/listas/marcas`). La comparación ignora mayúsculas.

**Concesiones conocidas**

- **Archivos huérfanos:** si la foto se sube y el producto no llega a crearse (error o el
  usuario se va), el archivo queda en disco. Hace falta una limpieza periódica cuando importe.
- **Una sola foto por producto** (la principal). El modelo ya admite varias; la pantalla no.
- **El disco local no sirve para más de una instancia de la API** ni para despliegues sin
  disco persistente. Es el momento de la implementación S3.
- En producción `/media` debe llegar al back desde el mismo origen que el front (proxy inverso),
  igual que `/api`.
- El estado «bajo» de stock no se muestra en la lista de productos: depende del umbral,
  que sigue pendiente. Hoy se ven Disponible / En depósito / Agotado.

---

## 015 — Inventario: quién movió qué, y sin pisarse

**Fecha:** 2026-10-05 · **Estado:** implementada

Conecta Inventario, Surtido e Historial al back y completa los movimientos que
faltaban.

- **Cada movimiento lleva firma.** `MovimientoExistencias.RealizadoPorUsuarioId` se llena
  con el usuario del token (`IUsuarioActual`, implementado en la API con
  `IHttpContextAccessor`). Application no sabe nada de HTTP. Los movimientos de la
  semilla quedan sin usuario y se muestran como «Sistema».
- **Ajuste y merma.** El ajuste deja una ubicación en lo que se contó físicamente y
  registra la diferencia (positiva o negativa); la merma descuenta unidades dañadas o
  perdidas. En los dos el **motivo es obligatorio**: un cambio de stock sin explicación
  es justo lo que el historial existe para evitar (decisión 006).
- **Surtido en lote, todo o nada.** `POST /api/inventario/surtido` mueve varias
  variantes en una sola transacción. Si una no tiene stock suficiente, no se mueve
  ninguna y el error dice cuál.
- **Concurrencia optimista.** `NivelExistencias.Version` se mapea a la columna de sistema
  `xmin` de PostgreSQL: si dos personas mueven la misma prenda (variante) a la vez, el
  segundo guardado falla en vez de pisar al primero, y el usuario recibe un mensaje para
  reintentar con los números nuevos. Cada movimiento marca los dos niveles de la variante
  (depósito y tienda), así la «foto» de saldos que guarda el historial nunca queda vieja. Además, un `CHECK (Cantidad >= 0)` garantiza en la
  base que el stock nunca queda negativo, aunque el código se equivoque.
- **Resumen e historial global.** `GET /api/inventario/resumen?desde=` da los totales y lo
  movido desde una fecha; `GET /api/inventario/movimientos` es el historial de todo,
  paginado y con filtros. El resumen es también la materia prima del reporte diario de
  n8n (decisión 013).
- **«Hoy» lo decide quien mira.** El back guarda todo en UTC; el front manda la medianoche
  local como `desde`. Así «surtidas hoy» es el día de Caracas y no el de Greenwich.

**Lo que queda fuera**

- **Devoluciones:** el tipo existe en el modelo, pero falta decidir si lo devuelto vuelve a
  tienda (vendible) o a depósito (para revisar).
- **«Stock bajo»:** sigue sin umbral; las pantallas muestran Disponible / En depósito / Agotado.
- **Ventas desde el panel:** se registran a mano en el diálogo de movimientos (solo
  inventario y admin). Un punto de venta de verdad es otra pieza.
- La sugerencia de cuánto surtir: hoy cada fila arranca en 0 y la persona decide.

---

## 016 — Dashboard con datos reales y «stock crítico» provisional

**Fecha:** 2026-10-06 · **Estado:** implementada

El Dashboard dejó de ser maqueta. Lo que muestra, de arriba abajo:

- **Saludo con la persona en sesión y la fecha de hoy.** «Buenos días / Buenas tardes / Buenas noches»
  según la hora local, el nombre tal como está registrado y la fecha real; se corrige solo si el
  panel queda abierto pasada la medianoche.
- **Cuatro métricas:** disponibles para venta, unidades en depósito, variantes en stock crítico y
  variantes agotadas (`GET /api/inventario/resumen`).
- **Stock crítico, al centro.** Las 8 variantes con menos unidades, cada una con su saldo por
  ubicación y una pista de acción: *hay en depósito → surtir* o *sin depósito → reponer*. Un
  enlace lleva a Inventario ya filtrado.
- **Pendiente de surtir** es ahora un atajo: muestra cuántas variantes esperan en el depósito, las
  primeras tres y lleva a la pestaña Surtido.
- **Unidades movidas, últimos 7 días** (entradas, surtidas, vendidas) con datos reales
  (`GET /api/inventario/actividad`), y el total de hoy.

**Se quitaron** «Movimientos recientes» (para eso está Historial, con filtros y búsqueda) y el botón
«Registrar movimiento» (duplicaba el diálogo de Inventario). Lo de registrar movimientos desde
fuera —lo que se pensó para n8n— ya existe como API: `POST /api/inventario/variantes/{id}/entradas|surtido|ventas|ajustes|mermas`.

**Definición provisional de «crítico».** Una variante es crítica si le quedan **entre 1 y 3 unidades
sumando depósito y tienda**. Cero unidades es «agotada», que se cuenta aparte; una variante con
poco en tienda pero mucho en depósito no es crítica, es «por surtir». Así las tres cosas no se
pisan. El 3 es **global** (`EstadoExistencias.UmbralCriticoPorDefecto` en el back y
`UMBRAL_STOCK_CRITICO` en el front, el mismo número) y puede pedirse otro con `?umbral=`.

**Concesiones conocidas**

- **El umbral sigue sin decidirse de verdad:** global (hoy) o por producto (la ropa básica rota más
  que un abrigo). Mientras tanto, la alerta de stock bajo de n8n debe esperar a esta decisión.
- **La gráfica agrupa los movimientos en memoria** (tres columnas de 7 días). Es trivial a esta
  escala; si el volumen crece, se pasa a una agregación en SQL.
- **Los «días» son bloques de 24 h desde la medianoche local de quien consulta.** Correcto en
  Caracas (sin horario de verano); en una zona con cambio de hora, el día del cambio saldría
  desfasado una hora.
- **Nombre completo en el saludo:** se usa el nombre registrado tal cual, sin adivinar cuál es el
  de pila.

---

## Pendientes de decisión

| Tema | Bloquea a |
|---|---|
| Modalidad de promociones (precio promocional, % de descuento, por categoría) | MVP 3 |
| Profundidad de la jerarquía de categorías (el filtro del catálogo hoy no incluye subcategorías) | Navegación del catálogo |
| Búsqueda: `ILIKE` simple vs. full-text de PostgreSQL | Rendimiento del catálogo |
| Editar producto, y con él el estado «Borrador» | Retomar productos incompletos |
| Limpieza de fotos huérfanas y más de una foto por producto | Crecimiento del almacenamiento |
| Umbral de «stock crítico»: hoy global y provisional (3 unidades); falta decidir si es por producto | Alertas de n8n |
| Mecanismo de webhooks salientes (reintentos, firma, tabla de eventos) | Casos n8n |
| Moneda de la tienda (hoy el front asume USD, centralizado en `money.ts`) | Precios en el catálogo |
| Cambio y recuperación de contraseña (hoy solo el admin crea cuentas) | Autoservicio del personal |
| Token en `localStorage` vs. cookie `httpOnly`, y refresh tokens | Exponer el panel a internet |
| Devoluciones: ¿vuelven a tienda o a depósito? | Registrar devoluciones |
