import { api } from './client'

/* ---------- Contrato del back (/api/inventario) ---------- */

export type Ubicacion = 'Deposito' | 'Tienda'
export type TipoMovimiento = 'Entrada' | 'Traslado' | 'Venta' | 'Devolucion' | 'Ajuste' | 'Merma'
export type EstadoFiltro = 'todos' | 'disponible' | 'solo-deposito' | 'agotado' | 'por-surtir' | 'critico'

/**
 * Una variante es «crítica» si le quedan entre 1 y este número de unidades sumando depósito y tienda.
 * Umbral provisional y global (igual al del back); si pasa a ser por producto, se mueve a la configuración.
 */
export const UMBRAL_STOCK_CRITICO = 3

export type ExistenciasVariante = {
  varianteId: string
  nombreProducto: string
  referencia: string
  codigoSku: string
  color: string
  colorHex: string
  talla: string
  cantidadDeposito: number
  cantidadTienda: number
  ultimoMovimientoEn: string | null
}

export type ResumenExistencias = {
  varianteId: string
  codigoSku: string
  color: string
  talla: string
  cantidadDeposito: number
  cantidadTienda: number
}

export type ResumenInventario = {
  unidadesDeposito: number
  unidadesTienda: number
  variantesActivas: number
  variantesSinSurtir: number
  variantesAgotadas: number
  variantesCriticas: number
  desde: string
  unidadesEntradas: number
  unidadesSurtidas: number
  unidadesVendidas: number
}

export type Movimiento = {
  id: string
  varianteId: string
  nombreProducto: string
  codigoSku: string
  color: string
  colorHex: string
  talla: string
  tipo: TipoMovimiento
  cantidad: number
  ubicacionOrigen: Ubicacion | null
  ubicacionDestino: Ubicacion | null
  cantidadResultanteDeposito: number
  cantidadResultanteTienda: number
  ocurridoEn: string
  notas: string | null
  nombreUsuario: string | null
}

export type Paginado<T> = { elementos: T[]; pagina: number; elementosPorPagina: number; cantidadTotal: number; paginasTotales: number }

const qs = (p: Record<string, string | number | undefined>) =>
  new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString()

/* ---------- Consultas ---------- */

export const listarVariantes = (p: { busqueda?: string; estado?: EstadoFiltro; pagina?: number; elementosPorPagina?: number }) =>
  api.get<Paginado<ExistenciasVariante>>(`/inventario/variantes?${qs({ ...p, umbral: p.estado === 'critico' ? UMBRAL_STOCK_CRITICO : undefined })}`)

/** Totales y unidades movidas desde `desde` (por defecto, desde la medianoche local). */
export const getResumenInventario = (desde: Date) =>
  api.get<ResumenInventario>(`/inventario/resumen?${qs({ desde: desde.toISOString(), umbral: UMBRAL_STOCK_CRITICO })}`)

export type ActividadDia = { inicio: string; entradas: number; surtidas: number; vendidas: number }

/** Unidades entradas, surtidas y vendidas por día: los últimos `dias` días locales, el último es hoy. */
export const getActividad = (dias = 7) => {
  const desde = new Date()
  desde.setHours(0, 0, 0, 0)
  desde.setDate(desde.getDate() - (dias - 1))
  return api.get<ActividadDia[]>(`/inventario/actividad?${qs({ desde: desde.toISOString(), dias })}`)
}

export const listarMovimientos = (p: { busqueda?: string; tipo?: TipoMovimiento; pagina?: number; elementosPorPagina?: number }) =>
  api.get<Paginado<Movimiento>>(`/inventario/movimientos?${qs(p)}`)

/* ---------- Movimientos (solo inventario y admin) ---------- */

const ruta = (id: string, accion: string) => `/inventario/variantes/${id}/${accion}`
const notasONull = (n?: string) => (n && n.trim() ? n.trim() : null)

export const registrarEntrada = (id: string, cantidad: number, notas?: string) =>
  api.post<ResumenExistencias>(ruta(id, 'entradas'), { cantidad, notas: notasONull(notas) })

export const surtir = (id: string, cantidad: number, notas?: string) =>
  api.post<ResumenExistencias>(ruta(id, 'surtido'), { cantidad, notas: notasONull(notas) })

export const registrarVenta = (id: string, cantidad: number, notas?: string) =>
  api.post<ResumenExistencias>(ruta(id, 'ventas'), { cantidad, notas: notasONull(notas) })

export const ajustar = (id: string, ubicacion: Ubicacion, cantidadContada: number, notas: string) =>
  api.post<ResumenExistencias>(ruta(id, 'ajustes'), { ubicacion, cantidadContada, notas: notasONull(notas) })

export const registrarMerma = (id: string, ubicacion: Ubicacion, cantidad: number, notas: string) =>
  api.post<ResumenExistencias>(ruta(id, 'mermas'), { ubicacion, cantidad, notas: notasONull(notas) })

/** Varias variantes de una vez, en una sola transacción: o se surten todas o ninguna. */
export const surtirLote = (elementos: { varianteId: string; cantidad: number }[], notas?: string) =>
  api.post<ResumenExistencias[]>('/inventario/surtido', { elementos, notas: notasONull(notas) })

/* ---------- Ayudas de presentación ---------- */

/** Estado visual a partir de dónde están las unidades (sin umbral de «stock bajo» todavía). */
export function estadoStock(v: { cantidadDeposito: number; cantidadTienda: number }): 'disponible' | 'deposito' | 'agotado' {
  if (v.cantidadTienda > 0) return 'disponible'
  if (v.cantidadDeposito > 0) return 'deposito'
  return 'agotado'
}
