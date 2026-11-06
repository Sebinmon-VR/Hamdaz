// Element "layers" (What We Do): the technology stack as four floating glass platforms, Security at the
// base, then Cloud, Data and AI. Glowing server modules sit on each level, beams of data pulse up through
// the stack, and an AI core hovers above the top platform.
import * as THREE from '../../vendor/three.module.min.js';
import { rng } from '../circuit.js';

const CYAN = new THREE.Color('#30c1f8');
const PINK = new THREE.Color('#eb4b96');
export const LAYERS = ['Security', 'Cloud', 'Data', 'AI'];
export const SIZE = 2.1; // platform width
export const GAP = 0.62; // height between platforms
export const levelY = (i) => (i - (LAYERS.length - 1) / 2) * GAP;
const BEAMS = [[-0.7, -0.7], [0.7, -0.7], [0.7, 0.7], [-0.7, 0.7], [0, 0]];

// the platform's top: a fine grid, a frame, and its name
function topTexture(name, i) {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const accent = i === LAYERS.length - 1 ? '235,75,150' : '48,193,248';
  const draw = () => {
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, 'rgba(20,52,82,0.92)');
    g.addColorStop(1, 'rgba(8,24,40,0.92)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = `rgba(${accent},0.14)`;
    ctx.lineWidth = 1;
    for (let k = 1; k < 16; k++) {
      const p = (k / 16) * S;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(S, p); ctx.stroke();
    }
    ctx.strokeStyle = `rgba(${accent},0.7)`;
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, S - 28, S - 28);
    ctx.fillStyle = `rgba(${accent},0.95)`;
    ctx.font = '500 30px "JetBrains Mono", Consolas, monospace';
    ctx.fillText(`0${i + 1}`, 36, S - 40);
    ctx.fillStyle = 'rgba(234,244,251,0.92)';
    ctx.font = '700 40px Archivo, "Arial Black", Arial, sans-serif';
    ctx.fillText(name.toUpperCase(), 96, S - 38);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.ready.then(draw);
  return tex;
}

