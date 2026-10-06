import { useState } from 'react'
import { Search, Tag, Ruler, Palette, Package } from 'lucide-react'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { formatPrice } from '../lib/money'

type Variant = {
  color: string
  hex: string
  tallas: { talla: string; disponible: number }[]
}

type Product = {
  id: string
  name: string
  brand: string
  ref: string
  category: string
  price: number
  description: string
  variants: Variant[]
  image: string
}

const products: Product[] = [
  {
    id: '1',
    name: 'Camisa Deportiva Dry-Fit',
    brand: 'ActiveWear',
    ref: 'CAM-DRY-001',
    category: 'Camisas',
    price: 22,
    description: 'Camisa de alto rendimiento con tecnología Dry-Fit. Tejido transpirable ideal para actividades deportivas y uso casual.',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop&auto=format',
    variants: [
      { color: 'Azul Marino', hex: '#1E3A5F', tallas: [{ talla: 'S', disponible: 5 }, { talla: 'M', disponible: 12 }, { talla: 'L', disponible: 3 }, { talla: 'XL', disponible: 0 }] },
      { color: 'Negro', hex: '#1A1A1A', tallas: [{ talla: 'S', disponible: 2 }, { talla: 'M', disponible: 8 }, { talla: 'L', disponible: 0 }, { talla: 'XL', disponible: 4 }] },
      { color: 'Blanco', hex: '#F5F5F5', tallas: [{ talla: 'S', disponible: 0 }, { talla: 'M', disponible: 6 }, { talla: 'L', disponible: 9 }, { talla: 'XL', disponible: 2 }] },
    ],
  },
  {
    id: '2',
    name: 'Pantalón Cargo Urbano',
    brand: 'UrbanCo',
    ref: 'PAN-CAR-001',
    category: 'Pantalones',
    price: 36,
    description: 'Pantalón estilo cargo con múltiples bolsillos y corte moderno. Fabricado en tela resistente con elasticidad cómoda.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop&auto=format',
    variants: [
      { color: 'Verde Militar', hex: '#4A5E3A', tallas: [{ talla: '28', disponible: 3 }, { talla: '30', disponible: 8 }, { talla: '32', disponible: 6 }, { talla: '34', disponible: 2 }] },
      { color: 'Negro', hex: '#1A1A1A', tallas: [{ talla: '28', disponible: 0 }, { talla: '30', disponible: 4 }, { talla: '32', disponible: 10 }, { talla: '34', disponible: 5 }] },
    ],
  },
  {
    id: '3',
    name: 'Sudadera Premium Fleece',
    brand: 'WarmBase',
    ref: 'SUD-PRE-001',
    category: 'Sudaderas',
    price: 44,
    description: 'Sudadera de felpa premium con interior suave. Capucha ajustable y bolsillo canguro. Ideal para clima frío.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=400&fit=crop&auto=format',
    variants: [
      { color: 'Gris Melange', hex: '#9CA3AF', tallas: [{ talla: 'S', disponible: 0 }, { talla: 'M', disponible: 2 }, { talla: 'L', disponible: 1 }, { talla: 'XL', disponible: 0 }] },
      { color: 'Borgoña', hex: '#7C2D44', tallas: [{ talla: 'S', disponible: 0 }, { talla: 'M', disponible: 0 }, { talla: 'L', disponible: 3 }, { talla: 'XL', disponible: 2 }] },
    ],
  },
  {
    id: '4',
    name: 'Chola Deportiva Runner',
    brand: 'RunStep',
    ref: 'CHO-RUN-001',
    category: 'Calzado',
    price: 80,
    description: 'Zapatilla de running con suela amortiguada y parte superior en malla transpirable. Diseño ergonómico para largas distancias.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format',
    variants: [
      { color: 'Blanco/Azul', hex: '#DBEAFE', tallas: [{ talla: '38', disponible: 2 }, { talla: '40', disponible: 5 }, { talla: '42', disponible: 8 }, { talla: '44', disponible: 3 }] },
      { color: 'Negro/Rojo', hex: '#1A1A1A', tallas: [{ talla: '38', disponible: 0 }, { talla: '40', disponible: 3 }, { talla: '42', disponible: 6 }, { talla: '44', disponible: 4 }] },
    ],
  },
]

