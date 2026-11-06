// The home hero's "scan horizon" (when the page's hero is 'scan', see src/pages/home.mjs): black meets white
// at an inky blue edge, a glowing orb on the horizon, and AI elements tracked across it in boxes with live
// readouts (an AI chip, a brain, a vision eye and data on the dark side; cloud, security and an agent on
// the light side). Drawn as SVG into [data-scan] (viewBox 1680 x 944), so it is sharp at any size.
// The orb is where stage.js starts the particles that stream down onto the white sheet.
const NS = 'http://www.w3.org/2000/svg';
export const ORB = { x: 1150, y: 472 }; // in the artwork's own units
const PLANET = { cx: ORB.x - 1560, cy: ORB.y, r: 1560 }; // the dark side: a vast circle whose edge passes the orb

// the AI elements, drawn around (0, 0) at about 90 units; s is the stroke attributes
const ICONS = {
  chip: (s) => `<rect x="-32" y="-32" width="64" height="64" rx="6" ${s}/><rect x="-16" y="-16" width="32" height="32" rx="3" ${s}/><text x="0" y="5" text-anchor="middle" font-size="14" font-weight="700" font-family="JetBrains Mono, monospace" fill="currentColor">AI</text>` +
    [-20, -7, 7, 20].map((p) => `<path d="M${p} -32V-44M${p} 32V44M-32 ${p}H-44M32 ${p}H44" ${s}/>`).join(''),
  brain: (s) => `<path d="M-4 -34C-22 -40 -40 -28 -38 -10C-48 -2 -46 18 -32 24C-30 38 -12 44 -4 34Z" ${s}/><path d="M4 -34C22 -40 40 -28 38 -10C48 -2 46 18 32 24C30 38 12 44 4 34Z" ${s}/><path d="M-4 -34V34M4 -34V34M-30 -8C-20 -12 -14 -4 -16 6M30 -8C20 -12 14 -4 16 6M-28 18C-18 14 -10 20 -10 28M28 18C18 14 10 20 10 28" ${s}/><circle cx="-16" cy="6" r="2.5" fill="currentColor"/><circle cx="16" cy="6" r="2.5" fill="currentColor"/>`,
  eye: (s) => `<path d="M-46 0C-30 -26 30 -26 46 0C30 26 -30 26 -46 0Z" ${s}/><circle r="15" ${s}/><circle r="6" fill="currentColor"/><path d="M-56 -30H-46M46 -30H56M-56 30H-46M46 30H56" ${s}/>`,
  data: (s) => `<path d="M0 -38L34 -20V20L0 38L-34 20V-20Z" ${s}/><path d="M-34 -20L0 -2L34 -20M0 -2V38" ${s}/><path d="M-17 -11V29M17 -11V29" ${s} opacity="0.5"/>`,
  cloud: (s) => `<path d="M-38 18C-52 18 -54 -4 -38 -6C-38 -26 -12 -32 -4 -16C4 -34 34 -28 32 -6C50 -6 50 18 34 18Z" ${s}/><path d="M-10 18V34M10 18V34M-10 34H-22M10 34H22" ${s}/><circle cx="-22" cy="34" r="3" fill="currentColor"/><circle cx="22" cy="34" r="3" fill="currentColor"/>`,
  lock: (s) => `<rect x="-28" y="-6" width="56" height="44" rx="6" ${s}/><path d="M-18 -6V-18C-18 -42 18 -42 18 -18V-6" ${s}/><circle cx="0" cy="12" r="6" fill="currentColor"/><path d="M0 16V26" ${s}/>`,
  robot: (s) => `<rect x="-30" y="-24" width="60" height="50" rx="12" ${s}/><circle cx="-12" cy="-2" r="6" fill="currentColor"/><circle cx="12" cy="-2" r="6" fill="currentColor"/><path d="M-12 14H12M0 -24V-36M-36 -4V8M36 -4V8" ${s}/><circle cx="0" cy="-40" r="4" fill="currentColor"/>`,
};
// where they sit: the lower left stays clear for the headline, the top right for the highlights
const SUBJECTS = [
  { kind: 'chip', x: 360, y: 250, label: 'ai_core.chip', dark: true, s: 1.0 },
  { kind: 'brain', x: 690, y: 190, label: 'neural.map', dark: true, s: 0.95 },
  { kind: 'data', x: 560, y: 440, label: 'data.store', dark: true, s: 0.85 },
  { kind: 'eye', x: 900, y: 320, label: 'vision.eye', dark: true, s: 0.85 },
  { kind: 'cloud', x: 1330, y: 400, label: 'cloud.node', dark: false, s: 0.85 },
  { kind: 'lock', x: 1490, y: 575, label: 'secure.layer', dark: false, s: 0.8 },
  { kind: 'robot', x: 1340, y: 700, label: 'agent.model', dark: false, s: 0.85 },
];

