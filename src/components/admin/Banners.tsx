import { useState, type FormEvent } from 'react'
import { useStore } from '@nanostores/react'
import { ArrowDown, ArrowUp, Monitor, Pencil, Plus, Smartphone, Trash2 } from 'lucide-react'
import { avisar } from '../../lib/avisos'
import { $catalogo, borrarBanner, guardarBanner, slug } from '../../lib/catalogo'
import type { Banner } from '../../lib/tipos'
import Dialogo from '../ui/Dialogo'

const esUrl = (s: string) => /^(https?:\/\/|\/)\S+$/.test(s.trim())
const claseInput = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900'

function FormBanner({ banner, total, onGuardar, onCancelar }: { banner: Banner | null; total: number; onGuardar: (b: Banner) => void; onCancelar: () => void }) {
  const [b, setB] = useState({ titulo: banner?.titulo ?? '', imagenEscritorio: banner?.imagenEscritorio ?? '', imagenCelular: banner?.imagenCelular ?? '', link: banner?.link ?? '', activo: banner?.activo ?? true })
  const [error, setError] = useState('')

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!b.titulo.trim()) return setError('Poné un título (sirve de texto alternativo de la imagen).')
    if (!esUrl(b.imagenEscritorio)) return setError('La imagen de escritorio tiene que ser una URL (https://…) o una ruta (/banners/…).')
    if (b.imagenCelular && !esUrl(b.imagenCelular)) return setError('La imagen de celular no es una URL válida.')
    onGuardar({
      id: banner?.id ?? `${slug(b.titulo)}-${Date.now().toString(36)}`,
      titulo: b.titulo.trim(), imagenEscritorio: b.imagenEscritorio.trim(), imagenCelular: b.imagenCelular.trim() || undefined,
      link: b.link.trim() || undefined, activo: b.activo, orden: banner?.orden ?? total + 1,
    })
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        {([['imagenEscritorio', Monitor, 'Escritorio'], ['imagenCelular', Smartphone, 'Celular']] as const).map(([k, Icono, t]) => (
          <div key={k}>
            <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-gray-500"><Icono size={12} /> {t}</p>
            <div className={`grid ${k === 'imagenCelular' ? 'aspect-square' : 'aspect-[16/5]'} place-items-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50`}>
              {esUrl(b[k]) ? <img src={b[k]} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">Sin imagen</span>}
            </div>
          </div>
        ))}
      </div>
      <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-gray-600">Título</span><input value={b.titulo} onChange={(e) => setB({ ...b, titulo: e.target.value })} className={claseInput} /></label>
      <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-gray-600">Imagen de escritorio (1600×500)</span><input value={b.imagenEscritorio} onChange={(e) => setB({ ...b, imagenEscritorio: e.target.value })} className={claseInput} placeholder="https://…" /></label>
      <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-gray-600">Imagen de celular (900×900, opcional)</span><input value={b.imagenCelular} onChange={(e) => setB({ ...b, imagenCelular: e.target.value })} className={claseInput} placeholder="Si queda vacío se usa la de escritorio" /></label>
      <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-gray-600">Link al tocarlo (opcional)</span><input value={b.link} onChange={(e) => setB({ ...b, link: e.target.value })} className={claseInput} placeholder="?categoria=Ofertas" /></label>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={b.activo} onChange={(e) => setB({ ...b, activo: e.target.checked })} className="h-4 w-4 accent-gray-900" /> Activo (se muestra en la tienda)</label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button type="button" onClick={onCancelar} className="rounded-lg px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100">Cancelar</button>
        <button type="submit" className="rounded-lg bg-gray-900 px-5 py-2 font-bold text-white">Guardar</button>
      </div>
    </form>
  )
}

export default function Banners() {
  const banners = [...useStore($catalogo).banners].sort((a, b) => a.orden - b.orden)
  const [editando, setEditando] = useState<Banner | 'nuevo' | null>(null)

  const mover = (i: number, d: -1 | 1) => {
    const a = banners[i], z = banners[i + d]
    if (!a || !z) return
    guardarBanner({ ...a, orden: z.orden })
    guardarBanner({ ...z, orden: a.orden })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-black">Banners</h1><p className="text-sm text-gray-500">El carrusel de la portada. Se muestran los activos, en este orden.</p></div>
        <button type="button" onClick={() => setEditando('nuevo')} className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Nuevo banner</button>
      </div>

      <ul className="space-y-3">
        {banners.map((b, i) => (
          <li key={b.id} className={`flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center ${b.activo ? '' : 'opacity-60'}`}>
            <img src={b.imagenEscritorio} alt="" className="aspect-[16/5] w-full rounded-lg object-cover sm:w-64" />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{b.titulo}</p>
              <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
                <span className={`rounded-full px-2 py-0.5 font-bold ${b.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{b.activo ? 'Activo' : 'Inactivo'}</span>
                <span className={`rounded-full px-2 py-0.5 font-bold ${b.imagenCelular ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{b.imagenCelular ? 'Con imagen de celular' : 'Sin imagen de celular'}</span>
                {b.link && <span className="truncate rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">→ {b.link}</span>}
              </p>
            </div>
            <div className="flex gap-1 self-end sm:self-center">
              <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-30"><ArrowUp size={16} /></button>
              <button type="button" aria-label="Bajar" disabled={i === banners.length - 1} onClick={() => mover(i, 1)} className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-30"><ArrowDown size={16} /></button>
              <button type="button" aria-label={`Editar ${b.titulo}`} onClick={() => setEditando(b)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
              <button type="button" aria-label={`Borrar ${b.titulo}`} onClick={() => { borrarBanner(b.id); avisar('Banner borrado', 'info') }} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
            </div>
          </li>
        ))}
        {!banners.length && <li className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">No hay banners. La portada muestra directamente el catálogo.</li>}
      </ul>

      <Dialogo abierto={!!editando} onCerrar={() => setEditando(null)} titulo={editando === 'nuevo' ? 'Nuevo banner' : 'Editar banner'} ancho="max-w-2xl">
        {editando && <FormBanner key={editando === 'nuevo' ? 'nuevo' : editando.id} banner={editando === 'nuevo' ? null : editando} total={banners.length}
          onGuardar={(b) => { guardarBanner(b); setEditando(null); avisar('Banner guardado') }} onCancelar={() => setEditando(null)} />}
      </Dialogo>
    </div>
  )
}
