import { useState } from 'react'
import { ArrowRightLeft, Boxes, CheckCircle2, Search, ChevronRight, AlertTriangle, WifiOff, Check, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card, { StatCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useAsync } from '../api/useAsync'
import { getResumenInventario, listarVariantes, surtir, surtirLote, type ExistenciasVariante } from '../api/inventario'
import { useDebounced } from '../lib/useDebounced'
import { inicioDeHoy } from '../lib/fechas'

const MAXIMO = 100 // el back pagina; aquí se muestran hasta 100 pendientes y se avisa si hay más

const stepper =
  'w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center bg-border-soft text-ink enabled:hover:bg-border disabled:opacity-40 cursor-pointer focus-visible:outline-2 focus-visible:outline-teal'

export default function Surtido() {
  const [search, setSearch] = useState('')
  const busqueda = useDebounced(search.trim())
  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const [trabajando, setTrabajando] = useState<string | null>(null) // id de la fila, o 'lote'
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const lista = useAsync(() => listarVariantes({ estado: 'por-surtir', busqueda, elementosPorPagina: MAXIMO }), [busqueda])
  const resumen = useAsync(() => getResumenInventario(inicioDeHoy()))

  const pendientes = lista.data?.elementos ?? []
  const cantidadDe = (v: ExistenciasVariante) => Math.min(cantidades[v.varianteId] ?? 0, v.cantidadDeposito)
  const fijar = (v: ExistenciasVariante, n: number) =>
    setCantidades((c) => ({ ...c, [v.varianteId]: Math.max(0, Math.min(v.cantidadDeposito, Number.isFinite(n) ? Math.trunc(n) : 0)) }))

  const marcadas = pendientes.filter((v) => cantidadDe(v) > 0)
  const unidadesMarcadas = marcadas.reduce((a, v) => a + cantidadDe(v), 0)

  const terminar = (texto: string, ids: string[]) => {
    setAviso({ tipo: 'ok', texto })
    setCantidades((c) => {
      const n = { ...c }
      for (const id of ids) delete n[id]
      return n
    })
    lista.reload()
    resumen.reload()
  }

  const fallar = (e: unknown) => setAviso({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo surtir.' })

  const surtirUna = async (v: ExistenciasVariante) => {
    const n = cantidadDe(v)
    if (n <= 0) return
    setTrabajando(v.varianteId)
    setAviso(null)
    try {
      await surtir(v.varianteId, n)
      terminar(`${n} surtidas a tienda: ${v.nombreProducto} (${v.color} · ${v.talla}).`, [v.varianteId])
    } catch (e) {
      fallar(e)
    } finally {
      setTrabajando(null)
    }
  }

  const surtirMarcadas = async () => {
    if (marcadas.length === 0) return
    setTrabajando('lote')
    setAviso(null)
    try {
      await surtirLote(marcadas.map((v) => ({ varianteId: v.varianteId, cantidad: cantidadDe(v) })))
      terminar(
        `${unidadesMarcadas} unidades surtidas en ${marcadas.length} ${marcadas.length === 1 ? 'variante' : 'variantes'}.`,
        marcadas.map((v) => v.varianteId),
      )
    } catch (e) {
      fallar(e) // todo o nada: si una falla, ninguna se movió
    } finally {
      setTrabajando(null)
    }
  }

  const r = resumen.data

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        <StatCard
          label="Sin nada en tienda"
          value={r?.variantesSinSurtir ?? '—'}
          sub="Variantes con depósito que hoy no se venden"
          accent="var(--color-amber)"
          accentBg="var(--color-amber-soft)"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Unidades en depósito"
          value={r?.unidadesDeposito?.toLocaleString('es-VE') ?? '—'}
          sub="Disponibles para surtir"
          accent="var(--color-blue)"
          accentBg="var(--color-blue-soft)"
          icon={<Boxes size={18} />}
        />
        <StatCard
          label="Surtidas hoy"
          value={r?.unidadesSurtidas?.toLocaleString('es-VE') ?? '—'}
          sub="Unidades pasadas a tienda desde las 00:00"
          accent="var(--color-teal)"
          accentBg="var(--color-teal-soft)"
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-5 py-4 rounded-2xl text-sm bg-teal-soft border border-teal-mid text-teal">
        <ArrowRightLeft size={16} className="mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold">Surtir</span> es pasar mercancía del depósito a la tienda. Solo lo surtido
          aparece disponible para venta en el catálogo. Elige cuántas unidades de cada variante quieres pasar.
        </div>
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
            placeholder="Buscar por producto, referencia, color o SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
            fullWidth
          />
        </div>
        <Button
          variant="teal"
          icon={<ArrowRightLeft size={15} />}
          loading={trabajando === 'lote'}
          onClick={surtirMarcadas}
          disabled={marcadas.length === 0 || trabajando !== null}
        >
          {marcadas.length === 0
            ? 'Surtir marcadas'
            : `Surtir ${unidadesMarcadas} ud en ${marcadas.length} ${marcadas.length === 1 ? 'variante' : 'variantes'}`}
        </Button>
      </div>

      {/* Items */}
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
      ) : !lista.data ? (
        <div className="space-y-3" role="status" aria-label="Cargando pendientes">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-border-soft animate-pulse" />
          ))}
        </div>
      ) : pendientes.length === 0 ? (
        <Card padding="lg">
          {busqueda ? (
            <div className="text-center py-8 text-sm text-muted">Nada por surtir coincide con «{busqueda}».</div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-teal-soft">
                <CheckCircle2 size={28} className="text-teal" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base font-display text-ink">Todo surtido</div>
                <div className="text-sm mt-1 text-muted">No quedan unidades esperando en el depósito.</div>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className={`space-y-3 ${lista.loading ? 'opacity-60' : ''}`} aria-busy={lista.loading}>
          {pendientes.map((v) => {
            const qty = cantidadDe(v)
            const sinTienda = v.cantidadTienda === 0
            return (
              <Card key={v.varianteId} padding="none">
                <div className="flex items-center gap-5 px-6 py-4">
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0"
                    style={{ background: v.colorHex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-ink">{v.nombreProducto}</span>
                      {sinTienda ? (
                        <Badge label="Nada en tienda" tone="coral" size="sm" dot />
                      ) : (
                        <Badge label={`${v.cantidadTienda} en tienda`} tone="neutral" size="sm" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs font-mono text-muted">{v.codigoSku}</span>
                      <span className="text-xs text-muted">
                        {v.color} · Talla {v.talla}
                      </span>
                    </div>
                  </div>

                  <div className="text-center flex-shrink-0 w-20">
                    <div className="text-lg font-semibold font-mono text-blue">{v.cantidadDeposito}</div>
                    <div className="text-xs text-muted">en depósito</div>
                  </div>

                  <ChevronRight size={16} className="text-border flex-shrink-0" />

                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className={stepper}
                        aria-label={`Una menos de ${v.codigoSku}`}
                        disabled={qty <= 0}
                        onClick={() => fijar(v, qty - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={v.cantidadDeposito}
                        aria-label={`Unidades a surtir de ${v.codigoSku}`}
                        value={qty}
                        onChange={(e) => fijar(v, Number(e.target.value))}
                        className="w-14 h-8 rounded-lg border border-border bg-surface text-center font-mono font-semibold text-sm text-ink outline-none focus:border-teal"
                      />
                      <button
                        type="button"
                        className={stepper}
                        aria-label={`Una más de ${v.codigoSku}`}
                        disabled={qty >= v.cantidadDeposito}
                        onClick={() => fijar(v, qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => fijar(v, v.cantidadDeposito)}
                      className="text-xs font-medium text-teal hover:underline cursor-pointer"
                      aria-label={`Marcar todo el depósito de ${v.codigoSku}`}
                    >
                      Todo ({v.cantidadDeposito})
                    </button>
                  </div>

                  <Button
                    variant="teal"
                    size="sm"
                    icon={<CheckCircle2 size={13} />}
                    loading={trabajando === v.varianteId}
                    disabled={qty <= 0 || trabajando !== null}
                    onClick={() => surtirUna(v)}
                    aria-label={`Surtir ${v.codigoSku}`}
                  >
                    Surtir
                  </Button>
                </div>
              </Card>
            )
          })}
          {lista.data.cantidadTotal > pendientes.length && (
            <p className="text-xs text-muted">
              Mostrando {pendientes.length} de {lista.data.cantidadTotal} variantes por surtir. Busca para encontrar el resto.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
