// Decide si vale la pena cargar la escena 3D y la carga después de pintar el texto. three.js (~150 kB gz) nunca bloquea
// el primer render: se importa en un chunk aparte cuando el navegador está libre.

function puede3D(canvas: HTMLCanvasElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) < 2 || (nav.hardwareConcurrency ?? 8) < 3) return false;
  try {
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

export function arrancarHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  if (!hero || !canvas) return;

  // Probar WebGL en un canvas aparte: el contexto de prueba no debe quedarse en el canvas real.
  if (!puede3D(document.createElement('canvas'))) return;

  const cargar = async () => {
    const { crearEscena } = await import('./hero-scene');
    const ok = await crearEscena(hero, canvas);
    if (!ok) return;
    canvas.style.opacity = '1';
    hero.querySelector<HTMLElement>('.hero-poster')?.style.setProperty('opacity', '0');
    hero.querySelector<HTMLElement>('[data-hero-hint]')?.style.setProperty('opacity', '1');
  };

  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 600);

  if (document.readyState === 'complete') idle(cargar);
  else addEventListener('load', () => idle(cargar), { once: true });
}
