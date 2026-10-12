import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { MODOS } from '../../config/tienda'
import { avisar } from '../../lib/avisos'
import { $carritoAbierto, agregarAlCarrito } from '../../lib/carrito'
import { cajasPorCantidad, formatoPrecio, precioCaja, precioCajaLista, tienePallet } from '../../lib/precios'
import type { ModoCompra, Producto } from '../../lib/tipos'
import Dialogo from '../ui/Dialogo'

interface Props { producto: Producto | null; onCerrar: () => void }

const ORDEN_MODOS: ModoCompra[] = ['retiro', 'bulto', 'pallet']

export default function OpcionesProducto({ producto: p, onCerrar }: Props) {
  const [modo, setModo] = useState<ModoCompra>('retiro')
  const [cantidad, setCantidad] = useState(1)

  // Al abrir otro producto, vuelve a los valores iniciales
  useEffect(() => { setModo('retiro'); setCantidad(1) }, [p?.id])

  if (!p) return <Dialogo abierto={false} onCerrar={onCerrar} titulo="">{null}</Dialogo>

  const porPallet = modo === 'pallet' && tienePallet(p)
  const maximo = porPallet ? Math.floor(p.stock / (p.cajasPorPallet as number)) : p.stock
  const sinPalletCompleto = porPallet && maximo < 1
  const cajas = cajasPorCantidad(p, modo, cantidad)
  const precio = precioCaja(p, modo)
  const total = precio * cajas

  const elegirModo = (m: ModoCompra) => { setModo(m); setCantidad(1) }
  const cambiar = (n: number) => setCantidad(Math.min(Math.max(1, n || 1), Math.max(maximo, 1)))

  const agregar = () => {
    agregarAlCarrito({ productoId: p.id, nombre: p.nombre, imagen: p.imagenes[0] ?? '', modo, cajas, precioCaja: precio }, p.stock)
    avisar(`${cajas} ${cajas === 1 ? 'caja agregada' : 'cajas agregadas'} al carrito`)
    onCerrar()
    $carritoAbierto.set(true)
  }

  return (
    <Dialogo abierto onCerrar={onCerrar} titulo={p.nombre} ancho="max-w-xl">
      <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
        <img src={p.imagenes[0] || '/productos/sin-imagen.svg'} alt="" width={160} height={160} className="hidden aspect-square w-full rounded-xl bg-gray-50 object-cover sm:block" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{p.marca} · Caja x{p.unidadesPorCaja}</p>
          {p.descripcion && <p className="mt-1 text-sm text-gray-600">{p.descripcion}</p>}
          <p className={`mt-2 text-sm font-semibold ${p.stock <= 5 ? 'text-amber-600' : 'text-green-700'}`}>
            {p.stock <= 5 ? `¡Últimas ${p.stock} cajas!` : `Stock: ${p.stock} cajas`}
          </p>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">1. Cómo lo querés</legend>
        <div className="space-y-2">
          {ORDEN_MODOS.map((m) => {
            const activo = modo === m
            const lista = precioCajaLista(p, m)
            const final = precioCaja(p, m)
            return (
              <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${activo ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="modo" checked={activo} onChange={() => elegirModo(m)} className="h-4 w-4 accent-gray-900" />
                <span className="flex-1">
                  <span className="block text-sm font-bold text-gray-900">{MODOS[m].nombre}</span>
                  <span className="block text-xs text-gray-500">
                    {m === 'pallet'
                      ? tienePallet(p) ? `Trae ${p.cajasPorPallet} cajas` : 'Cantidad de cajas a consultar'
                      : MODOS[m].detalle}
                  </span>
                </span>
                <span className="text-right">
                  {final < lista && <span className="block text-xs text-gray-400 line-through">{formatoPrecio(lista)}</span>}
                  <span className="block font-black text-gray-900">{formatoPrecio(final)}</span>
                  <span className="block text-[11px] text-gray-500">por caja</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="cantidad" className="mb-2 flex items-end justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
          <span>2. ¿Cuántos {porPallet ? 'pallets' : 'bultos (cajas)'}?</span>
          {porPallet && <span className="rounded bg-blue-50 px-2 py-0.5 normal-case tracking-normal text-blue-700">{cajas} cajas en total</span>}
        </label>
        <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-gray-300">
          <button type="button" aria-label="Menos" onClick={() => cambiar(cantidad - 1)} className="w-12 bg-gray-50 text-gray-700 hover:bg-gray-100"><Minus size={18} className="mx-auto" /></button>
          <input
            id="cantidad" type="number" inputMode="numeric" min={1} max={maximo} value={cantidad}
            onChange={(e) => cambiar(Number(e.target.value))}
            className="w-full text-center text-lg font-bold outline-none"
          />
          <button type="button" aria-label="Más" onClick={() => cambiar(cantidad + 1)} disabled={cantidad >= maximo} className="w-12 bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40"><Plus size={18} className="mx-auto" /></button>
        </div>
        {sinPalletCompleto && <p className="mt-2 text-xs font-medium text-amber-700">No hay stock para un pallet completo. Elegí envío por bulto.</p>}
      </div>

      <button
        type="button" onClick={agregar} disabled={sinPalletCompleto}
        className="mt-6 flex w-full items-center justify-between rounded-xl bg-gray-900 px-5 py-4 font-bold text-white shadow-lg transition hover:bg-black disabled:opacity-40"
      >
        <span>Agregar al carrito</span>
        <span className="text-lg">{formatoPrecio(total)}</span>
      </button>
    </Dialogo>
  )
}
