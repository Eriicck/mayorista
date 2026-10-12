// Catálogo de DEMOSTRACIÓN: marcas ficticias y precios de ejemplo.
// Las imágenes se generan con `npm run imagenes` (scripts/generar-imagenes.mjs) a partir de `envase`.
import type { Banner, Producto } from '../lib/tipos'
// Con extensión .ts para que también lo pueda leer el script de imágenes (Node)
import { slug } from '../lib/texto.ts'

export type Envase = 'bolsa' | 'paquete' | 'botella' | 'bidon' | 'lata' | 'caja' | 'frasco' | 'rollo' | 'aerosol' | 'barra'

export type ProductoDemo = Producto & { envase: Envase }

export const CATEGORIAS = ['Almacén', 'Bebidas', 'Limpieza', 'Perfumería', 'Golosinas', 'Librería', 'Bazar', 'Mascotas'] as const

type Datos = Omit<ProductoDemo, 'id' | 'imagenes' | 'visible' | 'precios'> & {
  /** [retiro, bulto, pallet?] precio por caja */
  p: [number, number, number?]
  visible?: boolean
}

const prod = ({ p, visible = true, ...d }: Datos): ProductoDemo => {
  const id = slug(`${d.nombre}`)
  return { id, ...d, precios: { retiro: p[0], bulto: p[1], ...(p[2] ? { pallet: p[2] } : {}) }, imagenes: [`/productos/${id}.webp`], visible }
}

