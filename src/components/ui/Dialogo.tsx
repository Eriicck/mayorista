import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo: ReactNode
  children: ReactNode
  pie?: ReactNode
  /** 'centro' = ventana; 'lateral' = panel que entra desde la derecha */
  variante?: 'centro' | 'lateral'
  ancho?: string
}

/**
 * Ventana modal con el <dialog> nativo: atrapa el foco, cierra con Escape
 * y devuelve el foco al botón que la abrió.
 */
export default function Dialogo({ abierto, onCerrar, titulo, children, pie, variante = 'centro', ancho = 'max-w-lg' }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  const clases =
    variante === 'lateral'
      ? 'panel-lateral m-0 ml-auto h-dvh max-h-dvh w-full max-w-md rounded-none'
      : `m-auto w-[calc(100%-2rem)] ${ancho} max-h-[90dvh] rounded-2xl`

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => { if (e.target === ref.current) onCerrar() }}
      className={`${clases} bg-white p-0 shadow-2xl backdrop:bg-black/50`}
    >
      <div className={`flex flex-col ${variante === 'lateral' ? 'h-full' : 'max-h-[90dvh]'}`}>
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {pie && <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">{pie}</div>}
      </div>
    </dialog>
  )
}
