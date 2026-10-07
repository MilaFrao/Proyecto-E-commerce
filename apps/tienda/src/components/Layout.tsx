import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Shirt, User, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { CatalogError, CatalogSkeleton } from './CatalogState'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `h-10 px-3 rounded-xl text-sm font-medium transition-colors inline-flex items-center focus-visible:outline-2 focus-visible:outline-teal ${
    isActive ? 'text-ink bg-bg' : 'text-muted hover:text-ink'
  }`

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function SearchBox() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const onCatalog = pathname === '/catalogo'
  const value = onCatalog ? (params.get('q') ?? '') : ''

  const setQuery = (q: string) => {
    const next = new URLSearchParams(onCatalog ? params : undefined)
    if (q) next.set('q', q)
    else next.delete('q')
    const qs = next.toString()
    // Desde otra página abre el catálogo; ya en el catálogo reemplaza para no llenar el historial.
    navigate(`/catalogo${qs ? `?${qs}` : ''}`, { replace: onCatalog })
  }

  return (
    <div className="relative w-full max-w-xs">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar prenda, color o marca"
        aria-label="Buscar en el catálogo"
        className="w-full h-10 rounded-full bg-bg border border-transparent pl-10 pr-9 text-sm outline-none transition-colors focus:bg-surface focus:border-teal"
      />
      {value && (
        <button
          onClick={() => setQuery('')}
          aria-label="Borrar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted hover:bg-border-soft cursor-pointer"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}

function AccountLink() {
  const { session } = useAuth()
  if (!session) {
    return (
      <Link
        to="/ingresar"
        className="h-10 px-4 rounded-full inline-flex items-center gap-2 text-sm font-medium text-ink hover:bg-bg focus-visible:outline-2 focus-visible:outline-teal"
      >
        <User size={16} />
        <span className="hidden sm:inline">Ingresar</span>
      </Link>
    )
  }
  return (
    <Link
      to="/cuenta"
      aria-label={`Mi cuenta (${session.usuario.nombre})`}
      className="w-10 h-10 rounded-full bg-teal text-white text-sm font-semibold inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      {session.usuario.nombre.trim().charAt(0).toUpperCase()}
    </Link>
  )
}

export default function Layout() {
  const { loading, error, reload, ready } = useCatalog()

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-ink">
      <ScrollToTop />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur border-b border-border-soft">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 mr-2 rounded-lg focus-visible:outline-2 focus-visible:outline-teal"
            aria-label="Vestir, ir al inicio"
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal">
              <Shirt size={16} className="text-white" />
            </span>
            <span className="text-lg font-semibold font-display">Vestir</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1" aria-label="Tienda">
            <NavLink to="/" end className={navClass}>
              Inicio
            </NavLink>
            <NavLink to="/catalogo" className={navClass}>
              Catálogo
            </NavLink>
            <NavLink to="/categorias" className={navClass}>
              Categorías
            </NavLink>
          </nav>

          <div className="flex-1" />
          <SearchBox />

          <AccountLink />
        </div>
        {/* En móvil la navegación va en una segunda fila */}
        <nav className="sm:hidden flex items-center gap-1 px-4 pb-2" aria-label="Tienda">
          <NavLink to="/" end className={navClass}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className={navClass}>
            Catálogo
          </NavLink>
          <NavLink to="/categorias" className={navClass}>
            Categorías
          </NavLink>
        </nav>
      </header>

      <main id="contenido" className="flex-1">
        {loading && !ready && <CatalogSkeleton />}
        {error && !ready && <CatalogError message={error.message} onRetry={reload} />}
        {ready && <Outlet />}
      </main>

      <footer className="border-t border-border-soft">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-ink">Vestir</span>
            <span aria-hidden="true">·</span>
            Todo lo que se muestra está disponible en tienda.
          </div>
          <nav className="flex gap-4" aria-label="Pie de página">
            <Link to="/catalogo" className="hover:text-ink">
              Catálogo
            </Link>
            <Link to="/categorias" className="hover:text-ink">
              Categorías
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
