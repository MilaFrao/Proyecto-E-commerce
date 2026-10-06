import { useMemo, useState } from 'react'
import { SearchX, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from './ProductCard'
import Swatch from '../../components/store/Swatch'
import Button from '../../components/ui/Button'
import { CATEGORIES } from '../../data/store'
import { formatPrice } from '../../lib/money'
import type { PublicProduct } from '../../lib/stock'

type Props = {
  products: PublicProduct[]
  category: string | null
  onCategory: (c: string | null) => void
  query: string
  onClearQuery: () => void
  onOpen: (id: string) => void
}

const SORTS = ['Recomendados', 'Precio: menor a mayor', 'Precio: mayor a menor', 'Nombre A–Z'] as const
type Sort = (typeof SORTS)[number]

const LETTER_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
function sizeOrder(a: string, b: string) {
  const ia = LETTER_ORDER.indexOf(a)
  const ib = LETTER_ORDER.indexOf(b)
  if (ia >= 0 && ib >= 0) return ia - ib
  if (ia >= 0) return -1
  if (ib >= 0) return 1
  if (a === 'Única') return 1
  if (b === 'Única') return -1
  return Number(a) - Number(b)
}

const pill =
  'h-8 min-w-9 px-2.5 rounded-lg text-sm border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'

export default function CatalogPage({ products, category, onCategory, query, onClearQuery, onOpen }: Props) {
  const [sort, setSort] = useState<Sort>('Recomendados')
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const prices = products.flatMap((p) => [p.minPrice, p.maxPrice])
  const ceiling = Math.ceil(Math.max(...prices, 1))
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const priceCap = maxPrice ?? ceiling

  const allSizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes.map((s) => s.size)))].sort(sizeOrder),
    [products],
  )
  const allColors = useMemo(() => {
    const m = new Map<string, string>()
    products.forEach((p) => p.colors.forEach((c) => m.set(c.name, c.hex)))
    return [...m].map(([name, hex]) => ({ name, hex }))
  }, [products])

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    products.forEach((p) => (m[p.category] = (m[p.category] ?? 0) + 1))
    return m
  }, [products])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((p) => {
      if (category && p.category !== category) return false
      if (q) {
        const hay = [p.name, p.brand, p.ref, p.category, ...p.colors.map((c) => c.name)].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (size || color) {
        const ok = p.variants.some((v) => v.available && (!size || v.size === size) && (!color || v.color === color))
        if (!ok) return false
      }
      return p.minPrice <= priceCap
    })
    const sorted = [...list] // copia: nunca ordenar el arreglo original
    if (sort === 'Precio: menor a mayor') sorted.sort((a, b) => a.minPrice - b.minPrice)
    if (sort === 'Precio: mayor a menor') sorted.sort((a, b) => b.minPrice - a.minPrice)
    if (sort === 'Nombre A–Z') sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    return sorted
  }, [products, category, query, size, color, priceCap, sort])

  const filtersActive = size !== null || color !== null || maxPrice !== null
  const clearFilters = () => {
    setSize(null)
    setColor(null)
    setMaxPrice(null)
  }
  const showHero = !category && !query.trim()

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      {showHero && (
        <section className="relative overflow-hidden rounded-3xl bg-teal-soft mt-8 px-8 sm:px-12 py-12 sm:py-16">
          <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-teal-mid" aria-hidden="true" />
          <div className="absolute right-40 bottom-[-50px] w-44 h-44 rounded-[40px] rotate-12 bg-blue-mid hidden sm:block" aria-hidden="true" />
          <div className="absolute right-12 bottom-10 w-28 h-28 rounded-tl-[112px] bg-coral-mid hidden sm:block" aria-hidden="true" />
          <div className="relative max-w-xl">
            <h1 className="font-display font-semibold text-ink text-4xl sm:text-5xl leading-[1.08] tracking-tight">
              Lo que ves aquí está en tienda hoy
            </h1>
            <p className="text-ink-2 mt-4 text-base leading-relaxed max-w-md">
              Busca por prenda, color o talla, y pasa a probártela. Si una talla se agota, la verás tachada.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald" />
              {products.length} prendas disponibles
            </div>
          </div>
        </section>
      )}

      {/* Categorías */}
      <div className={`flex flex-wrap gap-2 ${showHero ? 'mt-8' : 'mt-8'}`} role="group" aria-label="Categorías">
        <button
          onClick={() => onCategory(null)}
          aria-pressed={category === null}
          className={`h-10 px-4 rounded-full text-sm font-medium border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
            category === null ? 'bg-ink text-white border-ink' : 'bg-surface text-ink-2 border-border hover:border-ink'
          }`}
        >
          Todo
        </button>
        {CATEGORIES.filter((c) => counts[c.name]).map((c) => (
          <button
            key={c.name}
            onClick={() => onCategory(c.name)}
            aria-pressed={category === c.name}
            className={`h-10 px-4 rounded-full text-sm font-medium border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
              category === c.name ? 'bg-ink text-white border-ink' : 'bg-surface text-ink-2 border-border hover:border-ink'
            }`}
          >
            {c.name} <span className={category === c.name ? 'text-white/60' : 'text-muted'}>{counts[c.name]}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[230px_1fr] gap-10 mt-8">
        {/* Filtros: en móvil se abren con un botón */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            icon={<SlidersHorizontal size={15} />}
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="filtros"
          >
            Filtros{filtersActive ? ' (activos)' : ''}
          </Button>
        </div>
        <aside
          id="filtros"
          aria-label="Filtros"
          className={`${filtersOpen ? 'block' : 'hidden'} lg:block space-y-7 lg:sticky lg:top-24 self-start`}
        >
          <div>
            <div className="text-sm font-semibold text-ink mb-3">Talla</div>
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map((s) => (
                <button
                  key={s}
                  aria-pressed={size === s}
                  onClick={() => setSize(size === s ? null : s)}
                  className={`${pill} ${size === s ? 'bg-ink text-white border-ink' : 'bg-surface text-ink-2 border-border hover:border-ink'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-ink mb-3">Color</div>
            <div className="flex flex-wrap gap-1.5">
              {allColors.map((c) => (
                <Swatch
                  key={c.name}
                  hex={c.hex}
                  name={c.name}
                  size="md"
                  selected={color === c.name}
                  onClick={() => setColor(color === c.name ? null : c.name)}
                />
              ))}
            </div>
            {color && <div className="text-xs text-muted mt-2">{color}</div>}
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label htmlFor="price" className="text-sm font-semibold text-ink">
                Precio
              </label>
              <span className="text-xs text-muted">Hasta {formatPrice(priceCap)}</span>
            </div>
            <input
              id="price"
              type="range"
              min={1}
              max={ceiling}
              step={1}
              value={priceCap}
              onChange={(e) => setMaxPrice(Number(e.target.value) >= ceiling ? null : Number(e.target.value))}
              className="w-full accent-[var(--color-teal)] cursor-pointer"
            />
          </div>

          {filtersActive && (
            <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={clearFilters}>
              Quitar filtros
            </Button>
          )}
        </aside>

        {/* Resultados */}
        <section aria-label="Productos">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="text-sm text-muted" aria-live="polite">
              {query.trim() && (
                <>
                  Resultados para <span className="text-ink font-medium">“{query.trim()}”</span> ·{' '}
                </>
              )}
              {visible.length} {visible.length === 1 ? 'prenda' : 'prendas'}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              Ordenar
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm text-ink outline-none cursor-pointer focus-visible:border-teal"
              >
                {SORTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-3xl bg-surface border border-border-soft py-20 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-bg flex items-center justify-center mx-auto text-muted">
                <SearchX size={22} />
              </div>
              <h2 className="font-display font-semibold text-lg text-ink mt-5">
                {products.length === 0 ? 'Todavía no hay prendas en tienda' : 'No encontramos prendas con eso'}
              </h2>
              <p className="text-sm text-muted mt-1.5">
                {products.length === 0
                  ? 'Cuando llegue mercancía nueva la verás aquí.'
                  : 'Prueba con otra talla o color, o quita algún filtro.'}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {filtersActive && (
                  <Button variant="outline" onClick={clearFilters}>
                    Quitar filtros
                  </Button>
                )}
                {query.trim() && (
                  <Button variant="outline" onClick={onClearQuery}>
                    Borrar búsqueda
                  </Button>
                )}
                {category && (
                  <Button variant="outline" onClick={() => onCategory(null)}>
                    Ver todo
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-10">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={onOpen} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
