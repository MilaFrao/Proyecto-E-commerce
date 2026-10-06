import { useEffect, useState, type ReactNode } from 'react'
import { Plus, ArrowRightLeft, RotateCcw, XCircle, ShoppingBag, Undo2, Search, WifiOff } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { useAsync } from '../api/useAsync'
import { listarMovimientos, type Movimiento, type TipoMovimiento } from '../api/inventario'
import { useDebounced } from '../lib/useDebounced'
import { etiquetaDia, horaDe } from '../lib/fechas'

const POR_PAGINA = 50

type Tono = 'teal' | 'blue' | 'amber' | 'coral' | 'purple' | 'emerald'

const typeMeta: Record<TipoMovimiento, { icon: ReactNode; label: string; tone: Tono; detalle: string }> = {
  Entrada: { icon: <Plus size={14} />, label: 'Entrada', tone: 'teal', detalle: 'al depósito' },
  Traslado: { icon: <ArrowRightLeft size={14} />, label: 'Surtido', tone: 'blue', detalle: 'depósito → tienda' },
  Venta: { icon: <ShoppingBag size={14} />, label: 'Venta', tone: 'emerald', detalle: 'desde tienda' },
  Ajuste: { icon: <RotateCcw size={14} />, label: 'Ajuste', tone: 'amber', detalle: 'conteo físico' },
  Merma: { icon: <XCircle size={14} />, label: 'Merma', tone: 'coral', detalle: 'baja de unidades' },
  Devolucion: { icon: <Undo2 size={14} />, label: 'Devolución', tone: 'purple', detalle: 'del cliente' },
}

/* Devolución existe en el modelo pero todavía no hay forma de registrarla: no se ofrece como filtro. */
const FILTROS: (TipoMovimiento | 'todos')[] = ['todos', 'Entrada', 'Traslado', 'Venta', 'Ajuste', 'Merma']

const ubic = (u: Movimiento['ubicacionOrigen']) => (u === 'Deposito' ? 'depósito' : u === 'Tienda' ? 'tienda' : '')

/** El traslado no suma ni resta al total: se muestra como cantidad movida, sin signo. */
function cantidadVisible(m: Movimiento) {
  if (m.tipo === 'Traslado') return { texto: String(m.cantidad), color: 'text-blue' }
  return m.cantidad < 0 ? { texto: `−${-m.cantidad}`, color: 'text-coral' } : { texto: `+${m.cantidad}`, color: 'text-teal' }
}

