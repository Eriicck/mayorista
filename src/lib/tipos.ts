// Modelos de datos de la tienda.

/** Cómo se compra: retirando en el local, con envío por bulto (caja) o por pallet. */
export type ModoCompra = 'retiro' | 'bulto' | 'pallet'

export interface Producto {
  id: string
  nombre: string
  marca: string
  categoria: string
  subcategoria?: string
  descripcion?: string
  /** Precio de UNA caja cerrada según el modo de compra. */
  precios: { retiro: number; bulto: number; pallet?: number }
  unidadesPorCaja: number
  /** Si no se conoce, el pallet se vende "a consultar" (cuenta como cajas sueltas). */
  cajasPorPallet?: number
  /** Stock en cajas. */
  stock: number
  imagenes: string[]
  /** Porcentaje de descuento (0-90). Si es mayor a 0, aparece en "Ofertas". */
  oferta?: number
  masVendido?: boolean
  visible: boolean
}

export interface Banner {
  id: string
  titulo: string
  imagenEscritorio: string
  imagenCelular?: string
  link?: string
  orden: number
  activo: boolean
}

export interface ItemCarrito {
  productoId: string
  nombre: string
  imagen: string
  modo: ModoCompra
  /** Cantidad en cajas (en modo pallet ya viene multiplicada). */
  cajas: number
  precioCaja: number
}

export interface Catalogo {
  productos: Producto[]
  banners: Banner[]
}
