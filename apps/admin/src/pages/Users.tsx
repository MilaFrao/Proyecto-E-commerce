import { useState } from 'react'
import { Plus, Search, Shield, Package, ShoppingBag, WifiOff, Check, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Card, { StatCard } from '../components/ui/Card'
import NuevoUsuarioDialog from '../components/users/NuevoUsuarioDialog'
import { useAsync } from '../api/useAsync'
import { cambiarEstadoUsuario, listarUsuarios } from '../api/usuarios'
import { useAuth } from '../auth/AuthContext'
import { initialsOf, roleOf } from '../auth/roles'
import type { UsuarioApi } from '../auth/session'
import type { Role } from '../components/layout/Sidebar'

const ACENTOS = ['coral', 'teal', 'blue', 'purple', 'amber']

/** Color estable por usuario: el mismo id siempre cae en el mismo acento. */
function acentoDe(id: string): string {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return `var(--color-${ACENTOS[h % ACENTOS.length]})`
}

const DIA = 86_400_000

function ultimoAcceso(iso: string | null): string {
  if (!iso) return 'Nunca'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Nunca'
  const hora = d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: false })
  const inicioHoy = new Date().setHours(0, 0, 0, 0)
  if (d.getTime() >= inicioHoy) return `Hoy ${hora}`
  if (d.getTime() >= inicioHoy - DIA) return `Ayer ${hora}`
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })
}

const roleMeta: Record<Role, { label: string; tone: 'purple' | 'teal' | 'blue'; icon: React.ReactNode; description: string }> = {
  super: { label: 'Superusuario', tone: 'purple', icon: <Shield size={14} />, description: 'Acceso total al sistema' },
  inventory: { label: 'Inventario', tone: 'teal', icon: <Package size={14} />, description: 'Gestión de stock y productos' },
  seller: { label: 'Vendedor', tone: 'blue', icon: <ShoppingBag size={14} />, description: 'Consulta comercial' },
}

type Fila = {
  id: string
  name: string
  email: string
  role: Role
  activo: boolean
  lastAccess: string
  initials: string
  accentColor: string
}

/** Cuentas sin rol de personal (clientes) no aparecen en esta pantalla. */
function aFila(u: UsuarioApi): Fila | null {
  const role = roleOf(u)
  if (!role) return null
  return {
    id: u.id,
    name: u.nombre,
    email: u.correo,
    role,
    activo: u.estaActivo,
    lastAccess: ultimoAcceso(u.ultimoAcceso),
    initials: initialsOf(u.nombre),
    accentColor: acentoDe(u.id),
  }
}

