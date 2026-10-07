import { Link } from 'react-router-dom'
import { useTitle } from '../lib/useTitle'

export default function NotFound({ title = 'Esta página no existe', detail = 'Puede que el enlace esté viejo.' }: { title?: string; detail?: string }) {
  useTitle('No encontrado')
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display font-semibold text-xl">{title}</h1>
      <p className="text-sm text-muted mt-2">{detail}</p>
      <Link to="/catalogo" className="inline-block mt-4 text-sm font-medium text-teal hover:underline">
        Ir al catálogo
      </Link>
    </div>
  )
}
