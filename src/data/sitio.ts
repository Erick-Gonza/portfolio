// Datos personales y enlaces. Todo lo que cambia de una persona a otra está aquí; los textos por idioma están en
// src/i18n/ui.ts.

export const persona = {
  // PREGUNTA: ¿nombre completo tal como quieres que aparezca (p. ej. «Erick González»)?
  nombre: 'Erick',
  nombreCorto: 'Erick',
  ciudad: 'Monterrey, México',
  email: 'eagm080897@gmail.com',
  // Solo dígitos con lada de país, para wa.me.
  whatsapp: '528125672045',
  whatsappVisible: '+52 81 2567 2045',
  github: 'https://github.com/Erick-Gonza',
  linkedin: 'https://www.linkedin.com/in/erick-gzz/',
  empresa: { nombre: 'Orion Consultoría', url: 'https://orion-consultoria.tech' },
  // Ruta del CV en public/. Si el archivo no existe aún, el botón no se muestra (ver src/data/cv.ts).
  cv: { es: '/cv/erick-cv-es.pdf', en: '/cv/erick-cv-en.pdf' },
} as const;

export const umami = {
  // Script y website id de tu Umami en Dokploy. Mientras estén vacíos no se carga nada.
  src: '',
  websiteId: '',
};
