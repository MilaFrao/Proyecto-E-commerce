/**
 * Único punto por donde el front habla con el back.
 * En desarrollo Vite redirige /api al backend (vite.config.ts → proxy).
 *
 * La sesión se conecta desde AuthContext con configureAuth(): así este archivo
 * no depende de React y el token se agrega solo a cada petición.
 */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

type AuthHooks = {
  getToken: () => string | null
  onUnauthorized: () => void
}
let hooks: AuthHooks = { getToken: () => null, onUnauthorized: () => {} }

export function configureAuth(h: AuthHooks) {
  hooks = h
}

type Options = {
  /** Petición sin sesión (login, catálogo público): no lleva token y un 401 no cierra sesión. */
  publico?: boolean
}

const MENSAJES: Record<number, string> = {
  401: 'Tu sesión expiró. Entra de nuevo.',
  403: 'No tienes permiso para hacer esto.',
  429: 'Demasiados intentos. Espera un minuto e inténtalo otra vez.',
}

async function request<T>(path: string, init: RequestInit = {}, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {}
  // Con FormData el navegador arma solo el Content-Type (lleva el boundary del multipart).
  if (!(init.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const token = opts.publico ? null : hooks.getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`/api${path}`, { ...init, headers })
  } catch {
    // fetch solo lanza si no hay conexión con el servidor
    throw new ApiError(0, 'No se pudo conectar con el servidor.')
  }

  if (!res.ok) {
    // El back responde { error: "..." } en 400 y 404 con mensaje
    const body = await res.json().catch(() => null)
    if (res.status === 401 && !opts.publico) {
      hooks.onUnauthorized()
      throw new ApiError(401, MENSAJES[401])
    }
    throw new ApiError(res.status, body?.error ?? MENSAJES[res.status] ?? `Error ${res.status}`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const api = {
  get: <T>(path: string, opts?: Options) => request<T>(path, {}, opts),
  post: <T>(path: string, body?: unknown, opts?: Options) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }, opts),
  /** Subida de archivos (multipart/form-data). */
  upload: <T>(path: string, form: FormData, opts?: Options) => request<T>(path, { method: 'POST', body: form }, opts),
}
