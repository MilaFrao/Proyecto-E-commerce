import { WifiOff } from 'lucide-react'

/** Esqueleto mientras llega el catálogo: mismas proporciones que las tarjetas reales. */
export function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10" role="status" aria-label="Cargando catálogo">
      <div className="h-8 w-48 rounded-lg bg-border-soft animate-pulse" />
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] rounded-2xl bg-border-soft animate-pulse" />
            <div className="mt-3 h-4 w-3/4 rounded bg-border-soft animate-pulse" />
            <div className="mt-2 h-4 w-1/3 rounded bg-border-soft animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CatalogError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center" role="alert">
      <span className="w-12 h-12 mx-auto rounded-full bg-coral-soft flex items-center justify-center">
        <WifiOff size={20} className="text-coral" />
      </span>
      <h1 className="font-display font-semibold text-xl mt-5">No pudimos cargar el catálogo</h1>
      <p className="text-sm text-muted mt-2">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 h-10 px-5 rounded-xl bg-teal text-white text-sm font-medium cursor-pointer hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        Reintentar
      </button>
    </div>
  )
}
