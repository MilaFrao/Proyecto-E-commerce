import { useEffect, useState } from 'react'
import { Search, Shirt, User, X } from 'lucide-react'
import { getCatalogo } from '../api/catalogo'
import { useAsync } from '../api/useAsync'
import { CatalogError, CatalogSkeleton } from '../components/store/CatalogState'
import CatalogPage from './store/CatalogPage'
import CategoriesPage from './store/CategoriesPage'
import ProductDetail from './store/ProductDetail'

type Route = { name: 'catalog' } | { name: 'categories' } | { name: 'product'; id: string }

/** Área pública: sin autenticación y sin nada del inventario interno. */
export default function StoreApp() {
  const { data, error, loading, reload } = useAsync(getCatalogo)
  const products = data ?? []
  const [route, setRoute] = useState<Route>({ name: 'catalog' })
  const [category, setCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route])

  const goCatalog = (cat: string | null = null) => {
    setCategory(cat)
    setRoute({ name: 'catalog' })
  }

  const product = route.name === 'product' ? products.find((p) => p.id === route.id) : undefined

  const navLink = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`h-10 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-teal ${
        active ? 'text-ink bg-bg' : 'text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-surface font-body text-ink">
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur border-b border-border-soft">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => {
              setQuery('')
              goCatalog()
            }}
            className="flex items-center gap-2.5 mr-2 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-teal"
            aria-label="Vestir, ir al catálogo"
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal">
              <Shirt size={16} className="text-white" />
            </span>
            <span className="text-lg font-semibold font-display">Vestir</span>
          </button>

          <nav className="hidden sm:flex items-center gap-1" aria-label="Tienda">
            {navLink('Catálogo', route.name === 'catalog' || route.name === 'product', () => goCatalog(category))}
            {navLink('Categorías', route.name === 'categories', () => setRoute({ name: 'categories' }))}
          </nav>

          <div className="flex-1" />

          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (route.name !== 'catalog') setRoute({ name: 'catalog' })
              }}
              placeholder="Buscar prenda, color o marca"
              aria-label="Buscar en el catálogo"
              className="w-full h-10 rounded-full bg-bg border border-transparent pl-10 pr-9 text-sm outline-none transition-colors focus:bg-surface focus:border-teal"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Borrar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted hover:bg-border-soft cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            disabled
            title="Tu cuenta estará disponible cuando llegue la compra en línea"
            aria-label="Cuenta (próximamente)"
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted/60 cursor-not-allowed"
          >
            <User size={18} />
          </button>
        </div>
      </header>

      <main>
        {loading && !data && <CatalogSkeleton />}
        {error && !data && <CatalogError message={error.message} onRetry={reload} />}
        {data && route.name === 'catalog' && (
          <CatalogPage
            products={products}
            category={category}
            onCategory={setCategory}
            query={query}
            onClearQuery={() => setQuery('')}
            onOpen={(id) => setRoute({ name: 'product', id })}
          />
        )}
        {data && route.name === 'categories' && (
          <CategoriesPage products={products} onPick={(c) => goCatalog(c)} />
        )}
        {data && route.name === 'product' && product && (
          <ProductDetail
            key={product.id}
            product={product}
            related={products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)}
            onBack={() => goCatalog(category)}
            onOpen={(id) => setRoute({ name: 'product', id })}
          />
        )}
        {data && route.name === 'product' && !product && (
          <div className="max-w-7xl mx-auto px-6 py-24 text-center">
            <h1 className="font-display font-semibold text-xl">Esta prenda ya no está disponible</h1>
            <button onClick={() => goCatalog()} className="mt-4 text-sm font-medium text-teal hover:underline cursor-pointer">
              Volver al catálogo
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-border-soft">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-muted">
          Vestir · Todo lo que se muestra está disponible en tienda.
        </div>
      </footer>
    </div>
  )
}
