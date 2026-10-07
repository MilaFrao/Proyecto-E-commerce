import { useState } from 'react'
import { Shirt } from 'lucide-react'
import { categoryMeta } from '../lib/categories'

type Props = { image?: string; alt: string; category: string; className?: string; iconSize?: number }

/** Foto sobre un fondo teñido con el color de la categoría; si no hay foto o falla, queda el fondo con un icono. */
export default function ProductImage({ image, alt, category, className = '', iconSize = 40 }: Props) {
  const [failed, setFailed] = useState(false)
  const meta = categoryMeta(category)
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: meta.mid }}>
      {image && !failed ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ color: meta.ink }} role="img" aria-label={alt}>
          <Shirt size={iconSize} strokeWidth={1.25} />
        </div>
      )}
    </div>
  )
}
