// Importar y exportar productos en Excel (.xlsx) o CSV.
// La librería (SheetJS) se carga recién cuando se usa, así no pesa en la tienda.
import { slug } from './texto'
import type { Producto } from './tipos'

export const COLUMNAS = [
  'Nombre', 'Marca', 'Categoria', 'Subcategoria', 'PrecioRetiro', 'PrecioBulto', 'PrecioPallet', 'PrecioEsUnitario',
  'UnidadesPorCaja', 'CajasPorPallet', 'Stock', 'Oferta', 'MasVendido', 'Visible', 'Imagen', 'Descripcion',
] as const

type Fila = Partial<Record<(typeof COLUMNAS)[number], unknown>>

/** "$12.423", "12.423,50", 12423 → número. Vacío o basura → 0. */
export function leerPrecio(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (v === null || v === undefined) return 0
  const limpio = String(v).replace(/[$\s.]/g, '').replace(',', '.')
  const n = Number(limpio)
  return Number.isFinite(n) ? n : 0
}

const esSi = (v: unknown) => ['si', 'sí', 's', 'true', '1', 'x'].includes(String(v ?? '').trim().toLowerCase())
const esNo = (v: unknown) => ['no', 'n', 'false', '0'].includes(String(v ?? '').trim().toLowerCase())
const texto = (v: unknown) => String(v ?? '').trim()
const entero = (v: unknown, defecto = 0) => {
  const n = Math.floor(leerPrecio(v))
  return Number.isFinite(n) && n >= 0 ? n : defecto
}

export interface ResultadoFila {
  fila: number
  producto?: Producto
  errores: string[]
}

/** Convierte una fila de la planilla en un producto, con los errores que encuentre. */
export function filaAProducto(f: Fila, fila: number, existente?: Producto): ResultadoFila {
  const errores: string[] = []
  const nombre = texto(f.Nombre)
  if (!nombre) errores.push('Falta el nombre')
  const unidades = entero(f.UnidadesPorCaja, 1) || 1
  const multiplicar = esSi(f.PrecioEsUnitario) ? unidades : 1
  const retiro = Math.round(leerPrecio(f.PrecioRetiro) * multiplicar)
  const bulto = Math.round(leerPrecio(f.PrecioBulto) * multiplicar)
  const pallet = Math.round(leerPrecio(f.PrecioPallet) * multiplicar)
  if (retiro <= 0) errores.push('PrecioRetiro tiene que ser mayor a 0')
  if (bulto <= 0) errores.push('PrecioBulto tiene que ser mayor a 0')
  const oferta = Math.min(entero(f.Oferta), 90)
  if (errores.length) return { fila, errores }

  const id = slug(nombre)
  const imagen = texto(f.Imagen)
  const producto: Producto = {
    id,
    nombre,
    marca: texto(f.Marca) || existente?.marca || 'Sin marca',
    categoria: texto(f.Categoria) || existente?.categoria || 'General',
    subcategoria: texto(f.Subcategoria) || existente?.subcategoria,
    descripcion: texto(f.Descripcion) || existente?.descripcion,
    precios: { retiro, bulto, ...(pallet > 0 ? { pallet } : {}) },
    unidadesPorCaja: unidades,
    cajasPorPallet: entero(f.CajasPorPallet) || undefined,
    stock: f.Stock === undefined || texto(f.Stock) === '' ? (existente?.stock ?? 0) : entero(f.Stock),
    imagenes: imagen ? [imagen] : (existente?.imagenes ?? []),
    oferta: oferta || undefined,
    masVendido: esSi(f.MasVendido),
    visible: !esNo(f.Visible),
  }
  return { fila, producto, errores }
}

/** Lee un .xlsx/.csv y devuelve una fila por producto (la fila 1 son los títulos). */
export async function leerPlanilla(archivo: File, existentes: Producto[]): Promise<ResultadoFila[]> {
  const XLSX = await import('xlsx')
  const libro = XLSX.read(await archivo.arrayBuffer(), { type: 'array' })
  const hoja = libro.Sheets[libro.SheetNames[0]]
  const filas = XLSX.utils.sheet_to_json<Fila>(hoja, { defval: '' })
  const porId = new Map(existentes.map((p) => [p.id, p]))
  return filas.map((f, i) => filaAProducto(f, i + 2, porId.get(slug(texto(f.Nombre)))))
}

const aFila = (p: Producto): Fila => ({
  Nombre: p.nombre, Marca: p.marca, Categoria: p.categoria, Subcategoria: p.subcategoria ?? '',
  PrecioRetiro: p.precios.retiro, PrecioBulto: p.precios.bulto, PrecioPallet: p.precios.pallet ?? '', PrecioEsUnitario: 'NO',
  UnidadesPorCaja: p.unidadesPorCaja, CajasPorPallet: p.cajasPorPallet ?? '', Stock: p.stock, Oferta: p.oferta ?? '',
  MasVendido: p.masVendido ? 'SI' : 'NO', Visible: p.visible ? 'SI' : 'NO', Imagen: p.imagenes[0] ?? '', Descripcion: p.descripcion ?? '',
})

async function descargar(filas: Fila[], nombreArchivo: string) {
  const XLSX = await import('xlsx')
  const hoja = XLSX.utils.json_to_sheet(filas, { header: [...COLUMNAS] })
  hoja['!cols'] = COLUMNAS.map((c) => ({ wch: c === 'Nombre' || c === 'Descripcion' || c === 'Imagen' ? 32 : 14 }))
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, 'Productos')
  XLSX.writeFile(libro, nombreArchivo)
}

/** Planilla modelo con dos productos de ejemplo. */
export const descargarPlantilla = () =>
  descargar(
    [
      { Nombre: 'Arroz largo fino 1 kg', Marca: 'Don Cosme', Categoria: 'Almacén', Subcategoria: 'Arroz y legumbres', PrecioRetiro: 14500, PrecioBulto: 15900, PrecioPallet: 15100, PrecioEsUnitario: 'NO', UnidadesPorCaja: 10, CajasPorPallet: 80, Stock: 140, Oferta: '', MasVendido: 'SI', Visible: 'SI', Imagen: '', Descripcion: 'Caja de 10 paquetes' },
      { Nombre: 'Lavandina 2 L', Marca: 'Brisa', Categoria: 'Limpieza', Subcategoria: '', PrecioRetiro: 1200, PrecioBulto: 1340, PrecioPallet: '', PrecioEsUnitario: 'SI', UnidadesPorCaja: 8, CajasPorPallet: '', Stock: 90, Oferta: 10, MasVendido: 'NO', Visible: 'SI', Imagen: '', Descripcion: 'Precio por unidad: se multiplica por 8 al importar' },
    ],
    'modelo-productos.xlsx',
  )

export const exportarProductos = (productos: Producto[]) =>
  descargar(productos.map(aFila), `productos-${new Date().toISOString().slice(0, 10)}.xlsx`)
