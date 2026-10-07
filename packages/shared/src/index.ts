/**
 * Lo que comparten el panel (apps/admin) y la tienda (apps/tienda). Decisión 017.
 *
 * Regla: aquí entra solo lo que usan las dos apps y no depende de React. Si algo es de un
 * solo lado, vive en su app. Este archivo es la API pública del paquete.
 */
export { api, ApiError, configureAuth } from './api/client'
export { getCatalogo } from './api/catalogo'
export { CURRENCY, formatPrice } from './lib/money'
export { buildFacets } from './catalog/public'
export type { PublicProduct, PublicVariant } from './catalog/public'
