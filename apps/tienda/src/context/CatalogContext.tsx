import { createContext, useContext, type ReactNode } from 'react'
import { getCatalogo, type PublicProduct } from '@tienda/shared'
import { useAsync } from '../lib/useAsync'

type CatalogValue = {
  products: PublicProduct[]
  loading: boolean
  error: Error | null
  reload: () => void
  /** Ya llegó al menos una respuesta (aunque sea vacía). */
  ready: boolean
}

const Ctx = createContext<CatalogValue | null>(null)

/** El catálogo se pide una sola vez: navegar entre páginas no vuelve a llamar a la API. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const { data, error, loading, reload } = useAsync(getCatalogo)
  return (
    <Ctx.Provider value={{ products: data ?? [], loading, error, reload, ready: data !== undefined }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCatalog(): CatalogValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCatalog debe usarse dentro de <CatalogProvider>')
  return v
}
