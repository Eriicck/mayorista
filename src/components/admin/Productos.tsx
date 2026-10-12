import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@nanostores/react'
import { Eye, EyeOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { TIENDA } from '../../config/tienda'
import { avisar } from '../../lib/avisos'
import { $catalogo, borrarProducto, guardarProducto } from '../../lib/catalogo'
import { formatoPrecio } from '../../lib/precios'
import type { Producto } from '../../lib/tipos'
import Dialogo from '../ui/Dialogo'
import FormProducto from './FormProducto'

const FILTROS = {
  todos: 'Todos',
  'sin-stock': 'Sin stock',
  critico: 'Stock crítico',
  oferta: 'En oferta',
  ocultos: 'Ocultos',
} as const
type Filtro = keyof typeof FILTROS
const POR_PAGINA = 10

const filtroDeUrl = (): Filtro => {
  const f = new URLSearchParams(location.hash.split('?')[1] ?? '').get('filtro')
  return f && f in FILTROS ? (f as Filtro) : 'todos'
}

function estadoStock(stock: number) {
  if (stock <= 0) return 'bg-red-100 text-red-700'
  if (stock <= TIENDA.stockCritico) return 'bg-amber-100 text-amber-800'
  return 'bg-green-100 text-green-700'
}

export default function Productos() {
  const { productos } = useStore($catalogo)
  const [filtro, setFiltro] = useState<Filtro>(filtroDeUrl)
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState<Producto | 'nuevo' | null>(null)
  const [borrando, setBorrando] = useState<Producto | null>(null)

  useEffect(() => {
    const alCambiar = () => setFiltro(filtroDeUrl())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])
  useEffect(() => setPagina(1), [filtro, busqueda, categoria])

  const categorias = useMemo(() => [...new Set(productos.map((p) => p.categoria))].sort((a, b) => a.localeCompare(b, 'es')), [productos])

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos
      .filter((p) => {
        if (filtro === 'sin-stock') return p.stock <= 0
        if (filtro === 'critico') return p.stock > 0 && p.stock <= TIENDA.stockCritico
        if (filtro === 'oferta') return (p.oferta ?? 0) > 0
        if (filtro === 'ocultos') return !p.visible
        return true
      })
      .filter((p) => !categoria || p.categoria === categoria)
      .filter((p) => !q || `${p.nombre} ${p.marca}`.toLowerCase().includes(q))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [productos, filtro, busqueda, categoria])

  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const actual = Math.min(pagina, totalPaginas)
  const enPantalla = lista.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA)

  const cambiarFiltro = (f: Filtro) => { history.replaceState(null, '', f === 'todos' ? '#productos' : `#productos?filtro=${f}`); setFiltro(f) }
  const alternarVisible = (p: Producto) => { guardarProducto({ ...p, visible: !p.visible }); avisar(p.visible ? 'Producto oculto en la tienda' : 'Producto visible en la tienda', 'info') }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Productos</h1>
          <p className="text-sm text-gray-500">{productos.length} en total</p>
        </div>
        <button type="button" onClick={() => setEditando('nuevo')} className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-black"><Plus size={16} /> Nuevo producto</button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar">
        {(Object.keys(FILTROS) as Filtro[]).map((f) => (
          <button key={f} type="button" onClick={() => cambiarFiltro(f)} aria-pressed={filtro === f}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${filtro === f ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'}`}>
            {FILTROS[f]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 px-2">
          <Search size={17} className="text-gray-400" />
          <span className="sr-only">Buscar</span>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o marca…" className="w-full py-1.5 text-sm outline-none" />
          {busqueda && <button type="button" aria-label="Borrar búsqueda" onClick={() => setBusqueda('')} className="text-gray-400"><X size={15} /></button>}
        </label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoría" className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-3 font-bold">Producto</th>
                <th className="p-3 font-bold">Categoría</th>
                <th className="p-3 text-right font-bold">Retiro / caja</th>
                <th className="p-3 text-right font-bold">Bulto / caja</th>
                <th className="p-3 text-center font-bold">Stock</th>
                <th className="p-3 text-right font-bold"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enPantalla.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-gray-400">No hay productos con ese filtro.</td></tr>}
              {enPantalla.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 ${p.visible ? '' : 'opacity-60'}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imagenes[0] || '/productos/sin-imagen.svg'} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-lg bg-gray-50 object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{p.nombre}</p>
                        <p className="text-xs text-gray-500">{p.marca} · x{p.unidadesPorCaja}
                          {!!p.oferta && <span className="ml-1.5 rounded bg-green-100 px-1.5 font-bold text-green-700">-{p.oferta}%</span>}
                          {!p.visible && <span className="ml-1.5 rounded bg-gray-200 px-1.5 font-bold text-gray-600">Oculto</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{p.categoria}</td>
                  <td className="p-3 text-right font-semibold tabular-nums">{formatoPrecio(p.precios.retiro)}</td>
                  <td className="p-3 text-right tabular-nums text-gray-600">{formatoPrecio(p.precios.bulto)}</td>
                  <td className="p-3 text-center"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${estadoStock(p.stock)}`}>{p.stock}</span></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => alternarVisible(p)} aria-label={p.visible ? `Ocultar ${p.nombre}` : `Mostrar ${p.nombre}`} title={p.visible ? 'Ocultar en la tienda' : 'Mostrar en la tienda'} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">{p.visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                      <button type="button" onClick={() => setEditando(p)} aria-label={`Editar ${p.nombre}`} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
                      <button type="button" onClick={() => setBorrando(p)} aria-label={`Borrar ${p.nombre}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3 py-2.5 text-xs">
          <button type="button" disabled={actual === 1} onClick={() => setPagina(actual - 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-bold disabled:opacity-40">Anterior</button>
          <span className="text-gray-500">Página {actual} de {totalPaginas} · {lista.length} productos</span>
          <button type="button" disabled={actual === totalPaginas} onClick={() => setPagina(actual + 1)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-bold disabled:opacity-40">Siguiente</button>
        </div>
      </div>

      <Dialogo abierto={!!editando} onCerrar={() => setEditando(null)} titulo={editando === 'nuevo' ? 'Nuevo producto' : 'Editar producto'} ancho="max-w-3xl">
        {editando && (
          <FormProducto
            key={editando === 'nuevo' ? 'nuevo' : editando.id}
            producto={editando === 'nuevo' ? null : editando}
            categorias={categorias}
            idsUsados={productos.map((p) => p.id)}
            onGuardar={(p) => { guardarProducto(p); setEditando(null); avisar(editando === 'nuevo' ? 'Producto creado' : 'Cambios guardados') }}
            onCancelar={() => setEditando(null)}
          />
        )}
      </Dialogo>

      <Dialogo abierto={!!borrando} onCerrar={() => setBorrando(null)} titulo="¿Borrar producto?" ancho="max-w-md"
        pie={<div className="flex justify-end gap-2">
          <button type="button" onClick={() => setBorrando(null)} className="rounded-lg px-4 py-2 font-semibold text-gray-600 hover:bg-gray-200">Cancelar</button>
          <button type="button" onClick={() => { if (borrando) { borrarProducto(borrando.id); avisar('Producto borrado', 'info') } setBorrando(null) }} className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700">Borrar</button>
        </div>}>
        <p className="text-sm text-gray-600">Se va a borrar <strong>{borrando?.nombre}</strong>. Si solo querés que no aparezca en la tienda, podés ocultarlo con el ícono del ojo.</p>
      </Dialogo>
    </div>
  )
}
