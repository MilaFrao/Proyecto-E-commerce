import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import Dialog from '../ui/Dialog'
import Input, { Select } from '../ui/Input'
import { crearUsuario } from '../../api/usuarios'

type Props = {
  onClose: () => void
  /** Se llama con el nombre del usuario recién creado. */
  onCreated: (nombre: string) => void
}

type Errors = { nombre?: string; correo?: string; clave?: string; form?: string }

/** Mismas reglas que valida el back; aquí solo se adelantan para no hacer viajar un error evitable. */
function validar(nombre: string, correo: string, clave: string): Errors {
  const e: Errors = {}
  const n = nombre.trim()
  if (n.length < 2 || n.length > 100) e.nombre = 'El nombre debe tener entre 2 y 100 caracteres.'
  if (!/^\S+@\S+\.\S+$/.test(correo.trim())) e.correo = 'Revisa el correo: falta algo, como el @ o el dominio.'
  if (clave.length < 8) e.clave = 'Mínimo 8 caracteres.'
  else if (!/[A-Za-z]/.test(clave) || !/\d/.test(clave)) e.clave = 'Debe incluir al menos una letra y un número.'
  return e
}

export default function NuevoUsuarioDialog({ onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [rol, setRol] = useState('vendedor')
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = validar(nombre, correo, clave)
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      const u = await crearUsuario({ nombre: nombre.trim(), correo: correo.trim(), clave, rol })
      onCreated(u.nombre)
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'No se pudo crear el usuario.' })
      setSaving(false)
    }
  }

  return (
    <Dialog
      title="Nuevo usuario"
      description="Entrégale la contraseña en persona; no se puede volver a ver."
      onClose={onClose}
      busy={saving}
    >
        <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-4">
          {errors.form && (
            <div role="alert" className="flex items-start gap-2 text-sm rounded-xl px-3.5 py-3 bg-red-soft text-red">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {errors.form}
            </div>
          )}
          <Input
            label="Nombre"
            autoFocus
            autoComplete="off"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={errors.nombre}
            fullWidth
          />
          <Input
            label="Correo"
            type="email"
            autoComplete="off"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            error={errors.correo}
            fullWidth
          />
          <Input
            label="Contraseña inicial"
            type="password"
            autoComplete="new-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            error={errors.clave}
            hint={errors.clave ? undefined : 'Mínimo 8 caracteres, con letras y números.'}
            fullWidth
          />
          <Select label="Rol" value={rol} onChange={(e) => setRol(e.target.value)} fullWidth>
            <option value="vendedor">Vendedor: consulta comercial</option>
            <option value="inventario">Inventario: stock y productos</option>
            <option value="admin">Superusuario: acceso total</option>
          </Select>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="teal" loading={saving}>
              Crear usuario
            </Button>
          </div>
        </form>
    </Dialog>
  )
}
