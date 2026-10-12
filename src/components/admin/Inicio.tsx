import { useStore } from '@nanostores/react'
import { AlertTriangle, Ban, Package, Percent } from 'lucide-react'
import { TIENDA } from '../../config/tienda'
import { $catalogo } from '../../lib/catalogo'
import { formatoPrecio } from '../../lib/precios'

const Tarjeta = ({ titulo, valor, detalle, href, Icono, color }: { titulo: string; valor: number; detalle: string; href: string; Icono: typeof Package; color: string }) => (
  <a href={href} className="flex items-start justify-between rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
    <span>
      <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">{titulo}</span>
      <span className="mt-1 block text-3xl font-black text-gray-900">{valor}</span>
      <span className="mt-1 block text-xs text-gray-500">{detalle}</span>
    </span>
    <span className={`rounded-xl p-3 ${color}`}><Icono size={22} /></span>
  </a>
)

export default function Inicio() {
  const { productos } = useStore($catalogo)
  const publicados = productos.filter((p) => p.visible)
  const sinStock = productos.filter((p) => p.stock <= 0)
  const criticos = productos.filter((p) => p.stock > 0 && p.stock <= TIENDA.stockCritico)
  const enOferta = publicados.filter((p) => (p.oferta ?? 0) > 0)
  const valorInventario = productos.reduce((t, p) => t + p.stock * p.precios.retiro, 0)

  const porCategoria = Object.entries(
    productos.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.categoria]: (acc[p.categoria] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])
  const maximo = Math.max(1, ...porCategoria.map(([, n]) => n))
  const reponer = [...sinStock, ...criticos].slice(0, 6)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">¡Hola! 👋</h1>
        <p className="text-sm text-gray-500">Así está tu catálogo hoy.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta titulo="Publicados" valor={publicados.length} detalle={`${productos.length - publicados.length} ocultos`} href="#productos" Icono={Package} color="bg-gray-100 text-gray-800" />
        <Tarjeta titulo="Sin stock" valor={sinStock.length} detalle="No se pueden comprar" href="#productos?filtro=sin-stock" Icono={Ban} color="bg-red-50 text-red-600" />
        <Tarjeta titulo="Stock crítico" valor={criticos.length} detalle={`${TIENDA.stockCritico} cajas o menos`} href="#productos?filtro=critico" Icono={AlertTriangle} color="bg-amber-50 text-amber-600" />
        <Tarjeta titulo="En oferta" valor={enOferta.length} detalle="Aparecen en “Ofertas”" href="#productos?filtro=oferta" Icono={Percent} color="bg-green-50 text-green-700" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold">Productos por categoría</h2>
          <ul className="mt-4 space-y-2.5">
            {porCategoria.map(([cat, n]) => (
              <li key={cat} className="grid grid-cols-[110px_1fr_28px] items-center gap-3 text-sm">
                <span className="truncate text-gray-600">{cat}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-gray-100"><span className="block h-full rounded-full bg-gray-900" style={{ width: `${(n / maximo) * 100}%` }} /></span>
                <span className="text-right font-bold tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-500">Valor del inventario (a precio de retiro): <strong className="text-gray-900">{formatoPrecio(valorInventario)}</strong></p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold">Para reponer</h2>
          {reponer.length ? (
            <ul className="mt-3 divide-y divide-gray-100">
              {reponer.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <img src={p.imagenes[0] || '/productos/sin-imagen.svg'} alt="" width={40} height={40} className="h-10 w-10 rounded-lg bg-gray-50 object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.nombre}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{p.stock <= 0 ? 'Agotado' : `${p.stock} cajas`}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-gray-500">Todo con stock. 🎉</p>}
        </section>
      </div>
    </div>
  )
}
