import { useState } from 'react'
import { Search, ArrowUpDown, Boxes, ShoppingBag, AlertTriangle, PackageX, WifiOff, Check } from 'lucide-react'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import { StockBadge } from '../components/ui/Badge'
import Table from '../components/ui/Table'
import { StatCard } from '../components/ui/Card'
import Paginacion from '../components/ui/Paginacion'
import MovimientoDialog from '../components/inventario/MovimientoDialog'
import { useAsync } from '../api/useAsync'
import {
  estadoStock,
  getResumenInventario,
  listarVariantes,
  type EstadoFiltro,
  type ExistenciasVariante,
} from '../api/inventario'
import { useDebounced } from '../lib/useDebounced'
import { fechaRelativa, inicioDeHoy } from '../lib/fechas'

const POR_PAGINA = 50

const ESTADOS: { id: EstadoFiltro; label: string }[] = [
  { id: 'todos', label: 'Todos los estados' },
  { id: 'disponible', label: 'Disponible en tienda' },
  { id: 'solo-deposito', label: 'Solo en depósito' },
  { id: 'agotado', label: 'Agotado' },
]

export default function Inventory() {
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<EstadoFiltro>('todos')
  const [pagina, setPagina] = useState(1)
  const [moviendo, setMoviendo] = useState<ExistenciasVariante | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const busqueda = useDebounced(search.trim())

  const lista = useAsync(
    () => listarVariantes({ busqueda, estado, pagina, elementosPorPagina: POR_PAGINA }),
    [busqueda, estado, pagina],
  )
  const resumen = useAsync(() => getResumenInventario(inicioDeHoy()))

  // Cambiar el filtro o la búsqueda vuelve a la primera página.
  const filtrar = (f: () => void) => {
    f()
    setPagina(1)
  }

  const columns = [
    {
      key: 'variant',
      label: 'Variante',
      render: (row: ExistenciasVariante) => (
        <div>
          <div className="font-medium text-sm text-ink">{row.nombreProducto}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full border border-black/10" style={{ background: row.colorHex }} />
            <span className="text-xs text-muted">
              {row.color} · Talla {row.talla}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (row: ExistenciasVariante) => <span className="font-mono text-xs text-muted">{row.codigoSku}</span>,
    },
    {
      key: 'deposito',
      label: 'Depósito',
      align: 'center' as const,
      render: (row: ExistenciasVariante) => (
        <span className="font-mono font-semibold text-sm text-blue">{row.cantidadDeposito}</span>
      ),
    },
    {
      key: 'tienda',
      label: 'Tienda',
      align: 'center' as const,
      render: (row: ExistenciasVariante) => (
        <span className={`font-mono font-semibold text-sm ${row.cantidadTienda === 0 ? 'text-red' : 'text-teal'}`}>
          {row.cantidadTienda}
        </span>
      ),
    },
    {
      key: 'state',
      label: 'Estado',
      render: (row: ExistenciasVariante) => <StockBadge state={estadoStock(row)} />,
    },
    {
      key: 'lastMove',
      label: 'Último movimiento',
      render: (row: ExistenciasVariante) => (
        <span className="text-xs text-muted">{fechaRelativa(row.ultimoMovimientoEn, 'Sin movimientos')}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (row: ExistenciasVariante) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowUpDown size={13} />}
          onClick={() => setMoviendo(row)}
          aria-label={`Mover ${row.codigoSku}`}
        >
          Mover
        </Button>
      ),
    },
  ]

  const r = resumen.data
  const fmt = (x: number | undefined) => (x === undefined ? '—' : x.toLocaleString('es-VE'))

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          label="En depósito"
          value={fmt(r?.unidadesDeposito)}
          sub="Guardado, todavía no se vende"
          accent="var(--color-blue)"
          accentBg="var(--color-blue-soft)"
          icon={<Boxes size={18} />}
        />
        <StatCard
          label="En tienda"
          value={fmt(r?.unidadesTienda)}
          sub="Surtido: lo único disponible para venta"
          accent="var(--color-teal)"
          accentBg="var(--color-teal-soft)"
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          label="Sin surtir"
          value={fmt(r?.variantesSinSurtir)}
          sub="Variantes con depósito y nada en tienda"
          accent="var(--color-amber)"
          accentBg="var(--color-amber-soft)"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Agotadas"
          value={fmt(r?.variantesAgotadas)}
          sub="Cero en depósito y en tienda"
          accent="var(--color-red)"
          accentBg="var(--color-red-soft)"
          icon={<PackageX size={18} />}
        />
      </div>

      {aviso && (
        <div role="status" className="flex items-center gap-2 text-sm rounded-xl px-3.5 py-3 bg-teal-soft text-teal">
          <Check size={16} />
          {aviso}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por producto, referencia, color o SKU…"
            value={search}
            onChange={(e) => filtrar(() => setSearch(e.target.value))}
            icon={<Search size={15} />}
            fullWidth
          />
        </div>
        <div className="w-56">
          <Select
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(e) => filtrar(() => setEstado(e.target.value as EstadoFiltro))}
            fullWidth
          >
            {ESTADOS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {lista.error && !lista.data ? (
        <div className="py-16 flex items-center justify-center" role="alert">
          <div className="text-center max-w-sm">
            <span className="w-12 h-12 mx-auto rounded-full bg-coral-soft flex items-center justify-center">
              <WifiOff size={20} className="text-coral" />
            </span>
            <h2 className="font-display font-semibold text-lg mt-4 text-ink">No pudimos cargar el inventario</h2>
            <p className="text-sm text-muted mt-2">{lista.error.message}</p>
            <Button variant="teal" className="mt-5" onClick={lista.reload}>
              Reintentar
            </Button>
          </div>
        </div>
      ) : !lista.data ? (
        <div className="h-80 rounded-2xl bg-border-soft animate-pulse" role="status" aria-label="Cargando inventario" />
      ) : (
        <div className={`space-y-4 transition-opacity ${lista.loading ? 'opacity-60' : ''}`} aria-busy={lista.loading}>
          <Table
            columns={columns}
            data={lista.data.elementos}
            keyFn={(r) => r.varianteId}
            empty={
              busqueda || estado !== 'todos'
                ? 'Ninguna variante coincide con la búsqueda o el filtro.'
                : 'Todavía no hay variantes. Crea un producto para empezar.'
            }
          />
          <Paginacion
            pagina={lista.data.pagina}
            paginasTotales={lista.data.paginasTotales}
            cantidadTotal={lista.data.cantidadTotal}
            nombre="variantes"
            onChange={setPagina}
            disabled={lista.loading}
          />
        </div>
      )}

      {moviendo && (
        <MovimientoDialog
          variante={moviendo}
          onClose={() => setMoviendo(null)}
          onDone={(_, mensaje) => {
            setMoviendo(null)
            setAviso(mensaje)
            lista.reload()
            resumen.reload()
          }}
        />
      )}
    </div>
  )
}
