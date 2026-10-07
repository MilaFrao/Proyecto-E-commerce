/**
 * Reglas de negocio del catálogo, en un solo lugar (decisiones 005 y 007).
 * Aquí viven: el precio efectivo, la disponibilidad para venta y la regla
 * de publicación. Ninguna pantalla debe reimplementarlas.
 */

import { buildFacets, type PublicProduct, type PublicVariant } from '@tienda/shared'

export type ProductState = 'activo' | 'inactivo' | 'borrador'

export type Variant = {
  id: string
  color: string
  hex: string
  size: string
  sku: string
  /** Existencia física en depósito (interno). */
  deposito: number
  /** Existencia surtida en tienda (interno). Es la base de la disponibilidad. */
  tienda: number
  retailOverride?: number
  wholesaleOverride?: number
}

export type Product = {
  id: string
  name: string
  brand: string
  ref: string
  category: string
  description: string
  image?: string
  state: ProductState
  retailPrice: number
  wholesalePrice: number
  variants: Variant[]
}

/** precio efectivo = override de la variante ?? precio base del producto */
export function effectiveRetail(p: Product, v: Variant): number {
  return v.retailOverride ?? p.retailPrice
}

export function effectiveWholesale(p: Product, v: Variant): number {
  return v.wholesaleOverride ?? p.wholesalePrice
}

/** Disponible para venta = surtido en tienda. El depósito por sí solo no cuenta. */
export function isAvailable(v: Variant): boolean {
  return v.tienda > 0
}

/** Un producto se publica si está activo y tiene al menos una variante disponible. */
export function isPublishable(p: Product): boolean {
  return p.state === 'activo' && p.variants.some(isAvailable)
}

/* ---------- Vista pública: sin cantidades, sin depósito ---------- */
// Los tipos de la vista pública y buildFacets viven en @tienda/shared (decisión 017).

/**
 * Convierte un producto interno en su versión pública, o null si no se publica.
 * El tipo de salida no tiene campos de cantidad: el cliente no puede ver stock
 * aunque algún componente lo intente.
 */
export function toPublic(p: Product): PublicProduct | null {
  if (!isPublishable(p)) return null

  const variants: PublicVariant[] = p.variants.map((v) => ({
    id: v.id,
    color: v.color,
    hex: v.hex,
    size: v.size,
    available: isAvailable(v),
    price: effectiveRetail(p, v),
  }))

  const prices = variants.map((v) => v.price)
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    ref: p.ref,
    category: p.category,
    description: p.description,
    image: p.image,
    basePrice: p.retailPrice,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    variants,
    ...buildFacets(variants),
  }
}
