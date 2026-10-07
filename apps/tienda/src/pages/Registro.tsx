import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthShell, { inputClass, submitClass } from '../components/AuthShell'
import { mensajeDe, useAuth } from '../auth/AuthContext'
import { useTitle } from '../lib/useTitle'

export default function Registro() {
  useTitle('Crear cuenta')
  const { session, registrar } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/cuenta'
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to={from} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await registrar({ nombre, correo, clave, aceptaTerminos: acepta })
      navigate(from, { replace: true })
    } catch (err) {
      setError(mensajeDe(err))
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Guarda tus prendas favoritas y entérate cuando llegue tu talla."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/ingresar" state={{ from }} className="font-medium text-teal hover:underline">
            Ingresa
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-ink mb-1.5">
            Nombre
          </label>
          <input id="nombre" autoComplete="name" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} />
        </div>
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
          <input id="clave" type="password" autoComplete="new-password" required value={clave} onChange={(e) => setClave(e.target.value)} className={inputClass} aria-describedby="ayuda-clave" />
          <p id="ayuda-clave" className="text-xs text-muted mt-1.5">
            Mínimo 8 caracteres, con letras y números.
          </p>
        </div>
        <label className="flex items-start gap-2.5 text-sm text-ink-2 cursor-pointer">
          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5 accent-[var(--color-teal)]" />
          Acepto los términos y el uso de mis datos para gestionar mi cuenta.
        </label>
        {error && (
          <p role="alert" className="text-sm text-red">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading || !nombre || !correo || !clave || !acepta} className={submitClass}>
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthShell>
  )
}
