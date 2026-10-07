# @tienda/shared

Código que usan a la vez el panel (`apps/admin`) y la tienda (`apps/tienda`). Decisión 017.

- `src/api/client.ts` — cliente HTTP único hacia `/api` (la sesión se conecta con `configureAuth`).
- `src/api/catalogo.ts` — contrato del catálogo público y su adaptador.
- `src/catalog/public.ts` — tipos de la vista pública (sin cantidades ni depósito).
- `src/lib/money.ts` — moneda y formato de precios, en un solo lugar.

**Regla:** solo entra lo que de verdad usan las dos apps y no depende de React. Todo se exporta
desde `src/index.ts`; las apps importan siempre `@tienda/shared`, nunca rutas internas.
