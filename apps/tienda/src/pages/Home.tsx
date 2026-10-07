import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useCatalog } from '../context/CatalogContext'
import { CategoryIcon, categoryMeta, countByCategory } from '../lib/categories'
import { useTitle } from '../lib/useTitle'

const FEATURED = 4

export default function Home() {
  const { products } = useCatalog()
  useTitle()
  const categories = countByCategory(products).slice(0, 4)
  const featured = products.slice(0, FEATURED)

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <section className="relative overflow-hidden rounded-3xl bg-teal-soft mt-8 px-8 sm:px-12 py-12 sm:py-20">
        <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-teal-mid" aria-hidden="true" />
        <div className="absolute right-40 bottom-[-50px] w-44 h-44 rounded-[40px] rotate-12 bg-blue-mid hidden sm:block" aria-hidden="true" />
        <div className="absolute right-12 bottom-10 w-28 h-28 rounded-tl-[112px] bg-coral-mid hidden sm:block" aria-hidden="true" />
        <div className="relative max-w-xl">
          <h1 className="font-display font-semibold text-ink text-4xl sm:text-5xl leading-[1.08] tracking-tight">
            Lo que ves aquí está en tienda hoy
          </h1>
          <p className="text-ink-2 mt-4 text-base leading-relaxed max-w-md">
            Mira qué hay, elige color y talla, y pasa a probártelo. Si una talla se agota, la verás tachada.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-ink text-white text-sm font-medium hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              Ver el catálogo <ArrowRight size={16} />
            </Link>
            {products.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald" />
                {products.length} {products.length === 1 ? 'prenda disponible' : 'prendas disponibles'}
              </span>
            )}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mt-16" aria-label="Categorías">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display font-semibold text-2xl text-ink">Compra por categoría</h2>
            <Link to="/categorias" className="text-sm font-medium text-teal hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => {
              const meta = categoryMeta(c.name)
              return (
                <Link
                  key={c.name}
                  to={`/catalogo?categoria=${encodeURIComponent(c.name)}`}
                  className="group relative overflow-hidden rounded-3xl p-5 h-36 flex flex-col justify-between transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  style={{ background: meta.soft }}
                >
                  <div className="absolute -right-6 -bottom-8 w-28 h-28 rounded-full transition-transform duration-300 group-hover:scale-110" style={{ background: meta.mid }} aria-hidden="true" />
                  <span className="relative" style={{ color: meta.ink }}>
                    <CategoryIcon name={c.name} size={24} />
                  </span>
                  <div className="relative">
                    <div className="font-display font-semibold text-ink">{c.name}</div>
                    <div className="text-xs text-ink-2">
                      {c.count} {c.count === 1 ? 'prenda' : 'prendas'}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mt-16" aria-label="Para empezar">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display font-semibold text-2xl text-ink">Para empezar</h2>
            <Link to="/catalogo" className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
              Ver todo <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <p className="mt-16 text-center text-muted">Todavía no hay prendas en tienda. Vuelve pronto.</p>
      )}
    </div>
  )
}
