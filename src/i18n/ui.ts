// Textos de la interfaz y rutas por idioma. El español va sin prefijo (/), el inglés en /en/.

export const idiomas = ['es', 'en'] as const;
export type Lang = (typeof idiomas)[number];

export const locales: Record<Lang, { html: string; og: string; nombre: string }> = {
  es: { html: 'es-MX', og: 'es_MX', nombre: 'Español' },
  en: { html: 'en-US', og: 'en_US', nombre: 'English' },
};

type RutaClave = 'home' | 'projects' | 'blog' | 'about' | 'contact' | 'tags' | 'rss';

const rutas: Record<Lang, Record<RutaClave, string>> = {
  es: {
    home: '/',
    projects: '/proyectos/',
    blog: '/blog/',
    about: '/sobre-mi/',
    contact: '/#contacto',
    tags: '/blog/tags/',
    rss: '/rss.xml',
  },
  en: {
    home: '/en/',
    projects: '/en/projects/',
    blog: '/en/blog/',
    about: '/en/about/',
    contact: '/en/#contact',
    tags: '/en/blog/tags/',
    rss: '/en/rss.xml',
  },
};

export function ruta(lang: Lang, clave: RutaClave, slug?: string) {
  const base = rutas[lang][clave];
  return slug ? `${base}${slug}/` : base;
}

export function langDeUrl(url: URL): Lang {
  return url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'es';
}

