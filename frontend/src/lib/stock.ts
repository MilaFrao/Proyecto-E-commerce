/**
 * Reglas de negocio del catálogo, en un solo lugar (decisiones 005 y 007).
 * Aquí viven: el precio efectivo, la disponibilidad para venta y la regla
 * de publicación. Ninguna pantalla debe reimplementarlas.
 */

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

export type PublicVariant = {
  id: string
  color: string
  hex: string
  size: string
  available: boolean
  price: number
}

export type PublicProduct = {
  id: string
  name: string
  brand: string
  ref: string
  category: string
  description: string
  image?: string
  basePrice: number
  minPrice: number
  maxPrice: number
  variants: PublicVariant[]
  colors: { name: string; hex: string; available: boolean }[]
  sizes: { size: string; available: boolean }[]
}

/** Colores y tallas únicos de un producto, marcando si hay al menos una variante disponible. */
export function buildFacets(variants: PublicVariant[]): Pick<PublicProduct, 'colors' | 'sizes'> {
  const colors: PublicProduct['colors'] = []
  const sizes: PublicProduct['sizes'] = []
  for (const v of variants) {
    const c = colors.find((x) => x.name === v.color)
    if (c) c.available = c.available || v.available
    else colors.push({ name: v.color, hex: v.hex, available: v.available })

    const s = sizes.find((x) => x.size === v.size)
    if (s) s.available = s.available || v.available
    else sizes.push({ size: v.size, available: v.available })
  }
  return { colors, sizes }
}

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
