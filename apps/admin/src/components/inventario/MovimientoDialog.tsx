import { useState, type FormEvent } from 'react'
import { AlertCircle, ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import {
  ajustar,
  registrarEntrada,
  registrarMerma,
  registrarVenta,
  surtir,
  type ExistenciasVariante,
  type ResumenExistencias,
  type Ubicacion,
} from '../../api/inventario'

type Tipo = 'entrada' | 'surtido' | 'venta' | 'ajuste' | 'merma'

const TIPOS: { id: Tipo; label: string; ayuda: string; boton: string }[] = [
  { id: 'entrada', label: 'Entrada', ayuda: 'Llegó mercancía. Siempre entra al depósito.', boton: 'Registrar entrada' },
  { id: 'surtido', label: 'Surtir', ayuda: 'Pasa unidades del depósito a la tienda. Solo lo surtido se vende.', boton: 'Surtir a tienda' },
  { id: 'venta', label: 'Venta', ayuda: 'Descuenta unidades vendidas de la tienda.', boton: 'Registrar venta' },
  { id: 'ajuste', label: 'Ajuste', ayuda: 'Corrige el sistema con lo que contaste físicamente.', boton: 'Ajustar' },
  { id: 'merma', label: 'Merma', ayuda: 'Unidades dañadas, perdidas o que ya no se pueden vender.', boton: 'Registrar merma' },
]

type Props = {
  variante: ExistenciasVariante
  onClose: () => void
  /** Movimiento guardado: devuelve los saldos nuevos y un mensaje para el aviso. */
  onDone: (resumen: ResumenExistencias, mensaje: string) => void
}

const entero = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN)

