import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertCircle, ArrowLeft, Check, Info, Plus, Upload, WifiOff, X, Circle } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input, { Select } from '../components/ui/Input'
import { COLOR_PRESETS, SIZE_SETS } from '../data/store'
import { formatPrice } from '../lib/money'
import { useAsync } from '../api/useAsync'
import { crearMarca, getCategorias, getMarcas } from '../api/listas'
import { crearProducto, subirImagenProducto } from '../api/productos'

type Props = {
  onBack: () => void
  onSaved: (name: string) => void
}

type Color = { name: string; hex: string }
type Row = { retail: string; wholesale: string; deposito: string }
const EMPTY_ROW: Row = { retail: '', wholesale: '', deposito: '' }

const num = (s: string) => (s.trim() === '' ? NaN : Number(s))
const code = (s: string) => s.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()
const sizeCode = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

/** Lleva al usuario al campo con problema: el botón de crear está en la columna lateral, lejos de los campos. */
const irA = (id: string) => {
  const el = document.getElementById(id)
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  el?.focus({ preventScroll: true })
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const IMAGE_MAX_MB = 5

/** Vacío es válido (hereda el precio base o entra con 0 unidades); si hay algo, debe ser un número válido. */
const emptyOr = (v: string | undefined, ok: (n: number) => boolean) => v === undefined || v.trim() === '' || ok(Number(v))

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Card padding="lg">
      <h2 className="text-base font-semibold font-display text-ink">{title}</h2>
      {hint && <p className="text-sm text-muted mt-1">{hint}</p>}
      <div className="mt-6">{children}</div>
    </Card>
  )
}

const chip =
  'h-9 min-w-11 px-3 rounded-xl text-sm font-medium border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'
const chipOn = 'bg-ink text-white border-ink'
const chipOff = 'bg-surface text-ink-2 border-border hover:border-ink'

const cell =
  'w-full h-9 rounded-md border border-border bg-surface px-2.5 text-sm text-ink outline-none focus:border-teal focus:ring-3 focus:ring-teal/10 placeholder:text-muted/70'

