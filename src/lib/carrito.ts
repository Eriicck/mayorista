// Carrito guardado en el navegador (localStorage). Lo comparten todas las islas de la página.
import { persistentAtom } from '@nanostores/persistent'
import { atom, computed } from 'nanostores'
import { cajasEnCarrito, totalCarrito } from './precios'
import type { ItemCarrito, ModoCompra } from './tipos'

export const $carrito = persistentAtom<ItemCarrito[]>('mayorista-carrito', [], {
  encode: JSON.stringify,
  decode: (texto) => {
    try {
      const v = JSON.parse(texto)
      return Array.isArray(v) ? v : []
    } catch {
      return []
    }
  },
})

/** Panel lateral del carrito abierto/cerrado. */
export const $carritoAbierto = atom(false)

export const $totalCarrito = computed($carrito, totalCarrito)
export const $cajasCarrito = computed($carrito, cajasEnCarrito)

const mismo = (i: ItemCarrito, id: string, modo: ModoCompra) => i.productoId === id && i.modo === modo

/** Suma cajas al carrito. Si el producto ya está en el mismo modo, acumula (sin pasar el stock). */
export function agregarAlCarrito(item: ItemCarrito, stock: number) {
  const items = $carrito.get()
  const existente = items.find((i) => mismo(i, item.productoId, item.modo))
  const tope = Math.max(stock, 0)
  if (existente) {
    $carrito.set(items.map((i) => (i === existente ? { ...i, cajas: Math.min(i.cajas + item.cajas, tope), precioCaja: item.precioCaja } : i)))
  } else {
    $carrito.set([...items, { ...item, cajas: Math.min(item.cajas, tope) }])
  }
}

export function cambiarCajas(productoId: string, modo: ModoCompra, cajas: number, stock: number) {
  const n = Math.min(Math.max(1, Math.floor(cajas) || 1), Math.max(stock, 1))
  $carrito.set($carrito.get().map((i) => (mismo(i, productoId, modo) ? { ...i, cajas: n } : i)))
}

export function quitarDelCarrito(productoId: string, modo: ModoCompra) {
  $carrito.set($carrito.get().filter((i) => !mismo(i, productoId, modo)))
}

export const vaciarCarrito = () => $carrito.set([])
