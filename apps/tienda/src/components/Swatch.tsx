type Props = {
  hex: string
  name: string
  size?: 'sm' | 'md'
  selected?: boolean
  unavailable?: boolean
  onClick?: () => void
}

const strike =
  'linear-gradient(to top right, transparent calc(50% - 1px), rgba(17,19,24,0.6) 50%, transparent calc(50% + 1px))'

/** Muestra de color. Si el color está agotado en todas sus tallas se tacha en diagonal. */
export default function Swatch({ hex, name, size = 'md', selected, unavailable, onClick }: Props) {
  const dim = size === 'sm' ? 'w-4 h-4' : 'w-9 h-9'
  const body = (
    <span
      className={`relative block rounded-full border border-black/10 overflow-hidden ${dim} ${unavailable ? 'opacity-60' : ''}`}
      style={{ background: hex }}
    >
      {unavailable && <span className="absolute inset-0" style={{ backgroundImage: strike }} />}
    </span>
  )

  if (!onClick) {
    return (
      <span title={unavailable ? `${name} (agotado)` : name} className="inline-flex">
        {body}
        <span className="sr-only">{unavailable ? `${name}, agotado` : name}</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={unavailable ? `${name}, agotado` : name}
      title={unavailable ? `${name} (agotado)` : name}
      className={`rounded-full p-0.5 cursor-pointer transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
        selected ? 'ring-2 ring-ink ring-offset-2' : 'ring-1 ring-transparent hover:ring-border hover:ring-offset-2'
      }`}
    >
      {body}
    </button>
  )
}
