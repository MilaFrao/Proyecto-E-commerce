import ProductImage from '../../components/store/ProductImage'
import Swatch from '../../components/store/Swatch'
import { formatPrice } from '../../lib/money'
import type { PublicProduct } from '../../lib/stock'

type Props = { product: PublicProduct; onOpen: (id: string) => void }

export default function ProductCard({ product: p, onOpen }: Props) {
  const range = p.minPrice !== p.maxPrice
  const shown = p.colors.slice(0, 5)
  const extra = p.colors.length - shown.length

  return (
    <button
      onClick={() => onOpen(p.id)}
      className="group text-left rounded-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
    >
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
        <ProductImage
          image={p.image}
          alt={p.name}
          category={p.category}
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="pt-3.5 px-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-medium text-ink leading-snug">{p.name}</h3>
          <span className="text-sm font-semibold text-ink whitespace-nowrap">
            {range && <span className="font-normal text-muted">Desde </span>}
            {formatPrice(p.minPrice)}
          </span>
        </div>
        <div className="text-sm text-muted mt-0.5">{p.brand}</div>

        <div className="flex items-center gap-1.5 mt-2.5">
          {shown.map((c) => (
            <Swatch key={c.name} hex={c.hex} name={c.name} size="sm" unavailable={!c.available} />
          ))}
          {extra > 0 && <span className="text-xs text-muted ml-0.5">+{extra}</span>}
        </div>

        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-2 text-xs">
          {p.sizes.map((s) => (
            <span key={s.size} className={s.available ? 'text-ink-2' : 'text-muted/60 line-through'}>
              {s.size}
              {!s.available && <span className="sr-only"> (agotada)</span>}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
