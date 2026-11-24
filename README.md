# Portafolio de Erick

Sitio personal: portada (landing) con hero 3D, casos de estudio, blog y sobre mí. Bilingüe (español en `/`, inglés en
`/en/`), pensado primero para móvil.

**Stack:** Astro 7 · Tailwind 4 · three.js · MDX · Pagefind · Node (solo para `/api/contacto`) · Docker en Dokploy.

## Desarrollo

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # compila y genera el índice de búsqueda (Pagefind)
pnpm preview      # sirve el build como en producción
pnpm check        # tipos de Astro + TypeScript
```

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Datos personales, enlaces, Umami | `src/data/sitio.ts` |
| Textos de la interfaz y rutas por idioma | `src/i18n/ui.ts` |
| Paleta, tipografía y estilos base | `src/styles/global.css` |
| Casos de estudio | `src/content/proyectos/{es,en}/<slug>.mdx` |
| Posts del blog | `src/content/blog/{es,en}/<slug>.mdx` |
| Escena 3D del hero | `src/scripts/hero-scene.ts` (decide si cargarla: `src/scripts/hero.ts`) |
| Modelos de Blender | `src/assets/models/espacio.glb` |
| Formulario de contacto | `src/components/Contact.astro` + `src/pages/api/contacto.ts` |
| CV en PDF | `public/cv/erick-cv-es.pdf` y `public/cv/erick-cv-en.pdf` (el botón aparece cuando existen) |

## Escribir un post

Crea `src/content/blog/es/mi-post.mdx` (y opcionalmente `en/mi-post.mdx` con el **mismo slug** para enlazarlos):

```mdx
---
title: 'Título'
description: 'Una línea para listados y SEO.'
date: 2026-12-01
tags: ['astro', 'rendimiento']
draft: false
---

Contenido en Markdown o MDX.
```

`draft: true` lo muestra en `pnpm dev` pero no lo publica.

## Modelos 3D

El archivo fuente es `modelos/espacio.blend` (escena «Portafolio»). Al exportar a `src/assets/models/espacio.glb`: solo
los cuatro objetos, cada uno en el origen, sin UV ni cámaras/luces.

La escena funciona sola con geometría procedural. Si existe `src/assets/models/espacio.glb`, sus objetos llamados
`Planeta`, `Luna`, `Nave` y `Asteroide` reemplazan a los procedurales (los que falten se quedan como están). Mantén
cada uno centrado en el origen, con radio del planeta ≈ 1.6 unidades, low-poly y con materiales simples.

## Despliegue en Dokploy

1. Crear una app en Dokploy apuntando a este repo, build type **Dockerfile**, puerto **4321**.
2. Dominio: `erick.orion-consultoria.tech` con HTTPS (Let's Encrypt). Antes, un registro DNS `A`/`CNAME` de `erick` al
   VPS.
3. Variables de entorno (ver `.env.example`): `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. El remitente debe ser de un
   dominio verificado en Resend.
4. Analíticas: instalar Umami (plantilla de Dokploy), crear el sitio y pegar `src` y `websiteId` en `src/data/sitio.ts`.

Si cambias de dominio, actualiza `site` y `security.allowedDomains` en `astro.config.mjs`.
