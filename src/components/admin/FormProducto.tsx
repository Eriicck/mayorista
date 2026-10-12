import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowUp, ImagePlus, X } from 'lucide-react'
import { slug } from '../../lib/catalogo'
import { formatoPrecio } from '../../lib/precios'
import type { Producto } from '../../lib/tipos'

interface Props {
  producto: Producto | null
  categorias: string[]
  idsUsados: string[]
  onGuardar: (p: Producto) => void
  onCancelar: () => void
}

// En el formulario los números se manejan como texto para poder dejar campos vacíos
type Borrador = {
  nombre: string; marca: string; categoria: string; subcategoria: string; descripcion: string
  retiro: string; bulto: string; pallet: string; unidadesPorCaja: string; cajasPorPallet: string; stock: string; oferta: string
  masVendido: boolean; visible: boolean; imagenes: string[]
}

const aBorrador = (p: Producto | null): Borrador => ({
  nombre: p?.nombre ?? '', marca: p?.marca ?? '', categoria: p?.categoria ?? '', subcategoria: p?.subcategoria ?? '', descripcion: p?.descripcion ?? '',
  retiro: p ? String(p.precios.retiro) : '', bulto: p ? String(p.precios.bulto) : '', pallet: p?.precios.pallet ? String(p.precios.pallet) : '',
  unidadesPorCaja: p ? String(p.unidadesPorCaja) : '1', cajasPorPallet: p?.cajasPorPallet ? String(p.cajasPorPallet) : '', stock: p ? String(p.stock) : '0',
  oferta: p?.oferta ? String(p.oferta) : '', masVendido: !!p?.masVendido, visible: p?.visible ?? true, imagenes: p?.imagenes ?? [],
})

const num = (s: string) => Number(s.replace(/\./g, '').replace(',', '.'))

function validar(b: Borrador, esNuevo: boolean, idsUsados: string[]) {
  const e: Partial<Record<keyof Borrador, string>> = {}
  if (b.nombre.trim().length < 3) e.nombre = 'Escribí un nombre (mínimo 3 letras).'
  else if (esNuevo && idsUsados.includes(slug(b.nombre))) e.nombre = 'Ya existe un producto con ese nombre.'
  if (!b.marca.trim()) e.marca = 'Falta la marca.'
  if (!b.categoria.trim()) e.categoria = 'Falta la categoría.'
  if (!(num(b.retiro) > 0)) e.retiro = 'Tiene que ser mayor a 0.'
  if (!(num(b.bulto) > 0)) e.bulto = 'Tiene que ser mayor a 0.'
  if (b.pallet && !(num(b.pallet) > 0)) e.pallet = 'Dejalo vacío o poné un precio.'
  if (!(Number.isInteger(num(b.unidadesPorCaja)) && num(b.unidadesPorCaja) >= 1)) e.unidadesPorCaja = 'Número entero, 1 o más.'
  if (b.cajasPorPallet && !(Number.isInteger(num(b.cajasPorPallet)) && num(b.cajasPorPallet) >= 1)) e.cajasPorPallet = 'Número entero o vacío.'
  if (!(Number.isInteger(num(b.stock)) && num(b.stock) >= 0)) e.stock = 'Número entero, 0 o más.'
  if (b.oferta && !(num(b.oferta) >= 0 && num(b.oferta) <= 90)) e.oferta = 'Entre 0 y 90.'
  return e
}

const claseInput = (error?: string) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-1 ${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900'}`

function Campo({ id, etiqueta, error, ayuda, children, className = '' }: { id: string; etiqueta: string; error?: string; ayuda?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600">{etiqueta}</label>
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : ayuda && <p className="mt-1 text-xs text-gray-500">{ayuda}</p>}
    </div>
  )
}

