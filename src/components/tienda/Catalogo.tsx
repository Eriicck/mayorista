import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { TIENDA } from '../../config/tienda'
import { $busqueda } from '../../lib/busqueda'
import { $catalogo, cargarCambiosLocales, categoriasDe, escucharOtrasPestanas } from '../../lib/catalogo'
import { precioCaja } from '../../lib/precios'
import type { Producto } from '../../lib/tipos'
import OpcionesProducto from './OpcionesProducto'
import TarjetaProducto from './TarjetaProducto'

const INICIO = 'Inicio'
const ESPECIALES = [INICIO, 'Más vendidos', 'Ofertas'] as const
const ORDENES = { relevancia: 'Relevancia', menor: 'Menor precio', mayor: 'Mayor precio', az: 'Nombre (A-Z)' } as const
type Orden = keyof typeof ORDENES

const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Lee/escribe ?categoria= en la URL para poder compartir el link de una categoría. */
function leerCategoriaDeUrl() {
  return new URLSearchParams(location.search).get('categoria') ?? INICIO
}

export default function Catalogo() {
  const { productos } = useStore($catalogo)
  const busqueda = useStore($busqueda)
  const [categoria, setCategoria] = useState<string>(INICIO)
  const [sub, setSub] = useState('Todas')
  const [orden, setOrden] = useState<Orden>('relevancia')
  const [pagina, setPagina] = useState(1)
  const [elegido, setElegido] = useState<Producto | null>(null)
  const inicioLista = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    cargarCambiosLocales()
    setCategoria(leerCategoriaDeUrl())
    const alVolver = () => setCategoria(leerCategoriaDeUrl())
    window.addEventListener('popstate', alVolver)
    const dejar = escucharOtrasPestanas()
    return () => { window.removeEventListener('popstate', alVolver); dejar() }
  }, [])

  const visibles = useMemo(() => productos.filter((p) => p.visible), [productos])
  const categorias = useMemo(() => [...ESPECIALES, ...categoriasDe(visibles)], [visibles])
  const subcategorias = useMemo(() => {
    if ((ESPECIALES as readonly string[]).includes(categoria)) return []
    const subs = new Set(visibles.filter((p) => p.categoria === categoria && p.subcategoria).map((p) => p.subcategoria as string))
    return subs.size > 1 ? ['Todas', ...[...subs].sort((a, b) => a.localeCompare(b, 'es'))] : []
  }, [categoria, visibles])

  const filtrados = useMemo(() => {
    let lista = visibles
    const q = normalizar(busqueda.trim())
    if (q) {
      lista = lista.filter((p) => normalizar(`${p.nombre} ${p.marca} ${p.categoria} ${p.subcategoria ?? ''}`).includes(q))
    } else if (categoria === 'Más vendidos') lista = lista.filter((p) => p.masVendido)
    else if (categoria === 'Ofertas') lista = lista.filter((p) => (p.oferta ?? 0) > 0)
    else if (categoria !== INICIO) {
      lista = lista.filter((p) => p.categoria === categoria)
      if (sub !== 'Todas') lista = lista.filter((p) => p.subcategoria === sub)
    }
    const ordenada = [...lista]
    if (orden === 'menor') ordenada.sort((a, b) => precioCaja(a, 'retiro') / a.unidadesPorCaja - precioCaja(b, 'retiro') / b.unidadesPorCaja)
    if (orden === 'mayor') ordenada.sort((a, b) => precioCaja(b, 'retiro') / b.unidadesPorCaja - precioCaja(a, 'retiro') / a.unidadesPorCaja)
    if (orden === 'az') ordenada.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    // Con stock primero
    return ordenada.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
  }, [visibles, busqueda, categoria, sub, orden])

  const porPagina = TIENDA.productosPorPagina
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const enPantalla = filtrados.slice((paginaActual - 1) * porPagina, paginaActual * porPagina)

  useEffect(() => setPagina(1), [categoria, sub, busqueda, orden])

  const elegirCategoria = (c: string) => {
    setCategoria(c)
    setSub('Todas')
    $busqueda.set('')
    const url = new URL(location.href)
    if (c === INICIO) url.searchParams.delete('categoria')
    else url.searchParams.set('categoria', c)
    history.pushState(null, '', url)
  }

  const irAPagina = (n: number) => {
    setPagina(n)
    inicioLista.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const titulo = busqueda.trim() ? `Resultados para “${busqueda.trim()}”` : categoria

  return (
    <section aria-labelledby="titulo-catalogo" className="mt-8">
      <nav aria-label="Categorías" className="relative -mx-4 px-4">
        <ul className="sin-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categorias.map((c) => (
            <li key={c}>
              <button
                type="button" onClick={() => elegirCategoria(c)} aria-current={c === categoria && !busqueda ? 'true' : undefined}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${c === categoria && !busqueda ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="titulo-catalogo" ref={inicioLista} className="scroll-mt-24 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{titulo}</h2>
          <p className="mt-1 text-sm text-gray-500">{filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {subcategorias.length > 0 && !busqueda && (
            <div className="sin-scrollbar flex max-w-full gap-2 overflow-x-auto">
              {subcategorias.map((s) => (
                <button key={s} type="button" onClick={() => setSub(s)} aria-pressed={s === sub}
                  className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${s === sub ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-900'}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span className="sr-only sm:not-sr-only">Ordenar</span>
            <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-gray-900">
              {Object.entries(ORDENES).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
        </div>
      </div>

      {enPantalla.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {enPantalla.map((p, i) => (
            <li key={p.id}><TarjetaProducto producto={p} onElegir={setElegido} prioridad={i < 5} /></li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <SearchX className="mx-auto text-gray-300" size={40} />
          <p className="mt-3 text-lg text-gray-500">No encontramos productos{busqueda ? ` para “${busqueda}”` : ' en esta categoría'}.</p>
          <button type="button" onClick={() => elegirCategoria(INICIO)} className="mt-3 font-bold text-gray-900 underline">Ver todo el catálogo</button>
        </div>
      )}

      {totalPaginas > 1 && (
        <nav aria-label="Páginas" className="mt-10 flex items-center justify-center gap-2">
          <button type="button" aria-label="Página anterior" onClick={() => irAPagina(paginaActual - 1)} disabled={paginaActual === 1} className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 disabled:opacity-30"><ChevronLeft size={18} /></button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => irAPagina(n)} aria-current={n === paginaActual ? 'page' : undefined}
              className={`h-10 w-10 rounded-full text-sm font-bold ${n === paginaActual ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{n}</button>
          ))}
          <button type="button" aria-label="Página siguiente" onClick={() => irAPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 disabled:opacity-30"><ChevronRight size={18} /></button>
        </nav>
      )}

      <OpcionesProducto producto={elegido} onCerrar={() => setElegido(null)} />
    </section>
  )
}
