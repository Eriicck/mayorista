import { MODOS, TIENDA } from '../config/tienda'
import { formatoPrecio, totalCarrito } from './precios'
import type { ItemCarrito } from './tipos'

export type Entrega = 'retiro' | 'envio'

export interface DatosPedido {
  cliente: string
  telefono?: string
  entrega: Entrega
  calle?: string
  altura?: string
  entreCalles?: string
  localidad?: string
  codigoPostal?: string
  pago: string
  notas?: string
}

export type ErroresPedido = Partial<Record<keyof DatosPedido, string>>

/** Valida los datos de un paso del checkout (0: cliente, 1: entrega, 2: pago). */
export function validarPaso(paso: number, d: DatosPedido): ErroresPedido {
  const e: ErroresPedido = {}
  if (paso === 0 && d.cliente.trim().length < 2) e.cliente = 'Escribí tu nombre o el del local.'
  if (paso === 0 && d.telefono && !/^[\d\s()+-]{8,}$/.test(d.telefono)) e.telefono = 'Revisá el número de teléfono.'
  if (paso === 1 && d.entrega === 'envio') {
    if (!d.calle?.trim()) e.calle = 'Falta la calle.'
    if (!d.altura?.trim()) e.altura = 'Falta la altura.'
    if (!d.localidad?.trim()) e.localidad = 'Falta la localidad.'
  }
  if (paso === 2 && !d.pago) e.pago = 'Elegí un medio de pago.'
  return e
}

/** Código corto para identificar el pedido en el chat (ej. MO-4F7K). */
export function codigoPedido(azar: () => number = Math.random): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'MO-' + Array.from({ length: 4 }, () => letras[Math.floor(azar() * letras.length)]).join('')
}

/** Arma el mensaje de WhatsApp con el detalle del pedido. Sin emojis: el link de wa.me los rompe en algunos teléfonos. */
export function mensajePedido(items: ItemCarrito[], d: DatosPedido, codigo: string): string {
  const lineas = [
    `¡Hola! Soy *${d.cliente.trim()}*. Quiero hacer este pedido (${codigo}):`,
    '',
    '*DETALLE*',
    ...items.map((i) => `• ${i.cajas} × ${i.nombre} — ${MODOS[i.modo].corto} — ${formatoPrecio(i.precioCaja)} c/caja = ${formatoPrecio(i.precioCaja * i.cajas)}`),
    '',
    `*Total estimado: ${formatoPrecio(totalCarrito(items))}*`,
    '',
    `*Entrega:* ${d.entrega === 'retiro' ? `Retiro en el local (${TIENDA.direccion})` : 'Envío a domicilio'}`,
  ]
  if (d.entrega === 'envio') {
    lineas.push(`   ${[d.calle, d.altura].filter(Boolean).join(' ')}${d.entreCalles ? ` (entre ${d.entreCalles})` : ''}`)
    lineas.push(`   ${d.localidad}${d.codigoPostal ? ` — CP ${d.codigoPostal}` : ''}`)
  }
  lineas.push(`*Pago:* ${d.pago}`)
  if (d.telefono) lineas.push(`*Teléfono:* ${d.telefono}`)
  if (d.notas?.trim()) lineas.push(`*Notas:* ${d.notas.trim()}`)
  return lineas.join('\n')
}

export const linkWhatsApp = (mensaje: string, numero: string = TIENDA.whatsapp) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
