import {
  Package,
  Boxes,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
} from 'lucide-react'
import { StatCard } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const movements = [
  { id: '1', type: 'entrada', product: 'Camisa Deportiva Dry-Fit', variant: 'Azul / M', qty: 12, time: 'Hace 20 min', user: 'María P.' },
  { id: '2', type: 'surtido', product: 'Pantalón Cargo Urbano', variant: 'Verde / 32', qty: 8, time: 'Hace 1h', user: 'Carlos R.' },
  { id: '3', type: 'ajuste', product: 'Sudadera Premium', variant: 'Gris / L', qty: -2, time: 'Hace 2h', user: 'Ana S.' },
  { id: '4', type: 'salida', product: 'Chola Deportiva Runner', variant: 'Blanca / 40', qty: 3, time: 'Hace 3h', user: 'Luis M.' },
  { id: '5', type: 'entrada', product: 'Camisa Casual Oxford', variant: 'Blanca / S', qty: 24, time: 'Ayer', user: 'María P.' },
]

const lowStock = [
  { id: '1', name: 'Camisa Lino Premium', variant: 'Arena / M', stock: 2 },
  { id: '2', name: 'Pantalón Formal Slim', variant: 'Negro / 30', stock: 1 },
  { id: '3', name: 'Sudadera Vintage', variant: 'Borgoña / L', stock: 3 },
]

const pendingSurtido = [
  { id: '1', name: 'Chola Casual Canvas', qty: 15 },
  { id: '2', name: 'Camisa Denim Clásica', qty: 9 },
  { id: '3', name: 'Bermuda Cargo Verano', qty: 22 },
]

