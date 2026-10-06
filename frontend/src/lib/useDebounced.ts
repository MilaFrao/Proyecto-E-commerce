import { useEffect, useState } from 'react'

/** Devuelve `value` solo cuando deja de cambiar durante `ms`: evita una petición por cada tecla. */
export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}
