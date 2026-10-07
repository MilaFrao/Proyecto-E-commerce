import { Bell, Search } from 'lucide-react'

type Props = {
  title: string
  subtitle?: string
}

const iconBtn =
  'w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:bg-border-soft transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-teal'

function todayLabel() {
  return new Date().toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TopBar({ title, subtitle }: Props) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b bg-surface border-border-soft">
      <div>
        <h1 className="text-xl font-semibold leading-tight font-display text-ink">{title}</h1>
        {subtitle && <p className="text-sm mt-0.5 text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className={iconBtn} aria-label="Buscar">
          <Search size={17} />
        </button>
        <button className={`${iconBtn} relative`} aria-label="Notificaciones">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-coral" />
        </button>
        <div className="w-px h-5 mx-1 bg-border" />
        <span className="text-xs text-muted">{todayLabel()}</span>
      </div>
    </header>
  )
}
