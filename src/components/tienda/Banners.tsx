import { useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { $catalogo } from '../../lib/catalogo'

/** Carrusel de banners: imagen de escritorio y de celular, cambio automático cada 6 s (se pausa al pasar el mouse). */
export default function Banners() {
  const banners = useStore($catalogo).banners.filter((b) => b.activo).sort((a, b) => a.orden - b.orden)
  const [i, setI] = useState(0)
  const [pausa, setPausa] = useState(false)
  const total = banners.length

  useEffect(() => {
    if (total < 2 || pausa || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % total), 6000)
    return () => clearInterval(t)
  }, [total, pausa])

  if (!total) return null
  const actual = banners[i % total]
  const contenido = (
    <picture>
      {actual.imagenCelular && <source media="(max-width: 639px)" srcSet={actual.imagenCelular} />}
      <img src={actual.imagenEscritorio} alt={actual.titulo} width={1600} height={500} fetchPriority="high" className="aspect-square w-full object-cover sm:aspect-[16/5]" />
    </picture>
  )

  return (
    <section aria-roledescription="carrusel" aria-label="Promociones" className="relative overflow-hidden rounded-2xl bg-gray-900" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
      {actual.link ? <a href={actual.link}>{contenido}</a> : contenido}
      {total > 1 && (
        <>
          <button type="button" aria-label="Anterior" onClick={() => setI((n) => (n - 1 + total) % total)} className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-900 shadow transition hover:bg-white sm:block"><ChevronLeft size={20} /></button>
          <button type="button" aria-label="Siguiente" onClick={() => setI((n) => (n + 1) % total)} className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-900 shadow transition hover:bg-white sm:block"><ChevronRight size={20} /></button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2">
            {banners.map((b, n) => (
              <button key={b.id} type="button" aria-label={`Ver ${b.titulo}`} aria-current={n === i % total ? 'true' : undefined} onClick={() => setI(n)}
                className="group grid h-7 min-w-7 place-items-center px-1">
                <span className={`block h-1.5 rounded-full transition-all ${n === i % total ? 'w-8 bg-white' : 'w-2 bg-white/50 group-hover:bg-white/80'}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
