import { api } from '@tienda/shared'

/** Elemento de las listas compartidas (categorías, marcas). */
export type ElementoLista = { id: string; nombre: string; padreId: string | null }

export const getCategorias = () => api.get<ElementoLista[]>('/listas/categorias')
export const getMarcas = () => api.get<ElementoLista[]>('/listas/marcas')
export const crearMarca = (nombre: string) => api.post<ElementoLista>('/listas/marcas', { nombre })
