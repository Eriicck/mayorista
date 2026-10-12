import { useEffect, useState, type ComponentType } from 'react'
import { ExternalLink, FileSpreadsheet, Image, LayoutDashboard, LogOut, Menu, Package, RotateCcw, X } from 'lucide-react'
import { avisar } from '../../lib/avisos'
import { cargarCambiosLocales, escucharOtrasPestanas, restablecerDemo } from '../../lib/catalogo'
import Dialogo from '../ui/Dialogo'
import Banners from './Banners'
import Importar from './Importar'
import Ingreso from './Ingreso'
import Inicio from './Inicio'
import Productos from './Productos'

const SECCIONES = {
  inicio: { nombre: 'Resumen', Icono: LayoutDashboard, Vista: Inicio },
  productos: { nombre: 'Productos', Icono: Package, Vista: Productos },
  banners: { nombre: 'Banners', Icono: Image, Vista: Banners },
  importar: { nombre: 'Excel', Icono: FileSpreadsheet, Vista: Importar },
} satisfies Record<string, { nombre: string; Icono: ComponentType<{ size?: number }>; Vista: ComponentType }>
type Seccion = keyof typeof SECCIONES

const SESION = 'mayorista-admin-sesion'
const seccionDeUrl = (): Seccion => {
  const s = location.hash.slice(1).split('?')[0]
  return s in SECCIONES ? (s as Seccion) : 'inicio'
}

export default function AdminApp() {
  const [logueado, setLogueado] = useState(() => sessionStorage.getItem(SESION) === '1')
  const [seccion, setSeccion] = useState<Seccion>(seccionDeUrl)
  const [menuMovil, setMenuMovil] = useState(false)
  const [confirmarReset, setConfirmarReset] = useState(false)

  useEffect(() => {
    cargarCambiosLocales()
    const alCambiarHash = () => setSeccion(seccionDeUrl())
    window.addEventListener('hashchange', alCambiarHash)
    const dejar = escucharOtrasPestanas()
    return () => { window.removeEventListener('hashchange', alCambiarHash); dejar() }
  }, [])

  if (!logueado) {
    return <Ingreso onIngresar={() => { sessionStorage.setItem(SESION, '1'); setLogueado(true) }} />
  }

  const salir = () => { sessionStorage.removeItem(SESION); setLogueado(false) }
  const { Vista } = SECCIONES[seccion]

  const navegacion = (
    <nav aria-label="Secciones del panel" className="space-y-1">
      {(Object.keys(SECCIONES) as Seccion[]).map((s) => {
        const { nombre, Icono } = SECCIONES[s]
        const activa = s === seccion
        return (
          <a key={s} href={`#${s}`} onClick={() => setMenuMovil(false)} aria-current={activa ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${activa ? 'bg-white font-bold text-gray-900 shadow' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Icono size={18} /> {nombre}
          </a>
        )
      })}
    </nav>
  )

  const pieMenu = (
    <div className="space-y-1 border-t border-white/10 pt-3">
      <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"><ExternalLink size={17} /> Ver la tienda</a>
      <button type="button" onClick={() => setConfirmarReset(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"><RotateCcw size={17} /> Restablecer demo</button>
      <button type="button" onClick={salir} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-red-400"><LogOut size={17} /> Cerrar sesión</button>
    </div>
  )

  const marca = <p className="px-3 text-lg font-black tracking-tighter text-white">MAYORISTA<span className="text-gray-500">ONLINE</span></p>

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 bg-gray-950 p-4 md:flex">
        {marca}
        <div className="flex-1">{navegacion}</div>
        {pieMenu}
      </aside>

      {menuMovil && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-black/60" onClick={() => setMenuMovil(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col gap-6 bg-gray-950 p-4">
            <div className="flex items-center justify-between">{marca}<button type="button" aria-label="Cerrar menú" onClick={() => setMenuMovil(false)} className="text-gray-400"><X size={22} /></button></div>
            <div className="flex-1">{navegacion}</div>
            {pieMenu}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button type="button" aria-label="Abrir menú" onClick={() => setMenuMovil(true)}><Menu size={22} /></button>
          <span className="font-black">{SECCIONES[seccion].nombre}</span>
        </header>
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
          Modo demo: los cambios se guardan solo en este navegador.
        </div>
        <main className="mx-auto max-w-6xl p-4 md:p-8">
          <Vista />
        </main>
      </div>

      <Dialogo abierto={confirmarReset} onCerrar={() => setConfirmarReset(false)} titulo="¿Restablecer la demo?" ancho="max-w-md"
        pie={<div className="flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmarReset(false)} className="rounded-lg px-4 py-2 font-semibold text-gray-600 hover:bg-gray-200">Cancelar</button>
          <button type="button" onClick={() => { restablecerDemo(); setConfirmarReset(false); avisar('Se restauraron los datos de ejemplo') }} className="rounded-lg bg-gray-900 px-4 py-2 font-bold text-white">Restablecer</button>
        </div>}>
        <p className="text-sm text-gray-600">Se borran los cambios que hiciste en este navegador y vuelven los productos y banners de ejemplo.</p>
      </Dialogo>
    </div>
  )
}
