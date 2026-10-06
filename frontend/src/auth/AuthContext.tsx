import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api, ApiError, configureAuth } from '../api/client'
import type { Role } from '../components/layout/Sidebar'
import { roleOf } from './roles'
import { clearSession, isExpired, readSession, saveSession, type Session, type UsuarioApi } from './session'

type LoginResponse = { token: string; expiraEn: string; usuario: UsuarioApi }

type AuthState = {
  session: Session | null
  /** Rol del panel derivado de la sesión; null si no hay sesión. */
  role: Role | null
  /** false mientras se confirma con el back que la sesión guardada sigue vigente. */
  ready: boolean
  /** Mensaje para mostrar en el login (p. ej. «Tu sesión expiró»). */
  notice: string | null
  login: (correo: string, clave: string) => Promise<void>
  logout: () => void
  clearNotice: () => void
}

const Ctx = createContext<AuthState | null>(null)

const SIN_ACCESO = 'Esta cuenta no tiene acceso al panel.'
const EXPIRADA = 'Tu sesión expiró. Entra de nuevo.'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession())
  const [ready, setReady] = useState(() => session === null)
  const [notice, setNotice] = useState<string | null>(null)

  // El token se actualiza durante el render para que ninguna petición hija salga sin él.
  const tokenRef = useRef<string | null>(null)
  tokenRef.current = session?.token ?? null

  const terminar = useCallback((mensaje: string | null) => {
    clearSession()
    setSession(null)
    setNotice(mensaje)
  }, [])

  useLayoutEffect(() => {
    configureAuth({
      getToken: () => tokenRef.current,
      onUnauthorized: () => terminar(EXPIRADA),
    })
  }, [terminar])

  // Al cargar la página: confirmar con el back que el token guardado sigue valiendo.
  useEffect(() => {
    if (session === null) return
    let cancelado = false
    api.get<UsuarioApi>('/auth/yo').then(
      (u) => {
        if (cancelado) return
        if (!roleOf(u)) return terminar(SIN_ACCESO)
        setSession((s) => {
          if (!s) return s
          const next = { ...s, usuario: u }
          saveSession(next)
          return next
        })
        setReady(true)
      },
      () => {
        if (cancelado) return
        // Un 401 ya cerró la sesión vía onUnauthorized. Si el servidor no responde,
        // se conserva la sesión: caerse el back no es motivo para sacar al usuario.
        setReady(true)
      },
    )
    return () => {
      cancelado = true
    }
    // Solo al montar: reaccionar a cada cambio de sesión repetiría la validación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cerrar sesión justo cuando vence el token, sin esperar al siguiente 401.
  useEffect(() => {
    if (!session) return
    const ms = Date.parse(session.expiraEn) - Date.now()
    if (Number.isNaN(ms)) return
    const t = setTimeout(() => terminar(EXPIRADA), Math.min(Math.max(ms, 0), 2_000_000_000))
    return () => clearTimeout(t)
  }, [session, terminar])

  // Si otra pestaña cierra la sesión, esta también.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tienda.sesion' && e.newValue === null) setSession(null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async (correo: string, clave: string) => {
    const r = await api.post<LoginResponse>('/auth/login', { correo, clave }, { publico: true })
    if (!roleOf(r.usuario)) throw new ApiError(403, SIN_ACCESO)
    const s: Session = { token: r.token, expiraEn: r.expiraEn, usuario: r.usuario }
    if (isExpired(s)) throw new ApiError(500, 'El servidor emitió una sesión ya vencida. Revisa la hora del servidor.')
    tokenRef.current = s.token
    saveSession(s)
    setNotice(null)
    setSession(s)
    setReady(true)
  }, [])

  const logout = useCallback(() => terminar(null), [terminar])
  const clearNotice = useCallback(() => setNotice(null), [])

  const value = useMemo<AuthState>(
    () => ({ session, role: session ? roleOf(session.usuario) : null, ready, notice, login, logout, clearNotice }),
    [session, ready, notice, login, logout, clearNotice],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  return v
}
