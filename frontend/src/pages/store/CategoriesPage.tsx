import { ArrowUpRight, Footprints, Shirt, ShoppingBag, Snowflake, Sparkles, Package } from 'lucide-react'
import type { ReactNode } from 'react'
import { CATEGORIES } from '../../data/store'
import type { PublicProduct } from '../../lib/stock'

type Props = { products: PublicProduct[]; onPick: (c: string) => void }

const icons: Record<string, ReactNode> = {
  Camisas: <Shirt size={26} strokeWidth={1.5} />,
  Pantalones: <Package size={26} strokeWidth={1.5} />,
  Sudaderas: <Snowflake size={26} strokeWidth={1.5} />,
  Calzado: <Footprints size={26} strokeWidth={1.5} />,
  'Ropa interior': <Sparkles size={26} strokeWidth={1.5} />,
  Accesorios: <ShoppingBag size={26} strokeWidth={1.5} />,
}

export default function CategoriesPage({ products, onPick }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-10">
      <h1 className="font-display font-semibold text-ink text-4xl tracking-tight">Categorías</h1>
      <p className="text-muted mt-2">Elige una y ve solo lo que hay disponible en tienda.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {CATEGORIES.map((c) => {
          const n = products.filter((p) => p.category === c.name).length
          const empty = n === 0
          return (
            <button
              key={c.name}
              disabled={empty}
              onClick={() => onPick(c.name)}
              className="group relative overflow-hidden text-left rounded-3xl p-7 h-48 flex flex-col justify-between transition-shadow enabled:hover:shadow-md enabled:cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              style={{ background: c.soft }}
            >
              <div
                className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full transition-transform duration-300 group-hover:scale-110"
                style={{ background: c.mid }}
                aria-hidden="true"
              />
              <div className="relative w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-sm" style={{ color: c.ink }}>
                {icons[c.name]}
              </div>
              <div className="relative flex items-end justify-between">
                <div>
                  <div className="font-display font-semibold text-xl text-ink">{c.name}</div>
                  <div className="text-sm text-ink-2 mt-0.5">
                    {empty ? 'Sin prendas disponibles' : `${n} ${n === 1 ? 'prenda' : 'prendas'}`}
                  </div>
                </div>
                {!empty && <ArrowUpRight size={20} className="text-ink-2" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