export function drawScan(svg) {
  const el = (name, attrs = {}, parent = svg) => { const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const O = ORB;
  const origin = `transform-origin:${O.x}px ${O.y}px`;
  svg.innerHTML = '';

  el('defs').innerHTML = `
    <radialGradient id="scan-orb" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.18" stop-color="#e6ecff"/>
      <stop offset="0.45" stop-color="#4f73ff" stop-opacity="0.85"/><stop offset="1" stop-color="#1b3dff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="scan-halo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#2f56ff" stop-opacity="0.55"/><stop offset="1" stop-color="#2f56ff" stop-opacity="0"/>
    </radialGradient>
    <filter id="scan-blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="scan-blur8"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="scan-ink" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="4" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <clipPath id="scan-dark"><circle cx="${PLANET.cx}" cy="${PLANET.cy}" r="${PLANET.r}"/></clipPath>
    <clipPath id="scan-light"><path fill-rule="evenodd" d="M-200 -200H1880V1144H-200Z M${PLANET.cx + PLANET.r} ${PLANET.cy} A${PLANET.r} ${PLANET.r} 0 1 0 ${PLANET.cx - PLANET.r} ${PLANET.cy} A${PLANET.r} ${PLANET.r} 0 1 0 ${PLANET.cx + PLANET.r} ${PLANET.cy}Z"/></clipPath>`;

  // the two sides, and the blue ink edge where they meet
  el('rect', { x: -200, y: -200, width: 2080, height: 1344, fill: '#f3f5f9' });
  el('circle', { cx: PLANET.cx, cy: PLANET.cy, r: PLANET.r, fill: '#03060c' });
  el('circle', { cx: PLANET.cx, cy: PLANET.cy, r: PLANET.r + 10, fill: 'none', stroke: '#1f45ff', 'stroke-width': 90, opacity: 0.55, filter: 'url(#scan-blur30)' });
  el('circle', { cx: PLANET.cx, cy: PLANET.cy, r: PLANET.r + 18, fill: 'none', stroke: '#2a4dff', 'stroke-width': 26, opacity: 0.9, filter: 'url(#scan-ink)' });
  el('circle', { cx: PLANET.cx, cy: PLANET.cy, r: PLANET.r + 4, fill: 'none', stroke: '#8fa6ff', 'stroke-width': 2, opacity: 0.8 });
  const spray = el('g', { 'clip-path': 'url(#scan-light)' });
  for (let i = 0; i < 480; i++) {
    const a = (rand() - 0.5) * 0.62;
    const d = Math.pow(rand(), 2.4) * 360;
    el('circle', { cx: (PLANET.cx + Math.cos(a) * (PLANET.r + 6 + d)).toFixed(1), cy: (PLANET.cy + Math.sin(a) * (PLANET.r + 6 + d)).toFixed(1), r: (0.6 + rand() * 2.4 * (1 - d / 380)).toFixed(2), fill: rand() < 0.85 ? '#2547ff' : '#0b1a66', opacity: (0.25 + rand() * 0.6 * (1 - d / 380)).toFixed(2) }, spray);
  }
  const stars = el('g', { 'clip-path': 'url(#scan-dark)' });
  for (let i = 0; i < 200; i++) el('circle', { cx: (rand() * O.x).toFixed(1), cy: (rand() * 944).toFixed(1), r: (0.4 + rand() * 1.1).toFixed(2), fill: '#ffffff', opacity: (0.15 + rand() * 0.5).toFixed(2) }, stars);

  // circles, rays and the horizon: white on the dark side, ink on the light
  for (const [clip, c] of [['scan-dark', 'rgba(255,255,255,'], ['scan-light', 'rgba(14,26,80,']]) {
    const g = el('g', { 'clip-path': `url(#${clip})`, fill: 'none' });
    [140, 260, 430, 640, 880].forEach((r, i) => el('circle', { cx: O.x, cy: O.y, r, stroke: `${c}${Math.max(0.06, 0.22 - i * 0.035)})`, 'stroke-width': 1, 'stroke-dasharray': i === 2 ? '2 6' : '' }, g));
    el('line', { x1: -200, y1: O.y, x2: 1880, y2: O.y, stroke: `${c}0.5)`, 'stroke-width': 1.2 }, g);
    el('line', { x1: O.x, y1: -200, x2: O.x, y2: 1144, stroke: `${c}0.1)`, 'stroke-width': 1 }, g);
  }
  el('rect', { x: O.x - 240, y: O.y - 9, width: 480, height: 18, fill: '#03060c' });
  const code = el('text', { x: O.x, y: O.y + 4, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-size': 10, fill: '#cfd9ff', 'letter-spacing': '1.2' });
  const sweep = el('g', { class: 'scan-sweep', style: origin });
  el('line', { x1: O.x, y1: O.y, x2: O.x + 640, y2: O.y, stroke: '#5b7bff', 'stroke-width': 1.5, opacity: 0.6 }, sweep);
  el('circle', { cx: O.x + 640, cy: O.y, r: 3, fill: '#5b7bff' }, sweep);

  // the tracked AI elements
  const readouts = [];
  SUBJECTS.forEach((p, i) => {
    const ink = p.dark ? '#ffffff' : '#2547ff';
    const line = p.dark ? 'rgba(255,255,255,0.45)' : 'rgba(20,40,140,0.45)';
    const b = 64 * p.s;
    const dx = p.x - O.x;
    const dy = p.y - O.y;
    const edge = 1 - b / Math.max(Math.abs(dx), Math.abs(dy));
    el('line', { x1: O.x, y1: O.y, x2: O.x + dx * edge, y2: O.y + dy * edge, stroke: line, 'stroke-width': 1 });
    const t = 0.55 + rand() * 0.2;
    el('rect', { x: O.x + dx * t - 4, y: O.y + dy * t - 4, width: 8, height: 8, fill: 'none', stroke: ink, 'stroke-width': 1, opacity: 0.8 });
    const g = el('g', { class: 'scan-float', style: `animation-delay:${(-i * 0.7).toFixed(1)}s` });
    el('circle', { cx: p.x, cy: p.y, r: 46, fill: p.dark ? '#4f73ff' : '#2547ff', opacity: p.dark ? 0.18 : 0.08, filter: 'url(#scan-blur8)' }, g);
    const ig = el('g', { transform: `translate(${p.x} ${p.y}) scale(${p.s})`, style: `color:${ink}` }, g);
    ig.innerHTML = ICONS[p.kind](`fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`);
    const k = 14;
    el('path', { d: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => `M${p.x + sx * b} ${p.y + sy * b - sy * k}V${p.y + sy * b}H${p.x + sx * b - sx * k}`).join(''), fill: 'none', stroke: ink, 'stroke-width': 1.6 }, g);
    el('rect', { x: p.x - b, y: p.y - b, width: b * 2, height: b * 2, fill: 'none', stroke: ink, 'stroke-width': 0.6, opacity: 0.35 }, g);
    el('text', { x: p.x - b, y: p.y - b - 10, 'font-family': 'JetBrains Mono, monospace', 'font-size': 12, fill: ink, opacity: 0.95 }, g).textContent = p.label;
    readouts.push({ node: el('text', { x: p.x - b, y: p.y + b + 20, 'font-family': 'JetBrains Mono, monospace', 'font-size': 10.5, fill: ink, opacity: 0.7 }, g), p });
  });

  // the orb, over everything
  el('circle', { cx: O.x, cy: O.y, r: 230, fill: 'url(#scan-halo)' });
  const orb = el('g', { class: 'scan-pulse', style: origin });
  el('circle', { cx: O.x, cy: O.y, r: 92, fill: 'url(#scan-orb)' }, orb);
  el('circle', { cx: O.x, cy: O.y, r: 24, fill: 'none', stroke: '#ffffff', 'stroke-width': 2 }, orb);
  el('circle', { cx: O.x, cy: O.y, r: 9, fill: '#ffffff' }, orb);

  // live readouts and the code strip, only while the artwork is on screen
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true;
  let raf = 0;
  const tick = (t) => {
    for (const r of readouts) r.node.textContent = `${(r.p.x * 0.731 + Math.sin(t * 0.0007 + r.p.y) * 4).toFixed(3)}, ${(r.p.y * 1.27 + Math.cos(t * 0.0005 + r.p.x) * 4).toFixed(2)}`;
    const n = Math.floor(t / 180);
    code.textContent = Array.from({ length: 18 }, (_, i) => 65 + ((n * 7 + i * 13) % 58)).join(' ');
    if (!reduce && visible) raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(tick); }).observe(svg);
  tick(performance.now());
}

// where the orb is on screen right now (css pixels)
export function orbOnScreen(svg) {
  const m = svg.getScreenCTM();
  if (!m) return null;
  const pt = svg.createSVGPoint();
  pt.x = ORB.x;
  pt.y = ORB.y;
  const p = pt.matrixTransform(m);
  return { x: p.x, y: p.y };
}
