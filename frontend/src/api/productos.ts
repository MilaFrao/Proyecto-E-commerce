import { api } from './client'

/** Producto en el listado interno (GET /api/productos). */
export type ProductoDto = {
  id: string
  nombre: string
  referencia: string
  descripcion: string | null
  nombreCategoria: string
  nombreMarca: string | null
  precioVenta: number
  precioMayorista: number
  estado: 'Activo' | 'Inactivo'
  cantidadVariantes: number
  unidadesDeposito: number
  unidadesTienda: number
  urlImagenPrincipal: string | null
}

type Paginado<T> = { elementos: T[]; pagina: number; elementosPorPagina: number; cantidadTotal: number; paginasTotales: number }

export type NuevaVariante = {
  codigoSku: string
  color: string
  talla: string
  colorHex: string
  cantidadInicial: number
  precioVentaAlternativo: number | null
  precioMayoristaAlternativo: number | null
}

export type NuevoProducto = {
  nombre: string
  referencia: string
  descripcion: string | null
  categoriaId: string
  marcaId: string | null
  precioVenta: number
  precioMayorista: number
  urlImagen: string | null
  variantes: NuevaVariante[]
}

/** El back pagina; el panel pide el máximo (100) y filtra en pantalla, como el catálogo. */
export async function listarProductos(): Promise<{ productos: ProductoDto[]; total: number }> {
  const p = await api.get<Paginado<ProductoDto>>('/productos?incluirInactivos=true&elementosPorPagina=100')
  return { productos: p.elementos, total: p.cantidadTotal }
}

export const crearProducto = (p: NuevoProducto) => api.post<ProductoDto>('/productos', p)

export const cambiarEstadoProducto = (id: string, activo: boolean) =>
  api.post<void>(`/productos/${id}/${activo ? 'activar' : 'desactivar'}`)

/** Sube la foto y devuelve su URL pública (relativa al sitio, p. ej. /media/productos/ab12….jpg). */
export async function subirImagenProducto(archivo: File): Promise<string> {
  const form = new FormData()
  form.append('archivo', archivo)
  const r = await api.upload<{ url: string }>('/productos/imagenes', form)
  return r.url
}
