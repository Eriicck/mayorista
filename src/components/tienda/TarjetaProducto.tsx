import { formatoPrecio, precioCaja, precioUnitarioDesde } from '../../lib/precios'
import type { Producto } from '../../lib/tipos'

interface Props { producto: Producto; onElegir: (p: Producto) => void; prioridad?: boolean }

export default function TarjetaProducto({ producto: p, onElegir, prioridad }: Props) {
  const agotado = p.stock <= 0
  const imagen = p.imagenes[0] || '/productos/sin-imagen.svg'
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-gray-200 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={imagen} alt={p.nombre} width={400} height={400}
          loading={prioridad ? 'eager' : 'lazy'} decoding="async"
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${agotado ? 'opacity-40 grayscale' : ''}`}
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {!!p.oferta && !agotado && <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">-{p.oferta}%</span>}
          {p.masVendido && !agotado && <span className="rounded-md bg-gray-900 px-2 py-0.5 text-xs font-bold text-white">Más vendido</span>}
        </div>
        {agotado && (
          <span className="absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 rounded-md border-2 border-gray-400 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-500">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{p.marca}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-gray-900">{p.nombre}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl font-black text-red-600 sm:text-2xl">{formatoPrecio(precioUnitarioDesde(p))}</span>
          <span className="text-xs font-semibold text-gray-500">c/u</span>
        </div>
        <p className="mt-0.5 text-[11px] font-medium text-gray-500">
          Caja x{p.unidadesPorCaja} · desde {formatoPrecio(precioCaja(p, 'retiro'))}
        </p>
        <button
          type="button" onClick={() => onElegir(p)} disabled={agotado}
          className="mt-3 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-bold text-white transition hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 sm:mt-auto"
        >
          {agotado ? 'Agotado' : 'Elegir opciones'}
        </button>
      </div>
    </article>
  )
}
