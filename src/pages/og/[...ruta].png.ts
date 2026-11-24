import type { APIRoute, GetStaticPaths } from 'astro';
import { entradasOg, renderOg, type OgEntrada } from '../../data/og';

export const getStaticPaths: GetStaticPaths = async () =>
  (await entradasOg()).map((entrada) => ({ params: { ruta: entrada.clave }, props: { entrada } }));

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg((props as { entrada: OgEntrada }).entrada);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
