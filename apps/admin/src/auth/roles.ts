import type { Role } from '../components/layout/Sidebar'
import type { UsuarioApi } from './session'

/**
 * Puente entre los roles del back (admin / inventario / vendedor / cliente)
 * y los del panel (super / inventory / seller). Si hay varios, gana el de mayor poder.
 * Devuelve null si la cuenta no es de personal (p. ej. un cliente).
 */
const MAPA: [string, Role][] = [
  ['admin', 'super'],
  ['inventario', 'inventory'],
  ['vendedor', 'seller'],
]

export function roleOf(u: Pick<UsuarioApi, 'roles'>): Role | null {
  for (const [rolApi, rol] of MAPA) if (u.roles.includes(rolApi)) return rol
  return null
}

export function rolApiDe(role: Role): string {
  return MAPA.find(([, r]) => r === role)![0]
}

export function initialsOf(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const a = partes[0][0]
  const b = partes.length > 1 ? partes[partes.length - 1][0] : (partes[0][1] ?? '')
  return (a + b).toUpperCase()
}
