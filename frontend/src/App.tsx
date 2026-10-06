import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import Sidebar, { ROLE_HOME, canAccess } from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Inventory from './pages/Inventory'
import Surtido from './pages/Surtido'
import Historial from './pages/Historial'
import Consulta from './pages/Consulta'
import Users from './pages/Users'
import DesignSystem from './pages/DesignSystem'
import Login from './pages/Login'
import StoreApp from './pages/StoreApp'
import { useAuth } from './auth/AuthContext'

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  dashboard:     { title: 'Dashboard',          subtitle: 'Resumen operativo de la tienda' },
  products:      { title: 'Productos',          subtitle: 'Gestión del catálogo interno' },
  'new-product': { title: 'Nuevo producto',     subtitle: 'Datos, precios y variantes' },
  inventory:     { title: 'Inventario',         subtitle: 'Stock en depósito, tienda y disponibilidad para venta' },
  surtido:       { title: 'Surtido',            subtitle: 'Traslado de mercancía desde depósito a tienda' },
  historial:     { title: 'Historial',          subtitle: 'Línea de tiempo de movimientos de inventario' },
  consulta:      { title: 'Consulta comercial', subtitle: 'Búsqueda rápida de prendas para atención al cliente' },
  users:         { title: 'Usuarios',           subtitle: 'Gestión de accesos y roles del personal' },
  settings:      { title: 'Configuración',      subtitle: 'Ajustes del sistema' },
  ds:            { title: 'Design System',      subtitle: 'Componentes, tokens y estados visuales' },
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex-1 flex items-center justify-center h-full text-muted">
      <div className="text-center">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs mt-1">Próximamente</div>
      </div>
    </div>
  )
}

const floating =
  'fixed z-50 text-xs font-medium px-3.5 py-2 rounded-full shadow-lg transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'

export default function App() {
  const { session, role, ready, logout } = useAuth()
  const [inStore, setInStore] = useState(false)
  const [active, setActive] = useState('dashboard')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4500)
    return () => clearTimeout(t)
  }, [toast])

  // Cada vez que entra alguien (o se restaura su sesión) arranca en la página de su rol.
  const userId = session?.usuario.id
  useEffect(() => {
    if (role) setActive(ROLE_HOME[role])
    // Depende solo de quién es el usuario, no de cada refresco del perfil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const navigate = (id: string) => {
    if (id === 'catalog') {
      setInStore(true)
      return
    }
    setActive(id)
  }

  // Confirmando con el back que la sesión guardada sigue vigente (un instante).
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-sm text-muted" role="status">
        Verificando tu sesión…
      </div>
    )
  }

  if (inStore) {
    return (
      <>
        <StoreApp />
        <button onClick={() => setInStore(false)} className={`${floating} bottom-6 left-6 bg-sidebar text-white hover:scale-105`}>
          ← {session ? 'Volver al panel' : 'Volver al ingreso'}
        </button>
      </>
    )
  }

  if (!session || !role) return <Login onViewStore={() => setInStore(true)} />

  const page = canAccess(role, active) ? active : ROLE_HOME[role]
  const meta = pageMeta[page] ?? { title: page, subtitle: '' }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':   return <Dashboard />
      case 'products':    return <Products onNew={() => setActive('new-product')} />
      case 'new-product':
        return (
          <ProductForm
            onBack={() => setActive('products')}
            onSaved={(name) => {
              setActive('products')
              setToast(`«${name}» creado. Falta surtirlo para que salga en el catálogo`)
            }}
          />
        )
      case 'inventory':   return <Inventory />
      case 'surtido':     return <Surtido />
      case 'historial':   return <Historial />
      case 'consulta':    return <Consulta />
      case 'users':       return <Users />
      case 'ds':          return <DesignSystem />
      default:            return <Placeholder title={meta.title} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        active={page === 'new-product' ? 'products' : page}
        onNavigate={navigate}
        onLogout={logout}
        role={role}
        user={{ name: session.usuario.nombre, email: session.usuario.correo }}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-hidden">{renderPage()}</main>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-ink text-white text-sm px-4 py-3 shadow-lg max-w-sm"
        >
          <Check size={16} className="text-teal-mid flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* Atajo de desarrollo: no existe en el build de producción */}
      {import.meta.env.DEV && page !== 'ds' && (
        <button
          onClick={() => setActive('ds')}
          className="fixed bottom-6 right-6 z-50 text-xs font-mono font-medium px-3.5 py-2 rounded-full shadow-lg bg-ink text-white/80 hover:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          Design System ↗
        </button>
      )}
    </div>
  )
}
