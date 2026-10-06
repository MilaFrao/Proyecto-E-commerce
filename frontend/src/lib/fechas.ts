/** Fechas en hora local de quien mira la pantalla (el back guarda todo en UTC). */

const DIA = 86_400_000

const hora = (d: Date) => d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: false })

/** Medianoche de hoy, hora local. Sirve para «surtidas hoy» y similares. */
export function inicioDeHoy(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** «Hoy 10:25», «Ayer 18:30» o «10 sept 2026». */
export function fechaRelativa(iso: string | null | undefined, vacio = '—'): string {
  if (!iso) return vacio
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return vacio
  const hoy = inicioDeHoy().getTime()
  if (d.getTime() >= hoy) return `Hoy ${hora(d)}`
  if (d.getTime() >= hoy - DIA) return `Ayer ${hora(d)}`
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Encabezado de grupo por día: «Hoy», «Ayer» o «lunes 5 oct 2026». */
export function etiquetaDia(iso: string): string {
  const d = new Date(iso)
  const hoy = inicioDeHoy().getTime()
  if (d.getTime() >= hoy) return 'Hoy'
  if (d.getTime() >= hoy - DIA) return 'Ayer'
  return d.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
}

export const horaDe = (iso: string) => hora(new Date(iso))
