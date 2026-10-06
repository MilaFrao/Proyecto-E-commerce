/** Forma del usuario tal como lo devuelve el back (UsuarioDto). */
export type UsuarioApi = {
  id: string
  nombre: string
  correo: string
  roles: string[]
  estaActivo: boolean
  ultimoAcceso: string | null
}

export type Session = {
  token: string
  expiraEn: string // ISO 8601, UTC
  usuario: UsuarioApi
}

const KEY = 'tienda.sesion'

/** localStorage puede estar bloqueado (modo privado, políticas): nunca debe tumbar la app. */
export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Session
    if (!s?.token || !s?.usuario || isExpired(s)) {
      clearSession()
      return null
    }
    return s
  } catch {
    return null
  }
}

export function saveSession(s: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* sin almacenamiento: la sesión vive solo en memoria */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nada que limpiar */
  }
}

export function isExpired(s: Pick<Session, 'expiraEn'>): boolean {
  const t = Date.parse(s.expiraEn)
  return Number.isNaN(t) || t <= Date.now()
}
