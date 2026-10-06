type Tone = 'teal' | 'blue' | 'coral' | 'amber' | 'purple' | 'neutral' | 'red' | 'emerald'
type Size = 'sm' | 'md'

type Props = {
  label: string
  tone?: Tone
  size?: Size
  dot?: boolean
}

const tones: Record<Tone, { bg: string; text: string; dot: string }> = {
  teal: { bg: 'var(--color-teal-soft)', text: 'var(--color-teal)', dot: 'var(--color-teal)' },
  blue: { bg: 'var(--color-blue-soft)', text: 'var(--color-blue)', dot: 'var(--color-blue)' },
  coral: { bg: 'var(--color-coral-soft)', text: 'var(--color-coral)', dot: 'var(--color-coral)' },
  amber: { bg: 'var(--color-amber-soft)', text: 'var(--color-amber)', dot: 'var(--color-amber)' },
  purple: { bg: 'var(--color-purple-soft)', text: 'var(--color-purple)', dot: 'var(--color-purple)' },
  emerald: { bg: 'var(--color-emerald-soft)', text: 'var(--color-emerald)', dot: 'var(--color-emerald)' },
  red: { bg: 'var(--color-red-soft)', text: 'var(--color-red)', dot: 'var(--color-red)' },
  neutral: { bg: 'var(--color-border-soft)', text: 'var(--color-muted)', dot: 'var(--color-muted)' },
}

export default function Badge({ label, tone = 'neutral', size = 'md', dot = false }: Props) {
  const t = tones[tone]
  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium rounded-full"
      style={{
        background: t.bg,
        color: t.text,
        fontSize: size === 'sm' ? '11px' : '12px',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        fontFamily: 'var(--font-body)',
        lineHeight: '1.5',
      }}
    >
      {dot && (
        <span
          className="rounded-full flex-shrink-0"
          style={{ width: 6, height: 6, background: t.dot }}
        />
      )}
      {label}
    </span>
  )
}

/* Stock-specific state badges */
type StockState = 'disponible' | 'bajo' | 'agotado' | 'deposito' | 'surtido'

export function StockBadge({ state }: { state: StockState }) {
  const map: Record<StockState, { label: string; tone: Tone }> = {
    disponible: { label: 'Disponible', tone: 'emerald' },
    bajo: { label: 'Stock bajo', tone: 'amber' },
    agotado: { label: 'Agotado', tone: 'red' },
    deposito: { label: 'En depósito', tone: 'blue' },
    surtido: { label: 'Surtido', tone: 'teal' },
  }
  const { label, tone } = map[state]
  return <Badge label={label} tone={tone} dot />
}

/* Product state badge */
type ProductState = 'activo' | 'inactivo' | 'borrador'

export function ProductBadge({ state }: { state: ProductState }) {
  const map: Record<ProductState, { label: string; tone: Tone }> = {
    activo: { label: 'Activo', tone: 'teal' },
    inactivo: { label: 'Inactivo', tone: 'neutral' },
    borrador: { label: 'Borrador', tone: 'amber' },
  }
  const { label, tone } = map[state]
  return <Badge label={label} tone={tone} dot />
}
