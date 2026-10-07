const LETTERS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/** Tallas de letra primero (XS→XXL), luego las numéricas, y «Única» al final. */
export function sizeOrder(a: string, b: string): number {
  const ia = LETTERS.indexOf(a)
  const ib = LETTERS.indexOf(b)
  if (ia >= 0 && ib >= 0) return ia - ib
  if (ia >= 0) return -1
  if (ib >= 0) return 1
  if (a === 'Única') return 1
  if (b === 'Única') return -1
  return Number(a) - Number(b)
}
