// Mensajes cortos ("Agregado al carrito") que aparecen arriba y se van solos.
import { atom } from 'nanostores'

export type TipoAviso = 'ok' | 'error' | 'info'
export const $aviso = atom<{ id: number; texto: string; tipo: TipoAviso } | null>(null)

let temporizador: ReturnType<typeof setTimeout> | undefined
export function avisar(texto: string, tipo: TipoAviso = 'ok') {
  clearTimeout(temporizador)
  $aviso.set({ id: Date.now(), texto, tipo })
  temporizador = setTimeout(() => $aviso.set(null), 3000)
}
