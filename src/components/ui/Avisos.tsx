import { useStore } from '@nanostores/react'
import { AlertCircle, Check, Info } from 'lucide-react'
import { $aviso } from '../../lib/avisos'

const ESTILOS = {
  ok: 'bg-gray-900 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-white text-gray-900 border border-gray-200',
}
const ICONOS = { ok: Check, error: AlertCircle, info: Info }

export default function Avisos() {
  const aviso = useStore($aviso)
  const Icono = aviso ? ICONOS[aviso.tipo] : null
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex justify-center px-4">
      {aviso && Icono && (
        <div key={aviso.id} className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-xl ${ESTILOS[aviso.tipo]}`}>
          <Icono size={16} /> {aviso.texto}
        </div>
      )}
    </div>
  )
}
