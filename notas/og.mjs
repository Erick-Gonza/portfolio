// Genera public/og.png (1200x630) para redes. Uso: node notas/og.mjs
import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<defs><radialGradient id="p" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#ff5b2e"/><stop offset=".6" stop-color="#5a2412"/><stop offset="1" stop-color="#07070c"/></radialGradient></defs>
<rect width="1200" height="630" fill="#07070c"/>
<g transform="translate(860 300)"><ellipse rx="300" ry="62" fill="none" stroke="#2a2a33" stroke-width="3" transform="rotate(-18)"/>
<polygon points="0,-220 190,-110 190,110 0,220 -190,110 -190,-110" fill="url(#p)"/><circle cx="210" cy="-190" r="22" fill="#c8ff4d"/></g>
<text x="80" y="120" font-family="monospace" font-size="24" fill="#9a98a8" letter-spacing="4">FULL-STACK · 3D · JUEGOS</text>
<text x="74" y="330" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="150" fill="#ecebe4">erick<tspan fill="#ff5b2e">.dev</tspan></text>
<text x="80" y="420" font-family="Arial, sans-serif" font-size="36" fill="#ecebe4" opacity=".8">Apps web, sistemas a la medida</text>
<text x="80" y="468" font-family="Arial, sans-serif" font-size="36" fill="#ecebe4" opacity=".8">y mundos en tiempo real.</text>
<text x="80" y="560" font-family="monospace" font-size="24" fill="#ff5b2e">erick.orion-consultoria.tech</text></svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('public/og.png listo');