export default function Users() {
  const { session } = useAuth()
  const miId = session?.usuario.id
  const { data, error, loading, reload } = useAsync(listarUsuarios)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'todos'>('todos')
  const [creando, setCreando] = useState(false)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const users: Fila[] = (data ?? []).map(aFila).filter((f): f is Fila => f !== null)

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchRole = roleFilter === 'todos' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const cambiarEstado = async (u: Fila, activo: boolean) => {
    setTrabajando(u.id)
    setConfirmando(null)
    setAviso(null)
    try {
      await cambiarEstadoUsuario(u.id, activo)
      setAviso({ tipo: 'ok', texto: activo ? `${u.name} volvió a tener acceso.` : `${u.name} ya no puede entrar.` })
      reload()
    } catch (e) {
      setAviso({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo cambiar el estado.' })
    } finally {
      setTrabajando(null)
    }
  }

  if (loading && !data) {
    return (
      <div className="p-8 space-y-6" role="status" aria-label="Cargando usuarios">
        <div className="grid grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-border-soft animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-border-soft animate-pulse" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 h-full flex items-center justify-center" role="alert">
        <div className="text-center max-w-sm">
          <span className="w-12 h-12 mx-auto rounded-full bg-coral-soft flex items-center justify-center">
            <WifiOff size={20} className="text-coral" />
          </span>
          <h2 className="font-display font-semibold text-lg mt-4 text-ink">No pudimos cargar los usuarios</h2>
          <p className="text-sm text-muted mt-2">{error.message}</p>
          <Button variant="teal" className="mt-5" onClick={reload}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        <StatCard
          label="Usuarios activos"
          value={users.filter((u) => u.activo).length}
          sub="Con acceso al sistema"
          accent="var(--color-teal)"
          accentBg="var(--color-teal-soft)"
          icon={<Shield size={18} />}
        />
        <StatCard
          label="Personal de inventario"
          value={users.filter((u) => u.role === 'inventory').length}
          sub="Gestión de stock"
          accent="var(--color-blue)"
          accentBg="var(--color-blue-soft)"
          icon={<Package size={18} />}
        />
        <StatCard
          label="Vendedores"
          value={users.filter((u) => u.role === 'seller').length}
          sub="Consulta comercial"
          accent="var(--color-purple)"
          accentBg="var(--color-purple-soft)"
          icon={<ShoppingBag size={18} />}
        />
      </div>

      {/* Role info */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(roleMeta) as [Role, (typeof roleMeta)[Role]][]).map(([role, meta]) => (
          <Card key={role} padding="sm">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `var(--color-${meta.tone}-soft)`, color: `var(--color-${meta.tone})` }}
              >
                {meta.icon}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{meta.label}</div>
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{meta.description}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {aviso && (
        <div
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
          className={`flex items-center gap-2 text-sm rounded-xl px-3.5 py-3 ${aviso.tipo === 'error' ? 'bg-red-soft text-red' : 'bg-teal-soft text-teal'}`}
        >
          {aviso.tipo === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          {aviso.texto}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o correo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
            fullWidth
          />
        </div>
        <Button variant="teal" icon={<Plus size={15} />} onClick={() => setCreando(true)}>
          Nuevo usuario
        </Button>
      </div>

      {/* Role filter tabs */}
      <div className="flex items-center gap-1">
        {(['todos', 'super', 'inventory', 'seller'] as const).map((r) => {
          const isActive = roleFilter === r
          const label = r === 'todos' ? 'Todos' : roleMeta[r].label
          return (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-150 cursor-pointer"
              style={{
                background: isActive ? 'var(--color-ink)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-muted)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--color-border-soft)'
                  e.currentTarget.style.color = 'var(--color-ink)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-muted)'
                }
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* User list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--color-border-soft)', boxShadow: 'var(--shadow-sm)' }}
      >
        {filtered.map((u, i) => {
          const meta = roleMeta[u.role]
          return (
            <div
              key={u.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors"
              style={{
                background: 'var(--color-surface)',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border-soft)' : 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ background: u.accentColor, opacity: !u.activo ? 0.5 : 1 }}
              >
                {u.initials}
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-medium text-sm"
                    style={{ color: !u.activo ? 'var(--color-muted)' : 'var(--color-ink)' }}
                  >
                    {u.name}
                  </span>
                  {!u.activo && (
                    <Badge label="Inactivo" tone="neutral" size="sm" />
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {u.email}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge label={meta.label} tone={meta.tone} size="sm" dot />
              </div>

              {/* Last access */}
              <div className="flex-shrink-0 text-right min-w-32">
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Último acceso</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-ink-2)' }}>
                  {u.lastAccess}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex-shrink-0 w-44 flex justify-end">
                {u.id === miId ? (
                  <span className="text-xs text-muted">Tu cuenta</span>
                ) : !u.activo ? (
                  <Button size="sm" variant="outline" loading={trabajando === u.id} onClick={() => cambiarEstado(u, true)}>
                    Reactivar
                  </Button>
                ) : confirmando === u.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-ink-2">¿Desactivar?</span>
                    <Button size="sm" variant="danger" onClick={() => cambiarEstado(u, false)}>
                      Sí
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmando(null)}>
                      No
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" loading={trabajando === u.id} onClick={() => setConfirmando(u.id)}>
                    Desactivar
                  </Button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-sm" style={{ color: 'var(--color-muted)', background: 'var(--color-surface)' }}>
            {users.length === 0 ? 'Todavía no hay usuarios de personal.' : 'Ningún usuario coincide con la búsqueda.'}
          </div>
        )}
      </div>

      {creando && (
        <NuevoUsuarioDialog
          onClose={() => setCreando(false)}
          onCreated={(nombre) => {
            setCreando(false)
            setAviso({ tipo: 'ok', texto: `${nombre} ya puede entrar al panel.` })
            reload()
          }}
        />
      )}
    </div>
  )
}
