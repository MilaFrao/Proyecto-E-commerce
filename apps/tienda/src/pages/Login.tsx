import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthShell, { inputClass, submitClass } from '../components/AuthShell'
import { mensajeDe, useAuth } from '../auth/AuthContext'
import { useTitle } from '../lib/useTitle'

export default function Login() {
  useTitle('Ingresar')
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/cuenta'
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to={from} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(correo, clave)
      navigate(from, { replace: true })
    } catch (err) {
      setError(mensajeDe(err))
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Ingresar"
      subtitle="Entra a tu cuenta de Vestir."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" state={{ from }} className="font-medium text-teal hover:underline">
            Crea una
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-ink mb-1.5">
            Correo
          </label>
          <input id="correo" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="clave" className="block text-sm font-medium text-ink mb-1.5">
            Clave
          </label>
          <input id="clave" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} className={inputClass} />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading || !correo || !clave} className={submitClass}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthShell>
  )
}
