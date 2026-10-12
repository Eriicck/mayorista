import { useState, type ReactNode } from 'react'
import { useStore } from '@nanostores/react'
import { CheckCircle2, MessageCircle, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { MODOS, TIENDA } from '../../config/tienda'
import { $carrito, $carritoAbierto, $totalCarrito, cambiarCajas, quitarDelCarrito, vaciarCarrito } from '../../lib/carrito'
import { $catalogo } from '../../lib/catalogo'
import { codigoPedido, linkWhatsApp, mensajePedido, validarPaso, type DatosPedido, type ErroresPedido } from '../../lib/pedido'
import { formatoPrecio } from '../../lib/precios'
import Dialogo from '../ui/Dialogo'

const PASOS = ['Tus datos', 'Entrega', 'Pago', 'Confirmar']
const VACIO: DatosPedido = { cliente: '', telefono: '', entrega: 'retiro', calle: '', altura: '', entreCalles: '', localidad: '', codigoPostal: '', pago: '', notas: '' }

const claseCampo = (error?: string) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-1 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900'}`

function Campo({ id, etiqueta, error, children }: { id: string; etiqueta: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600">{etiqueta}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export default function PanelCarrito() {
  const abierto = useStore($carritoAbierto)
  const items = useStore($carrito)
  const total = useStore($totalCarrito)
  const { productos } = useStore($catalogo)
  const [paso, setPaso] = useState(-1) // -1 = lista del carrito
  const [datos, setDatos] = useState<DatosPedido>(VACIO)
  const [errores, setErrores] = useState<ErroresPedido>({})
  const [enviado, setEnviado] = useState<{ codigo: string; link: string } | null>(null)

  const stockDe = (id: string) => productos.find((p) => p.id === id)?.stock ?? 9999
  /** En pallet, el carrito sube y baja de a pallets completos. */
  const pasoDe = (id: string, modo: string) => (modo === 'pallet' ? productos.find((p) => p.id === id)?.cajasPorPallet || 1 : 1)
  const set = (campo: keyof DatosPedido) => (e: { target: { value: string } }) => setDatos({ ...datos, [campo]: e.target.value })
  const ariaError = (campo: keyof DatosPedido) => (errores[campo] ? { 'aria-invalid': true, 'aria-describedby': `${campo}-error` } : {})

  const cerrar = () => {
    $carritoAbierto.set(false)
    if (enviado) { setEnviado(null); setPaso(-1) }
  }

  const siguiente = () => {
    const e = validarPaso(paso, datos)
    setErrores(e)
    if (!Object.keys(e).length) setPaso(paso + 1)
  }

  const confirmar = () => {
    const codigo = codigoPedido()
    const link = linkWhatsApp(mensajePedido(items, datos, codigo))
    window.open(link, '_blank', 'noopener')
    setEnviado({ codigo, link })
    vaciarCarrito()
  }

  let titulo: ReactNode = 'Tu carrito'
  if (enviado) titulo = '¡Pedido listo!'
  else if (paso >= 0) titulo = 'Finalizar pedido'

  let contenido: ReactNode
  let pie: ReactNode = null

  if (enviado) {
    contenido = (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={56} />
        <p className="mt-4 text-lg font-bold">Pedido {enviado.codigo}</p>
        <p className="mt-2 text-sm text-gray-600">Se abrió WhatsApp con el detalle. Enviá el mensaje y te confirmamos stock y entrega.</p>
        <a href={enviado.link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800">
          <MessageCircle size={18} /> Abrir WhatsApp de nuevo
        </a>
      </div>
    )
  } else if (!items.length) {
    contenido = (
      <div className="py-16 text-center text-gray-500">
        <ShoppingCart className="mx-auto text-gray-300" size={44} />
        <p className="mt-3">Tu carrito está vacío.</p>
        <button type="button" onClick={cerrar} className="mt-2 font-bold text-gray-900 underline">Seguir comprando</button>
      </div>
    )
  } else if (paso === -1) {
    contenido = (
      <ul className="divide-y divide-gray-100">
        {items.map((i) => (
          <li key={`${i.productoId}-${i.modo}`} className="flex gap-3 py-4 first:pt-0">
            <img src={i.imagen || '/productos/sin-imagen.svg'} alt="" width={72} height={72} className="h-18 w-18 shrink-0 rounded-lg bg-gray-50 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold text-gray-900">{i.nombre}</p>
              <p className="mt-0.5 text-xs text-gray-500"><span className="rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-700">{MODOS[i.modo].corto}</span> · {formatoPrecio(i.precioCaja)} por caja</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex h-8 items-center rounded-lg border border-gray-200">
                  <button type="button" aria-label={i.modo === 'pallet' ? 'Un pallet menos' : 'Una caja menos'} onClick={() => cambiarCajas(i.productoId, i.modo, i.cajas - pasoDe(i.productoId, i.modo), stockDe(i.productoId))} disabled={i.cajas <= pasoDe(i.productoId, i.modo)} className="px-2.5 text-gray-600 disabled:opacity-30"><Minus size={14} /></button>
                  <span className="w-9 text-center text-sm font-bold" aria-label={`${i.cajas} cajas`}>{i.cajas}</span>
                  <button type="button" aria-label={i.modo === 'pallet' ? 'Un pallet más' : 'Una caja más'} onClick={() => cambiarCajas(i.productoId, i.modo, i.cajas + pasoDe(i.productoId, i.modo), stockDe(i.productoId))} disabled={i.cajas + pasoDe(i.productoId, i.modo) > stockDe(i.productoId)} className="px-2.5 text-gray-600 disabled:opacity-30"><Plus size={14} /></button>
                </div>
                <span className="font-bold">{formatoPrecio(i.precioCaja * i.cajas)}</span>
              </div>
            </div>
            <button type="button" aria-label={`Quitar ${i.nombre}`} onClick={() => quitarDelCarrito(i.productoId, i.modo)} className="self-start p-1 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
          </li>
        ))}
      </ul>
    )
    pie = (
      <>
        <div className="mb-3 flex items-end justify-between">
          <span className="text-sm text-gray-500">Total estimado</span>
          <span className="text-2xl font-black">{formatoPrecio(total)}</span>
        </div>
        <button type="button" onClick={() => setPaso(0)} className="w-full rounded-xl bg-gray-900 py-3.5 font-bold text-white transition hover:bg-black">Finalizar pedido</button>
        <p className="mt-2 text-center text-xs text-gray-500">El stock y el envío se confirman por WhatsApp.</p>
      </>
    )
  } else {
    contenido = (
      <div>
        <ol className="mb-6 flex justify-between">
          {PASOS.map((nombre, n) => (
            <li key={nombre} className={`flex flex-col items-center gap-1 text-[11px] font-bold uppercase tracking-wide ${n <= paso ? 'text-gray-900' : 'text-gray-300'}`} aria-current={n === paso ? 'step' : undefined}>
              <span className={`h-2.5 w-2.5 rounded-full ${n <= paso ? 'bg-gray-900' : 'bg-gray-200'}`} />{nombre}
            </li>
          ))}
        </ol>

        {paso === 0 && (
          <div className="space-y-4">
            <Campo id="cliente" etiqueta="Nombre o local" error={errores.cliente}>
              <input id="cliente" autoComplete="organization" value={datos.cliente} onChange={set('cliente')} className={claseCampo(errores.cliente)} placeholder="Ej: Almacén Rosa" {...ariaError('cliente')} />
            </Campo>
            <Campo id="telefono" etiqueta="Teléfono (opcional)" error={errores.telefono}>
              <input id="telefono" type="tel" autoComplete="tel" value={datos.telefono} onChange={set('telefono')} className={claseCampo(errores.telefono)} placeholder="11 2345-6789" {...ariaError('telefono')} />
            </Campo>
          </div>
        )}

        {paso === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Entrega">
              {(['retiro', 'envio'] as const).map((e) => (
                <button key={e} type="button" role="radio" aria-checked={datos.entrega === e} onClick={() => setDatos({ ...datos, entrega: e })}
                  className={`rounded-xl border p-3 text-sm font-bold transition ${datos.entrega === e ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}>
                  {e === 'retiro' ? 'Retiro en el local' : 'Envío a domicilio'}
                </button>
              ))}
            </div>
            {datos.entrega === 'retiro' ? (
              <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">Retirás en <strong>{TIENDA.direccion}</strong>. {TIENDA.horarios}.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><Campo id="calle" etiqueta="Calle" error={errores.calle}><input id="calle" autoComplete="address-line1" value={datos.calle} onChange={set('calle')} className={claseCampo(errores.calle)} {...ariaError('calle')} /></Campo></div>
                <Campo id="altura" etiqueta="Altura" error={errores.altura}><input id="altura" inputMode="numeric" value={datos.altura} onChange={set('altura')} className={claseCampo(errores.altura)} {...ariaError('altura')} /></Campo>
                <div className="col-span-3"><Campo id="entreCalles" etiqueta="Entre calles (opcional)"><input id="entreCalles" value={datos.entreCalles} onChange={set('entreCalles')} className={claseCampo()} /></Campo></div>
                <div className="col-span-2"><Campo id="localidad" etiqueta="Localidad" error={errores.localidad}><input id="localidad" autoComplete="address-level2" value={datos.localidad} onChange={set('localidad')} className={claseCampo(errores.localidad)} {...ariaError('localidad')} /></Campo></div>
                <Campo id="codigoPostal" etiqueta="CP"><input id="codigoPostal" autoComplete="postal-code" inputMode="numeric" value={datos.codigoPostal} onChange={set('codigoPostal')} className={claseCampo()} /></Campo>
              </div>
            )}
          </div>
        )}

        {paso === 2 && (
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-600">Medio de pago</legend>
            <div className="space-y-2">
              {TIENDA.mediosDePago.map((m) => (
                <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm font-medium transition ${datos.pago === m ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="pago" checked={datos.pago === m} onChange={() => setDatos({ ...datos, pago: m })} className="h-4 w-4 accent-gray-900" /> {m}
                </label>
              ))}
            </div>
            {errores.pago && <p className="mt-2 text-xs font-medium text-red-600">{errores.pago}</p>}
          </fieldset>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <p className="font-bold">{datos.cliente}</p>
              <p className="text-gray-600">{datos.entrega === 'retiro' ? 'Retiro en el local' : `${datos.calle} ${datos.altura}, ${datos.localidad}`} · {datos.pago}</p>
              <p className="mt-2 text-gray-600">{items.length} {items.length === 1 ? 'producto' : 'productos'} · <strong className="text-gray-900">{formatoPrecio(total)}</strong></p>
            </div>
            <Campo id="notas" etiqueta="Notas (opcional)">
              <textarea id="notas" rows={3} value={datos.notas} onChange={set('notas')} className={`${claseCampo()} resize-none`} placeholder="Ej: recibimos mercadería después de las 14 h" />
            </Campo>
            <p className="flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800"><MessageCircle size={18} className="shrink-0" /> Al confirmar se abre WhatsApp con tu pedido listo para enviar.</p>
          </div>
        )}
      </div>
    )
    pie = (
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => { setErrores({}); setPaso(paso - 1) }} className="px-3 py-2.5 font-bold text-gray-500 hover:text-gray-900">Volver</button>
        {paso < 3 ? (
          <button type="button" onClick={siguiente} className="rounded-xl bg-gray-900 px-7 py-3 font-bold text-white hover:bg-black">Siguiente</button>
        ) : (
          <button type="button" onClick={confirmar} className="flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"><MessageCircle size={18} /> Enviar por WhatsApp</button>
        )}
      </div>
    )
  }

  return (
    <Dialogo abierto={abierto} onCerrar={cerrar} titulo={titulo} variante="lateral" pie={pie}>
      {contenido}
    </Dialogo>
  )
}