const movementIcons: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  entrada: { icon: <Plus size={14} />, color: 'var(--color-teal)', bg: 'var(--color-teal-soft)', label: 'Entrada' },
  surtido: { icon: <ArrowRightLeft size={14} />, color: 'var(--color-blue)', bg: 'var(--color-blue-soft)', label: 'Surtido' },
  ajuste: { icon: <RotateCcw size={14} />, color: 'var(--color-amber)', bg: 'var(--color-amber-soft)', label: 'Ajuste' },
  salida: { icon: <XCircle size={14} />, color: 'var(--color-coral)', bg: 'var(--color-coral-soft)', label: 'Salida' },
}

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full">
      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <h2
            className="text-2xl font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
          >
            Buenos días, Ana Sofía
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Aquí está el resumen operativo de hoy — lunes, 29 sep 2026
          </p>
        </div>
        <Button variant="teal" icon={<Plus size={15} />}>
          Registrar movimiento
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          label="Productos activos"
          value="148"
          sub="6 creados este mes"
          accent="var(--color-blue)"
          accentBg="var(--color-blue-soft)"
          icon={<Package size={18} />}
          trend={{ value: '4%', up: true }}
        />
        <StatCard
          label="Unidades en depósito"
          value="2,340"
          sub="Stock físico total"
          accent="var(--color-teal)"
          accentBg="var(--color-teal-soft)"
          icon={<Boxes size={18} />}
          trend={{ value: '8%', up: true }}
        />
        <StatCard
          label="Disponibles para venta"
          value="1,108"
          sub="Surtidos en tienda"
          accent="var(--color-emerald)"
          accentBg="var(--color-emerald-soft)"
          icon={<CheckCircle2 size={18} />}
        />
        <StatCard
          label="Pendientes de surtido"
          value="46"
          sub="En 3 referencias"
          accent="var(--color-amber)"
          accentBg="var(--color-amber-soft)"
          icon={<AlertTriangle size={18} />}
          trend={{ value: '2', up: false }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Recent movements */}
        <div
          className="col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-soft)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: 'var(--color-muted)' }} />
              <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
                Movimientos recientes
              </span>
            </div>
            <button className="text-xs font-medium" style={{ color: 'var(--color-teal)' }}>
              Ver todos →
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-soft)' }}>
            {movements.map((m) => {
              const meta = movementIcons[m.type]
              return (
                <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>
                      {m.product}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {m.variant} · {m.user}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="font-mono font-medium text-sm"
                      style={{ color: m.qty < 0 ? 'var(--color-red)' : 'var(--color-teal)', fontFamily: 'var(--font-mono)' }}
                    >
                      {m.qty > 0 ? '+' : ''}{m.qty}
                    </span>
                    <Badge label={meta.label} tone={m.type === 'entrada' ? 'teal' : m.type === 'surtido' ? 'blue' : m.type === 'ajuste' ? 'amber' : 'coral'} size="sm" />
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{m.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Low stock */}
          <div
            className="rounded-2xl overflow-hidden flex-1"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-soft)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <AlertTriangle size={15} style={{ color: 'var(--color-amber)' }} />
              <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
                Stock crítico
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--color-border-soft)' }}>
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>
                      {p.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {p.variant}
                    </div>
                  </div>
                  <span
                    className="ml-3 font-mono font-semibold text-sm flex-shrink-0"
                    style={{ color: 'var(--color-red)', fontFamily: 'var(--font-mono)' }}
                  >
                    {p.stock} ud
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending surtido */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--color-teal-soft)',
              border: '1px solid var(--color-teal-mid)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-teal-mid)' }}>
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={15} style={{ color: 'var(--color-teal)' }} />
                <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-teal)' }}>
                  Pendiente de surtir
                </span>
              </div>
              <span
                className="text-xs font-semibold font-mono px-2 py-0.5 rounded-full"
                style={{ background: 'var(--color-teal)', color: '#fff', fontFamily: 'var(--font-mono)' }}
              >
                {pendingSurtido.reduce((a, b) => a + b.qty, 0)} ud
              </span>
            </div>
            <div className="px-5 py-3 space-y-2.5">
              {pendingSurtido.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-teal)' }}>
                    {p.name}
                  </span>
                  <span
                    className="text-sm font-mono font-medium"
                    style={{ color: 'var(--color-teal)', fontFamily: 'var(--font-mono)' }}
                  >
                    {p.qty}
                  </span>
                </div>
              ))}
              <Button variant="teal" size="sm" className="w-full mt-2 justify-center">
                Gestionar surtido
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trend bar - decorative */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-soft)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--color-muted)' }} />
            <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              Movimientos de inventario — últimos 7 días
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-teal)' }} />
              Entradas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-blue)' }} />
              Surtidos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--color-coral)' }} />
              Salidas
            </span>
          </div>
        </div>
        <MiniBarChart />
      </div>
    </div>
  )
}

const chartData = [
  { day: 'Lu', entradas: 18, surtidos: 12, salidas: 5 },
  { day: 'Ma', entradas: 24, surtidos: 8, salidas: 3 },
  { day: 'Mi', entradas: 12, surtidos: 20, salidas: 7 },
  { day: 'Ju', entradas: 30, surtidos: 15, salidas: 9 },
  { day: 'Vi', entradas: 22, surtidos: 18, salidas: 6 },
  { day: 'Sa', entradas: 8, surtidos: 6, salidas: 4 },
  { day: 'Do', entradas: 4, surtidos: 3, salidas: 2 },
]

function MiniBarChart() {
  const max = Math.max(...chartData.flatMap((d) => [d.entradas, d.surtidos, d.salidas]))

  return (
    <div className="flex items-end gap-3 h-24">
      {chartData.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-0.5 w-full" style={{ height: 80 }}>
            {([
              { val: d.entradas, color: 'var(--color-teal)' },
              { val: d.surtidos, color: 'var(--color-blue)' },
              { val: d.salidas, color: 'var(--color-coral)' },
            ] as const).map(({ val, color }, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-500"
                style={{
                  height: `${(val / max) * 100}%`,
                  background: color,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  )
}