export default function FormProducto({ producto, categorias, idsUsados, onGuardar, onCancelar }: Props) {
  const [b, setB] = useState<Borrador>(() => aBorrador(producto))
  const [errores, setErrores] = useState<ReturnType<typeof validar>>({})
  const [nuevaImagen, setNuevaImagen] = useState('')
  const esNuevo = !producto

  const set = (k: keyof Borrador) => (e: { target: { value: string } }) => setB({ ...b, [k]: e.target.value })
  const input = (k: keyof Borrador, extra: Record<string, unknown> = {}) => ({ id: k, value: b[k] as string, onChange: set(k), className: claseInput(errores[k]), 'aria-invalid': !!errores[k] || undefined, ...extra })

  const agregarImagen = () => {
    const url = nuevaImagen.trim()
    if (!/^(https?:\/\/|\/)/.test(url)) return
    setB({ ...b, imagenes: [...b.imagenes, url] })
    setNuevaImagen('')
  }

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const errs = validar(b, esNuevo, idsUsados)
    setErrores(errs)
    if (Object.keys(errs).length) return
    onGuardar({
      id: producto?.id ?? slug(b.nombre),
      nombre: b.nombre.trim(), marca: b.marca.trim(), categoria: b.categoria.trim(),
      subcategoria: b.subcategoria.trim() || undefined, descripcion: b.descripcion.trim() || undefined,
      precios: { retiro: num(b.retiro), bulto: num(b.bulto), ...(b.pallet ? { pallet: num(b.pallet) } : {}) },
      unidadesPorCaja: num(b.unidadesPorCaja), cajasPorPallet: b.cajasPorPallet ? num(b.cajasPorPallet) : undefined,
      stock: num(b.stock), oferta: b.oferta ? num(b.oferta) : undefined,
      masVendido: b.masVendido, visible: b.visible, imagenes: b.imagenes,
    })
  }

  const unitario = num(b.retiro) / Math.max(num(b.unidadesPorCaja) || 1, 1)

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <Campo id="nombre" etiqueta="Nombre" error={errores.nombre} className="sm:col-span-2"><input {...input('nombre')} placeholder="Ej: Arroz largo fino 1 kg" /></Campo>
        <Campo id="marca" etiqueta="Marca" error={errores.marca}><input {...input('marca')} /></Campo>
        <Campo id="categoria" etiqueta="Categoría" error={errores.categoria}>
          <input {...input('categoria', { list: 'lista-categorias' })} />
          <datalist id="lista-categorias">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
        </Campo>
        <Campo id="subcategoria" etiqueta="Subcategoría (opcional)"><input {...input('subcategoria')} /></Campo>
        <Campo id="unidadesPorCaja" etiqueta="Unidades por caja" error={errores.unidadesPorCaja}><input {...input('unidadesPorCaja', { inputMode: 'numeric' })} /></Campo>
        <Campo id="descripcion" etiqueta="Descripción (opcional)" className="sm:col-span-2"><textarea {...input('descripcion')} rows={2} className={`${claseInput()} resize-none`} /></Campo>
      </section>

      <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-blue-900">Precios por caja</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Campo id="retiro" etiqueta="Retiro en el local" error={errores.retiro} ayuda={unitario > 0 ? `${formatoPrecio(unitario)} por unidad` : 'El más barato'}><input {...input('retiro', { inputMode: 'decimal', placeholder: '$' })} /></Campo>
          <Campo id="bulto" etiqueta="Envío por bulto" error={errores.bulto}><input {...input('bulto', { inputMode: 'decimal', placeholder: '$' })} /></Campo>
          <Campo id="pallet" etiqueta="Envío por pallet" error={errores.pallet} ayuda="Vacío = se cobra como bulto"><input {...input('pallet', { inputMode: 'decimal', placeholder: '$' })} /></Campo>
          <Campo id="cajasPorPallet" etiqueta="Cajas por pallet" error={errores.cajasPorPallet} ayuda="Vacío = a consultar"><input {...input('cajasPorPallet', { inputMode: 'numeric' })} /></Campo>
          <Campo id="stock" etiqueta="Stock (cajas)" error={errores.stock}><input {...input('stock', { inputMode: 'numeric' })} /></Campo>
          <Campo id="oferta" etiqueta="Oferta (%)" error={errores.oferta} ayuda="Vacío = sin oferta"><input {...input('oferta', { inputMode: 'numeric' })} /></Campo>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-600">Imágenes (la primera es la principal)</h3>
        <div className="flex gap-2">
          <label htmlFor="nueva-imagen" className="sr-only">URL de la imagen</label>
          <input id="nueva-imagen" value={nuevaImagen} onChange={(e) => setNuevaImagen(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarImagen() } }} placeholder="https://… o /productos/archivo.webp" className={claseInput()} />
          <button type="button" onClick={agregarImagen} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm font-bold hover:bg-gray-50"><ImagePlus size={16} /> Agregar</button>
        </div>
        {b.imagenes.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-3">
            {b.imagenes.map((url, i) => (
              <li key={`${url}-${i}`} className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[10px] font-bold text-white">PRINCIPAL</span>}
                <div className="absolute right-1 top-1 flex gap-1">
                  {i > 0 && <button type="button" aria-label="Usar como principal" onClick={() => setB({ ...b, imagenes: [url, ...b.imagenes.filter((_, n) => n !== i)] })} className="rounded-full bg-white/90 p-1 shadow"><ArrowUp size={12} /></button>}
                  <button type="button" aria-label="Quitar imagen" onClick={() => setB({ ...b, imagenes: b.imagenes.filter((_, n) => n !== i) })} className="rounded-full bg-red-600 p-1 text-white shadow"><X size={12} /></button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-xs text-gray-500">Sin imágenes: en la tienda se muestra un dibujo genérico.</p>}
      </section>

      <section className="flex flex-wrap gap-3">
        {([['visible', 'Visible en la tienda'], ['masVendido', 'Marcar como “Más vendido”']] as const).map(([k, texto]) => (
          <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${b[k] ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
            <input type="checkbox" checked={b[k]} onChange={(e) => setB({ ...b, [k]: e.target.checked })} className="h-4 w-4 accent-gray-900" /> {texto}
          </label>
        ))}
      </section>

      {Object.keys(errores).length > 0 && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">Revisá los campos marcados en rojo.</p>}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button type="button" onClick={onCancelar} className="rounded-lg px-4 py-2.5 font-semibold text-gray-600 hover:bg-gray-100">Cancelar</button>
        <button type="submit" className="rounded-lg bg-gray-900 px-6 py-2.5 font-bold text-white hover:bg-black">{esNuevo ? 'Crear producto' : 'Guardar cambios'}</button>
      </div>
    </form>
  )
}
