// Genera las imágenes de la demo: un "packshot" ilustrado por producto, los banners y la imagen para compartir.
// Uso: npm run imagenes   (lee src/data/catalogo.ts, escribe en public/)
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'
import { BANNERS_DEMO, PRODUCTOS_DEMO } from '../src/data/catalogo.ts'

const COLOR_CATEGORIA = {
  'Almacén': '#f59e0b', Bebidas: '#0ea5e9', Limpieza: '#14b8a6', 'Perfumería': '#ec4899',
  Golosinas: '#8b5cf6', 'Librería': '#3b82f6', Bazar: '#64748b', Mascotas: '#f97316',
}
const PALETA = ['#dc2626', '#16a34a', '#2563eb', '#ea580c', '#7c3aed', '#0d9488', '#db2777', '#ca8a04', '#0f766e', '#4f46e5', '#b91c1c', '#15803d']
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Corta el texto en renglones de hasta `max` caracteres. */
function renglones(texto, max, limite = 3) {
  const out = []
  let linea = ''
  for (const palabra of texto.split(' ')) {
    if ((linea + ' ' + palabra).trim().length > max && linea) { out.push(linea); linea = palabra } else linea = (linea + ' ' + palabra).trim()
  }
  if (linea) out.push(linea)
  return out.slice(0, limite)
}

/** Etiqueta blanca con marca y nombre, centrada en (cx, cy). */
function etiqueta(p, cx, cy, ancho, alto, color) {
  const lineas = renglones(p.nombre, Math.max(8, Math.floor(ancho / 17)))
  const tam = Math.min(30, Math.floor(ancho / 9))
  // Arial Black mide ~0,72 em por letra: se achica la marca hasta que entre en la etiqueta
  const tamMarca = Math.min(tam + 4, Math.floor((ancho - 28) / (p.marca.length * 0.72)))
  const y0 = cy - alto / 2
  return `
    <rect x="${cx - ancho / 2}" y="${y0}" width="${ancho}" height="${alto}" rx="18" fill="#ffffff"/>
    <text x="${cx}" y="${y0 + 46}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${tamMarca}" fill="${color}">${esc(p.marca.toUpperCase())}</text>
    <rect x="${cx - 40}" y="${y0 + 60}" width="80" height="4" rx="2" fill="${color}" opacity=".35"/>
    ${lineas.map((l, i) => `<text x="${cx}" y="${y0 + 100 + i * (tam + 8)}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${tam}" fill="#1f2937">${esc(l)}</text>`).join('')}`
}

