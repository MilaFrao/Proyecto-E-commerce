import { useCallback, useEffect, useRef, useState } from 'react'

/** Carga asíncrona con estados de cargando / error / datos. Sin librerías. */
export function useAsync<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const fnRef = useRef(fn)
  fnRef.current = fn
  const run = useRef(0)

  const load = useCallback(() => {
    const id = ++run.current
    setLoading(true)
    setError(null)
    fnRef.current().then(
      (d) => run.current === id && (setData(d), setLoading(false)),
      (e) => run.current === id && (setError(e instanceof Error ? e : new Error(String(e))), setLoading(false)),
    )
  }, [])

  useEffect(() => {
    load()
    return () => {
      run.current++ // descarta respuestas de un componente desmontado
    }
  }, [load])

  return { data, error, loading, reload: load }
}