export default function MovimientoDialog({ variante: v, onClose, onDone }: Props) {
  const [tipo, setTipo] = useState<Tipo>('entrada')
  const [cantidad, setCantidad] = useState('')
  const [ubicacion, setUbicacion] = useState<Ubicacion>('Tienda')
  const [notas, setNotas] = useState('')
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const meta = TIPOS.find((t) => t.id === tipo)!
  const n = entero(cantidad)
  const dep = v.cantidadDeposito
  const tie = v.cantidadTienda
  const enUbicacion = ubicacion === 'Deposito' ? dep : tie
  const nombreUbicacion = ubicacion === 'Deposito' ? 'depósito' : 'tienda'
  const motivoObligatorio = tipo === 'ajuste' || tipo === 'merma'

  /* Validación en el navegador (el back valida lo mismo) y saldos resultantes para la vista previa. */
  let errorCantidad: string | null = null
  let despues: { dep: number; tie: number } | null = null
  if (Number.isNaN(n)) errorCantidad = tipo === 'ajuste' ? 'Escribe cuántas unidades contaste.' : 'Escribe una cantidad entera.'
  else if (tipo === 'ajuste') {
    if (n === enUbicacion) errorCantidad = `Coincide con el sistema (${enUbicacion}): no hay nada que ajustar.`
    else despues = ubicacion === 'Deposito' ? { dep: n, tie } : { dep, tie: n }
  } else if (n <= 0) errorCantidad = 'La cantidad debe ser mayor que cero.'
  else if (tipo === 'entrada') despues = { dep: dep + n, tie }
  else if (tipo === 'surtido') {
    if (n > dep) errorCantidad = `Solo hay ${dep} en depósito.`
    else despues = { dep: dep - n, tie: tie + n }
  } else if (tipo === 'venta') {
    if (n > tie) errorCantidad = `Solo hay ${tie} surtidas en tienda.`
    else despues = { dep, tie: tie - n }
  } else if (tipo === 'merma') {
    if (n > enUbicacion) errorCantidad = `Solo hay ${enUbicacion} en ${nombreUbicacion}.`
    else despues = ubicacion === 'Deposito' ? { dep: dep - n, tie } : { dep, tie: tie - n }
  }
  const errorNotas = motivoObligatorio && !notas.trim() ? 'Indica el motivo: queda en el historial.' : null

  const cambiarTipo = (t: Tipo) => {
    setTipo(t)
    setError(null)
    setTried(false)
    // Una venta solo puede salir de tienda; para ajuste y merma se elige.
    if (t === 'ajuste' || t === 'merma') setUbicacion(tie > 0 || dep === 0 ? 'Tienda' : 'Deposito')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    setError(null)
    if (errorCantidad || errorNotas || saving) return
    setSaving(true)
    try {
      let r: ResumenExistencias | undefined
      let msg = ''
      const prenda = `${v.nombreProducto} (${v.color} · ${v.talla})`
      switch (tipo) {
        case 'entrada':
          r = await registrarEntrada(v.varianteId, n, notas)
          msg = `Entrada registrada: +${n} al depósito de ${prenda}.`
          break
        case 'surtido':
          r = await surtir(v.varianteId, n, notas)
          msg = `${n} surtidas a tienda de ${prenda}.`
          break
        case 'venta':
          r = await registrarVenta(v.varianteId, n, notas)
          msg = `Venta registrada: −${n} de ${prenda}.`
          break
        case 'ajuste':
          r = await ajustar(v.varianteId, ubicacion, n, notas)
          msg = `Ajuste registrado en ${nombreUbicacion} de ${prenda}: ahora hay ${n}.`
          break
        case 'merma':
          r = await registrarMerma(v.varianteId, ubicacion, n, notas)
          msg = `Merma registrada: −${n} en ${nombreUbicacion} de ${prenda}.`
          break
      }
      if (r) onDone(r, msg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.')
      setSaving(false)
    }
  }

  return (
    <Dialog
      title="Registrar movimiento"
      size="lg"
      onClose={onClose}
      busy={saving}
      description={
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0" style={{ background: v.colorHex }} />
          <span>
            {v.nombreProducto} · {v.color} · Talla {v.talla}
            <span className="font-mono text-xs ml-2">{v.codigoSku}</span>
          </span>
        </span>
      }
    >
      <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-5">
        {/* Tipo de movimiento */}
        <div role="radiogroup" aria-label="Tipo de movimiento" className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-bg">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={tipo === t.id}
              onClick={() => cambiarTipo(t.id)}
              className={`h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-teal ${
                tipo === t.id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-2 -mt-2">{meta.ayuda}</p>

        {(tipo === 'ajuste' || tipo === 'merma') && (
          <fieldset>
            <legend className="text-xs font-semibold text-ink-2 mb-1.5">Dónde</legend>
            <div className="flex gap-2">
              {(['Tienda', 'Deposito'] as const).map((u) => (
                <label
                  key={u}
                  className={`flex-1 flex items-center justify-between gap-2 h-10 px-3.5 rounded-xl border text-sm cursor-pointer ${
                    ubicacion === u ? 'border-ink bg-ink text-white' : 'border-border text-ink-2 hover:border-ink'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ubicacion"
                      value={u}
                      checked={ubicacion === u}
                      onChange={() => setUbicacion(u)}
                      className="sr-only"
                    />
                    {u === 'Deposito' ? 'Depósito' : 'Tienda'}
                  </span>
                  <span className="font-mono text-xs opacity-80">{u === 'Deposito' ? dep : tie} en sistema</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <Input
          label={tipo === 'ajuste' ? 'Unidades contadas' : 'Cantidad'}
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          autoFocus
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          error={tried && errorCantidad ? errorCantidad : undefined}
          fullWidth
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="mov-notas" className="text-xs font-semibold text-ink-2">
            {motivoObligatorio ? 'Motivo' : 'Notas (opcional)'}
          </label>
          <textarea
            id="mov-notas"
            rows={2}
            maxLength={500}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder={
              tipo === 'entrada' ? 'Proveedor, número de factura…'
              : tipo === 'ajuste' ? 'Conteo físico del sábado, diferencia encontrada…'
              : tipo === 'merma' ? 'Costura rota, mancha, extravío…'
              : ''
            }
            aria-invalid={tried && errorNotas ? true : undefined}
            className={`w-full rounded-xl border-[1.5px] bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-teal focus:ring-3 focus:ring-teal/10 resize-y ${
              tried && errorNotas ? 'border-red' : 'border-border'
            }`}
          />
          {tried && errorNotas && <p className="text-xs text-red">{errorNotas}</p>}
        </div>

        {/* Saldos: antes → después */}
        <div className="grid grid-cols-2 gap-3" aria-live="polite">
          {[
            { label: 'Depósito', antes: dep, despues: despues?.dep, color: 'text-blue' },
            { label: 'Tienda (a la venta)', antes: tie, despues: despues?.tie, color: 'text-teal' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-bg px-4 py-3">
              <div className="text-xs text-muted">{s.label}</div>
              <div className={`mt-1 flex items-center gap-2 font-mono font-semibold ${s.color}`}>
                <span>{s.antes}</span>
                {s.despues !== undefined && s.despues !== s.antes && (
                  <>
                    <ArrowRight size={14} className="text-muted" />
                    <span>{s.despues}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 text-sm rounded-xl px-3.5 py-3 bg-red-soft text-red">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="teal" loading={saving}>
            {meta.boton}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
