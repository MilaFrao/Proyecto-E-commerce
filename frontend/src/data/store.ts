import { toPublic, type Product, type Variant, type PublicProduct } from '../lib/stock'

/* ---------- Categorías (lista plana: la jerarquía sigue pendiente de decidir) ---------- */

export type CategoryMeta = { name: string; soft: string; mid: string; ink: string }

export const CATEGORIES: CategoryMeta[] = [
  { name: 'Camisas', soft: 'var(--color-blue-soft)', mid: 'var(--color-blue-mid)', ink: 'var(--color-blue)' },
  { name: 'Pantalones', soft: 'var(--color-teal-soft)', mid: 'var(--color-teal-mid)', ink: 'var(--color-teal)' },
  { name: 'Sudaderas', soft: 'var(--color-purple-soft)', mid: 'var(--color-purple-mid)', ink: 'var(--color-purple)' },
  { name: 'Calzado', soft: 'var(--color-coral-soft)', mid: 'var(--color-coral-mid)', ink: 'var(--color-coral)' },
  { name: 'Ropa interior', soft: 'var(--color-amber-soft)', mid: 'var(--color-amber-mid)', ink: 'var(--color-amber)' },
  { name: 'Accesorios', soft: 'var(--color-emerald-soft)', mid: 'var(--color-border-soft)', ink: 'var(--color-emerald)' },
]

export function categoryMeta(name: string): CategoryMeta {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[0]
}

/* ---------- Paletas y tallas para armar variantes ---------- */

export const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: 'Negro', hex: '#1A1A1A' },
  { name: 'Blanco', hex: '#F5F5F5' },
  { name: 'Gris', hex: '#9CA3AF' },
  { name: 'Azul marino', hex: '#1E3A5F' },
  { name: 'Azul claro', hex: '#60A5FA' },
  { name: 'Verde militar', hex: '#4A5E3A' },
  { name: 'Borgoña', hex: '#7C2D44' },
  { name: 'Arena', hex: '#D4B896' },
  { name: 'Kaki', hex: '#A0856C' },
  { name: 'Rojo', hex: '#C0392B' },
]

export const SIZE_SETS: Record<string, { label: string; sizes: string[] }> = {
  letras: { label: 'Ropa (XS–XXL)', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  pantalon: { label: 'Pantalón (28–38)', sizes: ['28', '30', '32', '34', '36', '38'] },
  calzado: { label: 'Calzado (36–45)', sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] },
  unica: { label: 'Talla única', sizes: ['Única'] },
}

/* ---------- Productos de ejemplo ---------- */

type ColorSpec = { color: string; hex: string; /** stock en tienda por talla, mismo orden que `sizes` */ tienda: number[]; deposito?: number[] }

function build(
  ref: string,
  sizes: string[],
  colors: ColorSpec[],
  overrides: Record<string, number> = {},
): Variant[] {
  const out: Variant[] = []
  for (const c of colors) {
    sizes.forEach((size, i) => {
      const code = c.color.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()
      out.push({
        id: `${ref}-${code}-${size}`,
        color: c.color,
        hex: c.hex,
        size,
        sku: `${ref}-${code}-${size}`,
        tienda: c.tienda[i] ?? 0,
        deposito: c.deposito?.[i] ?? (c.tienda[i] ?? 0) * 2 + 4,
        retailOverride: overrides[size],
      })
    })
  }
  return out
}

