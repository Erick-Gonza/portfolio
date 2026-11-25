import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada entrada vive en <coleccion>/<idioma>/<slug>.mdx. El id que genera el loader es «es/slug», y de ahí salen el
// idioma y el slug (ver src/data/contenido.ts). Mismo slug en los dos idiomas = misma pieza traducida.

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/proyectos' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(200),
    // Resumen de tres líneas que se muestra arriba del caso de estudio (para leerlo en 10 segundos).
    resumen: z.object({ problema: z.string(), solucion: z.string(), resultado: z.string() }).optional(),
    year: z.number().int(),
    role: z.string(),
    category: z.enum(['app', 'game', 'web', 'tool']),
    status: z.enum(['produccion', 'beta', 'prototipo']),
    stack: z.array(z.string()).min(1),
    links: z
      .object({
        demo: z.url().optional(),
        repo: z.url().optional(),
      })
      .nullish()
      .transform((v) => v ?? {}),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ff5b2e'),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { proyectos, blog };
