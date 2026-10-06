import { useEffect, useState, type ReactNode } from 'react'
import { AlertTriangle, ArrowRight, ArrowRightLeft, Boxes, CheckCircle2, PackageX, TrendingUp, WifiOff } from 'lucide-react'
import Card, { StatCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useAuth } from '../auth/AuthContext'
import { useAsync } from '../api/useAsync'
import {
  UMBRAL_STOCK_CRITICO,
  getActividad,
  getResumenInventario,
  listarVariantes,
  type ActividadDia,
  type EstadoFiltro,
} from '../api/inventario'
import { diaCorto, fechaLarga, inicioDeHoy, saludoDe } from '../lib/fechas'

type Props = {
  /** Cambia de pantalla (mismos ids que el menú lateral). */
  onNavigate: (id: string) => void
  /** Abre Inventario ya filtrado. */
  onVerInventario: (estado: EstadoFiltro) => void
}

const n = (v: number | undefined) => (v === undefined ? '—' : v.toLocaleString('es-VE'))

/** Reloj de un minuto: el saludo y la fecha se corrigen solos si el panel queda abierto toda la noche. */
function useAhora() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])
  return ahora
}

function Fallo({ mensaje, onRetry }: { mensaje: string; onRetry: () => void }) {
  return (
    <div className="px-6 py-10 text-center" role="alert">
      <WifiOff size={20} className="text-coral mx-auto" />
      <p className="text-sm text-muted mt-3">{mensaje}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

const Esqueleto = ({ filas }: { filas: number }) => (
  <div className="px-6 py-4 space-y-3" role="status" aria-label="Cargando">
    {Array.from({ length: filas }, (_, i) => (
      <div key={i} className="h-10 rounded-xl bg-border-soft animate-pulse" />
    ))}
  </div>
)

export default function Dashboard({ onNavigate, onVerInventario }: Props) {
  const { session } = useAuth()
  const ahora = useAhora()

  const resumen = useAsync(() => getResumenInventario(inicioDeHoy()))
  const criticas = useAsync(() => listarVariantes({ estado: 'critico', elementosPorPagina: 8 }))
  const porSurtir = useAsync(() => listarVariantes({ estado: 'por-surtir', elementosPorPagina: 3 }))
  const actividad = useAsync(() => getActividad(7))

  const r = resumen.data
  const nombre = session?.usuario.nombre

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      {/* Saludo: usuario en sesión y fecha real */}
      <div>
        <h2 className="text-2xl font-semibold font-display text-ink">
          {saludoDe(ahora)}
          {nombre ? `, ${nombre}` : ''}
        </h2>
        <p className="text-sm mt-1 text-muted">Aquí está el resumen operativo de hoy — {fechaLarga(ahora)}</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          label="Disponibles para venta"
          value={n(r?.unidadesTienda)}
          sub="Unidades surtidas en tienda"
          accent="var(--color-emerald)"
          accentBg="var(--color-emerald-soft)"
          icon={<CheckCircle2 size={18} />}
        />
        <StatCard
          label="Unidades en depósito"
          value={n(r?.unidadesDeposito)}
          sub={r ? `${n(r.variantesActivas)} variantes activas` : 'Stock físico en depósito'}
          accent="var(--color-blue)"
          accentBg="var(--color-blue-soft)"
          icon={<Boxes size={18} />}
        />
        <StatCard
          label="Stock crítico"
          value={n(r?.variantesCriticas)}
          sub={`Variantes con ${UMBRAL_STOCK_CRITICO} unidades o menos`}
          accent="var(--color-amber)"
          accentBg="var(--color-amber-soft)"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Agotadas"
          value={n(r?.variantesAgotadas)}
          sub="Sin unidades en ningún lado"
          accent="var(--color-coral)"
          accentBg="var(--color-coral-soft)"
          icon={<PackageX size={18} />}
        />
      </div>
      {resumen.error && !r && (
        <div role="alert" className="flex items-center justify-between gap-3 text-sm rounded-xl px-4 py-3 bg-red-soft text-red">
          <span>No pudimos cargar las métricas: {resumen.error.message}</span>
          <Button variant="outline" size="sm" onClick={resumen.reload}>
            Reintentar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Stock crítico: el centro del panel */}
        <Card padding="none" className="col-span-2 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-border-soft">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber" />
              <h3 className="font-semibold text-sm font-display text-ink">Stock crítico</h3>
              {criticas.data && criticas.data.cantidadTotal > 0 && (
                <Badge label={`${criticas.data.cantidadTotal} ${criticas.data.cantidadTotal === 1 ? 'variante' : 'variantes'}`} tone="amber" size="sm" />
              )}
            </div>
            <span className="text-xs text-muted">Quedan {UMBRAL_STOCK_CRITICO} unidades o menos entre depósito y tienda</span>
          </div>

          {criticas.error && !criticas.data ? (
            <Fallo mensaje={criticas.error.message} onRetry={criticas.reload} />
          ) : !criticas.data ? (
            <Esqueleto filas={4} />
          ) : criticas.data.elementos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-soft">
                <CheckCircle2 size={24} className="text-teal" />
              </span>
              <div className="font-semibold text-sm font-display text-ink">Nada en nivel crítico</div>
              <div className="text-xs text-muted">Ninguna variante está por agotarse.</div>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border-soft">
                {criticas.data.elementos.map((v) => {
                  const total = v.cantidadDeposito + v.cantidadTienda
                  return (
                    <li key={v.varianteId} className="flex items-center gap-4 px-6 py-3.5">
                      <span
                        className="w-9 h-9 rounded-xl flex-shrink-0"
                        style={{ background: v.colorHex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-ink">{v.nombreProducto}</div>
                        <div className="text-xs mt-0.5 text-muted truncate">
                          {v.color} · Talla {v.talla} · <span className="font-mono">{v.codigoSku}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted text-right flex-shrink-0">
                        <div>
                          Tienda <span className="font-mono font-medium text-teal">{v.cantidadTienda}</span> · Depósito{' '}
                          <span className="font-mono font-medium text-blue">{v.cantidadDeposito}</span>
                        </div>
                        <div className="mt-0.5">{v.cantidadDeposito > 0 ? 'Hay en depósito: surtir' : 'Sin depósito: reponer'}</div>
                      </div>
                      <span
                        className="w-16 text-right font-mono font-semibold text-sm flex-shrink-0 text-red"
                        title={`${total} ${total === 1 ? 'unidad' : 'unidades'} en total`}
                      >
                        {total} ud
                      </span>
                    </li>
                  )
                })}
              </ul>
              {criticas.data.cantidadTotal > criticas.data.elementos.length && (
                <div className="px-6 py-3 border-t border-border-soft">
                  <button
                    type="button"
                    onClick={() => onVerInventario('critico')}
                    className="text-xs font-medium text-teal cursor-pointer hover:underline focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    Ver las {criticas.data.cantidadTotal} en Inventario →
                  </button>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Pendiente de surtir: atajo a la pestaña de Surtido */}
        <button
          type="button"
          onClick={() => onNavigate('surtido')}
          aria-label="Ir a Surtido"
          className="text-left rounded-xl overflow-hidden bg-teal-soft border border-teal-mid shadow-sm cursor-pointer transition-[box-shadow,transform] duration-150 hover:shadow-md hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-teal-mid">
            <div className="flex items-center gap-2 text-teal">
              <ArrowRightLeft size={15} />
              <span className="font-semibold text-sm font-display">Pendiente de surtir</span>
            </div>
            {porSurtir.data && (
              <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded-full bg-teal text-white">
                {porSurtir.data.cantidadTotal} {porSurtir.data.cantidadTotal === 1 ? 'variante' : 'variantes'}
              </span>
            )}
          </div>

          <div className="px-5 py-4 space-y-2.5 text-teal">
            {porSurtir.error && !porSurtir.data ? (
              <p className="text-sm">No se pudo cargar: {porSurtir.error.message}</p>
            ) : !porSurtir.data ? (
              <div className="space-y-2" role="status" aria-label="Cargando">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-5 rounded bg-teal-mid/60 animate-pulse" />
                ))}
              </div>
            ) : porSurtir.data.elementos.length === 0 ? (
              <p className="text-sm font-medium">Todo surtido: no queda nada esperando en el depósito.</p>
            ) : (
              <>
                {r && r.variantesSinSurtir > 0 && (
                  <p className="text-xs font-medium">
                    {r.variantesSinSurtir} {r.variantesSinSurtir === 1 ? 'no tiene' : 'no tienen'} nada en tienda y hoy no se {r.variantesSinSurtir === 1 ? 'vende' : 'venden'}.
                  </p>
                )}
                {porSurtir.data.elementos.map((v) => (
                  <div key={v.varianteId} className="flex items-center justify-between gap-3">
                    <span className="text-sm truncate">
                      {v.nombreProducto} <span className="text-xs opacity-80">· {v.color} {v.talla}</span>
                    </span>
                    <span className="text-sm font-mono font-medium flex-shrink-0">{v.cantidadDeposito}</span>
                  </div>
                ))}
                {porSurtir.data.cantidadTotal > porSurtir.data.elementos.length && (
                  <p className="text-xs opacity-80">y {porSurtir.data.cantidadTotal - porSurtir.data.elementos.length} más…</p>
                )}
              </>
            )}
            <div className="flex items-center gap-1.5 pt-1 text-sm font-semibold">
              Ir a surtido <ArrowRight size={14} />
            </div>
          </div>
        </button>
      </div>

      {/* Actividad de la semana */}
      <Card padding="md">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-muted" />
            <h3 className="font-semibold text-sm font-display text-ink">Unidades movidas — últimos 7 días</h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted">
            <Leyenda color="var(--color-teal)" texto="Entradas" />
            <Leyenda color="var(--color-blue)" texto="Surtidas" />
            <Leyenda color="var(--color-coral)" texto="Vendidas" />
            <button
              type="button"
              onClick={() => onNavigate('historial')}
              className="font-medium text-teal cursor-pointer hover:underline focus-visible:outline-2 focus-visible:outline-teal"
            >
              Ver historial →
            </button>
          </div>
        </div>

        {actividad.error && !actividad.data ? (
          <Fallo mensaje={actividad.error.message} onRetry={actividad.reload} />
        ) : !actividad.data ? (
          <div className="h-32 rounded-xl bg-border-soft animate-pulse" role="status" aria-label="Cargando gráfica" />
        ) : (
          <>
            <Barras dias={actividad.data} />
            {r && (
              <p className="text-xs text-muted mt-4">
                Hoy: <b className="font-medium text-ink-2">{n(r.unidadesEntradas)}</b> entradas ·{' '}
                <b className="font-medium text-ink-2">{n(r.unidadesSurtidas)}</b> surtidas ·{' '}
                <b className="font-medium text-ink-2">{n(r.unidadesVendidas)}</b> vendidas
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

function Leyenda({ color, texto }: { color: string; texto: string }): ReactNode {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      {texto}
    </span>
  )
}

const ALTO = 96

function Barras({ dias }: { dias: ActividadDia[] }) {
  const max = Math.max(0, ...dias.flatMap((d) => [d.entradas, d.surtidas, d.vendidas]))
  const total = dias.reduce((a, d) => a + d.entradas + d.surtidas + d.vendidas, 0)

  if (total === 0) {
    return <div className="h-32 flex items-center justify-center text-sm text-muted">Sin movimientos en los últimos 7 días.</div>
  }

  const resumenAccesible = `Unidades movidas por día. ${dias
    .map((d) => `${diaCorto(d.inicio)}: ${d.entradas} entradas, ${d.surtidas} surtidas, ${d.vendidas} vendidas`)
    .join('. ')}.`

  return (
    <div role="img" aria-label={resumenAccesible} className="flex items-end gap-3">
      {dias.map((d, i) => (
        <div key={d.inicio} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="flex items-end gap-0.5 w-full"
            style={{ height: ALTO }}
            title={`${diaCorto(d.inicio)}: ${d.entradas} entradas, ${d.surtidas} surtidas, ${d.vendidas} vendidas`}
          >
            {(
              [
                { val: d.entradas, color: 'var(--color-teal)' },
                { val: d.surtidas, color: 'var(--color-blue)' },
                { val: d.vendidas, color: 'var(--color-coral)' },
              ] as const
            ).map(({ val, color }, k) => (
              <div
                key={k}
                className="flex-1 rounded-t-sm"
                style={{ height: val > 0 ? Math.max((val / max) * ALTO, 3) : 0, background: color, opacity: 0.85 }}
              />
            ))}
          </div>
          <span className={`text-xs font-mono ${i === dias.length - 1 ? 'text-ink font-semibold' : 'text-muted'}`}>
            {i === dias.length - 1 ? 'Hoy' : diaCorto(d.inicio)}
          </span>
        </div>
      ))}
    </div>
  )
}
