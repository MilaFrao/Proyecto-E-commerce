import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX, SlidersHorizontal, X } from 'lucide-react'
import { formatPrice } from '@tienda/shared'
import ProductCard from '../components/ProductCard'
import Swatch from '../components/Swatch'
import { ghostBtn, outlineBtn } from '../components/ui'
import { useCatalog } from '../context/CatalogContext'
import { countByCategory } from '../lib/categories'
import { sizeOrder } from '../lib/sizes'
import { useTitle } from '../lib/useTitle'

const SORTS = ['Recomendados', 'Precio: menor a mayor', 'Precio: mayor a menor', 'Nombre A–Z'] as const
type Sort = (typeof SORTS)[number]

const pill =
  'h-8 min-w-9 px-2.5 rounded-lg text-sm border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'
const chip =
  'h-10 px-4 rounded-full text-sm font-medium border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'

export default function CatalogPage() {
  const { products } = useCatalog()
  const [params, setParams] = useSearchParams()
  // Categoría y búsqueda viven en la URL: se pueden compartir y el botón «atrás» funciona.
  const category = params.get('categoria')
  const query = params.get('q') ?? ''

  const [sort, setSort] = useState<Sort>('Recomendados')
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useTitle(category ?? 'Catálogo')

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const ceiling = Math.max(1, Math.ceil(Math.max(...products.flatMap((p) => [p.minPrice, p.maxPrice]), 1)))
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
  const categories = useMemo(() => countByCategory(products), [products])

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

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <h1 className="font-display font-semibold text-ink text-4xl tracking-tight pt-10">{category ?? 'Catálogo'}</h1>

      <div className="flex flex-wrap gap-2 mt-6" role="group" aria-label="Categorías">
        <button
          onClick={() => setParam('categoria', null)}
          aria-pressed={category === null}
          className={`${chip} ${category === null ? 'bg-ink text-white border-ink' : 'bg-surface text-ink-2 border-border hover:border-ink'}`}
        >
          Todo
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setParam('categoria', c.name)}
            aria-pressed={category === c.name}
            className={`${chip} ${category === c.name ? 'bg-ink text-white border-ink' : 'bg-surface text-ink-2 border-border hover:border-ink'}`}
          >
            {c.name} <span className={category === c.name ? 'text-white/60' : 'text-muted'}>{c.count}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[230px_1fr] gap-10 mt-8">
        <div className="lg:hidden">
          <button
            className={outlineBtn}
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="filtros"
          >
            <SlidersHorizontal size={15} />
            Filtros{filtersActive ? ' (activos)' : ''}
          </button>
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
            <button className={ghostBtn} onClick={clearFilters}>
              <X size={14} /> Quitar filtros
            </button>
          )}
        </aside>

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
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {filtersActive && (
                  <button className={outlineBtn} onClick={clearFilters}>
                    Quitar filtros
                  </button>
                )}
                {query.trim() && (
                  <button className={outlineBtn} onClick={() => setParam('q', null)}>
                    Borrar búsqueda
                  </button>
                )}
                {category && (
                  <button className={outlineBtn} onClick={() => setParam('categoria', null)}>
                    Ver todo
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-10">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
