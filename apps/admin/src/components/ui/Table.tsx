import { type ReactNode } from 'react'

type Column<T> = {
  key: string
  label: string
  width?: string
  align?: 'left' | 'right' | 'center'
  render: (row: T) => ReactNode
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  keyFn: (row: T) => string
  onRowClick?: (row: T) => void
  empty?: ReactNode
}

export default function Table<T>({ columns, data, keyFn, onRowClick, empty }: Props<T>) {
  return (
    <div
      className="w-full overflow-x-auto"
      style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-soft)' }}
    >
      <table className="w-full" style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase"
                style={{
                  color: 'var(--color-muted)',
                  width: col.width,
                  textAlign: col.align ?? 'left',
                  background: 'var(--color-bg)',
                  letterSpacing: '0.05em',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-sm"
                style={{ color: 'var(--color-muted)', background: 'var(--color-surface)' }}
              >
                {empty ?? 'Sin resultados'}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyFn(row)}
                onClick={() => onRowClick?.(row)}
                className={`bg-surface border-b border-border-soft transition-colors duration-100 ${
                  onRowClick ? 'cursor-pointer hover:bg-bg' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-5 py-3.5 text-sm"
                    style={{ color: 'var(--color-ink-2)', textAlign: col.align ?? 'left' }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