export default function ProductForm({ onBack, onSaved }: Props) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [ref, setRef] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [retail, setRetail] = useState('')
  const [wholesale, setWholesale] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null) // vista previa local, no la URL del servidor
  const [imageError, setImageError] = useState<string | null>(null)

  const [sizeSet, setSizeSet] = useState('letras')
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [customName, setCustomName] = useState('')
  const [customHex, setCustomHex] = useState('#6B7280')
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const [rows, setRows] = useState<Record<string, Row>>({})
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [refError, setRefError] = useState<string | null>(null)

  const listas = useAsync(() => Promise.all([getCategorias(), getMarcas()]))
  const categorias = listas.data?.[0] ?? []
  const marcas = listas.data?.[1] ?? []
  // Marcas creadas durante esta sesión del formulario: si el producto falla y se reintenta, no se vuelven a crear.
  const marcasCreadas = useRef(new Map<string, string>())
  // Foto ya subida: si el producto falla y se reintenta, no se vuelve a subir el mismo archivo.
  const fotoSubida = useRef<{ file: File; url: string } | null>(null)

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl) }, [imageUrl])

  const baseRetail = num(retail)
  const baseWholesale = num(wholesale)

  const toggleSize = (s: string) =>
    setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  const toggleColor = (c: Color) =>
    setColors((cur) => (cur.some((x) => x.name === c.name) ? cur.filter((x) => x.name !== c.name) : [...cur, c]))

  const addCustom = () => {
    const n = customName.trim()
    if (!n || colors.some((c) => c.name.toLowerCase() === n.toLowerCase())) return
    setColors((cur) => [...cur, { name: n, hex: customHex }])
    setCustomName('')
  }

  const changeSizeSet = (key: string) => {
    setSizeSet(key)
    setSizes([])
  }

  /* Matriz color × talla, menos las combinaciones que el usuario quitó.
     Los SKU se asignan sobre la matriz completa (antes de quitar) y se desambiguan si dos colores
     abrevian igual ("Azul" y "Azul marino" → AZU): así quitar una fila no cambia el SKU de las demás. */
  const variants = useMemo(() => {
    const out: { key: string; color: Color; size: string; sku: string }[] = []
    const usados = new Set<string>()
    const prefijo = ref.trim().toUpperCase() || 'REF'
    for (const c of colors)
      for (const s of sizes) {
        const base = `${prefijo}-${code(c.name)}-${sizeCode(s)}`
        let sku = base
        for (let n = 2; usados.has(sku); n++) sku = `${base}-${n}`
        usados.add(sku)
        const key = `${c.name}|${s}`
        if (!removed.has(key)) out.push({ key, color: c, size: s, sku })
      }
    return out
  }, [colors, sizes, removed, ref])

  const setRow = (key: string, patch: Partial<Row>) =>
    setRows((cur) => ({ ...cur, [key]: { ...EMPTY_ROW, ...cur[key], ...patch } }))

  const totalDeposito = variants.reduce((a, v) => a + (Number(rows[v.key]?.deposito) || 0), 0)

  const checks = [
    { label: 'Nombre', ok: name.trim().length > 0 },
    { label: 'Referencia', ok: ref.trim().length > 0 },
    { label: 'Categoría', ok: categoryId !== '' },
    { label: 'Precio al detal', ok: baseRetail > 0 },
    { label: 'Al menos una variante', ok: variants.length > 0 },
  ]
  const wholesaleOk = emptyOr(wholesale, (n) => n >= 0)
  const rowsOk = variants.every((v) => {
    const r = rows[v.key]
    return (
      emptyOr(r?.retail, (n) => n > 0) &&
      emptyOr(r?.wholesale, (n) => n >= 0) &&
      emptyOr(r?.deposito, (n) => Number.isInteger(n) && n >= 0)
    )
  })
  const ready = checks.every((c) => c.ok) && wholesaleOk && rowsOk

  const pickImage = (file: File | undefined) => {
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) return setImageError('Usa una imagen JPG, PNG o WebP.')
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) return setImageError(`La foto pesa más de ${IMAGE_MAX_MB} MB.`)
    setImageError(null)
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file)) // el efecto de arriba libera la vista previa anterior
  }

  /** Marca escrita a mano: si ya existe se usa; si no, se crea en el momento. */
  const resolverMarca = async (): Promise<string | null> => {
    const texto = brand.trim()
    if (!texto) return null
    const clave = texto.toLowerCase()
    const existente = marcas.find((m) => m.nombre.toLowerCase() === clave)
    if (existente) return existente.id
    const creada = marcasCreadas.current.get(clave)
    if (creada) return creada
    const nueva = await crearMarca(texto)
    marcasCreadas.current.set(clave, nueva.id)
    return nueva.id
  }

  const save = async () => {
    setTried(true)
    setFormError(null)
    if (saving) return
    if (!ready) {
      irA(
        !checks[0].ok ? 'producto-nombre'
        : !checks[1].ok ? 'producto-referencia'
        : !checks[2].ok ? 'producto-categoria'
        : !checks[3].ok ? 'producto-precio'
        : !wholesaleOk ? 'producto-precio-mayor'
        : 'producto-variantes',
      )
      return
    }
    setSaving(true)
    try {
      let urlImagen: string | null = null
      if (imageFile) {
        if (fotoSubida.current?.file !== imageFile) fotoSubida.current = { file: imageFile, url: await subirImagenProducto(imageFile) }
        urlImagen = fotoSubida.current.url
      }
      const marcaId = await resolverMarca()
      await crearProducto({
        nombre: name.trim(),
        referencia: ref.trim().toUpperCase(),
        descripcion: description.trim() || null,
        categoriaId: categoryId,
        marcaId,
        precioVenta: baseRetail,
        precioMayorista: Number.isFinite(baseWholesale) ? baseWholesale : 0,
        urlImagen,
        variantes: variants.map((v) => {
          const r = rows[v.key]
          const alt = (x?: string) => (x === undefined || x.trim() === '' ? null : Number(x))
          return {
            codigoSku: v.sku,
            color: v.color.name,
            colorHex: v.color.hex.toUpperCase(),
            talla: v.size,
            cantidadInicial: r?.deposito?.trim() ? Number(r.deposito) : 0,
            precioVentaAlternativo: alt(r?.retail),
            precioMayoristaAlternativo: alt(r?.wholesale),
          }
        }),
      })
      onSaved(name.trim())
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo crear el producto.'
      // El back avisa de la referencia repetida con este mensaje: va junto al campo, que es donde se arregla.
      if (/referencia/i.test(msg)) {
        setRefError(msg)
        irA('producto-referencia')
      } else setFormError(msg)
      setSaving(false)
    }
  }

  const err = (ok: boolean, msg: string) => (tried && !ok ? msg : undefined)

  if (listas.loading && !listas.data) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6" role="status" aria-label="Cargando el formulario">
        <div className="h-64 rounded-2xl bg-border-soft animate-pulse" />
        <div className="h-40 rounded-2xl bg-border-soft animate-pulse" />
      </div>
    )
  }

  if (listas.error && !listas.data) {
    return (
      <div className="p-8 h-full flex items-center justify-center" role="alert">
        <div className="text-center max-w-sm">
          <span className="w-12 h-12 mx-auto rounded-full bg-coral-soft flex items-center justify-center">
            <WifiOff size={20} className="text-coral" />
          </span>
          <h2 className="font-display font-semibold text-lg mt-4 text-ink">No pudimos cargar categorías y marcas</h2>
          <p className="text-sm text-muted mt-2">{listas.error.message}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="outline" onClick={onBack}>Volver</Button>
            <Button variant="teal" onClick={listas.reload}>Reintentar</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-teal"
        >
          <ArrowLeft size={16} /> Volver a productos
        </button>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 mt-5 items-start">
          <div className="space-y-6">
            <Section title="Datos del producto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    id="producto-nombre"
                    label="Nombre"
                    placeholder="Camisa deportiva Dry-Fit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={err(name.trim().length > 0, 'El producto necesita un nombre.')}
                    fullWidth
                  />
                </div>
                <Input
                  id="producto-referencia"
                  label="Referencia"
                  placeholder="CAM-DRY-001"
                  value={ref}
                  onChange={(e) => {
                    setRef(e.target.value.toUpperCase())
                    setRefError(null)
                  }}
                  hint="Se usa para armar el SKU de cada variante."
                  error={refError ?? err(ref.trim().length > 0, 'Escribe una referencia.')}
                  fullWidth
                />
                <div>
                  <Input
                    label="Marca"
                    placeholder="ActiveWear"
                    list="marcas-existentes"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    hint="Elige una existente o escribe una nueva: se crea al guardar."
                    fullWidth
                  />
                  <datalist id="marcas-existentes">
                    {marcas.map((m) => (
                      <option key={m.id} value={m.nombre} />
                    ))}
                  </datalist>
                </div>
                <Select
                  id="producto-categoria"
                  label="Categoría"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  error={err(categoryId !== '', 'Elige una categoría.')}
                  fullWidth
                >
                  <option value="">Elegir…</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="desc" className="text-xs font-semibold text-ink-2">
                    Descripción
                  </label>
                  <textarea
                    id="desc"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Lo que un cliente querría saber antes de probársela."
                    className="w-full rounded-xl border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-teal focus:ring-3 focus:ring-teal/10 resize-y"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Precios base"
              hint="Aplican a todas las variantes, salvo que una tenga su propio precio en la tabla de abajo."
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  id="producto-precio"
                  label="Precio al detal"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={retail}
                  onChange={(e) => setRetail(e.target.value)}
                  error={err(baseRetail > 0, 'El precio al detal debe ser mayor que cero.')}
                  fullWidth
                />
                <Input
                  id="producto-precio-mayor"
                  label="Precio al mayor"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={wholesale}
                  onChange={(e) => setWholesale(e.target.value)}
                  error={err(wholesaleOk, 'El precio al mayor no puede ser negativo.')}
                  fullWidth
                />
              </div>
            </Section>

            <Section title="Foto principal">
              <label
                className={`flex items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-border p-4 cursor-pointer transition-colors hover:border-teal hover:bg-teal-soft focus-within:border-teal`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => pickImage(e.target.files?.[0])}
                />
                <div className="w-20 h-24 rounded-xl bg-bg flex items-center justify-center overflow-hidden flex-shrink-0 text-muted">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={20} />
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-ink">{imageFile?.name ?? 'Subir una foto'}</div>
                  <div className="text-muted mt-0.5">
                    {imageFile ? 'Haz clic para cambiarla.' : `JPG, PNG o WebP de hasta ${IMAGE_MAX_MB} MB. Vertical se ve mejor en el catálogo.`}
                  </div>
                </div>
              </label>
              {imageError && (
                <p role="alert" className="text-xs text-red mt-2">
                  {imageError}
                </p>
              )}
            </Section>

            <div id="producto-variantes" tabIndex={-1} className="scroll-mt-8 outline-none">
            <Section
              title="Variantes"
              hint="Elige colores y tallas; la tabla se arma sola con todas las combinaciones."
            >
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-semibold text-ink-2 mb-2.5">Colores</div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((c) => {
                      const on = colors.some((x) => x.name === c.name)
                      return (
                        <button
                          key={c.name}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleColor(c)}
                          className={`inline-flex items-center gap-2 h-9 pl-2 pr-3 rounded-xl text-sm border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                            on ? 'border-ink bg-ink text-white' : 'border-border bg-surface text-ink-2 hover:border-ink'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full border border-black/10" style={{ background: c.hex }} />
                          {c.name}
                        </button>
                      )
                    })}
                    {colors
                      .filter((c) => !COLOR_PRESETS.some((p) => p.name === c.name))
                      .map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          aria-pressed
                          onClick={() => toggleColor(c)}
                          title="Quitar color"
                          className="inline-flex items-center gap-2 h-9 pl-2 pr-3 rounded-xl text-sm border border-ink bg-ink text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                        >
                          <span className="w-5 h-5 rounded-full border border-white/30" style={{ background: c.hex }} />
                          {c.name}
                          <X size={13} className="opacity-70" />
                        </button>
                      ))}
                  </div>
                  <div className="flex items-end gap-2 mt-3 max-w-sm">
                    <input
                      type="color"
                      aria-label="Tono del color nuevo"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border bg-surface p-1 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Input
                        placeholder="Otro color, por ejemplo Mostaza"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustom()
                          }
                        }}
                        fullWidth
                      />
                    </div>
                    <Button variant="outline" icon={<Plus size={15} />} onClick={addCustom} disabled={!customName.trim()}>
                      Agregar
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4 mb-2.5">
                    <div className="text-xs font-semibold text-ink-2">Tallas</div>
                    <div className="w-52">
                      <Select value={sizeSet} onChange={(e) => changeSizeSet(e.target.value)} aria-label="Tipo de tallas" fullWidth>
                        {Object.entries(SIZE_SETS).map(([k, s]) => (
                          <option key={k} value={k}>
                            {s.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_SETS[sizeSet].sizes.map((s) => {
                      const on = sizes.includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleSize(s)}
                          className={`${chip} ${on ? chipOn : chipOff}`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {tried && variants.length === 0 && (
                  <p role="alert" className="text-xs text-red">
                    Elige al menos un color y una talla para crear variantes.
                  </p>
                )}

                {variants.length > 0 && (
                  <div>
                    <div className="flex items-baseline justify-between mb-2.5">
                      <div className="text-xs font-semibold text-ink-2">{variants.length} variantes</div>
                      <div className="text-xs text-muted">El stock inicial entra al depósito. Surtir a tienda se hace en Surtido.</div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-border-soft">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-bg text-left text-xs font-semibold text-muted">
                            <th className="px-4 py-3">Variante</th>
                            <th className="px-3 py-3">SKU</th>
                            <th className="px-3 py-3 w-28">Detal</th>
                            <th className="px-3 py-3 w-28">Mayor</th>
                            <th className="px-3 py-3 w-28">En depósito</th>
                            <th className="px-2 py-3 w-10">
                              <span className="sr-only">Quitar</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v) => (
                            <tr key={v.key} className="border-t border-border-soft">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0" style={{ background: v.color.hex }} />
                                  <span className="text-ink font-medium">
                                    {v.color.name} · {v.size}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 font-mono text-xs text-muted">{v.sku}</td>
                              <td className="px-3 py-2.5">
                                <input
                                  className={cell}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  aria-label={`Precio al detal de ${v.color.name} ${v.size}`}
                                  placeholder={baseRetail > 0 ? formatPrice(baseRetail) : 'Base'}
                                  value={rows[v.key]?.retail ?? ''}
                                  onChange={(e) => setRow(v.key, { retail: e.target.value })}
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  className={cell}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  aria-label={`Precio al mayor de ${v.color.name} ${v.size}`}
                                  placeholder={baseWholesale > 0 ? formatPrice(baseWholesale) : 'Base'}
                                  value={rows[v.key]?.wholesale ?? ''}
                                  onChange={(e) => setRow(v.key, { wholesale: e.target.value })}
                                />
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  className={cell}
                                  type="number"
                                  min="0"
                                  step="1"
                                  aria-label={`Unidades en depósito de ${v.color.name} ${v.size}`}
                                  placeholder="0"
                                  value={rows[v.key]?.deposito ?? ''}
                                  onChange={(e) => setRow(v.key, { deposito: e.target.value })}
                                />
                              </td>
                              <td className="px-2 py-2.5">
                                <button
                                  type="button"
                                  title="Quitar esta combinación"
                                  aria-label={`Quitar ${v.color.name} ${v.size}`}
                                  onClick={() => setRemoved((cur) => new Set(cur).add(v.key))}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-red-soft hover:text-red transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-teal"
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {tried && !rowsOk && (
                      <p role="alert" className="text-xs text-red mt-2.5">
                        Revisa la tabla: los precios deben ser mayores que cero (o quedar vacíos) y el stock, un número entero desde 0.
                      </p>
                    )}
                    <p className="text-xs text-muted mt-2.5">
                      Deja el precio vacío para que la variante use el precio base. Solo llénalo si cuesta distinto, por ejemplo una talla grande.
                    </p>
                    {removed.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setRemoved(new Set())}
                        className="mt-2 text-xs font-medium text-teal hover:underline cursor-pointer"
                      >
                        Restaurar combinaciones quitadas
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Section>
            </div>
          </div>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-8 space-y-4">
            <Card padding="md">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold font-display text-ink">Resumen</h2>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Variantes</dt>
                  <dd className="font-medium text-ink">{variants.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Unidades en depósito</dt>
                  <dd className="font-medium text-ink font-mono">{totalDeposito}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Unidades surtidas</dt>
                  <dd className="font-medium text-ink font-mono">0</dd>
                </div>
              </dl>

              <ul className="mt-5 pt-5 border-t border-border-soft space-y-2">
                {checks.map((c) => (
                  <li key={c.label} className={`flex items-center gap-2 text-sm ${c.ok ? 'text-ink' : 'text-muted'}`}>
                    {c.ok ? (
                      <Check size={15} className="text-teal" />
                    ) : (
                      <Circle size={15} className="text-border" />
                    )}
                    {c.label}
                  </li>
                ))}
              </ul>

              {formError && (
                <div role="alert" className="mt-5 flex items-start gap-2 text-sm rounded-xl px-3.5 py-3 bg-red-soft text-red">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="mt-6">
                <Button variant="teal" size="lg" loading={saving} onClick={save} className="w-full">
                  Crear producto
                </Button>
              </div>
            </Card>

            <div className="flex gap-3 rounded-2xl bg-teal-soft p-4 text-sm text-ink-2">
              <Info size={16} className="text-teal mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                Aún no saldrá en el catálogo público. Se publica cuando al menos una variante tenga unidades surtidas en tienda.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
