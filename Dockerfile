# Imagen para Dokploy (build type «Dockerfile»). Compila el sitio y lo sirve con el servidor standalone de Astro:
# las páginas son estáticas (dist/client) y solo /api/contacto corre en Node.

# 1. Dependencias y build con Node 24 y el pnpm de `packageManager` (vía corepack).
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 2. Solo dependencias de producción para el servidor.
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# 3. Runtime mínimo.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1:4321/robots.txt >/dev/null || exit 1
CMD ["node", "./dist/server/entry.mjs"]
