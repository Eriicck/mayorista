import type { ItemCarrito, ModoCompra, Producto } from './tipos'

const ars = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/** $ 12.345 */
export const formatoPrecio = (n: number) => `$ ${ars.format(Math.round(Number.isFinite(n) ? n : 0))}`

/** Precio de una caja en el modo elegido, con la oferta aplicada. Sin precio de pallet, usa el de bulto. */
export function precioCaja(p: Producto, modo: ModoCompra): number {
  const base = modo === 'pallet' ? (p.precios.pallet || p.precios.bulto) : p.precios[modo]
  const descuento = Math.min(Math.max(p.oferta ?? 0, 0), 90)
  return Math.round(base * (1 - descuento / 100))
}

/** Precio sin descuento (para mostrar tachado en las ofertas). */
export function precioCajaLista(p: Producto, modo: ModoCompra): number {
  return modo === 'pallet' ? (p.precios.pallet || p.precios.bulto) : p.precios[modo]
}

/** El precio por unidad más bajo (retirando en el local), para la tarjeta del catálogo. */
export function precioUnitarioDesde(p: Producto): number {
  return precioCaja(p, 'retiro') / Math.max(p.unidadesPorCaja, 1)
}

export const tienePallet = (p: Producto) => (p.cajasPorPallet ?? 0) > 0

/** Cuántas cajas representa la cantidad elegida: en pallet (si se sabe cuántas trae) se multiplica. */
export function cajasPorCantidad(p: Producto, modo: ModoCompra, cantidad: number): number {
  const n = Math.max(1, Math.floor(cantidad) || 1)
  return modo === 'pallet' && tienePallet(p) ? n * (p.cajasPorPallet as number) : n
}

export const totalCarrito = (items: ItemCarrito[]) => items.reduce((t, i) => t + i.precioCaja * i.cajas, 0)
export const cajasEnCarrito = (items: ItemCarrito[]) => items.reduce((t, i) => t + i.cajas, 0)
