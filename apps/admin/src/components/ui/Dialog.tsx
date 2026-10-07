import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  title: string
  description?: ReactNode
  onClose: () => void
  /** Mientras es true no se puede cerrar (Esc, fondo ni X): hay una petición en curso. */
  busy?: boolean
  size?: 'md' | 'lg'
  children: ReactNode
}

/** Diálogo modal accesible: Esc cierra, Tab no se escapa, clic en el fondo cierra. */
export default function Dialog({ title, description, onClose, busy = false, size = 'md', children }: Props) {
  const titleId = useId()
  const box = useRef<HTMLDivElement>(null)
  const busyRef = useRef(busy)
  busyRef.current = busy

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busyRef.current) return onClose()
      if (e.key !== 'Tab' || !box.current) return
      const f = box.current.querySelectorAll<HTMLElement>('input, select, textarea, button:not([disabled])')
      if (f.length === 0) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/50"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full ${size === 'lg' ? 'max-w-xl' : 'max-w-md'} max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-surface shadow-lg border border-border-soft p-6`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold font-display text-ink">
              {title}
            </h2>
            {description && <div className="text-sm text-muted mt-1">{description}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
            className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-muted hover:bg-border-soft cursor-pointer focus-visible:outline-2 focus-visible:outline-teal"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