const L = ['S', 'M', 'L', 'XL']
const P = ['28', '30', '32', '34']
const C = ['38', '40', '42', '44']

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Camisa deportiva Dry-Fit',
    brand: 'ActiveWear',
    ref: 'CAM-DRY-001',
    category: 'Camisas',
    description:
      'Tejido transpirable que seca rápido, ideal para entrenar o para el día a día. Corte regular y costuras planas que no rozan.',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80&auto=format&fit=crop',
    state: 'activo',
    retailPrice: 22,
    wholesalePrice: 15,
    variants: build('CAM-DRY-001', L, [
      { color: 'Azul marino', hex: '#1E3A5F', tienda: [5, 12, 3, 0] },
      { color: 'Negro', hex: '#1A1A1A', tienda: [2, 8, 0, 4] },
      { color: 'Blanco', hex: '#F5F5F5', tienda: [0, 6, 9, 2] },
    ]),
  },
  {
    id: 'p2',
    name: 'Camisa casual Oxford',
    brand: 'ClassicLine',
    ref: 'CAM-OXF-002',
    category: 'Camisas',
    description:
      'Algodón oxford de textura suave, cuello abotonado y corte clásico. Funciona con jean o con pantalón de vestir.',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80&auto=format&fit=crop',
    state: 'activo',
    retailPrice: 31,
    wholesalePrice: 22,
    variants: build('CAM-OXF-002', L, [
      { color: 'Blanco', hex: '#F5F5F5', tienda: [4, 7, 5, 3] },
      { color: 'Azul claro', hex: '#60A5FA', tienda: [0, 3, 6, 0] },
    ]),
  },
  {
    id: 'p3',
    name: 'Pantalón cargo urbano',
    brand: 'UrbanCo',
    ref: 'PAN-CAR-001',
    category: 'Pantalones',
    description:
      'Seis bolsillos, tela resistente con un poco de elasticidad y bota ajustable. Cómodo para moverse todo el día.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80&auto=format&fit=crop',
    state: 'activo',
    retailPrice: 36,
    wholesalePrice: 26,
    variants: build(
      'PAN-CAR-001',
      P,
      [
        { color: 'Verde militar', hex: '#4A5E3A', tienda: [3, 8, 6, 2] },
        { color: 'Negro', hex: '#1A1A1A', tienda: [0, 4, 10, 5] },
      ],
      { '34': 39 },
    ),
  },
  {
    id: 'p4',
    name: 'Sudadera premium fleece',
    brand: 'WarmBase',
    ref: 'SUD-PRE-001',
    category: 'Sudaderas',
    description: 'Felpa suave por dentro, capucha ajustable y bolsillo canguro. Para las noches frescas.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80&auto=format&fit=crop',
    state: 'activo',
    retailPrice: 44,
    wholesalePrice: 32,
    variants: build('SUD-PRE-001', L, [
      { color: 'Gris', hex: '#9CA3AF', tienda: [0, 2, 1, 0] },
      { color: 'Borgoña', hex: '#7C2D44', tienda: [0, 0, 3, 2] },
    ]),
  },
  {
    id: 'p5',
    name: 'Chola deportiva Runner',
    brand: 'RunStep',
    ref: 'CHO-RUN-001',
    category: 'Calzado',
    description: 'Suela amortiguada y malla transpirable. Pensada para caminar y correr distancias largas.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop',
    state: 'activo',
    retailPrice: 80,
    wholesalePrice: 58,
    variants: build('CHO-RUN-001', C, [
      { color: 'Blanco', hex: '#F5F5F5', tienda: [2, 5, 8, 3] },
      { color: 'Negro', hex: '#1A1A1A', tienda: [0, 3, 6, 4] },
    ]),
  },
  {
    id: 'p6',
    name: 'Bóxer de algodón',
    brand: 'BasicLab',
    ref: 'BOX-ALG-001',
    category: 'Ropa interior',
    description: 'Algodón peinado con elástico cubierto que no marca ni aprieta. Se lava y mantiene la forma.',
    state: 'activo',
    retailPrice: 8,
    wholesalePrice: 5,
    variants: build('BOX-ALG-001', L, [
      { color: 'Negro', hex: '#1A1A1A', tienda: [10, 14, 9, 6] },
      { color: 'Gris', hex: '#9CA3AF', tienda: [7, 11, 0, 4] },
    ]),
  },
  {
    id: 'p7',
    name: 'Gorra clásica',
    brand: 'BasicLab',
    ref: 'GOR-CLA-001',
    category: 'Accesorios',
    description: 'Gorra de seis paneles con cierre ajustable atrás. Talla única.',
    state: 'activo',
    retailPrice: 12,
    wholesalePrice: 8,
    variants: build('GOR-CLA-001', ['Única'], [
      { color: 'Negro', hex: '#1A1A1A', tienda: [9] },
      { color: 'Arena', hex: '#D4B896', tienda: [5] },
      { color: 'Azul marino', hex: '#1E3A5F', tienda: [0] },
    ]),
  },
  /* Estos dos NO salen en el catálogo: demuestran la regla de publicación. */
  {
    id: 'p8',
    name: 'Camisa lino premium',
    brand: 'LuxFabric',
    ref: 'CAM-LIN-002',
    category: 'Camisas',
    description: 'Lino lavado, fresco y ligero.',
    state: 'activo',
    retailPrice: 52,
    wholesalePrice: 38,
    variants: build('CAM-LIN-002', L, [{ color: 'Arena', hex: '#D4B896', tienda: [0, 0, 0, 0], deposito: [0, 2, 0, 0] }]),
  },
  {
    id: 'p9',
    name: 'Bermuda cargo verano',
    brand: 'UrbanCo',
    ref: 'BER-CAR-001',
    category: 'Pantalones',
    description: 'Bermuda ligera con bolsillos laterales.',
    state: 'borrador',
    retailPrice: 24,
    wholesalePrice: 17,
    variants: build('BER-CAR-001', P, [{ color: 'Kaki', hex: '#A0856C', tienda: [0, 0, 0, 0], deposito: [10, 15, 15, 10] }]),
  },
]

/** Lo que el cliente puede ver: solo productos publicables, sin cantidades. */
export function getPublicCatalog(): PublicProduct[] {
  return PRODUCTS.map(toPublic).filter((p): p is PublicProduct => p !== null)
}