const moduleVertex = /* glsl */ `
  attribute float aSeed;
  varying vec3 vN;
  varying float vSeed;
  varying float vH;
  void main() {
    vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vSeed = aSeed;
    vH = position.y + 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const moduleFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vN;
  varying float vSeed;
  varying float vH;
  void main() {
    vec3 cyan = vec3(0.19, 0.76, 0.97);
    vec3 pink = vec3(0.92, 0.29, 0.59);
    float on = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (1.0 + vSeed * 2.0) + vSeed * 30.0), 4.0);
    vec3 accent = vSeed > 0.85 ? pink : cyan;
    vec3 col;
    if (vN.y > 0.5) col = accent * (0.35 + 0.65 * on); // glowing top
    else {
      // dark sides with thin lit slots, like a server face
      float slot = step(0.55, fract(vH * 6.0)) * step(fract(vH * 6.0), 0.75);
      col = vec3(0.04, 0.09, 0.15) + accent * slot * on * 0.6;
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.3)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function build({ root, U, reduceMotion }) {
  const rand = rng(151);
  const glow = glowTexture();
  const stack = new THREE.Group();
  root.add(stack);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: CYAN, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(6);
  halo.position.z = -1.5;
  root.add(halo);

  /* --- the platforms --- */
  const slab = new THREE.BoxGeometry(SIZE, 0.06, SIZE);
  const edges = new THREE.EdgesGeometry(slab);
  const sideMat = new THREE.MeshBasicMaterial({ color: 0x0b2138, transparent: true, opacity: 0.85 });
  const levels = LAYERS.map((name, i) => {
    const g = new THREE.Group();
    g.position.y = levelY(i);
    const topMat = new THREE.MeshBasicMaterial({ map: topTexture(name, i), transparent: true, opacity: 0.95 });
    // BoxGeometry faces: +x, -x, +y (top), -y, +z, -z
    g.add(new THREE.Mesh(slab, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]));
    g.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: i === LAYERS.length - 1 ? PINK : CYAN, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })));
    stack.add(g);
    return { g, phase: i * 0.9 };
  });

  /* --- server modules on each platform --- */
  const spots = [];
  levels.forEach((_, i) => {
    const used = new Set();
    for (let n = 0; n < 7; n++) {
      let cx;
      let cz;
      do { cx = Math.floor(rand() * 4); cz = Math.floor(rand() * 4); } while (used.has(`${cx},${cz}`) || (cx === 0 && cz === 3));
      used.add(`${cx},${cz}`);
      spots.push({ i, x: (cx - 1.5) * 0.42, z: (cz - 1.5) * 0.42, h: 0.08 + rand() * 0.22, seed: rand() });
    }
  });
  const mod = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 1, 0.26), new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime }, vertexShader: moduleVertex, fragmentShader: moduleFragment }), spots.length);
  const seedAttr = new Float32Array(spots.length);
  spots.forEach((s, n) => { seedAttr[n] = s.seed; });
  mod.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seedAttr, 1));
  stack.add(mod);
  const m4 = new THREE.Matrix4();
  const setModules = () => {
    spots.forEach((s, n) => {
      const base = levels[s.i].g.position.y + 0.03;
      m4.makeScale(1, s.h, 1).setPosition(s.x, base + s.h / 2, s.z);
      mod.setMatrixAt(n, m4);
    });
    mod.instanceMatrix.needsUpdate = true;
  };
  setModules();

  /* --- beams of data rising through the stack --- */
  const top = levelY(LAYERS.length - 1) + 0.9;
  const bottom = levelY(0) - 0.15;
  {
    const p = [];
    for (const [x, z] of BEAMS) p.push(x, bottom, z, x, top - 0.5, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    stack.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })));
  }
  const PK = 26;
  const pulses = Array.from({ length: PK }, (_, n) => ({ b: BEAMS[n % BEAMS.length], k: rand(), speed: 0.18 + rand() * 0.22, pink: n % 5 === 0 }));
  const pPos = new Float32Array(PK * 3);
  const pCol = new Float32Array(PK * 4);
  const pSize = new Float32Array(PK).fill(10);
  pulses.forEach((p, n) => { const c = p.pink ? PINK : new THREE.Color(0.75, 0.95, 1); pCol.set([c.r, c.g, c.b, 1], n * 4); });
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pg.setAttribute('aColor', new THREE.BufferAttribute(pCol, 4));
  pg.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
  const pts = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: { uPixel: U.uPixel },
    vertexShader: `attribute float aSize; attribute vec4 aColor; uniform float uPixel; varying vec4 vColor;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPixel * (6.0 / -mv.z); vColor = aColor; }`,
    fragmentShader: `varying vec4 vColor; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vColor.rgb, vColor.a * a * a); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  pts.frustumCulled = false;
  stack.add(pts);

  /* --- the AI core above the top platform --- */
  const core = new THREE.Group();
  core.position.y = top - 0.25;
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: PINK, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  coreGlow.scale.setScalar(0.9);
  const coreWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.2, 1)), new THREE.LineBasicMaterial({ color: '#ffb3d6', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.add(coreGlow, coreWire);
  stack.add(core);

  return {
    anchors: {},
    update({ t, dt, e, p }) {
      // the platforms drift apart a little (p.open) and breathe
      const open = p.open ?? 0;
      levels.forEach((l, i) => { l.g.position.y = levelY(i) * (1 + open * 0.25) + (reduceMotion ? 0 : Math.sin(t * 0.8 + l.phase) * 0.025); });
      setModules();
      pulses.forEach((pl, n) => {
        if (!reduceMotion) pl.k = (pl.k + dt * pl.speed) % 1;
        pPos.set([pl.b[0], bottom + (top - 0.5 - bottom) * pl.k, pl.b[1]], n * 3);
        pCol[n * 4 + 3] = Math.sin(pl.k * Math.PI) * e;
      });
      pg.attributes.position.needsUpdate = true;
      pg.attributes.aColor.needsUpdate = true;
      core.position.y = top - 0.25 + (reduceMotion ? 0 : Math.sin(t * 1.2) * 0.04);
      coreWire.rotation.set(t * 0.5, t * 0.7, 0);
      coreGlow.material.opacity = (reduceMotion ? 0.7 : 0.55 + 0.25 * Math.sin(t * 2.2)) * e;
      halo.material.opacity = 0.25 * e;
    },
  };
}
