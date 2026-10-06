import { useState, type FormEvent } from 'react'
import { Mail, Lock, Eye, EyeOff, Shirt, AlertCircle, Store } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../auth/AuthContext'

type Props = {
  onViewStore: () => void
}

export default function Login({ onViewStore }: Props) {
  const { login, notice, clearNotice } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    clearNotice()
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Escribe tu correo.'
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Revisa el correo: falta algo, como el @ o el dominio.'
    if (!password) next.password = 'Escribe tu contraseña.'
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      await login(email.trim(), password)
      // Al entrar, App deja de mostrar este componente: no hay nada más que hacer aquí.
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'No se pudo entrar. Inténtalo de nuevo.' })
      setLoading(false)
    }
  }

  const aviso = errors.form ?? notice

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(420px,520px)_1fr] bg-surface">
      {/* Formulario */}
      <main className="flex flex-col px-8 sm:px-14 py-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal">
            <Shirt size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold font-display text-ink">Vestir</span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full py-12">
          <h1 className="text-3xl font-semibold font-display text-ink leading-tight">Entra al panel de la tienda</h1>
          <p className="text-sm text-muted mt-2">Usa el correo y la contraseña que te dio el administrador.</p>

          <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
            {aviso && (
              <div role="alert" className="flex items-start gap-2 text-sm rounded-xl px-3.5 py-3 bg-red-soft text-red">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {aviso}
              </div>
            )}
            <Input
              label="Correo"
              type="email"
              autoComplete="username"
              placeholder="nombre@vestir.co"
              icon={<Mail size={15} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              fullWidth
            />
            <div className="relative">
              <Input
                label="Contraseña"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                icon={<Lock size={15} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2 top-[26px] w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-border-soft cursor-pointer focus-visible:outline-2 focus-visible:outline-teal"
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted">¿Problemas para entrar? Habla con el administrador.</p>
        </div>

        <button
          onClick={onViewStore}
          className="self-start inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-teal rounded-lg"
        >
          <Store size={15} />
          Ver el catálogo público
        </button>
      </main>

      {/* Composición: los tres niveles de stock son la idea central del sistema */}
      <aside className="hidden lg:flex relative items-center justify-center overflow-hidden bg-bg" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-teal-mid" />
        <div className="absolute bottom-16 -left-20 w-72 h-72 rounded-[48px] rotate-12 bg-blue-mid" />
        <div className="absolute top-20 left-24 w-40 h-40 rounded-tl-[160px] bg-coral-mid" />
        <div className="absolute bottom-24 right-28 w-56 h-14 rounded-full bg-amber-mid" />
        <div className="absolute bottom-[-60px] right-[-40px] w-64 h-64 rounded-full border-[28px] border-purple-mid" />

        <div className="relative w-[360px] rounded-3xl bg-surface shadow-lg border border-border-soft p-7">
          <div className="text-sm font-semibold font-display text-ink">Cada prenda, en tres niveles</div>
          <div className="mt-6 space-y-5">
            {[
              { label: 'En depósito', w: 'w-full', c: 'bg-blue' },
              { label: 'Surtido en tienda', w: 'w-3/5', c: 'bg-teal' },
              { label: 'Disponible para venta', w: 'w-2/5', c: 'bg-emerald' },
            ].map((r) => (
              <div key={r.label}>
                <div className="text-xs text-muted mb-1.5">{r.label}</div>
                <div className="h-2.5 rounded-full bg-border-soft">
                  <div className={`h-full rounded-full ${r.w} ${r.c}`} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-6 leading-relaxed">
            El cliente solo ve lo que ya está surtido y disponible.
          </p>
        </div>
      </aside>
    </div>
  )
}
