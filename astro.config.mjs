import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// Sitio estático: `npm run build` genera dist/ listo para Netlify.
export default defineConfig({
  site: 'https://mayoristaweb.netlify.app',
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/admin') })],
  vite: { plugins: [tailwindcss()] },
})
