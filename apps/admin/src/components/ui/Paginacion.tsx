import Button from './Button'

type Props = {
  pagina: number
  paginasTotales: number
  cantidadTotal: number
  /** Cómo se llaman los elementos: «variantes», «movimientos»… */
  nombre: string
  onChange: (pagina: number) => void
  disabled?: boolean
}

export default function Paginacion({ pagina, paginasTotales, cantidadTotal, nombre, onChange, disabled }: Props) {
  if (paginasTotales <= 1) {
    return <p className="text-xs text-muted">{cantidadTotal} {nombre}</p>
  }
  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Paginación">
      <p className="text-xs text-muted">
        Página {pagina} de {paginasTotales} · {cantidadTotal} {nombre}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={disabled || pagina <= 1} onClick={() => onChange(pagina - 1)}>
          Anterior
        </Button>
        <Button size="sm" variant="outline" disabled={disabled || pagina >= paginasTotales} onClick={() => onChange(pagina + 1)}>
          Siguiente
        </Button>
      </div>
    </nav>
  )
}