const sombra = (cx, y, rx) => `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${rx * 0.12}" fill="#0f172a" opacity=".16"/>`
const brillo = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="#ffffff" opacity=".22"/>`

const ENVASES = {
  bolsa: (p, c) => `${sombra(400, 700, 230)}
    <path d="M190 200 l20 -30 l20 30 l20 -30 l20 30 l20 -30 l20 30 l20 -30 l20 30 l20 -30 l20 30 l20 -30 l20 30 l20 -30 l20 30 l20 -30 l20 30 l20 -30 l20 30 l20 -30 l10 15 V650 q0 40 -40 40 H230 q-40 0 -40 -40 Z" fill="${c}"/>
    ${brillo(225, 240, 26, 380)}${etiqueta(p, 400, 450, 340, 250, c)}`,
  paquete: (p, c) => `${sombra(400, 705, 220)}
    <rect x="200" y="150" width="400" height="550" rx="22" fill="${c}"/>
    <rect x="200" y="150" width="400" height="60" rx="22" fill="#000" opacity=".12"/>
    ${brillo(225, 230, 24, 420)}${etiqueta(p, 400, 450, 330, 260, c)}`,
  botella: (p, c) => `${sombra(400, 715, 170)}
    <rect x="360" y="70" width="80" height="60" rx="12" fill="#1f2937"/>
    <path d="M370 130 h60 v60 q90 50 90 150 V680 q0 30 -30 30 H310 q-30 0 -30 -30 V340 q0 -100 90 -150 Z" fill="${c}"/>
    ${brillo(305, 340, 22, 320)}${etiqueta(p, 400, 500, 230, 250, c)}`,
  bidon: (p, c) => `${sombra(400, 715, 220)}
    <rect x="370" y="80" width="70" height="55" rx="10" fill="#1f2937"/>
    <path d="M240 210 q0 -70 130 -75 h70 q120 5 120 75 V680 q0 30 -30 30 H270 q-30 0 -30 -30 Z" fill="${c}"/>
    <path d="M470 160 q90 0 90 90 v60 h-50 v-60 q0 -40 -40 -40 Z" fill="#000" opacity=".15"/>
    ${brillo(262, 260, 24, 380)}${etiqueta(p, 400, 480, 270, 260, c)}`,
  lata: (p, c) => `${sombra(400, 712, 175)}
    <rect x="240" y="150" width="320" height="550" rx="28" fill="${c}"/>
    <ellipse cx="400" cy="160" rx="160" ry="30" fill="#cbd5e1"/><ellipse cx="400" cy="160" rx="130" ry="20" fill="#94a3b8"/>
    <rect x="240" y="670" width="320" height="30" rx="14" fill="#cbd5e1"/>
    ${brillo(262, 210, 26, 430)}${etiqueta(p, 400, 440, 260, 250, c)}`,
  caja: (p, c) => `${sombra(400, 712, 240)}
    <path d="M200 210 l60 -60 h340 l-60 60 Z" fill="${c}" opacity=".75"/>
    <path d="M540 210 l60 -60 V640 l-60 60 Z" fill="#000" opacity=".22"/>
    <path d="M540 210 l60 -60 V640 l-60 60 Z" fill="${c}" opacity=".6"/>
    <rect x="200" y="210" width="340" height="490" fill="${c}"/>
    ${brillo(220, 250, 20, 400)}${etiqueta(p, 370, 455, 280, 260, c)}`,
  frasco: (p, c) => `${sombra(400, 712, 190)}
    <rect x="270" y="150" width="260" height="80" rx="14" fill="#1f2937"/>
    <rect x="230" y="225" width="340" height="480" rx="60" fill="${c}"/>
    ${brillo(255, 280, 24, 360)}${etiqueta(p, 400, 465, 280, 250, c)}`,
  rollo: (p, c) => `${sombra(400, 712, 250)}
    <rect x="160" y="170" width="480" height="530" rx="40" fill="${c}" opacity=".25"/>
    ${[[270, 290], [530, 290]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="105" fill="#f8fafc"/><circle cx="${x}" cy="${y}" r="34" fill="#cbd5e1"/>`).join('')}
    <rect x="160" y="400" width="480" height="300" rx="40" fill="${c}"/>
    ${etiqueta(p, 400, 550, 360, 230, c)}`,
  aerosol: (p, c) => `${sombra(400, 715, 150)}
    <rect x="335" y="70" width="130" height="100" rx="30" fill="#1f2937"/>
    <rect x="290" y="160" width="220" height="545" rx="40" fill="${c}"/>
    ${brillo(308, 210, 20, 430)}${etiqueta(p, 400, 450, 190, 260, c)}`,
  barra: (p, c) => `${sombra(400, 600, 300)}
    <path d="M100 280 l20 -12 l20 12 V560 l-20 12 l-20 -12 Z M660 280 l20 -12 l20 12 V560 l-20 12 l-20 -12 Z" fill="${c}" opacity=".7"/>
    <rect x="130" y="270" width="540" height="300" rx="26" fill="${c}"/>
    ${brillo(150, 290, 500, 18)}${etiqueta(p, 400, 425, 420, 230, c)}`,
}

function packshot(p) {
  const fondo = COLOR_CATEGORIA[p.categoria] ?? '#94a3b8'
  const color = PALETA[hash(p.marca) % PALETA.length]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs><radialGradient id="g" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${fondo}" stop-opacity=".22"/></radialGradient></defs>
    <rect width="800" height="800" fill="#f8fafc"/><rect width="800" height="800" fill="url(#g)"/>
    ${ENVASES[p.envase](p, color)}
  </svg>`
}

const BANNER_TEXTOS = {
  "precios-mayoristas": ["Precios mayoristas", "por caja cerrada", "Retiro en el local, envío por bulto o pallet", ["arroz-largo-fino-1-kg", "aceite-de-girasol-900-ml", "yerba-mate-1-kg"]],
  ofertas: ["Ofertas de la semana", "hasta 15% OFF", "En almacén, limpieza, bebidas y más", ["mayonesa-500-g", "detergente-concentrado-750-ml", "desodorante-en-aerosol-150-ml"]],
  envios: ["Envíos por bulto", "y por pallet", "A todo el oeste del GBA · Coordinamos por WhatsApp", ["gaseosa-cola-2-25-l", "lavandina-2-l", "agua-mineral-2-l"]],
}

async function banner(id, ancho, alto, movil) {
  const [t1, t2, t3, ids] = BANNER_TEXTOS[id]
    const fs1 = 54, fs2 = movil ? 46 : 48
  const tx = movil ? 56 : 90, ty = movil ? 130 : 205
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}">
    <defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1120"/><stop offset="1" stop-color="#1f2937"/></linearGradient></defs>
    <rect width="${ancho}" height="${alto}" fill="url(#f)"/>
    <circle cx="${ancho * 0.78}" cy="${alto * (movil ? 0.78 : 0.5)}" r="${alto * (movil ? 0.42 : 0.62)}" fill="#dc2626" opacity=".16"/>
    <rect x="${tx}" y="${ty - fs1 - 30}" width="64" height="6" rx="3" fill="#dc2626"/>
    <text x="${tx}" y="${ty}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs1}" fill="#ffffff">${esc(t1)}</text>
    <text x="${tx}" y="${ty + fs2 + 14}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs2}" fill="#f87171">${esc(t2)}</text>
    <text x="${tx}" y="${ty + fs2 + 70}" font-family="Arial, sans-serif" font-size="${movil ? 26 : 24}" fill="#cbd5e1">${esc(t3)}</text>
  </svg>`
  const lado = movil ? 300 : 240
  const mascara = Buffer.from(`<svg width="${lado}" height="${lado}"><rect width="${lado}" height="${lado}" rx="${Math.round(lado * 0.12)}"/></svg>`)
  const fotos = await Promise.all(ids.map((pid) => sharp(`public/productos/${pid}.webp`).resize(lado, lado).composite([{ input: mascara, blend: "dest-in" }]).png().toBuffer()))
  const x0 = movil ? ancho / 2 - lado * 1.35 : ancho - lado * 2.8 - 50
  const y0 = movil ? alto - lado - 30 : (alto - lado) / 2 + 20
  const capas = fotos.map((input, i) => ({ input, left: Math.round(x0 + i * lado * 0.9), top: Math.round(y0 + (i === 1 ? -30 : 0)) }))
  const sufijo = movil ? '-movil' : ''
  await sharp(Buffer.from(svg)).composite(capas).webp({ quality: 82 }).toFile(`public/banners/${id}${sufijo}.webp`)
}

await mkdir('public/productos', { recursive: true })
await mkdir('public/banners', { recursive: true })

for (const p of PRODUCTOS_DEMO) {
  await sharp(Buffer.from(packshot(p))).webp({ quality: 84 }).toFile(`public/productos/${p.id}.webp`)
}
console.log(`${PRODUCTOS_DEMO.length} imágenes de productos`)

for (const b of BANNERS_DEMO) {
  await banner(b.id, 1600, 500, false)
  await banner(b.id, 900, 900, true)
}
console.log(`${BANNERS_DEMO.length} banners (escritorio + celular)`)

// Imagen para compartir (Open Graph) 1200x630
await sharp(`public/banners/precios-mayoristas.webp`).resize(1200, 630, { fit: 'cover', position: 'left' }).jpeg({ quality: 82 }).toFile('public/og.jpg')
console.log('og.jpg')