export const ui = {
  es: {
    'nav.projects': 'Proyectos',
    'nav.blog': 'Blog',
    'nav.about': 'Sobre mí',
    'nav.contact': 'Contacto',
    'nav.menu': 'Menú',
    'nav.close': 'Cerrar',
    'nav.skip': 'Saltar al contenido',
    'theme.toggle': 'Cambiar tema',
    'lang.switch': 'English',

    'meta.title': 'Erick Gonzalez — Desarrollador web y de software en Monterrey',
    'meta.description':
      'Desarrollo de software, IA aplicada y consultoría tecnológica para negocios: agentes de IA, sistemas a la medida, webs y 3D. Desde Monterrey, para todo México.',

    'hero.kicker': 'Full-stack · IA · Consultoría · Monterrey',
    'hero.title.1': 'Erick Gonzalez',
    'hero.title.2': 'Desarrollador',
    'hero.title.3': 'de software.',
    'hero.lead':
      'Sistemas a la medida, agentes de IA y consultoría para que tu negocio automatice lo repetitivo y crezca. Del diagnóstico al servidor, sin intermediarios.',
    'hero.cta': 'Trabajemos juntos',
    'hero.secondary': 'Ver proyectos',
    'hero.hint': 'Mueve el cursor o inclina el teléfono',

    'services.label': 'Qué hago',
    'services.title': 'Cuatro frentes, un mismo oficio.',
    'services.ia.title': 'IA aplicada y automatización',
    'services.ia.body':
      'Agentes que atienden por WhatsApp y correo, dan seguimiento y agendan citas. Integrados a tus sistemas, con reglas claras de qué pueden y qué no.',
    'services.web.title': 'Webs y landings',
    'services.web.body':
      'Sitios rápidos, con animación cuando suma y SEO desde el día uno. Pensados primero para el teléfono.',
    'services.apps.title': 'Sistemas a la medida',
    'services.apps.body':
      'Apps para el día a día de un negocio: agenda, inventario, ventas, reportes. Que tu equipo las use sin manual.',
    'services.3d.title': '3D y videojuegos',
    'services.3d.body':
      'Escenas 3D para la web, herramientas con geometría y juegos multijugador con servidor propio.',

    'process.label': 'Proceso',
    'process.title': 'Cómo trabajo contigo',
    'process.lead':
      'Una web, un sistema a la medida, una automatización con IA o una experiencia 3D: el proceso es el mismo. Primero entiendo tu negocio y después propongo lo que de verdad necesitas, ni más ni menos.',
    'process.1.title': 'Diagnóstico',
    'process.1.body': 'Una llamada para entender tu negocio, tus objetivos y qué solución tiene más sentido, sin compromiso.',
    'process.2.title': 'Propuesta',
    'process.2.body': 'Alcance, plazo y costo claros por escrito, antes de empezar. Sin letras chiquitas.',
    'process.3.title': 'Construcción',
    'process.3.body': 'Entregas cortas que puedes probar desde la primera semana, con tu equipo dando retroalimentación.',
    'process.4.title': 'Acompañamiento',
    'process.4.body': 'Capacitación, ajustes y soporte después de lanzar. El software tiene que funcionar en el día a día.',
    'process.cta': 'Cuéntame tu proyecto',
    'process.orion': 'Ver proyectos',

    'projects.label': 'Proyectos',
    'projects.title': 'Trabajo reciente',
    'projects.metaTitle': 'Proyectos: apps, sistemas a la medida y videojuegos',
    'projects.all': 'Ver todos los proyectos',
    'projects.intro':
      'Casos de estudio de lo que he construido: qué problema resolvía, cómo está hecho y en qué punto está.',
    'projects.stack': 'Stack',
    'projects.role': 'Rol',
    'projects.year': 'Año',
    'projects.status': 'Estado',
    'projects.demo': 'Ver en vivo',
    'projects.repo': 'Código',
    'projects.back': 'Todos los proyectos',
    'projects.next': 'Siguiente proyecto',
    'status.produccion': 'En producción',
    'status.beta': 'Beta',
    'status.prototipo': 'Prototipo',
    'category.app': 'App',
    'category.game': 'Videojuego',
    'category.web': 'Web',
    'category.tool': 'Herramienta',

    'blog.label': 'Blog',
    'blog.title': 'Notas de taller',
    'blog.metaTitle': 'Blog de desarrollo web, 3D y videojuegos',
    'blog.intro': 'Lo que aprendo construyendo: decisiones técnicas, errores y cosas que funcionaron.',
    'blog.latest': 'Últimos posts',
    'blog.all': 'Ir al blog',
    'blog.tags': 'Temas',
    'blog.tag': 'Tema',
    'blog.allTags': 'Todos',
    'blog.search': 'Buscar en el blog',
    'blog.searchPlaceholder': 'Buscar…',
    'blog.searchDev': 'La búsqueda funciona en el sitio compilado (pnpm build).',
    'blog.readTime': 'min de lectura',
    'blog.empty': 'Todavía no hay posts en este idioma.',
    'blog.back': 'Volver al blog',
    'blog.otherLang': 'Este post también está en inglés',
    'blog.rss': 'RSS',

    'about.label': 'Sobre mí',
    'about.title': 'Hola, soy Erick.',
    'about.metaTitle': 'Sobre mí: desarrollador full-stack desde 2019',
    'about.cv': 'Descargar CV',
    'about.stack': 'Con qué trabajo',
    'about.now': 'En qué ando',
    'about.job': 'Actualmente',

    'contact.label': 'Contacto',
    'contact.title': '¿Tienes un proyecto en mente?',
    'contact.lead': 'Cuéntame qué necesitas. Te respondo en menos de 48 horas con preguntas o una propuesta.',
    'contact.name': 'Nombre',
    'contact.email': 'Correo',
    'contact.message': '¿Qué quieres construir?',
    'contact.messageHint': 'Qué hace tu negocio, qué te gustaría resolver y si tienes fecha o presupuesto.',
    'contact.send': 'Enviar mensaje',
    'contact.sending': 'Enviando…',
    'contact.ok': '¡Listo! Tu mensaje llegó. Te escribo pronto.',
    'contact.error': 'No se pudo enviar. Escríbeme por WhatsApp o correo mientras lo reviso.',
    'contact.invalid': 'Revisa tu nombre, un correo válido y un mensaje de al menos 10 caracteres.',
    'contact.or': 'O directo por',
    'contact.whatsappMsg': 'Hola Erick, vi tu portafolio y me interesa platicar sobre un proyecto.',

    'footer.made': 'Hecho con Astro, three.js y mucho café.',
    'footer.source': 'Código del sitio',

    '404.title': 'Página perdida en el espacio',
    '404.body': 'La ruta que buscas no existe o se movió.',
    '404.home': 'Volver al inicio',
  },
  en: {
    'nav.projects': 'Projects',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.skip': 'Skip to content',
    'theme.toggle': 'Toggle theme',
    'lang.switch': 'Español',

    'meta.title': 'Erick Gonzalez — Web & software developer in Monterrey, Mexico',
    'meta.description':
      'Software development, applied AI and tech consulting for businesses: AI agents, custom software, websites and 3D. Based in Monterrey, Mexico.',

    'hero.kicker': 'Full-stack · AI · Consulting · Monterrey',
    'hero.title.1': 'Erick Gonzalez',
    'hero.title.2': 'Software',
    'hero.title.3': 'developer.',
    'hero.lead':
      'Custom software, AI agents and consulting so your business automates the repetitive work and grows. From diagnosis to the server, with no middlemen.',
    'hero.cta': "Let's work together",
    'hero.secondary': 'See projects',
    'hero.hint': 'Move your cursor or tilt your phone',

    'services.label': 'What I do',
    'services.title': 'Four fronts, one craft.',
    'services.ia.title': 'Applied AI & automation',
    'services.ia.body':
      'Agents that answer on WhatsApp and email, follow up and book appointments. Connected to your systems, with clear rules on what they can and cannot do.',
    'services.web.title': 'Websites & landing pages',
    'services.web.body':
      'Fast sites, with motion where it helps and SEO from day one. Designed for the phone first.',
    'services.apps.title': 'Custom software',
    'services.apps.body':
      'Apps for the day-to-day of a business: scheduling, inventory, sales, reports. Your team uses them without a manual.',
    'services.3d.title': '3D & games',
    'services.3d.body': '3D scenes for the web, geometry-heavy tools and multiplayer games with their own servers.',

    'process.label': 'Process',
    'process.title': 'How I work with you',
    'process.lead':
      'A website, custom software, an AI automation or a 3D experience: the process is the same. First I get to know your business, then I propose what you actually need, nothing more and nothing less.',
    'process.1.title': 'Diagnosis',
    'process.1.body': 'A call to understand your business, your goals and which solution makes the most sense, no strings attached.',
    'process.2.title': 'Proposal',
    'process.2.body': 'Clear scope, timeline and cost in writing before we start. No fine print.',
    'process.3.title': 'Build',
    'process.3.body': 'Short deliveries you can try from the first week, with your team giving feedback.',
    'process.4.title': 'Support',
    'process.4.body': 'Training, adjustments and support after launch. Software has to work day to day.',
    'process.cta': 'Tell me about your project',
    'process.orion': 'See projects',

    'projects.label': 'Projects',
    'projects.title': 'Recent work',
    'projects.metaTitle': 'Projects: web apps, custom software and games',
    'projects.all': 'See all projects',
    'projects.intro': "Case studies of what I've built: the problem it solved, how it's made and where it stands.",
    'projects.stack': 'Stack',
    'projects.role': 'Role',
    'projects.year': 'Year',
    'projects.status': 'Status',
    'projects.demo': 'Live site',
    'projects.repo': 'Source',
    'projects.back': 'All projects',
    'projects.next': 'Next project',
    'status.produccion': 'In production',
    'status.beta': 'Beta',
    'status.prototipo': 'Prototype',
    'category.app': 'App',
    'category.game': 'Game',
    'category.web': 'Web',
    'category.tool': 'Tool',

    'blog.label': 'Blog',
    'blog.title': 'Workshop notes',
    'blog.metaTitle': 'Blog on web development, 3D and games',
    'blog.intro': 'What I learn while building: technical decisions, mistakes and things that worked.',
    'blog.latest': 'Latest posts',
    'blog.all': 'Go to the blog',
    'blog.tags': 'Topics',
    'blog.tag': 'Topic',
    'blog.allTags': 'All',
    'blog.search': 'Search the blog',
    'blog.searchPlaceholder': 'Search…',
    'blog.searchDev': 'Search works on the built site (pnpm build).',
    'blog.readTime': 'min read',
    'blog.empty': 'No posts in this language yet.',
    'blog.back': 'Back to the blog',
    'blog.otherLang': 'This post is also available in Spanish',
    'blog.rss': 'RSS',

    'about.label': 'About',
    'about.title': "Hi, I'm Erick.",
    'about.metaTitle': 'About: full-stack developer since 2019',
    'about.cv': 'Download CV',
    'about.stack': 'What I work with',
    'about.now': "What I'm up to",
    'about.job': 'Currently',

    'contact.label': 'Contact',
    'contact.title': 'Got a project in mind?',
    'contact.lead': "Tell me what you need. I'll reply within 48 hours with questions or a proposal.",
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'What do you want to build?',
    'contact.messageHint': 'What your business does, what you want to solve, and any deadline or budget.',
    'contact.send': 'Send message',
    'contact.sending': 'Sending…',
    'contact.ok': "Done! Your message arrived. I'll be in touch soon.",
    'contact.error': "Couldn't send it. Reach me on WhatsApp or email while I look into it.",
    'contact.invalid': 'Check your name, a valid email and a message of at least 10 characters.',
    'contact.or': 'Or reach me on',
    'contact.whatsappMsg': "Hi Erick, I saw your portfolio and I'd like to talk about a project.",

    'footer.made': 'Built with Astro, three.js and plenty of coffee.',
    'footer.source': 'Site source',

    '404.title': 'Page lost in space',
    '404.body': "The page you're looking for doesn't exist or has moved.",
    '404.home': 'Back home',
  },
} as const;

export type UiKey = keyof (typeof ui)['es'];

export function t(lang: Lang) {
  return (key: UiKey) => ui[lang][key] ?? ui.es[key];
}
