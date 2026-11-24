// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Todo el sitio se prerenderiza (HTML estático). Solo /api/contacto corre en el servidor (prerender = false), por eso
// va el adaptador de Node en modo standalone: el contenedor de Dokploy ejecuta dist/server/entry.mjs.
export default defineConfig({
  site: 'https://erick.orion-consultoria.tech',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'ignore',
  // Detrás de Traefik (Dokploy): confiar en X-Forwarded-Host/Proto solo para este dominio, así el chequeo de origen
  // de los POST (formulario) ve la URL pública real.
  security: {
    allowedDomains: [{ hostname: 'erick.orion-consultoria.tech', protocol: 'https' }],
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      i18n: { defaultLocale: 'es', locales: { es: 'es-MX', en: 'en-US' } },
    }),
  ],
  // Fuentes servidas desde el propio dominio. Bricolage Grotesque para titulares, Geist para texto y Geist Mono para etiquetas.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      weights: [600, 700, 800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    // three.js va en su propio chunk, cargado tarde; su tamaño es esperado.
    build: { chunkSizeWarningLimit: 800 },
  },
});
