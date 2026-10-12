import { useState, type FormEvent } from 'react'
import { AlertCircle, Info, LogIn, Store } from 'lucide-react'
import { DEMO_ADMIN, TIENDA } from '../../config/tienda'

/**
 * Ingreso al panel. En esta demo las credenciales son públicas y se muestran en pantalla;
 * en un sitio real el ingreso lo valida el servidor (Firebase Auth u otro), nunca el navegador.
 */
export default function Ingreso({ onIngresar }: { onIngresar: () => void }) {
  const [email, setEmail] = useState<string>(DEMO_ADMIN.email)
  const [clave, setClave] = useState<string>(DEMO_ADMIN.clave)
  const [error, setError] = useState('')

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (email.trim().toLowerCase() === DEMO_ADMIN.email && clave === DEMO_ADMIN.clave) onIngresar()
    else setError('Email o contraseña incorrectos.')
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <p className="text-center text-2xl font-black tracking-tighter">MAYORISTA<span className="text-gray-400">ONLINE</span></p>
        <h1 className="mt-1 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">Panel de administración</h1>

        <div className="mt-6 flex gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>Es una <strong>demo</strong>: los datos ya están cargados. Lo que cambies se guarda solo en tu navegador y lo ves reflejado en la tienda.</p>
        </div>

        <form onSubmit={enviar} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold text-gray-700">Email</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-gray-900" />
          </div>
          <div>
            <label htmlFor="clave" className="mb-1 block text-sm font-bold text-gray-700">Contraseña</label>
            <input id="clave" type="password" autoComplete="current-password" value={clave} onChange={(e) => { setClave(e.target.value); setError('') }} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-gray-900" aria-describedby="clave-demo" />
            <p id="clave-demo" className="mt-1 text-xs text-gray-500">Demo: {DEMO_ADMIN.email} · {DEMO_ADMIN.clave}</p>
          </div>
          {error && <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} />{error}</p>}
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 font-bold text-white hover:bg-black"><LogIn size={18} /> Ingresar</button>
        </form>
        <a href="/" className="mt-5 flex items-center justify-center gap-2 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-500 hover:text-gray-900"><Store size={16} /> Volver a {TIENDA.nombre}</a>
      </div>
    </main>
  )
}
