import { useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react'
import { avisar } from '../../lib/avisos'
import { $catalogo, importarProductos } from '../../lib/catalogo'
import { COLUMNAS, descargarPlantilla, exportarProductos, leerPlanilla, type ResultadoFila } from '../../lib/excel'
import { formatoPrecio } from '../../lib/precios'

export default function Importar() {
  const { productos } = useStore($catalogo)
  const [filas, setFilas] = useState<ResultadoFila[] | null>(null)
  const [archivo, setArchivo] = useState('')
  const [cargando, setCargando] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const validas = filas?.filter((f) => f.producto) ?? []
  const conError = filas?.filter((f) => !f.producto) ?? []
  const nuevos = validas.filter((f) => !productos.some((p) => p.id === f.producto?.id)).length

  const leer = async (f?: File) => {
    if (!f) return
    setCargando(true)
    try {
      setFilas(await leerPlanilla(f, productos))
      setArchivo(f.name)
    } catch {
      avisar('No se pudo leer el archivo. ¿Es un Excel o CSV?', 'error')
    } finally {
      setCargando(false)
      if (input.current) input.current.value = ''
    }
  }

  const confirmar = () => {
    importarProductos(validas.map((f) => f.producto!))
    avisar(`${validas.length} productos importados`)
    setFilas(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Importar y exportar con Excel</h1>
        <p className="text-sm text-gray-500">Cargá o actualizá muchos productos de una vez. Si el nombre ya existe, se actualiza; si no, se crea.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <button type="button" onClick={() => descargarPlantilla()} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left hover:shadow-md">
          <span className="rounded-xl bg-blue-50 p-3 text-blue-700"><Download size={22} /></span>
          <span><span className="block font-bold">1. Bajar el modelo</span><span className="text-xs text-gray-500">Planilla con las columnas y 2 ejemplos</span></span>
        </button>
        <button type="button" onClick={() => input.current?.click()} disabled={cargando} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left hover:shadow-md disabled:opacity-60">
          <span className="rounded-xl bg-green-50 p-3 text-green-700"><Upload size={22} /></span>
          <span><span className="block font-bold">2. Subir la planilla</span><span className="text-xs text-gray-500">{cargando ? 'Leyendo…' : '.xlsx, .xls o .csv'}</span></span>
        </button>
        <button type="button" onClick={() => exportarProductos(productos)} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left hover:shadow-md">
          <span className="rounded-xl bg-gray-100 p-3 text-gray-800"><FileSpreadsheet size={22} /></span>
          <span><span className="block font-bold">Exportar catálogo</span><span className="text-xs text-gray-500">Los {productos.length} productos actuales</span></span>
        </button>
        <input ref={input} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => leer(e.target.files?.[0])} aria-label="Elegir planilla" />
      </div>

      {filas && (
        <section className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
            <div>
              <h2 className="font-bold">Vista previa: {archivo}</h2>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-green-700">{validas.length} listos</span> ({nuevos} nuevos, {validas.length - nuevos} a actualizar)
                {conError.length > 0 && <> · <span className="font-semibold text-red-600">{conError.length} con errores (no se importan)</span></>}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFilas(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button type="button" onClick={confirmar} disabled={!validas.length} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Importar {validas.length}</button>
            </div>
          </div>
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                <tr><th className="p-3">Fila</th><th className="p-3">Producto</th><th className="p-3">Categoría</th><th className="p-3 text-right">Retiro / caja</th><th className="p-3 text-center">Stock</th><th className="p-3">Estado</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filas.map((f) => (
                  <tr key={f.fila} className={f.producto ? '' : 'bg-red-50/60'}>
                    <td className="p-3 tabular-nums text-gray-500">{f.fila}</td>
                    <td className="p-3 font-medium">{f.producto?.nombre ?? '—'}</td>
                    <td className="p-3 text-gray-600">{f.producto?.categoria ?? ''}</td>
                    <td className="p-3 text-right tabular-nums">{f.producto ? formatoPrecio(f.producto.precios.retiro) : ''}</td>
                    <td className="p-3 text-center tabular-nums">{f.producto?.stock ?? ''}</td>
                    <td className="p-3">
                      {f.producto
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-green-700"><CheckCircle2 size={14} /> {productos.some((p) => p.id === f.producto?.id) ? 'Actualiza' : 'Nuevo'}</span>
                        : <span className="flex items-start gap-1 text-xs font-semibold text-red-700"><AlertCircle size={14} className="mt-px shrink-0" /> {f.errores.join(' · ')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-gray-200 bg-white p-5 text-sm">
        <summary className="cursor-pointer font-bold">¿Qué va en cada columna?</summary>
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-gray-600 sm:grid-cols-2">
          <li><b>Nombre</b> (obligatorio): identifica el producto. Si ya existe, se actualiza.</li>
          <li><b>PrecioRetiro, PrecioBulto</b> (obligatorios), <b>PrecioPallet</b>: precio de la caja. Aceptan “$12.500”.</li>
          <li><b>PrecioEsUnitario</b>: “SI” si cargaste el precio por unidad; se multiplica por la caja.</li>
          <li><b>UnidadesPorCaja</b>, <b>CajasPorPallet</b>, <b>Stock</b> (en cajas).</li>
          <li><b>Oferta</b>: porcentaje de descuento (0 a 90).</li>
          <li><b>MasVendido</b>, <b>Visible</b>: SI / NO.</li>
          <li><b>Imagen</b>: URL de la foto.</li>
          <li>Columnas: {COLUMNAS.join(', ')}.</li>
        </ul>
      </details>
    </div>
  )
}
