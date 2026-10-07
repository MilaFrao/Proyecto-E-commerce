import { Footprints, Package, Shirt, ShoppingBag, Snowflake, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Las categorías vienen de la API (lista plana; la jerarquía sigue pendiente de decidir).
 * Aquí solo se les da color e icono para que se vean distintas: si llega una categoría
 * nueva, toma un color según su nombre y no hace falta tocar nada.
 */
export type CategoryMeta = { soft: string; mid: string; ink: string }

const PALETTE: CategoryMeta[] = [
  { soft: 'var(--color-blue-soft)', mid: 'var(--color-blue-mid)', ink: 'var(--color-blue)' },
  { soft: 'var(--color-teal-soft)', mid: 'var(--color-teal-mid)', ink: 'var(--color-teal)' },
  { soft: 'var(--color-purple-soft)', mid: 'var(--color-purple-mid)', ink: 'var(--color-purple)' },
  { soft: 'var(--color-coral-soft)', mid: 'var(--color-coral-mid)', ink: 'var(--color-coral)' },
  { soft: 'var(--color-amber-soft)', mid: 'var(--color-amber-mid)', ink: 'var(--color-amber)' },
  { soft: 'var(--color-emerald-soft)', mid: 'var(--color-border-soft)', ink: 'var(--color-emerald)' },
]

const KNOWN: Record<string, number> = {
  camisas: 0,
  pantalones: 1,
  sudaderas: 2,
  calzado: 3,
  'ropa interior': 4,
  accesorios: 5,
}

export function categoryMeta(name: string): CategoryMeta {
  const known = KNOWN[name.trim().toLowerCase()]
  if (known !== undefined) return PALETTE[known]
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
}

const ICONS: Record<string, typeof Shirt> = {
  camisas: Shirt,
  pantalones: Package,
  sudaderas: Snowflake,
  calzado: Footprints,
  'ropa interior': Sparkles,
  accesorios: ShoppingBag,
}

export function CategoryIcon({ name, size = 26 }: { name: string; size?: number }): ReactNode {
  const Icon = ICONS[name.trim().toLowerCase()] ?? Shirt
  return <Icon size={size} strokeWidth={1.5} />
}

/** Cuenta de prendas por categoría, en el orden en que aparecen. */
export function countByCategory(products: { category: string }[]): { name: string; count: number }[] {
  const m = new Map<string, number>()
  for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1)
  return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name, 'es'))
}
