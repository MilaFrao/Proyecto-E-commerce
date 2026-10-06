import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
  onClick?: () => void
  hoverable?: boolean
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  style,
  onClick,
  hoverable,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-xl border border-border-soft shadow-sm ${paddings[padding]} ${
        hoverable
          ? 'cursor-pointer transition-[box-shadow,transform] duration-150 hover:shadow-md hover:-translate-y-px'
          : ''
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

/* Stat card for dashboard metrics */
type StatCardProps = {
  label: string
  value: string | number
  sub?: string
  accent: string
  accentBg: string
  icon: ReactNode
  trend?: { value: string; up: boolean }
}

export function StatCard({ label, value, sub, accent, accentBg, icon, trend }: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentBg, color: accent }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: trend.up ? 'var(--color-emerald-soft)' : 'var(--color-red-soft)',
              color: trend.up ? 'var(--color-emerald)' : 'var(--color-red)',
            }}
          >
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div
          className="text-3xl font-semibold leading-none"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          {value}
        </div>
        <div className="mt-1.5 text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>
          {label}
        </div>
        {sub && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {sub}
          </div>
        )}
      </div>
    </Card>
  )
}
