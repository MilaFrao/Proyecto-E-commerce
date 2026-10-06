import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowRightLeft,
  Search,
  Users,
  Settings,
  ChevronRight,
  Shirt,
  History,
  Store,
  LogOut,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { initialsOf } from '../../auth/roles'

export type Role = 'super' | 'inventory' | 'seller'

export const ROLE_META: Record<Role, { label: string; tone: string }> = {
  super: { label: 'Superusuario', tone: 'purple' },
  inventory: { label: 'Inventario', tone: 'teal' },
  seller: { label: 'Vendedor', tone: 'blue' },
}

/** Página a la que cae cada rol al entrar. */
export const ROLE_HOME: Record<Role, string> = {
  super: 'dashboard',
  inventory: 'dashboard',
  seller: 'consulta',
}

type NavItem = { id: string; label: string; icon: ReactNode; roles: Role[] }

const ALL: Role[] = ['super', 'inventory', 'seller']
const STAFF: Role[] = ['super', 'inventory']

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: STAFF },
  { id: 'products', label: 'Productos', icon: <Package size={18} />, roles: STAFF },
  { id: 'inventory', label: 'Inventario', icon: <Boxes size={18} />, roles: STAFF },
  { id: 'surtido', label: 'Surtido', icon: <ArrowRightLeft size={18} />, roles: STAFF },
  { id: 'historial', label: 'Historial', icon: <History size={18} />, roles: STAFF },
  { id: 'consulta', label: 'Consulta comercial', icon: <Search size={18} />, roles: ALL },
  { id: 'users', label: 'Usuarios', icon: <Users size={18} />, roles: ['super'] },
  { id: 'catalog', label: 'Tienda pública', icon: <Store size={18} />, roles: ALL },
]

const settingsItem: NavItem = { id: 'settings', label: 'Configuración', icon: <Settings size={18} />, roles: ['super'] }

const toneClasses: Record<string, { pill: string; dot: string }> = {
  purple: { pill: 'bg-purple/15 text-purple', dot: 'bg-purple' },
  teal: { pill: 'bg-teal/15 text-teal', dot: 'bg-teal' },
  blue: { pill: 'bg-blue/15 text-blue', dot: 'bg-blue' },
}

type Props = {
  active: string
  onNavigate: (id: string) => void
  onLogout: () => void
  role: Role
  user: { name: string; email: string }
}

function NavButton({ item, active, onNavigate, quiet }: { item: NavItem; active: boolean; onNavigate: (id: string) => void; quiet?: boolean }) {
  return (
    <button
      onClick={() => onNavigate(item.id)}
      aria-current={active ? 'page' : undefined}
      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-teal ${
        quiet ? '' : 'mb-0.5'
      } ${
        active
          ? 'bg-sidebar-active text-white'
          : `${quiet ? 'text-white/40 hover:text-white/70' : 'text-white/50 hover:text-white/80'} hover:bg-sidebar-hover`
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-teal" />}
      <span className="flex-shrink-0">{item.icon}</span>
      <span className="flex-1 text-left font-medium">{item.label}</span>
      {active && !quiet && <ChevronRight size={14} className="opacity-50" />}
    </button>
  )
}

export default function Sidebar({ active, onNavigate, onLogout, role, user }: Props) {
  const meta = ROLE_META[role]
  const tone = toneClasses[meta.tone]
  const main = navItems.filter((i) => i.roles.includes(role))
  const bottom = settingsItem.roles.includes(role) ? [settingsItem] : []

  return (
    <aside className="flex flex-col h-full w-60 flex-shrink-0 bg-sidebar">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-teal">
          <Shirt size={16} className="text-white" />
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight font-display">Vestir</div>
          <div className="text-white/40 text-xs">Panel operativo</div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${tone.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
          {meta.label}
        </span>
      </div>

      <nav className="flex-1 px-3 pt-3 overflow-y-auto" aria-label="Navegación principal">
        {main.map((item) => (
          <NavButton key={item.id} item={item} active={active === item.id} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        {bottom.map((item) => (
          <NavButton key={item.id} item={item} active={active === item.id} onNavigate={onNavigate} quiet />
        ))}

        <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-hover">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 bg-coral">
            {initialsOf(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{user.name}</div>
            <div className="text-white/40 text-xs truncate">{user.email}</div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-sidebar-active transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-teal"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

/** ¿Este rol puede abrir esta página del panel? */
export function canAccess(role: Role, id: string): boolean {
  if (id === 'ds') return import.meta.env.DEV // atajo de desarrollo: no existe en producción
  if (id === 'new-product') return role !== 'seller'
  const item = [...navItems, settingsItem].find((i) => i.id === id)
  return item ? item.roles.includes(role) : false
}
