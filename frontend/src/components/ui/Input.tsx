import { type InputHTMLAttributes, type ReactNode, useId, useState } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export default function Input({
  label,
  hint,
  error,
  icon,
  iconRight,
  fullWidth,
  className,
  ...props
}: Props) {
  const [focused, setFocused] = useState(false)
  const autoId = useId()
  const id = props.id ?? autoId

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-wide"
          style={{ color: 'var(--color-ink-2)', letterSpacing: '0.02em' }}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span
            className="absolute left-3 flex items-center"
            style={{ color: focused ? 'var(--color-teal)' : 'var(--color-muted)' }}
          >
            {icon}
          </span>
        )}
        <input
          {...props}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? `${id}-msg` : undefined}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className={`w-full text-sm transition-all duration-150 outline-none ${className ?? ''}`}
          style={{
            height: '40px',
            background: 'var(--color-surface)',
            border: `1.5px solid ${error ? 'var(--color-red)' : focused ? 'var(--color-teal)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-ink)',
            paddingLeft: icon ? '36px' : '14px',
            paddingRight: iconRight ? '36px' : '14px',
            fontFamily: 'var(--font-body)',
            boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(239,68,68,0.1)' : 'rgba(13,148,136,0.1)'}` : 'none',
          }}
        />
        {iconRight && (
          <span className="absolute right-3 flex items-center" style={{ color: 'var(--color-muted)' }}>
            {iconRight}
          </span>
        )}
      </div>
      {(hint || error) && (
        <p
          id={`${id}-msg`}
          className="text-xs"
          style={{ color: error ? 'var(--color-red)' : 'var(--color-muted)' }}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  hint?: string
  error?: string
  fullWidth?: boolean
  children: ReactNode
}

export function Select({ label, hint, error, fullWidth, children, ...props }: SelectProps) {
  const [focused, setFocused] = useState(false)
  const autoId = useId()
  const id = props.id ?? autoId
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold tracking-wide" style={{ color: 'var(--color-ink-2)' }}>
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        className="w-full text-sm outline-none appearance-none transition-all duration-150 cursor-pointer"
        style={{
          height: '40px',
          background: 'var(--color-surface)',
          border: `1.5px solid ${error ? 'var(--color-red)' : focused ? 'var(--color-teal)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-ink)',
          padding: '0 36px 0 14px',
          fontFamily: 'var(--font-body)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          boxShadow: focused ? '0 0 0 3px rgba(13,148,136,0.1)' : 'none',
        }}
      >
        {children}
      </select>
      {(hint || error) && (
        <p className="text-xs" style={{ color: error ? 'var(--color-red)' : 'var(--color-muted)' }}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
