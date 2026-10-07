/**
 * La tienda pública es otra aplicación (decisión 017): el panel solo enlaza a ella.
 * En producción se define con VITE_TIENDA_URL; en desarrollo corre en el puerto 5174.
 */
export const TIENDA_URL: string = import.meta.env.VITE_TIENDA_URL ?? 'http://localhost:5174'

export function abrirTienda() {
  window.open(TIENDA_URL, '_blank', 'noopener,noreferrer')
}
