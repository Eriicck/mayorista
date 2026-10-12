import { useStore } from '@nanostores/react'
import { Search, X } from 'lucide-react'
import { $busqueda } from '../../lib/busqueda'

/** Buscador del encabezado. Filtra el catálogo mientras se escribe. */
export default function Buscador() {
  const texto = useStore($busqueda)
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); document.getElementById('titulo-catalogo')?.scrollIntoView({ behavior: 'smooth' }) }} className="relative w-full">
      <label htmlFor="buscar" className="sr-only">Buscar productos</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        id="buscar" type="search" value={texto} onChange={(e) => $busqueda.set(e.target.value)}
        placeholder="Buscar arroz, lavandina, gaseosa…" autoComplete="off"
        className="w-full rounded-full border border-transparent bg-gray-100 py-2.5 pl-10 pr-9 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white [&::-webkit-search-cancel-button]:hidden"
      />
      {texto && (
        <button type="button" aria-label="Borrar búsqueda" onClick={() => $busqueda.set('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"><X size={16} /></button>
      )}
    </form>
  )
}
