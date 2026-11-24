import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Proyecto = CollectionEntry<'proyectos'>;
export type Post = CollectionEntry<'blog'>;

/** «es/equivale» → { lang: 'es', slug: 'equivale' } */
export function partes(id: string) {
  const [lang, ...resto] = id.split('/');
  return { lang: lang as Lang, slug: resto.join('/') };
}

export const slugDe = (entry: { id: string }) => partes(entry.id).slug;

export async function proyectos(lang: Lang) {
  const todos = await getCollection('proyectos', (p) => partes(p.id).lang === lang);
  return todos.sort((a, b) => a.data.order - b.data.order);
}

export async function posts(lang: Lang) {
  const todos = await getCollection(
    'blog',
    (p) => partes(p.id).lang === lang && (import.meta.env.DEV || !p.data.draft),
  );
  return todos.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** ¿Existe la misma pieza en el otro idioma? Devuelve su slug o null. */
export async function traduccion(coleccion: 'blog' | 'proyectos', slug: string, lang: Lang) {
  const todos = await getCollection(coleccion);
  return todos.find((e) => {
    const p = partes(e.id);
    return p.lang === lang && p.slug === slug;
  })
    ? slug
    : null;
}

export function minutosLectura(texto = '') {
  const palabras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 220));
}

export function slugTag(tag: string) {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function fecha(d: Date, lang: Lang) {
  return d.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
