// Fuente de datos del catálogo.
// Modo demo: arranca con los datos de ejemplo y los cambios del panel se guardan en este navegador
// (localStorage), así la tienda muestra lo que se edita en /admin sin tocar ninguna base real.
// Para conectarlo a una base (Firebase, API propia) alcanza con reemplazar este archivo.
import { atom } from 'nanostores'
import { BANNERS_DEMO, PRODUCTOS_DEMO } from '../data/catalogo'
import type { Banner, Catalogo, Producto } from './tipos'

const CLAVE = 'mayorista-demo-catalogo-v1'

const sinEnvase = ({ envase: _envase, ...p }: (typeof PRODUCTOS_DEMO)[number]): Producto => p

export const CATALOGO_INICIAL: Catalogo = {
  productos: PRODUCTOS_DEMO.map(sinEnvase),
  banners: BANNERS_DEMO,
}

export const $catalogo = atom<Catalogo>(CATALOGO_INICIAL)

const esCatalogo = (v: unknown): v is Catalogo =>
  !!v && Array.isArray((v as Catalogo).productos) && Array.isArray((v as Catalogo).banners)

/** Si este navegador tiene cambios hechos desde el panel, los carga. Devuelve true si había cambios. */
export function cargarCambiosLocales(): boolean {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? 'null')
    if (esCatalogo(guardado)) {
      $catalogo.set(guardado)
      return true
    }
  } catch {
    /* sin acceso a localStorage (modo privado, etc.): queda el catálogo de ejemplo */
  }
  return false
}

function guardar(c: Catalogo) {
  $catalogo.set(c)
  try {
    localStorage.setItem(CLAVE, JSON.stringify(c))
  } catch {
    /* se mantiene en memoria mientras dure la pestaña */
  }
}

/** Mantiene sincronizadas las pestañas abiertas (tienda en una, panel en otra). */
export function escucharOtrasPestanas() {
  const alCambiar = (e: StorageEvent) => {
    if (e.key === CLAVE) e.newValue ? cargarCambiosLocales() : $catalogo.set(CATALOGO_INICIAL)
  }
  window.addEventListener('storage', alCambiar)
  return () => window.removeEventListener('storage', alCambiar)
}

export function guardarProducto(p: Producto) {
  const c = $catalogo.get()
  const existe = c.productos.some((x) => x.id === p.id)
  guardar({ ...c, productos: existe ? c.productos.map((x) => (x.id === p.id ? p : x)) : [p, ...c.productos] })
}

export function borrarProducto(id: string) {
  const c = $catalogo.get()
  guardar({ ...c, productos: c.productos.filter((p) => p.id !== id) })
}

/** Agrega o actualiza varios productos a la vez (importación desde Excel). Coincide por id. */
export function importarProductos(nuevos: Producto[]) {
  const c = $catalogo.get()
  const porId = new Map(c.productos.map((p) => [p.id, p]))
  for (const p of nuevos) porId.set(p.id, { ...porId.get(p.id), ...p })
  guardar({ ...c, productos: [...porId.values()] })
}

export function guardarBanner(b: Banner) {
  const c = $catalogo.get()
  const existe = c.banners.some((x) => x.id === b.id)
  const banners = existe ? c.banners.map((x) => (x.id === b.id ? b : x)) : [...c.banners, b]
  guardar({ ...c, banners: banners.sort((a, z) => a.orden - z.orden) })
}

export function borrarBanner(id: string) {
  const c = $catalogo.get()
  guardar({ ...c, banners: c.banners.filter((b) => b.id !== id) })
}

/** Vuelve a los datos de ejemplo. */
export function restablecerDemo() {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    /* nada que borrar */
  }
  $catalogo.set(CATALOGO_INICIAL)
}

export { slug } from './texto'

/** Categorías presentes en los productos visibles, en orden alfabético. */
export const categoriasDe = (productos: Producto[]) =>
  [...new Set(productos.filter((p) => p.visible).map((p) => p.categoria))].sort((a, b) => a.localeCompare(b, 'es'))
