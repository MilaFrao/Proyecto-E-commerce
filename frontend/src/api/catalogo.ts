import { api } from './client'
import { buildFacets, type PublicProduct } from '../lib/stock'

/* ---------- Contrato del back (GET /api/catalogo/productos) ---------- */

type VarianteCatalogoDto = {
  id: string
  color: string
  colorHex: string
  talla: string
  precio: number
  estaDisponible: boolean
}

type ProductoCatalogoDto = {
  id: string
  nombre: string
  descripcion: string | null
  nombreCategoria: string
  nombreMarca: string | null
  precio: number
  urlImagenPrincipal: string | null
  variantes: VarianteCatalogoDto[]
}

type Paginado<T> = {
  elementos: T[]
  pagina: number
  elementosPorPagina: number
  cantidadTotal: number
  paginasTotales: number
}

/* ---------- Adaptador: el único sitio que conoce los nombres del back ---------- */

export function aProductoPublico(d: ProductoCatalogoDto): PublicProduct {
  const variants = d.variantes.map((v) => ({
    id: v.id,
    color: v.color,
    hex: v.colorHex,
    size: v.talla,
    available: v.estaDisponible,
    price: v.precio,
  }))
  const prices = variants.length ? variants.map((v) => v.price) : [d.precio]

  return {
    id: d.id,
    name: d.nombre,
    brand: d.nombreMarca ?? '',
    ref: '', // la referencia es interna: no viaja al público
    category: d.nombreCategoria,
    description: d.descripcion ?? '',
    image: d.urlImagenPrincipal ?? undefined,
    basePrice: d.precio,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    variants,
    ...buildFacets(variants),
  }
}

/** El back limita a 100 por página; el filtrado fino se hace en el navegador por ahora. */
export async function getCatalogo(): Promise<PublicProduct[]> {
  const pagina = await api.get<Paginado<ProductoCatalogoDto>>('/catalogo/productos?elementosPorPagina=100', { publico: true })
  return pagina.elementos.map(aProductoPublico)
}