export default function Historial() {
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState<TipoMovimiento | 'todos'>('todos')
  const [pagina, setPagina] = useState(1)
  const [items, setItems] = useState<Movimiento[]>([])
  const busqueda = useDebounced(search.trim())

  const lista = useAsync(
    () => listarMovimientos({ busqueda, tipo: tipo === 'todos' ? undefined : tipo, pagina, elementosPorPagina: POR_PAGINA }),
    [busqueda, tipo, pagina],
  )

  // «Cargar más» acumula; un filtro nuevo (página 1) reemplaza.
  useEffect(() => {
    const d = lista.data
    if (!d) return
    setItems((prev) => (d.pagina === 1 ? d.elementos : [...prev, ...d.elementos.filter((m) => !prev.some((p) => p.id === m.id))]))
  }, [lista.data])

  const filtrar = (f: () => void) => {
    f()
    setPagina(1)
  }

  const grupos = items.reduce<{ dia: string; items: Movimiento[] }[]>((acc, m) => {
    const dia = etiquetaDia(m.ocurridoEn)
    const ultimo = acc[acc.length - 1]
    if (ultimo && ultimo.dia === dia) ultimo.items.push(m)
    else acc.push({ dia, items: [m] })
    return acc
  }, [])

  const hayMas = !!lista.data && lista.data.pagina < lista.data.paginasTotales

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      <Input
        placeholder="Buscar por producto, referencia, SKU o nota…"
        value={search}
        onChange={(e) => filtrar(() => setSearch(e.target.value))}
        icon={<Search size={15} />}
        fullWidth
      />

      {/* Type tabs */}
      <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Tipo de movimiento">
        {FILTROS.map((t) => {
          const meta = t === 'todos' ? null : typeMeta[t]
          const activo = tipo === t
          return (
            <button
              key={t}
              onClick={() => filtrar(() => setTipo(t))}
              aria-pressed={activo}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-colors duration-150 cursor-pointer flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-teal ${
                activo ? 'bg-ink text-white' : 'text-muted hover:bg-border-soft hover:text-ink'
              }`}
            >
              {meta && <span>{meta.icon}</span>}
              {meta ? meta.label : 'Todos'}
            </button>
          )
        })}
      </div>

      {lista.error && !lista.data ? (
        <Card padding="lg">
          <div className="text-center py-8" role="alert">
            <WifiOff size={20} className="text-coral mx-auto" />
            <p className="text-sm text-muted mt-3">{lista.error.message}</p>
            <Button variant="teal" className="mt-4" onClick={lista.reload}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : !lista.data && items.length === 0 ? (
        <div className="space-y-2" role="status" aria-label="Cargando historial">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-border-soft animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 && !lista.loading ? (
        <Card padding="lg">
          <div className="text-center py-8 text-sm text-muted">
            {busqueda || tipo !== 'todos'
              ? 'No hay movimientos que coincidan con la búsqueda o el filtro.'
              : 'Todavía no hay movimientos. Aparecerán aquí al registrar entradas, surtidos o ventas.'}
          </div>
        </Card>
      ) : (
        <div className={`space-y-6 ${lista.loading && pagina === 1 ? 'opacity-60' : ''}`} aria-busy={lista.loading}>
          {grupos.map((g) => (
            <section key={g.items[0].id} className="space-y-2" aria-label={g.dia}>
              <div className="flex items-center gap-3 py-1">
                <h2 className="text-sm font-semibold text-ink-2 first-letter:uppercase">{g.dia}</h2>
                <div className="flex-1 h-px bg-border-soft" />
                <span className="text-xs text-muted">
                  {g.items.length} movimiento{g.items.length !== 1 ? 's' : ''}
                </span>
              </div>

              {g.items.map((m) => {
                const meta = typeMeta[m.tipo]
                const q = cantidadVisible(m)
                const lugar = m.tipo === 'Ajuste' || m.tipo === 'Merma' ? ubic(m.ubicacionOrigen ?? m.ubicacionDestino) : ''
                return (
                  <Card key={m.id} padding="none">
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `var(--color-${meta.tone}-soft)`, color: `var(--color-${meta.tone})` }}
                      >
                        {meta.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-ink">{m.nombreProducto}</span>
                          <Badge label={meta.label} tone={meta.tone} size="sm" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted flex-wrap">
                          <span className="inline-block w-2.5 h-2.5 rounded-full border border-black/10" style={{ background: m.colorHex }} />
                          <span>
                            {m.color} · Talla {m.talla}
                          </span>
                          <span className="font-mono">{m.codigoSku}</span>
                          {m.notas && <span className="text-ink-2">«{m.notas}»</span>}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right w-32">
                        <div className={`text-xl font-semibold font-mono ${q.color}`}>{q.texto}</div>
                        <div className="text-xs text-muted">{lugar ? `en ${lugar}` : meta.detalle}</div>
                      </div>

                      <div className="flex-shrink-0 text-right w-28 hidden lg:block">
                        <div className="text-xs text-muted">Quedó</div>
                        <div className="text-xs font-mono mt-0.5">
                          <span className="text-blue">{m.cantidadResultanteDeposito}</span>
                          <span className="text-border"> / </span>
                          <span className="text-teal">{m.cantidadResultanteTienda}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right w-40 pl-4 border-l border-border-soft">
                        <div className="text-xs font-medium text-ink-2 truncate" title={m.nombreUsuario ?? 'Sistema'}>
                          {m.nombreUsuario ?? 'Sistema'}
                        </div>
                        <div className="text-xs font-mono mt-0.5 text-muted">{horaDe(m.ocurridoEn)}</div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </section>
          ))}

          {hayMas && (
            <div className="flex justify-center">
              <Button variant="outline" loading={lista.loading} onClick={() => setPagina((p) => p + 1)}>
                Cargar más
              </Button>
            </div>
          )}
          {lista.data && (
            <p className="text-xs text-muted text-center">
              {items.length} de {lista.data.cantidadTotal} movimientos · «Quedó» es depósito / tienda después del movimiento
            </p>
          )}
        </div>
      )}

      <div className="pb-8" />
    </div>
  )
}