export default function Consulta() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [activeVariant, setActiveVariant] = useState(0)

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.ref.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (p: Product) => {
    setSelected(p)
    setActiveVariant(0)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: search + list */}
      <div
        className="w-80 flex-shrink-0 flex flex-col border-r"
        style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-surface)' }}
      >
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
          <Input
            placeholder="Buscar prenda…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
            fullWidth
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer border-b"
              style={{
                borderColor: 'var(--color-border-soft)',
                background: selected?.id === p.id ? 'var(--color-teal-soft)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (selected?.id !== p.id)
                  e.currentTarget.style.background = 'var(--color-bg)'
              }}
              onMouseLeave={(e) => {
                if (selected?.id !== p.id)
                  e.currentTarget.style.background = 'transparent'
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: 'var(--color-bg)' }}
              >
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium text-sm truncate"
                  style={{ color: selected?.id === p.id ? 'var(--color-teal)' : 'var(--color-ink)' }}
                >
                  {p.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{p.brand}</span>
                  <span
                    className="text-xs font-mono"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
                  >
                    {p.ref}
                  </span>
                </div>
              </div>
              <span
                className="text-xs font-mono font-medium flex-shrink-0"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}
              >
                {formatPrice(p.price)}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
              Sin resultados para "{search}"
            </div>
          )}
        </div>
      </div>

      {/* Right: product detail */}
      <div className="flex-1 overflow-y-auto p-8">
        {selected ? (
          <ProductDetail
            product={selected}
            activeVariant={activeVariant}
            onVariantChange={setActiveVariant}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-border-soft)' }}
            >
              <Package size={28} style={{ color: 'var(--color-muted)' }} />
            </div>
            <div className="text-center">
              <div className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>
                Selecciona una prenda
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                Busca y selecciona para consultar disponibilidad y tallas
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductDetail({
  product,
  activeVariant,
  onVariantChange,
}: {
  product: Product
  activeVariant: number
  onVariantChange: (i: number) => void
}) {
  const variant = product.variants[activeVariant]

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex gap-6">
        <div
          className="w-32 h-32 rounded-2xl flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--color-bg)', boxShadow: 'var(--shadow-md)' }}
        >
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-2 flex-wrap">
            <h2
              className="text-xl font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
            >
              {product.name}
            </h2>
            <Badge label={product.category} tone="blue" size="sm" />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{product.brand}</span>
            <span
              className="text-sm font-mono"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
            >
              Ref. {product.ref}
            </span>
          </div>
          <div
            className="mt-3 text-3xl font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
          >
            {formatPrice(product.price)}
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
            {product.description}
          </p>
        </div>
      </div>

      {/* Colors */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={15} style={{ color: 'var(--color-muted)' }} />
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
            Colores disponibles
          </span>
        </div>
        <div className="flex items-center gap-3">
          {product.variants.map((v, i) => (
            <button
              key={v.color}
              onClick={() => onVariantChange(i)}
              className="flex flex-col items-center gap-1.5 cursor-pointer"
              title={v.color}
            >
              <div
                className="w-9 h-9 rounded-xl transition-all duration-150"
                style={{
                  background: v.hex,
                  boxShadow: i === activeVariant
                    ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${v.hex}`
                    : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                  transform: i === activeVariant ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              <span
                className="text-xs"
                style={{ color: i === activeVariant ? 'var(--color-ink)' : 'var(--color-muted)' }}
              >
                {v.color}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tallas + disponibilidad */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Ruler size={15} style={{ color: 'var(--color-muted)' }} />
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
            Tallas — {variant.color}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {variant.tallas.map((t) => {
            const available = t.disponible > 0
            return (
              <div
                key={t.talla}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl"
                style={{
                  background: available ? 'var(--color-teal-soft)' : 'var(--color-border-soft)',
                  border: `1.5px solid ${available ? 'var(--color-teal-mid)' : 'var(--color-border-soft)'}`,
                }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{ color: available ? 'var(--color-teal)' : 'var(--color-muted)' }}
                >
                  {t.talla}
                </span>
                <span
                  className="font-mono text-xs"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: available ? 'var(--color-teal)' : 'var(--color-muted)',
                  }}
                >
                  {available ? `${t.disponible} ud` : 'Agotado'}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--color-muted)' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-teal)' }} />
            Con stock disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-border)' }} />
            Agotado
          </span>
        </div>
      </Card>

      {/* Info adicional */}
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={15} style={{ color: 'var(--color-muted)' }} />
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
            Información adicional
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Marca', value: product.brand },
            { label: 'Categoría', value: product.category },
            { label: 'Referencia', value: product.ref },
            { label: 'Colores disponibles', value: `${product.variants.length} colores` },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-xs mb-0.5" style={{ color: 'var(--color-muted)' }}>
                {item.label}
              </div>
              <div className="font-medium" style={{ color: 'var(--color-ink)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
