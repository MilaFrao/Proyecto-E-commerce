/** Sesión del cliente guardada en el navegador (decisión 018: versión simple, igual que el panel). */
export type ClienteApi = {
  id: string
  nombre: string
  correo: string
  roles: string[]
  estaActivo: boolean
  ultimoAcceso: string | null
}

export type Session = { token: string; expiraEn: string; usuario: ClienteApi }

const KEY = 'tienda.cliente'

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Session
    if (!s?.token || !s.usuario || isExpired(s)) return null
    return s
  } catch {
    return null
  }
}

export function saveSession(s: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* sin almacenamiento: la sesión dura lo que dure la pestaña */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nada que limpiar */
  }
}

export function isExpired(s: Session): boolean {
  const t = Date.parse(s.expiraEn)
  return Number.isNaN(t) || t <= Date.now()
}

export const SESSION_KEY = KEY
