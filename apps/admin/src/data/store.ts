/* Paletas y tallas para armar variantes en el formulario de producto. */

export const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: 'Negro', hex: '#1A1A1A' },
  { name: 'Blanco', hex: '#F5F5F5' },
  { name: 'Gris', hex: '#9CA3AF' },
  { name: 'Azul marino', hex: '#1E3A5F' },
  { name: 'Azul claro', hex: '#60A5FA' },
  { name: 'Verde militar', hex: '#4A5E3A' },
  { name: 'Borgoña', hex: '#7C2D44' },
  { name: 'Arena', hex: '#D4B896' },
  { name: 'Kaki', hex: '#A0856C' },
  { name: 'Rojo', hex: '#C0392B' },
]

export const SIZE_SETS: Record<string, { label: string; sizes: string[] }> = {
  letras: { label: 'Ropa (XS–XXL)', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  pantalon: { label: 'Pantalón (28–38)', sizes: ['28', '30', '32', '34', '36', '38'] },
  calzado: { label: 'Calzado (36–45)', sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] },
  unica: { label: 'Talla única', sizes: ['Única'] },
}
