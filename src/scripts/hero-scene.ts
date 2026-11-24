// Escena espacial del hero: planeta low-poly con anillo de asteroides, una luna y una nave que orbita. Reacciona al
// cursor (escritorio) o al giroscopio (móvil) y se aleja un poco con el scroll.
//
// Modelos: si existe src/assets/models/espacio.glb, sus objetos con nombre «Planeta», «Luna», «Nave» y «Asteroide»
// reemplazan a las versiones hechas con código. Sin el GLB la escena funciona igual con geometría procedural.

import * as THREE from 'three';

const glbs = import.meta.glob('../assets/models/*.glb', { query: '?url', import: 'default', eager: true }) as Record<
  string,
  string
>;
const urlEspacio = Object.entries(glbs).find(([k]) => k.endsWith('/espacio.glb'))?.[1];

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const movil = () => matchMedia('(max-width: 767px)').matches;

// Ruido determinista por posición para deformar vértices compartidos igual (sin grietas en la malla).
function ruido(x: number, y: number, z: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
}

function planetaProcedural(radio: number, detalle: number) {
  const geo = new THREE.IcosahedronGeometry(radio, detalle).toNonIndexed();
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = ruido(+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3));
    v.multiplyScalar(1 + (n - 0.5) * 0.09);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  // Un color por cara: bandas por latitud + variación, para el look facetado.
  const colores = new Float32Array(pos.count * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(colores, 3));
  geo.computeVertexNormals();
  return geo;
}

function pintarPlaneta(geo: THREE.BufferGeometry, a: THREE.Color, b: THREE.Color) {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const col = geo.getAttribute('color') as THREE.BufferAttribute;
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i += 3) {
    const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const banda = Math.sin(y * 3.2) * 0.5 + 0.5;
    const n = ruido(pos.getX(i), y, pos.getZ(i));
    c.copy(a).lerp(b, Math.min(1, banda * 0.75 + n * 0.35));
    for (let k = 0; k < 3; k++) col.setXYZ(i + k, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
}

function naveProcedural(color: THREE.Color, motor: THREE.Color) {
  const nave = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.5, metalness: 0.2 });
  const cuerpo = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.55, 5), mat);
  cuerpo.rotation.x = Math.PI / 2; // punta hacia +Z
  nave.add(cuerpo);
  const alas = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.16), mat);
  alas.position.z = -0.12;
  nave.add(alas);
  const aleta = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.14), mat);
  aleta.position.set(0, 0.07, -0.18);
  nave.add(aleta);
  const fuego = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 6),
    new THREE.MeshBasicMaterial({ color: motor, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }),
  );
  fuego.scale.set(1, 1, 2.2);
  fuego.position.z = -0.32;
  fuego.name = 'fuego';
  nave.add(fuego);
  return nave;
}

async function cargarGlb() {
  if (!urlEspacio) return null;
  try {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const gltf = await new GLTFLoader().loadAsync(urlEspacio);
    return gltf.scene;
  } catch (e) {
    console.warn('[hero] No se pudo cargar espacio.glb, uso la escena procedural.', e);
    return null;
  }
}

