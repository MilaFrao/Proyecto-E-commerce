import { type ReactNode, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal' | 'outline'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  children?: ReactNode
}

/* Hover y foco por clases: nada de onMouseEnter. `enabled:` evita hover en deshabilitados. */
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white enabled:hover:bg-[#2A2E38]',
  teal: 'bg-teal text-white enabled:hover:bg-[#0B8276]',
  secondary: 'bg-blue-soft text-blue enabled:hover:bg-blue-mid',
  ghost: 'bg-transparent text-ink-2 enabled:hover:bg-border-soft',
  outline: 'bg-transparent text-ink border border-border enabled:hover:bg-border-soft',
  danger: 'bg-red-soft text-red enabled:hover:bg-[#FEE2E2]',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-sm rounded-xl gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  children,
  disabled,
  className = '',
  type = 'button',
  ...props
}: Props) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium font-body select-none transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" />
          <path d="M21 12a9 9 0 00-9-9" />
        </svg>
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  )
}
