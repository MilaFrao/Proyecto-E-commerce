import { useState } from 'react'
import { ArrowLeft, Check, Store, X } from 'lucide-react'
import ProductImage from '../../components/store/ProductImage'
import Swatch from '../../components/store/Swatch'
import ProductCard from './ProductCard'
import { formatPrice } from '../../lib/money'
import type { PublicProduct } from '../../lib/stock'

type Props = {
  product: PublicProduct
  related: PublicProduct[]
  onBack: () => void
  onOpen: (id: string) => void
}

export default function ProductDetail({ product: p, related, onBack, onOpen }: Props) {
  const firstAvailable = p.colors.find((c) => c.available) ?? p.colors[0]
  const [color, setColor] = useState(firstAvailable.name)
  const [size, setSize] = useState<string | null>(p.sizes.length === 1 && p.sizes[0].available ? p.sizes[0].size : null)

  const forColor = p.variants.filter((v) => v.color === color)
  const selected = size ? forColor.find((v) => v.size === size) : undefined
  const colorMeta = p.colors.find((c) => c.name === color)!

  const pickColor = (name: string) => {
    setColor(name)
    // Si la talla elegida no existe disponible en el color nuevo, se limpia.
    const v = p.variants.find((x) => x.color === name && x.size === size)
    if (!v || !v.available) setSize(null)
  }

  const priceLabel = selected ? (
    formatPrice(selected.price)
  ) : p.minPrice !== p.maxPrice ? (
    <>
      <span className="text-lg font-normal text-muted">Desde </span>
      {formatPrice(p.minPrice)}
    </>
  ) : (
    formatPrice(p.minPrice)
  )

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-6">
      <nav aria-label="Ruta" className="flex items-center gap-2 text-sm text-muted">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-teal"
        >
          <ArrowLeft size={15} /> Catálogo
        </button>
        <span aria-hidden="true">/</span>
        <span>{p.category}</span>
      </nav>

      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-16 mt-6">
        <ProductImage
          image={p.image}
          alt={p.name}
          category={p.category}
          iconSize={72}
          className="aspect-[4/5] rounded-3xl"
        />

        <div className="md:py-4 max-w-lg">
          <div className="text-sm text-muted">
            {p.brand}
          </div>
          <h1 className="font-display font-semibold text-ink text-4xl leading-tight tracking-tight mt-2">{p.name}</h1>
          <div className="font-display font-semibold text-ink text-3xl mt-4">{priceLabel}</div>

          <p className="text-ink-2 leading-relaxed mt-5">{p.description}</p>

          {/* Color */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm font-semibold text-ink">Color</span>
              <span className="text-sm text-muted">
                {color}
                {!colorMeta.available && ' · agotado'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {p.colors.map((c) => (
                <Swatch
                  key={c.name}
                  hex={c.hex}
                  name={c.name}
                  selected={color === c.name}
                  unavailable={!c.available}
                  onClick={() => pickColor(c.name)}
                />
              ))}
            </div>
          </div>

          {/* Talla */}
          <div className="mt-7">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm font-semibold text-ink">Talla</span>
              <span className="text-xs text-muted">Las tachadas están agotadas en este color</span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Talla">
              {forColor.map((v) => {
                const on = size === v.size
                return (
                  <button
                    key={v.id}
                    disabled={!v.available}
                    aria-pressed={on}
                    onClick={() => setSize(v.size)}
                    title={v.available ? undefined : 'Agotada'}
                    className={`h-12 min-w-14 px-4 rounded-xl text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                      !v.available
                        ? 'border-border-soft bg-bg text-muted/60 line-through cursor-not-allowed'
                        : on
                          ? 'bg-ink text-white border-ink cursor-pointer'
                          : 'bg-surface text-ink border-border hover:border-ink cursor-pointer'
                    }`}
                  >
                    {v.size}
                    {!v.available && <span className="sr-only"> (agotada)</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Disponibilidad: nunca cantidades */}
          <div role="status" className="mt-6 min-h-6 text-sm">
            {selected ? (
              <span className="inline-flex items-center gap-2 text-emerald font-medium">
                <Check size={16} /> Disponible en tienda
              </span>
            ) : !colorMeta.available ? (
              <span className="inline-flex items-center gap-2 text-red font-medium">
                <X size={16} /> Este color está agotado por ahora
              </span>
            ) : (
              <span className="text-muted">Elige una talla para confirmar que está en tienda.</span>
            )}
          </div>

          <div className="mt-8 flex gap-3 rounded-2xl bg-bg p-4 text-sm text-ink-2">
            <Store size={18} className="text-muted mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              Pasa por la tienda a probártela. La compra en línea llegará más adelante.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20" aria-label="Más de esta categoría">
          <h2 className="font-display font-semibold text-xl text-ink mb-6">Más en {p.category.toLowerCase()}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