export async function crearEscena(hero: HTMLElement, canvas: HTMLCanvasElement): Promise<boolean> {
  const esMovil = movil();
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !esMovil, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return false;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, esMovil ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 0, 9);

  const rig = new THREE.Group(); // gira con el cursor/giroscopio
  scene.add(rig);
  const sistema = new THREE.Group(); // planeta + luna + anillo + nave
  rig.add(sistema);

  // Luces: clave cálida, contraluz en el color secundario y un ambiente bajo.
  const amb = new THREE.AmbientLight(0xffffff, 0.35);
  const clave = new THREE.DirectionalLight(0xffffff, 2.4);
  clave.position.set(-4, 3, 5);
  const contra = new THREE.DirectionalLight(0xffffff, 1.6);
  contra.position.set(5, -2, -4);
  scene.add(amb, clave, contra);

  // Planeta.
  const geoPlaneta = planetaProcedural(1.6, esMovil ? 2 : 3);
  const matPlaneta = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 });
  let planeta: THREE.Object3D = new THREE.Mesh(geoPlaneta, matPlaneta);
  sistema.add(planeta);

  // Anillo de asteroides (instanciado: una sola llamada de dibujo).
  const nAst = esMovil ? 70 : 160;
  const matAst = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 });
  let geoAst: THREE.BufferGeometry = new THREE.DodecahedronGeometry(0.035, 0);
  let asteroides: THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material> = new THREE.InstancedMesh(geoAst, matAst, nAst);
  const anillo = new THREE.Group();
  anillo.rotation.set(1.25, 0.15, -0.35);
  sistema.add(anillo);
  const datosAst = Array.from({ length: nAst }, (_, i) => ({
    r: 2.35 + Math.random() * 0.75,
    a: (i / nAst) * Math.PI * 2 + Math.random() * 0.2,
    y: (Math.random() - 0.5) * 0.12,
    s: 0.4 + Math.random() * 1.4,
    rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0),
  }));
  const tmp = new THREE.Object3D();
  const colocarAsteroides = (t: number) => {
    datosAst.forEach((d, i) => {
      const a = d.a + t * 0.04;
      tmp.position.set(Math.cos(a) * d.r, d.y, Math.sin(a) * d.r);
      tmp.rotation.set(d.rot.x + t * 0.3, d.rot.y + t * 0.2, 0);
      tmp.scale.setScalar(d.s);
      tmp.updateMatrix();
      asteroides.setMatrixAt(i, tmp.matrix);
    });
    asteroides.instanceMatrix.needsUpdate = true;
  };
  anillo.add(asteroides);

  // Luna.
  const matLuna = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.8 });
  let luna: THREE.Object3D = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), matLuna);
  sistema.add(luna);

  // Nave.
  let nave: THREE.Object3D = naveProcedural(new THREE.Color(0xffffff), new THREE.Color(0xffffff));
  scene.add(nave); // fuera del rig para que su órbita no herede el giro del cursor de forma rara
  const estela = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(Array.from({ length: 40 }, () => new THREE.Vector3())),
    new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 }),
  );
  scene.add(estela);

  // Estrellas.
  const nEst = esMovil ? 700 : 1600;
  const pEst = new Float32Array(nEst * 3);
  for (let i = 0; i < nEst; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(25 + Math.random() * 50);
    pEst.set([v.x, v.y, v.z - 20], i * 3);
  }
  const geoEst = new THREE.BufferGeometry();
  geoEst.setAttribute('position', new THREE.BufferAttribute(pEst, 3));
  const matEst = new THREE.PointsMaterial({ size: esMovil ? 0.14 : 0.11, sizeAttenuation: true, transparent: true, opacity: 0.8 });
  const estrellas = new THREE.Points(geoEst, matEst);
  scene.add(estrellas);

  // Modelos de Blender, si existen: sustituyen a los procedurales manteniendo posición y tamaño de la escena.
  const glb = await cargarGlb();
  if (glb) {
    const tomar = (nombre: string) => glb.getObjectByName(nombre);
    const p = tomar('Planeta');
    if (p) {
      sistema.remove(planeta);
      planeta = p;
      sistema.add(p);
    }
    const l = tomar('Luna');
    if (l) {
      sistema.remove(luna);
      luna = l;
      sistema.add(l);
    }
    const n = tomar('Nave');
    if (n) {
      scene.remove(nave);
      const g = new THREE.Group();
      g.add(n);
      nave = g;
      scene.add(g);
    }
    const a = tomar('Asteroide') as THREE.Mesh | undefined;
    if (a?.geometry) {
      anillo.remove(asteroides);
      geoAst = a.geometry;
      asteroides = new THREE.InstancedMesh(geoAst, (a.material as THREE.Material) ?? matAst, nAst);
      anillo.add(asteroides);
    }
    planeta.position.set(0, 0, 0);
    luna.position.set(0, 0, 0);
  }

  // Colores del tema (se repintan al cambiarlo).
  const aplicarTema = () => {
    const acento = new THREE.Color(css('--accent'));
    const acento2 = new THREE.Color(css('--accent-2'));
    const fondo = new THREE.Color(css('--bg'));
    const texto = new THREE.Color(css('--fg'));
    const oscuro = fondo.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5;
    pintarPlaneta(geoPlaneta, acento, new THREE.Color(oscuro ? 0x1b1830 : 0x2b2560));
    matAst.color.copy(texto).lerp(fondo, 0.45);
    matLuna.color.copy(acento2);
    clave.color.set(0xfff1e0);
    contra.color.copy(acento2);
    amb.intensity = oscuro ? 0.3 : 0.9;
    matEst.color.copy(texto);
    matEst.opacity = oscuro ? 0.85 : 0.35;
    (estela.material as THREE.LineBasicMaterial).color.copy(acento);
    nave.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial | undefined;
      if (!m || glb?.getObjectByName('Nave')) return;
      if (o.name === 'fuego') m.color.copy(acento);
      else m.color.copy(texto);
    });
  };
  aplicarTema();
  addEventListener('tema', () => requestAnimationFrame(aplicarTema));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema);

  // Encuadre: en escritorio el planeta a la derecha; en móvil arriba y más pequeño, para dejar el texto abajo.
  const encuadrar = () => {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (w < 768) {
      sistema.position.set(0.8, 2.0, 0);
      sistema.scale.setScalar(0.62);
    } else {
      const a = w / h;
      sistema.position.set(a > 1.6 ? 3.4 : a > 1.2 ? 2.7 : 1.6, a > 1.2 ? 0.2 : 1.4, 0);
      sistema.scale.setScalar(a > 1.2 ? 0.85 : 0.75);
    }
  };
  encuadrar();
  new ResizeObserver(encuadrar).observe(hero);

  // Entrada: cursor o giroscopio → objetivo de giro; se suaviza en cada frame.
  const objetivo = { x: 0, y: 0 };
  const actual = { x: 0, y: 0 };
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      objetivo.x = (e.clientX / innerWidth - 0.5) * 2;
      objetivo.y = (e.clientY / innerHeight - 0.5) * 2;
    },
    { passive: true },
  );
  const orientacion = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    objetivo.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
    objetivo.y = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
  };
  type DOEPermiso = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };
  const DOE = (window as unknown as { DeviceOrientationEvent?: DOEPermiso }).DeviceOrientationEvent;
  if (DOE?.requestPermission) {
    // iOS: hay que pedir permiso con un gesto. Se pide al primer toque en el hero.
    hero.addEventListener(
      'touchend',
      () => DOE.requestPermission!().then((r) => r === 'granted' && addEventListener('deviceorientation', orientacion)).catch(() => {}),
      { once: true },
    );
  } else if (DOE) {
    addEventListener('deviceorientation', orientacion, { passive: true });
  }

  // Órbita de la nave: elipse inclinada alrededor del planeta, en coordenadas del mundo.
  const centro = new THREE.Vector3();
  const puntoOrbita = (t: number, out: THREE.Vector3) => {
    sistema.getWorldPosition(centro);
    const s = sistema.scale.x;
    out.set(Math.cos(t) * 3.6 * s, Math.sin(t * 2) * 0.35 * s + Math.sin(t) * 0.9 * s, Math.sin(t) * 2.4 * s);
    out.applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.25);
    return out.add(centro);
  };
  const historial: THREE.Vector3[] = Array.from({ length: 40 }, () => new THREE.Vector3());
  const pNave = new THREE.Vector3();
  const pSig = new THREE.Vector3();

  // Bucle: solo corre si el hero se ve y la pestaña está activa.
  const inicio = performance.now();
  let visible = true;
  let progreso = 0;
  const frame = () => {
    const t = (performance.now() - inicio) / 1000;
    actual.x += (objetivo.x - actual.x) * 0.05;
    actual.y += (objetivo.y - actual.y) * 0.05;
    rig.rotation.y = actual.x * 0.28;
    rig.rotation.x = actual.y * 0.16;

    planeta.rotation.y = t * 0.08;
    luna.position.set(Math.cos(t * 0.5) * 2.1, Math.sin(t * 0.5) * 0.6, Math.sin(t * 0.5) * 2.1);
    luna.rotation.y = t * 0.3;
    colocarAsteroides(t);

    const tn = t * 0.32;
    puntoOrbita(tn, pNave);
    puntoOrbita(tn + 0.02, pSig);
    nave.position.copy(pNave);
    nave.lookAt(pSig);
    nave.rotateZ(Math.sin(tn) * 0.5);
    const viejo = historial.pop()!;
    historial.unshift(viejo.copy(pNave));
    const posEstela = estela.geometry.getAttribute('position') as THREE.BufferAttribute;
    historial.forEach((p, i) => posEstela.setXYZ(i, p.x, p.y, p.z));
    posEstela.needsUpdate = true;
    estela.geometry.computeBoundingSphere();

    estrellas.rotation.y = t * 0.004 + actual.x * 0.05;
    estrellas.rotation.x = actual.y * 0.03;

    camera.position.z = 9 + progreso * 3;
    camera.position.y = -progreso * 1.2;

    renderer.render(scene, camera);
  };

  const sincronizar = () => renderer.setAnimationLoop(visible && !document.hidden ? frame : null);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    sincronizar();
  }).observe(hero);
  document.addEventListener('visibilitychange', sincronizar);
  addEventListener(
    'scroll',
    () => {
      progreso = THREE.MathUtils.clamp(scrollY / hero.clientHeight, 0, 1);
    },
    { passive: true },
  );

  // Primer frame ya con todo colocado, para que el fundido no muestre la escena vacía.
  historial.forEach((h) => h.copy(puntoOrbita(0, new THREE.Vector3())));
  frame();
  sincronizar();
  return true;
}
