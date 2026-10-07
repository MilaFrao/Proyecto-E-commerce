/**
 * Vista pública del catálogo: lo que el cliente puede ver. Sin cantidades, sin depósito
 * (decisiones 005 y 010). Lo comparten el panel y la tienda.
 */

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
