import { useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { ShoppingCart } from 'lucide-react'
import { $cajasCarrito, $carritoAbierto, $totalCarrito } from '../../lib/carrito'
import { formatoPrecio } from '../../lib/precios'

/** Botón del carrito: en el encabezado o flotante (abajo a la derecha, solo con productos). */
export default function BotonCarrito({ flotante = false }: { flotante?: boolean }) {
  const cajas = useStore($cajasCarrito)
  const total = useStore($totalCarrito)
  // El carrito vive en localStorage: hasta montar no se conoce, así el HTML del servidor coincide
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])
  const n = montado ? cajas : 0
  const abrir = () => $carritoAbierto.set(true)

  if (flotante) {
    if (!n) return null
    return (
      <button type="button" onClick={abrir} aria-label={`Ver carrito: ${n} cajas, ${formatoPrecio(total)}`}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-3 rounded-full bg-gray-900 py-3 pl-4 pr-5 text-white shadow-2xl transition hover:bg-black active:scale-95 lg:hidden">
        <span className="relative"><ShoppingCart size={22} /><span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold">{n}</span></span>
        <span className="text-sm font-bold">{formatoPrecio(total)}</span>
      </button>
    )
  }

  return (
    <button type="button" onClick={abrir} aria-label={`Carrito: ${n} cajas`} className="relative rounded-full p-2 text-gray-900 transition hover:bg-gray-100">
      <ShoppingCart size={24} />
      {n > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">{n}</span>}
    </button>
  )
}
