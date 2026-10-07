import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import { CategoryIcon, categoryMeta, countByCategory } from '../lib/categories'
import { useTitle } from '../lib/useTitle'

export default function CategoriesPage() {
  const { products } = useCatalog()
  useTitle('Categorías')
  const categories = countByCategory(products)

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-10">
      <h1 className="font-display font-semibold text-ink text-4xl tracking-tight">Categorías</h1>
      <p className="text-muted mt-2">Elige una y ve solo lo que hay disponible en tienda.</p>

      {categories.length === 0 ? (
        <p className="mt-10 text-muted">Todavía no hay prendas en tienda.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {categories.map((c) => {
            const meta = categoryMeta(c.name)
            return (
              <Link
                key={c.name}
                to={`/catalogo?categoria=${encodeURIComponent(c.name)}`}
                className="group relative overflow-hidden rounded-3xl p-7 h-48 flex flex-col justify-between transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                style={{ background: meta.soft }}
              >
                <div
                  className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full transition-transform duration-300 group-hover:scale-110"
                  style={{ background: meta.mid }}
                  aria-hidden="true"
                />
                <div className="relative w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-sm" style={{ color: meta.ink }}>
                  <CategoryIcon name={c.name} />
                </div>
                <div className="relative flex items-end justify-between">
                  <div>
                    <div className="font-display font-semibold text-xl text-ink">{c.name}</div>
                    <div className="text-sm text-ink-2 mt-0.5">
                      {c.count} {c.count === 1 ? 'prenda' : 'prendas'}
                    </div>
                  </div>
                  <ArrowUpRight size={20} className="text-ink-2" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
