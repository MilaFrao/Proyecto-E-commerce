import { api } from '@tienda/shared'
import type { UsuarioApi } from '../auth/session'

/** Solo el administrador puede llamar a estos endpoints (política Admin en el back). */
export const listarUsuarios = () => api.get<UsuarioApi[]>('/usuarios')

export type NuevoUsuario = {
  nombre: string
  correo: string
  clave: string
  /** Nombre del rol en el back: admin | inventario | vendedor */
  rol: string
}

export const crearUsuario = (u: NuevoUsuario) => api.post<UsuarioApi>('/usuarios', u)

export const cambiarEstadoUsuario = (id: string, activo: boolean) =>
  api.post<void>(`/usuarios/${id}/${activo ? 'activar' : 'desactivar'}`)
