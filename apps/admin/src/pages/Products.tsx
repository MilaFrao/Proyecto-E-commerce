import { useState } from 'react'
import { Plus, Search, Package, WifiOff, Check, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge, { ProductBadge, StockBadge } from '../components/ui/Badge'
import Table from '../components/ui/Table'
import Card from '../components/ui/Card'
import { formatPrice } from '@tienda/shared'
import { useAsync } from '../api/useAsync'
import { cambiarEstadoProducto, listarProductos, type ProductoDto } from '../api/productos'

/** Sin umbral de «stock bajo» todavía (decisión pendiente): el estado sale solo de dónde están las unidades. */
function stockState(p: ProductoDto): 'disponible' | 'deposito' | 'agotado' {
  if (p.unidadesTienda > 0) return 'disponible'
  if (p.unidadesDeposito > 0) return 'deposito'
  return 'agotado'
}

export default function Products({ onNew }: { onNew: () => void }) {
  const { data, error, loading, reload } = useAsync(listarProductos)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  if (loading && !data) {
    return (
      <div className="p-8 space-y-6" role="status" aria-label="Cargando productos">
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-border-soft animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-border-soft animate-pulse" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-8 h-full flex items-center justify-center" role="alert">
        <div className="text-center max-w-sm">
          <span className="w-12 h-12 mx-auto rounded-full bg-coral-soft flex items-center justify-center">
            <WifiOff size={20} className="text-coral" />
          </span>
          <h2 className="font-display font-semibold text-lg mt-4 text-ink">No pudimos cargar los productos</h2>
          <p className="text-sm text-muted mt-2">{error.message}</p>
          <Button variant="teal" className="mt-5" onClick={reload}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const products = data?.productos ?? []
  const categories = ['Todas', ...Array.from(new Set(products.map((p) => p.nombreCategoria))).sort((a, b) => a.localeCompare(b, 'es'))]

  const q = search.trim().toLowerCase()
  const filtered = products.filter((p) => {
    const matchSearch =
      q === '' ||
      p.nombre.toLowerCase().includes(q) ||
      p.referencia.toLowerCase().includes(q) ||
      (p.nombreMarca ?? '').toLowerCase().includes(q)
    return matchSearch && (category === 'Todas' || p.nombreCategoria === category)
  })

  const cambiarEstado = async (p: ProductoDto, activo: boolean) => {
    setTrabajando(p.id)
    setConfirmando(null)
    setAviso(null)
    try {
      await cambiarEstadoProducto(p.id, activo)
      setAviso({
        tipo: 'ok',
        texto: activo ? `«${p.nombre}» volvió al catálogo interno.` : `«${p.nombre}» ya no sale en el catálogo público.`,
      })
      reload()
    } catch (e) {
      setAviso({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo cambiar el estado.' })
    } finally {
      setTrabajando(null)
    }
  }

  const columns = [
    {
      key: 'product',
      label: 'Producto',
      render: (row: ProductoDto) => (
        <div className="flex items-center gap-3">
          {row.urlImagenPrincipal ? (
            <img src={row.urlImagenPrincipal} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0 bg-bg" />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-blue-soft)', color: 'var(--color-blue)' }}
            >
              <Package size={16} />
            </div>
          )}
          <div>
            <div className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>
              {row.nombre}
            </div>
            <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
              {row.referencia}
              {row.nombreMarca ? ` · ${row.nombreMarca}` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (row: ProductoDto) => <Badge label={row.nombreCategoria} tone="neutral" size="sm" />,
    },
    {
      key: 'price',
      label: 'Precio',
      align: 'right' as const,
      render: (row: ProductoDto) => (
        <span className="font-mono text-sm font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
          {formatPrice(row.precioVenta)}
        </span>
      ),
    },
    {
      key: 'variants',
      label: 'Variantes',
      align: 'center' as const,
      render: (row: ProductoDto) => (
        <span className="font-mono text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
          {row.cantidadVariantes}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Depósito / Tienda',
      align: 'center' as const,
      render: (row: ProductoDto) => (
        <div className="flex items-center justify-center gap-1.5 font-mono text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--color-blue)' }}>{row.unidadesDeposito}</span>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <span style={{ color: 'var(--color-teal)' }}>{row.unidadesTienda}</span>
        </div>
      ),
    },
    {
      key: 'stockState',
      label: 'Stock',
      render: (row: ProductoDto) => <StockBadge state={stockState(row)} />,
    },
    {
      key: 'state',
      label: 'Estado',
      render: (row: ProductoDto) => <ProductBadge state={row.estado === 'Activo' ? 'activo' : 'inactivo'} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (row: ProductoDto) =>
        row.estado === 'Inactivo' ? (
          <Button size="sm" variant="outline" loading={trabajando === row.id} onClick={() => cambiarEstado(row, true)}>
            Reactivar
          </Button>
        ) : confirmando === row.id ? (
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs text-ink-2">¿Desactivar?</span>
            <Button size="sm" variant="danger" onClick={() => cambiarEstado(row, false)}>
              Sí
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmando(null)}>
              No
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" loading={trabajando === row.id} onClick={() => setConfirmando(row.id)}>
            Desactivar
          </Button>
        ),
    },
  ]

  const activos = products.filter((p) => p.estado === 'Activo')

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total productos', value: products.length, color: 'var(--color-ink)' },
          { label: 'Activos', value: activos.length, color: 'var(--color-teal)' },
          { label: 'Sin surtir (solo en depósito)', value: activos.filter((p) => stockState(p) === 'deposito').length, color: 'var(--color-blue)' },
          { label: 'Agotados', value: activos.filter((p) => stockState(p) === 'agotado').length, color: 'var(--color-red)' },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <div className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      {aviso && (
        <div
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
          className={`flex items-center gap-2 text-sm rounded-xl px-3.5 py-3 ${aviso.tipo === 'error' ? 'bg-red-soft text-red' : 'bg-teal-soft text-teal'}`}
        >
          {aviso.tipo === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          {aviso.texto}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, referencia o marca…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
            fullWidth
          />
        </div>
        <Button variant="teal" icon={<Plus size={15} />} onClick={onNew}>
          Nuevo producto
        </Button>
      </div>

      {/* Category tabs */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-teal ${
                category === cat ? 'bg-ink text-white' : 'text-muted hover:bg-border-soft hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        keyFn={(r) => r.id}
        empty={
          products.length === 0
            ? 'Todavía no hay productos. Crea el primero con «Nuevo producto».'
            : 'Ningún producto coincide con la búsqueda.'
        }
      />

      {data && data.total > products.length && (
        <p className="text-xs text-muted">
          Mostrando {products.length} de {data.total} productos. Afina la búsqueda para encontrar el resto.
        </p>
      )}
    </div>
  )
}
