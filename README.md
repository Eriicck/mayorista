# Mayorista Online

Tienda mayorista con pedidos por WhatsApp y panel de administración.
**Proyecto de demostración** para portafolio: marcas, productos y precios son ficticios.

https://mayoristaweb.netlify.app · Panel: `/admin` (demo: `demo@mayoristaonline.com` / `demo1234`)

## Qué hace

**Tienda**
- Catálogo por categorías, “Más vendidos” y “Ofertas”, búsqueda sin tildes, orden y paginación.
- Tres formas de comprar cada caja: **retiro en el local**, **envío por bulto** o **por pallet** (multiplica por las cajas que trae el pallet y controla el stock).
- Carrito guardado en el navegador y pedido en 4 pasos que se envía por **WhatsApp** con el detalle, el total y un código (`MO-XXXX`).
- Banners con imagen distinta para celular y escritorio.

**Panel `/admin`**
- Resumen: publicados, sin stock, stock crítico, ofertas, productos por categoría y lista para reponer.
- Productos: búsqueda, filtros, alta/edición con validación, ocultar/mostrar y borrar con confirmación.
- Banners: alta, edición, orden y activación.
- Excel: modelo descargable, importación con **vista previa y errores por fila**, y exportación del catálogo.

En modo demo los cambios del panel se guardan en el navegador (`localStorage`) y la tienda los muestra al instante, también en otra pestaña. “Restablecer demo” vuelve a los datos de ejemplo.

## Tecnología

Astro 7 (páginas estáticas) · React 19 solo en las partes interactivas · Tailwind CSS 4 · nanostores (estado compartido entre islas) · SheetJS (se carga solo al usar Excel) · Vitest.

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # pruebas de precios, pedido e importación
npm run build      # genera dist/
npm run imagenes   # regenera las ilustraciones de productos y banners
```

## Dónde está cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Nombre, WhatsApp, dirección, horarios, medios de pago | `src/config/tienda.ts` |
| Productos y banners de ejemplo | `src/data/catalogo.ts` |
| Cálculo de precios y cajas | `src/lib/precios.ts` |
| Mensaje de WhatsApp y validación del checkout | `src/lib/pedido.ts` |
| Columnas y reglas del Excel | `src/lib/excel.ts` |
| De dónde salen los datos (demo / base real) | `src/lib/catalogo.ts` |

## Pasar de demo a tienda real

Toda la lectura y escritura del catálogo está en `src/lib/catalogo.ts`. Para un negocio real se reemplaza ese archivo por uno que use una base (Firebase, Supabase o una API) y el ingreso del panel pasa a validarse en el servidor: en la demo las credenciales son públicas a propósito.

## Carpeta `n8n/`

Flujos de n8n (agente de ventas por WhatsApp) que acompañaban a la versión anterior. No forman parte del sitio.
