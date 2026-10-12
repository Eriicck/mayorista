// Datos del negocio. Todo lo que se muestra en la tienda y en el pedido sale de acá.

export const TIENDA = {
  nombre: 'Mayorista Online',
  url: 'https://mayoristaweb.netlify.app',
  descripcion: 'Distribuidora mayorista: almacén, bebidas, limpieza y más. Precios por caja cerrada, retiro en el local o envío por bulto y pallet.',
  /** Número de WhatsApp en formato internacional, sin + ni espacios (Argentina: 549 + área + número). */
  whatsapp: '5491176612886',
  telefonoVisible: '+54 9 11 7661-2886',
  direccion: 'Av. Victorica 1234, Moreno, Buenos Aires',
  mapa: 'https://www.google.com/maps/search/?api=1&query=Moreno+Buenos+Aires',
  horarios: 'Lunes a viernes de 8 a 17 h · Sábados de 8 a 13 h',
  mediosDePago: ['Efectivo', 'Transferencia bancaria', 'Acordar con el vendedor'],
  /** Debajo de esta cantidad de cajas el producto figura como "stock crítico" en el panel. */
  stockCritico: 5,
  productosPorPagina: 12,
  redes: { instagram: '', facebook: '' },
} as const

/** Credenciales de la demo del panel (se muestran en la pantalla de ingreso). */
export const DEMO_ADMIN = { email: 'demo@mayoristaonline.com', clave: 'demo1234' } as const

export const MODOS = {
  retiro: { nombre: 'Retiro en el local', corto: 'Retiro', detalle: 'La opción más económica' },
  bulto: { nombre: 'Envío por bulto', corto: 'Bulto', detalle: 'Entrega estándar por caja' },
  pallet: { nombre: 'Envío por pallet', corto: 'Pallet', detalle: 'Para compras grandes' },
} as const
