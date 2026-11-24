// Imágenes para redes (og:image) generadas en el build, una por página: /og/<ruta>.png.
// satori convierte el texto a trazos, así que sharp no necesita fuentes instaladas (sirve igual en el Docker de Alpine).

import fs from 'node:fs';
import satori from 'satori';
import sharp from 'sharp';
import { posts, proyectos, slugDe } from './contenido';
import { t, type Lang } from '../i18n/ui';
import { persona } from './sitio';

export interface OgEntrada {
  clave: string; // ruta sin barras: «proyectos/equivale», «en/index»
  kicker: string;
  titulo: string;
  texto: string;
  acento: string;
}

/** «/proyectos/equivale/» → «proyectos/equivale»; «/» → «index»; «/en/» → «en/index». */
export function claveOg(pathname: string) {
  const limpio = pathname.replace(/^\/|\/$/g, '');
  if (!limpio) return 'index';
  if (limpio === 'en') return 'en/index';
  return limpio;
}

let cache: OgEntrada[] | null = null;

export async function entradasOg(): Promise<OgEntrada[]> {
  if (cache) return cache;
  const lista: OgEntrada[] = [];
  for (const lang of ['es', 'en'] as Lang[]) {
    const tr = t(lang);
    const pre = lang === 'es' ? '' : 'en/';
    const base = '#ff5b2e';
    lista.push(
      { clave: `${pre}index`, kicker: tr('hero.kicker'), titulo: persona.nombre, texto: tr('hero.lead'), acento: base },
      { clave: lang === 'es' ? 'proyectos' : 'en/projects', kicker: tr('projects.label'), titulo: tr('projects.title'), texto: tr('projects.intro'), acento: base },
      { clave: `${pre}blog`, kicker: 'Blog', titulo: tr('blog.title'), texto: tr('blog.intro'), acento: '#c8ff4d' },
      { clave: lang === 'es' ? 'sobre-mi' : 'en/about', kicker: tr('about.label'), titulo: tr('about.title'), texto: tr('meta.description'), acento: base },
    );
    for (const p of await proyectos(lang)) {
      lista.push({
        clave: `${lang === 'es' ? 'proyectos' : 'en/projects'}/${slugDe(p)}`,
        kicker: `${tr(`category.${p.data.category}`)} · ${tr(`status.${p.data.status}`)}`,
        titulo: p.data.title,
        texto: p.data.summary,
        acento: p.data.accent,
      });
    }
    for (const p of await posts(lang)) {
      lista.push({
        clave: `${pre}blog/${slugDe(p)}`,
        kicker: `Blog · ${p.data.tags.slice(0, 3).map((x) => `#${x}`).join(' ')}`,
        titulo: p.data.title,
        texto: p.data.description,
        acento: '#c8ff4d',
      });
    }
  }
  cache = lista;
  return lista;
}

const fuente = (ruta: string) => fs.readFileSync(`${process.cwd()}/node_modules/${ruta}`);
let fuentes: Parameters<typeof satori>[1]['fonts'] | null = null;
function cargarFuentes() {
  fuentes ??= [
    { name: 'Bricolage', data: fuente('@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff'), weight: 800, style: 'normal' },
    { name: 'Geist', data: fuente('@fontsource/geist/files/geist-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Geist Mono', data: fuente('@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff'), weight: 400, style: 'normal' },
  ];
  return fuentes;
}

type Nodo = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Nodo => ({
  type,
  props: { style, children },
});

export async function renderOg(e: OgEntrada) {
  const tamTitulo = e.titulo.length > 38 ? 68 : e.titulo.length > 22 ? 84 : 108;
  // Ojo: satori suma el padding al ancho/alto (content-box), así que el margen se hace con una capa absoluta interna.
  const arbol = h(
    'div',
    { width: 1200, height: 630, display: 'flex', position: 'relative', background: '#07070c', color: '#ecebe4', fontFamily: 'Geist' },
    [
      // Planeta en el color de la página, recortado a la derecha, y una luna lima.
      h('div', {
        position: 'absolute',
        right: -120,
        top: 70,
        width: 460,
        height: 460,
        borderRadius: 9999,
        background: `radial-gradient(circle at 35% 35%, ${e.acento}, ${e.acento}55 55%, #07070c 75%)`,
        opacity: 0.9,
      }),
      h('div', { position: 'absolute', right: 300, top: 96, width: 34, height: 34, borderRadius: 9999, background: '#c8ff4d' }),
      h(
        'div',
        { position: 'absolute', left: 72, top: 64, right: 72, bottom: 64, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
        [
          h('div', { display: 'flex', fontFamily: 'Geist Mono', fontSize: 24, letterSpacing: 3, color: '#9a98a8', textTransform: 'uppercase' }, e.kicker),
          h('div', { display: 'flex', flexDirection: 'column', maxWidth: 860 }, [
            h('div', { display: 'flex', fontFamily: 'Bricolage', fontSize: tamTitulo, lineHeight: 0.95, letterSpacing: -3 }, e.titulo),
            h('div', { display: 'flex', marginTop: 28, fontSize: 30, lineHeight: 1.35, color: '#c9c7c0' }, e.texto.length > 150 ? `${e.texto.slice(0, 147)}…` : e.texto),
          ]),
          h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
            h('div', { display: 'flex', fontFamily: 'Bricolage', fontSize: 40 }, [h('span', {}, 'erick'), h('span', { color: '#ff5b2e' }, '.')]),
            h('div', { display: 'flex', fontFamily: 'Geist Mono', fontSize: 22, color: e.acento }, new URL(import.meta.env.SITE).host),
          ]),
        ],
      ),
    ],
  );
  const svg = await satori(arbol as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: cargarFuentes() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
