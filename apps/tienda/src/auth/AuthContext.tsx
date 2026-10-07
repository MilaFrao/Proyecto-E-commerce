import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError, configureAuth } from '@tienda/shared'
import { loginCliente, miPerfil, registrarCliente, type LoginResponse, type NuevaCuenta } from '../api/cuenta'
import { clearSession, readSession, saveSession, SESSION_KEY, type Session } from './session'

type AuthState = {
  session: Session | null
  /** false mientras se confirma con el back que la sesión guardada sigue vigente. */
  ready: boolean
  login: (correo: string, clave: string) => Promise<void>
  registrar: (c: NuevaCuenta) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession())
  const [ready, setReady] = useState(() => session === null)

  // El token se actualiza durante el render para que ninguna petición hija salga sin él.
  const tokenRef = useRef<string | null>(null)
  tokenRef.current = session?.token ?? null

  const terminar = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  useLayoutEffect(() => {
    configureAuth({ getToken: () => tokenRef.current, onUnauthorized: terminar })
  }, [terminar])

  // Al cargar: confirmar con el back que el token guardado sigue valiendo.
  useEffect(() => {
    if (session === null) return
    let cancelado = false
    miPerfil().then(
      (u) => {
        if (cancelado) return
        setSession((s) => {
          if (!s) return s
          const next = { ...s, usuario: u }
          saveSession(next)
          return next
        })
        setReady(true)
      },
      () => {
        // Un 401 ya cerró la sesión. Si el servidor no responde se conserva: caerse el back no saca a nadie.
        if (!cancelado) setReady(true)
      },
    )
    return () => {
      cancelado = true
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cerrar sesión justo cuando vence el token.
  useEffect(() => {
    if (!session) return
    const ms = Date.parse(session.expiraEn) - Date.now()
    if (Number.isNaN(ms)) return
    const t = setTimeout(terminar, Math.min(Math.max(ms, 0), 2_000_000_000))
    return () => clearTimeout(t)
  }, [session, terminar])

  // Si otra pestaña cierra o abre sesión, esta también.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) setSession(readSession())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const iniciar = useCallback((r: LoginResponse) => {
    const s: Session = { token: r.token, expiraEn: r.expiraEn, usuario: r.usuario }
    saveSession(s)
    setSession(s)
    setReady(true)
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      session,
      ready,
      login: async (correo, clave) => iniciar(await loginCliente(correo, clave)),
      registrar: async (c) => iniciar(await registrarCliente(c)),
      logout: terminar,
    }),
    [session, ready, iniciar, terminar],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return v
}

export function mensajeDe(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Algo salió mal. Inténtalo de nuevo.'
}
