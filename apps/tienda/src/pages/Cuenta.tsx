import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTitle } from '../lib/useTitle'

export default function Cuenta() {
  useTitle('Mi cuenta')
  const { session, ready, logout } = useAuth()
  const location = useLocation()

  if (!ready) return <p className="max-w-md mx-auto px-6 py-16 text-sm text-muted" role="status">Verificando tu sesión…</p>
  if (!session) return <Navigate to="/ingresar" state={{ from: location.pathname }} replace />

  const u = session.usuario
  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-ink text-3xl tracking-tight">Hola, {u.nombre.split(' ')[0]}</h1>
      <dl className="mt-8 rounded-2xl bg-bg p-5 text-sm space-y-3">
        <div>
          <dt className="text-muted">Nombre</dt>
          <dd className="text-ink font-medium">{u.nombre}</dd>
        </div>
        <div>
          <dt className="text-muted">Correo</dt>
          <dd className="text-ink font-medium">{u.correo}</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-muted">Pronto podrás guardar prendas y pedir aviso cuando llegue tu talla.</p>
      <button
        onClick={logout}
        className="mt-8 h-10 px-4 rounded-xl border border-border text-sm font-medium text-ink hover:border-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
