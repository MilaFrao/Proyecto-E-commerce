import { useEffect } from 'react'

/** Título de la pestaña por página: «Camisas · Vestir». */
export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Vestir` : 'Vestir'
  }, [title])
}
