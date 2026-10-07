import type { ReactNode } from 'react'

/** Marco común de las pantallas de entrada y registro. */
export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-ink text-3xl tracking-tight">{title}</h1>
      <p className="text-muted mt-2">{subtitle}</p>
      <div className="mt-8">{children}</div>
      <p className="mt-6 text-sm text-muted">{footer}</p>
    </div>
  )
}

export const inputClass =
  'w-full h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-teal'

export const submitClass =
  'w-full h-12 rounded-xl bg-ink text-white text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'