export const PRODUCTOS_DEMO: ProductoDemo[] = [
  // ── Almacén
  prod({ nombre: 'Arroz largo fino 1 kg', marca: 'Don Cosme', categoria: 'Almacén', subcategoria: 'Arroz y legumbres', envase: 'bolsa', unidadesPorCaja: 10, cajasPorPallet: 80, stock: 140, p: [14500, 15900, 15100], masVendido: true, descripcion: 'Arroz largo fino tipo 00000. Caja cerrada de 10 paquetes de 1 kg.' }),
  prod({ nombre: 'Fideos spaghetti 500 g', marca: 'La Pradera', categoria: 'Almacén', subcategoria: 'Pastas secas', envase: 'paquete', unidadesPorCaja: 20, cajasPorPallet: 60, stock: 95, p: [17800, 19400, 18500], masVendido: true }),
  prod({ nombre: 'Aceite de girasol 900 ml', marca: 'Sol del Valle', categoria: 'Almacén', subcategoria: 'Aceites', envase: 'botella', unidadesPorCaja: 12, cajasPorPallet: 70, stock: 60, p: [26400, 28900, 27600], oferta: 10 }),
  prod({ nombre: 'Harina 000 1 kg', marca: 'Don Cosme', categoria: 'Almacén', subcategoria: 'Harinas', envase: 'bolsa', unidadesPorCaja: 10, cajasPorPallet: 90, stock: 120, p: [9800, 10900, 10300] }),
  prod({ nombre: 'Azúcar 1 kg', marca: 'Dulce Norte', categoria: 'Almacén', subcategoria: 'Azúcar y endulzantes', envase: 'bolsa', unidadesPorCaja: 10, cajasPorPallet: 90, stock: 4, p: [11200, 12300, 11800] }),
  prod({ nombre: 'Yerba mate 1 kg', marca: 'Pampa Verde', categoria: 'Almacén', subcategoria: 'Infusiones', envase: 'paquete', unidadesPorCaja: 10, cajasPorPallet: 50, stock: 75, p: [42500, 46200, 44100], masVendido: true }),
  prod({ nombre: 'Puré de tomate 520 g', marca: 'La Pradera', categoria: 'Almacén', subcategoria: 'Conservas', envase: 'caja', unidadesPorCaja: 12, stock: 88, p: [10300, 11400] }),
  prod({ nombre: 'Atún al natural 170 g', marca: 'Mar Azul', categoria: 'Almacén', subcategoria: 'Conservas', envase: 'lata', unidadesPorCaja: 24, cajasPorPallet: 100, stock: 0, p: [52800, 57600, 55200] }),
  prod({ nombre: 'Mayonesa 500 g', marca: 'Sol del Valle', categoria: 'Almacén', subcategoria: 'Aderezos', envase: 'frasco', unidadesPorCaja: 12, stock: 46, p: [21600, 23700], oferta: 15 }),

  // ── Bebidas
  prod({ nombre: 'Agua mineral 2 L', marca: 'Fuente Clara', categoria: 'Bebidas', subcategoria: 'Aguas', envase: 'botella', unidadesPorCaja: 6, cajasPorPallet: 84, stock: 210, p: [5400, 6100, 5700], masVendido: true }),
  prod({ nombre: 'Gaseosa cola 2,25 L', marca: 'Burbuja', categoria: 'Bebidas', subcategoria: 'Gaseosas', envase: 'botella', unidadesPorCaja: 8, cajasPorPallet: 60, stock: 130, p: [17600, 19500, 18400], masVendido: true }),
  prod({ nombre: 'Jugo de naranja 1 L', marca: 'Huerta', categoria: 'Bebidas', subcategoria: 'Jugos', envase: 'caja', unidadesPorCaja: 12, stock: 54, p: [16300, 17900], oferta: 10 }),
  prod({ nombre: 'Cerveza rubia lata 473 ml', marca: 'Cervecería del Sur', categoria: 'Bebidas', subcategoria: 'Cervezas', envase: 'lata', unidadesPorCaja: 24, cajasPorPallet: 80, stock: 3, p: [31200, 34300, 32600] }),
  prod({ nombre: 'Vino tinto malbec 750 ml', marca: 'Viñas del Oeste', categoria: 'Bebidas', subcategoria: 'Vinos', envase: 'botella', unidadesPorCaja: 6, stock: 40, p: [24600, 26900] }),
  prod({ nombre: 'Bebida isotónica 500 ml', marca: 'Impulso', categoria: 'Bebidas', subcategoria: 'Isotónicas', envase: 'botella', unidadesPorCaja: 12, cajasPorPallet: 100, stock: 66, p: [13900, 15300, 14500] }),

  // ── Limpieza
  prod({ nombre: 'Lavandina 2 L', marca: 'Brisa', categoria: 'Limpieza', subcategoria: 'Lavandinas', envase: 'bidon', unidadesPorCaja: 8, cajasPorPallet: 60, stock: 90, p: [9600, 10700, 10100], masVendido: true }),
  prod({ nombre: 'Detergente concentrado 750 ml', marca: 'Brisa', categoria: 'Limpieza', subcategoria: 'Vajilla', envase: 'botella', unidadesPorCaja: 12, stock: 72, p: [18700, 20500], oferta: 12 }),
  prod({ nombre: 'Jabón en polvo 3 kg', marca: 'Nube', categoria: 'Limpieza', subcategoria: 'Ropa', envase: 'bolsa', unidadesPorCaja: 4, cajasPorPallet: 45, stock: 5, p: [33400, 36700, 35000] }),
  prod({ nombre: 'Limpiador de pisos 900 ml', marca: 'Hogar Plus', categoria: 'Limpieza', subcategoria: 'Pisos', envase: 'botella', unidadesPorCaja: 12, stock: 58, p: [14200, 15600] }),
  prod({ nombre: 'Esponja doble uso x3', marca: 'Hogar Plus', categoria: 'Limpieza', subcategoria: 'Accesorios', envase: 'paquete', unidadesPorCaja: 24, stock: 34, p: [21100, 23200] }),

  // ── Perfumería
  prod({ nombre: 'Papel higiénico x4 rollos', marca: 'Nube', categoria: 'Perfumería', subcategoria: 'Papel', envase: 'rollo', unidadesPorCaja: 12, cajasPorPallet: 40, stock: 80, p: [19800, 21900, 20700], masVendido: true }),
  prod({ nombre: 'Shampoo 400 ml', marca: 'Aurora', categoria: 'Perfumería', subcategoria: 'Cabello', envase: 'botella', unidadesPorCaja: 12, stock: 28, p: [27300, 29900] }),
  prod({ nombre: 'Jabón de tocador x3', marca: 'Aurora', categoria: 'Perfumería', subcategoria: 'Cuidado personal', envase: 'caja', unidadesPorCaja: 24, stock: 0, p: [30200, 33100] }),
  prod({ nombre: 'Desodorante en aerosol 150 ml', marca: 'Impulso', categoria: 'Perfumería', subcategoria: 'Cuidado personal', envase: 'aerosol', unidadesPorCaja: 12, stock: 44, p: [25900, 28400], oferta: 15 }),

  // ── Golosinas
  prod({ nombre: 'Alfajor triple chocolate', marca: 'Kiko', categoria: 'Golosinas', subcategoria: 'Alfajores', envase: 'barra', unidadesPorCaja: 18, stock: 64, p: [16900, 18500], masVendido: true }),
  prod({ nombre: 'Chocolate con leche 100 g', marca: 'Kiko', categoria: 'Golosinas', subcategoria: 'Chocolates', envase: 'barra', unidadesPorCaja: 20, stock: 39, p: [28400, 31200] }),
  prod({ nombre: 'Caramelos frutales 800 g', marca: 'Dulce Norte', categoria: 'Golosinas', subcategoria: 'Caramelos', envase: 'bolsa', unidadesPorCaja: 12, stock: 22, p: [36500, 40100], oferta: 10 }),
  prod({ nombre: 'Chicles menta x20', marca: 'Kiko', categoria: 'Golosinas', subcategoria: 'Chicles', envase: 'caja', unidadesPorCaja: 24, stock: 2, p: [19200, 21100] }),

  // ── Librería
  prod({ nombre: 'Cuaderno tapa dura 84 hojas', marca: 'Trazo', categoria: 'Librería', subcategoria: 'Cuadernos', envase: 'caja', unidadesPorCaja: 10, stock: 30, p: [27500, 30200] }),
  prod({ nombre: 'Bolígrafo azul x50', marca: 'Trazo', categoria: 'Librería', subcategoria: 'Escritura', envase: 'caja', unidadesPorCaja: 1, stock: 26, p: [14800, 16300] }),
  prod({ nombre: 'Resma A4 75 g 500 hojas', marca: 'Trazo', categoria: 'Librería', subcategoria: 'Papel', envase: 'paquete', unidadesPorCaja: 5, cajasPorPallet: 40, stock: 48, p: [41500, 45600, 43400] }),

  // ── Bazar
  prod({ nombre: 'Vasos descartables 220 cc x50', marca: 'Fiesta', categoria: 'Bazar', subcategoria: 'Descartables', envase: 'paquete', unidadesPorCaja: 20, stock: 52, p: [23900, 26300] }),
  prod({ nombre: 'Bolsas de residuo 50x70 x10', marca: 'Hogar Plus', categoria: 'Bazar', subcategoria: 'Residuos', envase: 'rollo', unidadesPorCaja: 20, stock: 70, p: [15600, 17100] }),
  prod({ nombre: 'Servilletas de papel x100', marca: 'Nube', categoria: 'Bazar', subcategoria: 'Descartables', envase: 'paquete', unidadesPorCaja: 24, stock: 36, p: [20400, 22400], visible: false }),

  // ── Mascotas
  prod({ nombre: 'Alimento perro adulto 15 kg', marca: 'Patitas', categoria: 'Mascotas', subcategoria: 'Perros', envase: 'bolsa', unidadesPorCaja: 1, cajasPorPallet: 40, stock: 18, p: [38900, 42700, 40800], masVendido: true }),
  prod({ nombre: 'Alimento gato 1 kg', marca: 'Patitas', categoria: 'Mascotas', subcategoria: 'Gatos', envase: 'bolsa', unidadesPorCaja: 10, stock: 25, p: [44200, 48600], oferta: 10 }),
]

export const BANNERS_DEMO: Banner[] = [
  { id: 'precios-mayoristas', titulo: 'Precios mayoristas en todo el catálogo', imagenEscritorio: '/banners/precios-mayoristas.webp', imagenCelular: '/banners/precios-mayoristas-movil.webp', orden: 1, activo: true },
  { id: 'ofertas', titulo: 'Ofertas de la semana', imagenEscritorio: '/banners/ofertas.webp', imagenCelular: '/banners/ofertas-movil.webp', link: '?categoria=Ofertas', orden: 2, activo: true },
  { id: 'envios', titulo: 'Envíos por bulto y pallet', imagenEscritorio: '/banners/envios.webp', imagenCelular: '/banners/envios-movil.webp', orden: 3, activo: true },
]
