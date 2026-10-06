/**
 * Único lugar donde se decide la moneda y cómo se escribe un precio.
 * Si la tienda cambia de moneda, se cambia aquí y en ningún otro sitio.
 */
export const CURRENCY = { symbol: '$', locale: 'es-VE' } as const

export function formatPrice(amount: number): string {
  const hasCents = !Number.isInteger(amount)
  return `${CURRENCY.symbol}${amount.toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}
