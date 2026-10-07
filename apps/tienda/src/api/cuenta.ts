import { api } from '@tienda/shared'
import type { ClienteApi } from '../auth/session'

export type LoginResponse = { token: string; expiraEn: string; usuario: ClienteApi }

export type NuevaCuenta = { nombre: string; correo: string; clave: string; aceptaTerminos: boolean }

export const registrarCliente = (c: NuevaCuenta) => api.post<LoginResponse>('/clientes/registro', c, { publico: true })

export const loginCliente = (correo: string, clave: string) =>
  api.post<LoginResponse>('/clientes/auth/login', { correo, clave }, { publico: true })

export const miPerfil = () => api.get<ClienteApi>('/clientes/yo')
