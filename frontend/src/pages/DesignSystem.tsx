import { Search, Plus, Package, Boxes, AlertTriangle, ArrowRightLeft, Mail, Lock } from 'lucide-react'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Badge, { StockBadge, ProductBadge } from '../components/ui/Badge'
import Card, { StatCard } from '../components/ui/Card'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3
          className="text-sm font-semibold uppercase tracking-widest flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', letterSpacing: '0.1em' }}
        >
          {title}
        </h3>
        <div className="flex-1 h-px" style={{ background: 'var(--color-border-soft)' }} />
      </div>
      {children}
    </div>
  )
}

export default function DesignSystem() {
  return (
    <div className="p-8 space-y-10 overflow-y-auto h-full max-w-4xl">
      <div>
        <h2
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          Design System
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Componentes, tokens y estados del sistema operativo Vestir
        </p>
      </div>

      {/* Typography */}
      <Section title="Tipografía">
        <Card padding="lg">
          <div className="space-y-4">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>display / Outfit</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.2 }}>
                Panel operativo Vestir
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>heading / Outfit 500</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: 'var(--color-ink)' }}>
                Gestión de inventario y productos
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>body / Inter 400</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.6 }}>
                El sistema diferencia claramente entre existencia física en depósito, unidades surtidas en tienda y disponibilidad real para venta.
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>mono / JetBrains Mono</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-muted)' }}>
                CAM-DRY-001 · $89,000 · 12 ud · SKU-ref-0042
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* Color palette */}
      <Section title="Paleta de colores">
        <Card padding="md">
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: 'Teal / Inventario', bg: 'var(--color-teal)', soft: 'var(--color-teal-soft)' },
              { name: 'Blue / Productos', bg: 'var(--color-blue)', soft: 'var(--color-blue-soft)' },
              { name: 'Coral / Usuarios', bg: 'var(--color-coral)', soft: 'var(--color-coral-soft)' },
              { name: 'Amber / Alertas', bg: 'var(--color-amber)', soft: 'var(--color-amber-soft)' },
              { name: 'Purple / Reportes', bg: 'var(--color-purple)', soft: 'var(--color-purple-soft)' },
              { name: 'Emerald / Activo', bg: 'var(--color-emerald)', soft: 'var(--color-emerald-soft)' },
              { name: 'Red / Error', bg: 'var(--color-red)', soft: 'var(--color-red-soft)' },
              { name: 'Ink / Base', bg: 'var(--color-ink)', soft: 'var(--color-bg)' },
            ].map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex h-10 rounded-xl overflow-hidden">
                  <div className="w-1/2" style={{ background: c.bg }} />
                  <div className="w-1/2 border-r border-b border-t" style={{ background: c.soft, borderColor: 'var(--color-border-soft)' }} />
                </div>
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{c.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Buttons */}
      <Section title="Botones">
        <Card padding="md">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primario</Button>
              <Button variant="teal" icon={<Plus size={15} />}>Crear producto</Button>
              <Button variant="secondary" icon={<Package size={15} />}>Secundario</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Eliminar</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="teal" size="sm">Pequeño</Button>
              <Button variant="teal" size="md">Mediano</Button>
              <Button variant="teal" size="lg">Grande</Button>
              <Button variant="primary" loading>Cargando</Button>
              <Button variant="primary" disabled>Desactivado</Button>
            </div>
          </div>
        </Card>
      </Section>

      {/* Inputs */}
      <Section title="Inputs y selects">
        <Card padding="md">
          <div className="grid grid-cols-2 gap-5">
            <Input label="Nombre del producto" placeholder="Ej: Camisa Deportiva Dry-Fit" fullWidth />
            <Input label="SKU" placeholder="CAM-DRY-001" icon={<Package size={15} />} fullWidth />
            <Input label="Email" placeholder="ana@vestir.co" icon={<Mail size={15} />} type="email" fullWidth />
            <Input label="Contraseña" placeholder="••••••••" icon={<Lock size={15} />} type="password" fullWidth />
            <Input label="Búsqueda" placeholder="Buscar producto…" icon={<Search size={15} />} hint="Busca por nombre, SKU o categoría" fullWidth />
            <Input label="Con error" placeholder="Precio" error="El precio debe ser mayor a 0" fullWidth />
            <Select label="Categoría" fullWidth>
              <option>Seleccionar categoría</option>
              <option>Camisas</option>
              <option>Pantalones</option>
              <option>Calzado</option>
            </Select>
            <Select label="Estado" fullWidth>
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Borrador</option>
            </Select>
          </div>
        </Card>
      </Section>

      {/* Badges */}
      <Section title="Badges y estados">
        <Card padding="md">
          <div className="space-y-5">
            <div>
              <div className="text-xs mb-3 font-medium" style={{ color: 'var(--color-muted)' }}>
                Tonos generales
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge label="Teal" tone="teal" dot />
                <Badge label="Blue" tone="blue" dot />
                <Badge label="Coral" tone="coral" dot />
                <Badge label="Amber" tone="amber" dot />
                <Badge label="Purple" tone="purple" dot />
                <Badge label="Emerald" tone="emerald" dot />
                <Badge label="Red" tone="red" dot />
                <Badge label="Neutral" tone="neutral" dot />
              </div>
            </div>
            <div>
              <div className="text-xs mb-3 font-medium" style={{ color: 'var(--color-muted)' }}>
                Estados de stock
              </div>
              <div className="flex flex-wrap gap-2">
                <StockBadge state="disponible" />
                <StockBadge state="bajo" />
                <StockBadge state="agotado" />
                <StockBadge state="deposito" />
                <StockBadge state="surtido" />
              </div>
            </div>
            <div>
              <div className="text-xs mb-3 font-medium" style={{ color: 'var(--color-muted)' }}>
                Estados de producto
              </div>
              <div className="flex flex-wrap gap-2">
                <ProductBadge state="activo" />
                <ProductBadge state="inactivo" />
                <ProductBadge state="borrador" />
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* Cards */}
      <Section title="Cards y métricas">
        <div className="grid grid-cols-2 gap-5">
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
            label="En depósito"
            value="2,340"
            sub="Stock físico"
            accent="var(--color-teal)"
            accentBg="var(--color-teal-soft)"
            icon={<Boxes size={18} />}
          />
          <StatCard
            label="Pendientes de surtir"
            value="46"
            sub="3 referencias urgentes"
            accent="var(--color-amber)"
            accentBg="var(--color-amber-soft)"
            icon={<AlertTriangle size={18} />}
            trend={{ value: '2', up: false }}
          />
          <StatCard
            label="Movimientos hoy"
            value="23"
            sub="Entradas, surtidos y ajustes"
            accent="var(--color-purple)"
            accentBg="var(--color-purple-soft)"
            icon={<ArrowRightLeft size={18} />}
          />
        </div>
      </Section>

      {/* Border radius / shadows */}
      <Section title="Radios y sombras">
        <Card padding="md">
          <div className="flex items-end gap-5">
            {[
              { label: 'sm · 8px', r: 'var(--radius-sm)', size: 48 },
              { label: 'md · 12px', r: 'var(--radius-md)', size: 56 },
              { label: 'lg · 16px', r: 'var(--radius-lg)', size: 64 },
              { label: 'xl · 20px', r: 'var(--radius-xl)', size: 72 },
              { label: '2xl · 24px', r: 'var(--radius-2xl)', size: 80 },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div
                  style={{
                    width: item.size,
                    height: item.size,
                    borderRadius: item.r,
                    background: 'var(--color-teal-soft)',
                    border: '2px solid var(--color-teal-mid)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <span className="text-xs text-center" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <div className="pb-8" />
    </div>
  )
}
