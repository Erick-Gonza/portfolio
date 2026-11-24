import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { posts, slugDe } from './contenido';
import { ruta, t, type Lang } from '../i18n/ui';

export async function feed(lang: Lang, context: APIContext) {
  const tr = t(lang);
  const lista = await posts(lang);
  return rss({
    title: `Erick · ${tr('blog.title')}`,
    description: tr('blog.intro'),
    site: context.site!,
    customData: `<language>${lang === 'es' ? 'es-mx' : 'en-us'}</language>`,
    items: lista.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      categories: p.data.tags,
      link: ruta(lang, 'blog', slugDe(p)),
    })),
  });
}
