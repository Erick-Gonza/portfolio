import type { APIRoute } from 'astro';

// Único endpoint con servidor. Recibe el formulario de contacto y lo reenvía por correo con la API HTTP de Resend.
// Variables (Dokploy → Environment): RESEND_API_KEY, CONTACT_TO, CONTACT_FROM. Ver .env.example.
export const prerender = false;

const MAX = { nombre: 100, email: 200, mensaje: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Límite simple en memoria: 5 envíos por IP cada 10 minutos. Suficiente para un solo contenedor.
const ventana = 10 * 60 * 1000;
const intentos = new Map<string, number[]>();
function limitado(ip: string) {
  const ahora = Date.now();
  const lista = (intentos.get(ip) ?? []).filter((t) => ahora - t < ventana);
  lista.push(ahora);
  intentos.set(ip, lista);
  return lista.length > 5;
}

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const quiereJson = request.headers.get('accept')?.includes('application/json');
  let lang = 'es';
  const responder = (ok: boolean, status = ok ? 200 : 400) => {
    if (quiereJson) return Response.json({ ok }, { status });
    return redirect(`${lang === 'en' ? '/en/' : '/'}?contacto=${ok ? 'ok' : 'error'}#${lang === 'en' ? 'contact' : 'contacto'}`, 303);
  };

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return responder(false);
  }
  lang = form.get('lang') === 'en' ? 'en' : 'es';

  // Bot: rellenó el campo oculto. Se responde «ok» para no darle pistas.
  if (String(form.get('website') ?? '').trim()) return responder(true);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'desconocida';
  if (limitado(ip)) return responder(false, 429);

  const nombre = String(form.get('nombre') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const mensaje = String(form.get('mensaje') ?? '').trim();
  if (
    nombre.length < 2 ||
    nombre.length > MAX.nombre ||
    !EMAIL_RE.test(email) ||
    email.length > MAX.email ||
    mensaje.length < 10 ||
    mensaje.length > MAX.mensaje
  ) {
    return responder(false);
  }

  const key = process.env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? import.meta.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM ?? import.meta.env.CONTACT_FROM;
  if (!key || !to || !from) {
    console.error('[contacto] Faltan RESEND_API_KEY, CONTACT_TO o CONTACT_FROM.');
    return responder(false, 500);
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Portafolio: mensaje de ${nombre.slice(0, 60)}`,
      text: `Nombre: ${nombre}\nCorreo: ${email}\nIdioma: ${lang}\n\n${mensaje}`,
      html: `<p><strong>Nombre:</strong> ${escapar(nombre)}<br><strong>Correo:</strong> ${escapar(email)}<br><strong>Idioma:</strong> ${lang}</p><p style="white-space:pre-wrap">${escapar(mensaje)}</p>`,
    }),
  }).catch((e) => {
    console.error('[contacto] Error de red con Resend', e);
    return null;
  });

  if (!res?.ok) {
    console.error('[contacto] Resend respondió', res?.status, await res?.text().catch(() => ''));
    return responder(false, 502);
  }
  return responder(true);
};
