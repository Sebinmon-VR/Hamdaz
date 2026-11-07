// Hamdaz: a 3D scene for each inner page hero.
//   network : Who We Are  - a sphere of connected people with signals travelling between them
//   blocks  : What We Do  - 20 service modules rising and falling on a blueprint grid
//   neural  : How We Do   - a flowing data wave with a wireframe AI core above it
// Three.js r160 (MIT).
import * as THREE from '../vendor/three.module.min.js';

const DEG = Math.PI / 180;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const CYAN = new THREE.Color('#30c1f8');
const PINK = new THREE.Color('#eb4b96');
const CAM_Z = 10;
const FOV = 35;

// Seeded random so every visit draws the same composition.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------- shared shaders */
// depth fade: things further from the camera are dimmer
const FADE = /* glsl */ `float depthFade(float z) { return smoothstep(${(CAM_Z + 4).toFixed(1)}, ${(CAM_Z - 2.5).toFixed(1)}, z); }`;

const lineMaterial = (color, opacity) =>
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color.clone() }, uOpacity: { value: opacity } },
    vertexShader: /* glsl */ `
      ${FADE}
      varying float vFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFade = depthFade(-mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vFade;
      void main() { gl_FragColor = vec4(uColor, uOpacity * vFade); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

// soft round points; per-point colour and size
const pointMaterial = (U, opacity = 1) =>
  new THREE.ShaderMaterial({
    uniforms: { uPixel: U.uPixel, uOpacity: { value: opacity } },
    vertexShader: /* glsl */ `
      ${FADE}
      attribute float aSize;
      attribute vec3 aColor;
      uniform float uPixel;
      varying vec3 vColor;
      varying float vFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixel * (${CAM_Z.toFixed(1)} / -mv.z);
        vColor = aColor;
        vFade = depthFade(-mv.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vFade;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(vColor, a * a * vFade * uOpacity);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

// a soft radial glow on a camera-facing plane
function glow(size, color, strength) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color.clone() }, uStrength: { value: strength } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uStrength;
        varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 2.2) * uStrength;
          gl_FragColor = vec4(uColor, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  return mesh;
}

/* ---------------------------------------------------------------- Who We Are: network of people */
function network(root, U) {
  const rand = rng(7);
  const spin = new THREE.Group();
  root.add(glow(7.5, CYAN, 0.22), spin);

  // nodes on a Fibonacci sphere, gently jittered for depth
  const N = 150;
  const R = 2.05;
  const nodes = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const k = R * (0.84 + rand() * 0.3);
    nodes.push(new THREE.Vector3(Math.cos(golden * i) * r * k, y * k, Math.sin(golden * i) * r * k));
  }

  // each node links to its three nearest neighbours
  const edges = new Set();
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => [a.distanceToSquared(b), j])
      .filter(([, j]) => j !== i)
      .sort((p, q) => p[0] - q[0])
      .slice(0, 3)
      .forEach(([, j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  const pairs = [...edges].map((e) => e.split('-').map(Number));
  const linePos = new Float32Array(pairs.length * 6);
  pairs.forEach(([i, j], n) => {
    nodes[i].toArray(linePos, n * 6);
    nodes[j].toArray(linePos, n * 6 + 3);
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  spin.add(new THREE.LineSegments(lineGeo, lineMaterial(CYAN, 0.32)));

  // people: mostly cyan, some pink, a few larger "hubs"
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const size = new Float32Array(N);
  nodes.forEach((v, i) => {
    v.toArray(pos, i * 3);
    const hub = rand() < 0.06;
    const c = rand() < 0.18 ? PINK : CYAN;
    c.toArray(col, i * 3);
    size[i] = hub ? 15 : 6 + rand() * 3;
  });
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  nodeGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  spin.add(new THREE.Points(nodeGeo, pointMaterial(U, 1)));

  // signals travelling along random links
  const M = 42;
  const pulseGeo = new THREE.BufferGeometry();
  const A = new Float32Array(M * 3);
  const B = new Float32Array(M * 3);
  const speed = new Float32Array(M);
  const offset = new Float32Array(M);
  const pcol = new Float32Array(M * 3);
  for (let m = 0; m < M; m++) {
    const [i, j] = pairs[Math.floor(rand() * pairs.length)];
    const flip = rand() < 0.5;
    nodes[flip ? i : j].toArray(A, m * 3);
    nodes[flip ? j : i].toArray(B, m * 3);
    speed[m] = 0.25 + rand() * 0.45;
    offset[m] = rand();
    (rand() < 0.35 ? PINK : CYAN).toArray(pcol, m * 3);
  }
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(M * 3), 3));
  pulseGeo.setAttribute('aA', new THREE.BufferAttribute(A, 3));
  pulseGeo.setAttribute('aB', new THREE.BufferAttribute(B, 3));
  pulseGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
  pulseGeo.setAttribute('aOffset', new THREE.BufferAttribute(offset, 1));
  pulseGeo.setAttribute('aColor', new THREE.BufferAttribute(pcol, 3));
  const pulses = new THREE.Points(
    pulseGeo,
    new THREE.ShaderMaterial({
      uniforms: { uTime: U.uTime, uPixel: U.uPixel },
      vertexShader: /* glsl */ `
        ${FADE}
        attribute vec3 aA;
        attribute vec3 aB;
        attribute float aSpeed;
        attribute float aOffset;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uPixel;
        varying vec3 vColor;
        varying float vA;
        void main() {
          float t = fract(uTime * aSpeed + aOffset);
          vec4 mv = modelViewMatrix * vec4(mix(aA, aB, t), 1.0);
          gl_Position = projectionMatrix * mv;
          float s = sin(t * 3.14159);
          gl_PointSize = (4.0 + 8.0 * s) * uPixel * (${CAM_Z.toFixed(1)} / -mv.z);
          vColor = aColor;
          vA = s * depthFade(-mv.z);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, a * a * vA);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  pulses.frustumCulled = false;
  spin.add(pulses);

  return {
    place: (halfW, halfH, narrow) => (narrow ? { x: 0, y: halfH * 0.36, s: 0.74 } : { x: halfW * 0.52, y: 0.25, s: 0.9 }),
    live: () => ({ x: root.position.x, y: root.position.y, s: root.scale.x, rx: spin.rotation.x, ry: spin.rotation.y }),
    update({ t, scroll, px, py }) {
      spin.rotation.y = t * 0.09 + scroll * 1.4 + px * 0.35;
      spin.rotation.x = 0.28 - py * 0.2 - scroll * 0.35;
    },
  };
}

/* ---------------------------------------------------------------- What We Do: 20 service blocks */
function blocks(root, U) {
  const rand = rng(11);
  const COLS = 5;
  const ROWS = 4;
  const GAP = 0.92;
  const FOOT = 0.7;
  const COUNT = COLS * ROWS; // one block per managed service
  const spin = new THREE.Group();
  root.add(glow(8, CYAN, 0.16), spin);

  // blueprint floor grid, fading out from the centre
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: CYAN.clone() } },
      vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying vec2 vP;
        void main() {
          vec2 g = abs(fract(vP / ${(GAP / 2).toFixed(2)} + 0.5) - 0.5) / fwidth(vP / ${(GAP / 2).toFixed(2)});
          float line = 1.0 - min(min(g.x, g.y), 1.0);
          float fade = 1.0 - smoothstep(1.2, 4.6, length(vP));
          gl_FragColor = vec4(uColor, line * fade * 0.28);
        }`,
      extensions: { derivatives: true },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  spin.add(floor);

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const aScale = new THREE.InstancedBufferAttribute(new Float32Array(COUNT * 3), 3);
  const aGlow = new THREE.InstancedBufferAttribute(new Float32Array(COUNT), 1);
  const aTint = new THREE.InstancedBufferAttribute(new Float32Array(COUNT), 1);
  geo.setAttribute('aScale', aScale);
  geo.setAttribute('aGlow', aGlow);
  geo.setAttribute('aTint', aTint);
  const mesh = new THREE.InstancedMesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms: {
        uBase: { value: new THREE.Color('#1a4468') },
        uCyan: { value: CYAN.clone() },
        uPink: { value: PINK.clone() },
        uLight: { value: new THREE.Vector3(0.45, 1, 0.35).normalize() },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aScale;
        attribute float aGlow;
        attribute float aTint;
        varying vec3 vNormalW;
        varying vec3 vLocal;
        varying vec3 vScale;
        varying float vGlow;
        varying float vTint;
        void main() {
          vLocal = position;
          vScale = aScale;
          vGlow = aGlow;
          vTint = aTint;
          vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uBase;
        uniform vec3 uCyan;
        uniform vec3 uPink;
        uniform vec3 uLight;
        varying vec3 vNormalW;
        varying vec3 vLocal;
        varying vec3 vScale;
        varying float vGlow;
        varying float vTint;
        void main() {
          vec3 n = normalize(vNormalW);
          vec3 col = uBase * (0.5 + 0.8 * max(dot(n, uLight), 0.0));
          // distance (in world units) to the nearest edge of this face
          vec3 d = (0.5 - abs(vLocal)) * vScale;
          float e = d.x < d.y && d.x < d.z ? min(d.y, d.z) : (d.y < d.z ? min(d.x, d.z) : min(d.x, d.y));
          float w = fwidth(e);
          float edge = 1.0 - smoothstep(0.018 - w, 0.018 + w, e);
          vec3 accent = mix(uCyan, uPink, vTint);
          float top = step(0.5, n.y);
          col += accent * edge * (0.85 + 0.4 * vGlow);
          col = mix(col, accent * 0.9, top * vGlow * 0.8);
          col += accent * vGlow * 0.12;
          gl_FragColor = vec4(col, 1.0);
        }`,
      extensions: { derivatives: true },
    }),
    COUNT,
  );
  const tints = new Set();
  while (tints.size < 4) tints.add(Math.floor(rand() * COUNT));
  for (let i = 0; i < COUNT; i++) aTint.setX(i, tints.has(i) ? 1 : 0);
  spin.add(mesh);

  // the highlight scans through the blocks in a shuffled order
  const order = [...Array(COUNT).keys()].sort(() => rand() - 0.5);
  const glowNow = new Float32Array(COUNT);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();

  const setBlocks = (t) => {
    const active = order[Math.floor(t / 0.75) % COUNT];
    for (let i = 0; i < COUNT; i++) {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      const h = 0.32 + 0.95 * (0.5 + 0.5 * Math.sin(t * 0.9 + c * 0.75 + r * 1.15));
      p.set((c - (COLS - 1) / 2) * GAP, h / 2, (r - (ROWS - 1) / 2) * GAP);
      s.set(FOOT, h, FOOT);
      m4.compose(p, q, s);
      mesh.setMatrixAt(i, m4);
      aScale.setXYZ(i, FOOT, h, FOOT);
      glowNow[i] += ((i === active ? 1 : 0) - glowNow[i]) * 0.12;
      aGlow.setX(i, reduceMotion ? (i === order[0] ? 1 : 0) : glowNow[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    aScale.needsUpdate = true;
    aGlow.needsUpdate = true;
    aTint.needsUpdate = true;
  };
  setBlocks(0);

  return {
    place: (halfW, halfH, narrow) => (narrow ? { x: 0, y: halfH * 0.4, s: 0.4 } : { x: halfW * 0.5, y: 0.05, s: 0.74 }),
    live: () => ({ x: root.position.x, y: root.position.y, s: root.scale.x, rx: spin.rotation.x, ry: spin.rotation.y }),
    update({ t, scroll, px, py }) {
      setBlocks(t);
      spin.rotation.x = 0.58 + py * 0.12 + scroll * 0.25;
      spin.rotation.y = -0.72 + px * 0.28 + scroll * 0.7 + Math.sin(t * 0.18) * 0.12;
    },
  };
}

/* ---------------------------------------------------------------- How We Do: data wave + AI core */
function neural(root, U) {
  // flowing wave of points across the hero
  const NX = 120;
  const NZ = 64;
  const SX = 14;
  const SZ = 8;
  const pos = new Float32Array(NX * NZ * 3);
  let k = 0;
  for (let i = 0; i < NX; i++) {
    for (let j = 0; j < NZ; j++) {
      pos[k++] = (i / (NX - 1) - 0.5) * SX;
      pos[k++] = 0;
      pos[k++] = (j / (NZ - 1) - 0.5) * SZ;
    }
  }
  const waveGeo = new THREE.BufferGeometry();
  waveGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const wave = new THREE.Points(
    waveGeo,
    new THREE.ShaderMaterial({
      uniforms: { uTime: U.uTime, uPixel: U.uPixel, uCyan: { value: CYAN.clone() }, uPink: { value: PINK.clone() } },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixel;
        varying float vH;
        varying float vA;
        void main() {
          vec3 p = position;
          float h = 0.34 * sin(p.x * 0.62 + uTime * 0.5) * cos(p.z * 0.8 + uTime * 0.32)
                  + 0.16 * sin((p.x + p.z) * 1.35 - uTime * 0.75);
          p.y += h;
          vH = h;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = 3.1 * uPixel * (${CAM_Z.toFixed(1)} / -mv.z);
          float edge = (1.0 - smoothstep(0.55, 1.0, abs(p.x) / ${(SX / 2).toFixed(1)})) * (1.0 - smoothstep(0.45, 1.0, abs(p.z) / ${(SZ / 2).toFixed(1)}));
          vA = edge * smoothstep(${(CAM_Z + 8).toFixed(1)}, ${(CAM_Z - 1).toFixed(1)}, -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uCyan;
        uniform vec3 uPink;
        varying float vH;
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.1, d);
          vec3 c = mix(uCyan, uPink, smoothstep(0.16, 0.44, vH));
          gl_FragColor = vec4(c, a * vA);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  wave.frustumCulled = false;
  const field = new THREE.Group();
  field.add(wave);
  root.add(field);

  // wireframe AI core
  const core = new THREE.Group();
  const ico = new THREE.IcosahedronGeometry(1.15, 1);
  core.add(new THREE.LineSegments(new THREE.EdgesGeometry(ico), lineMaterial(CYAN, 0.75)));
  const inner = new THREE.IcosahedronGeometry(0.62, 0);
  core.add(new THREE.LineSegments(new THREE.EdgesGeometry(inner), lineMaterial(PINK, 0.6)));
  // vertices as glowing points
  const v = ico.getAttribute('position');
  const seen = new Map();
  for (let i = 0; i < v.count; i++) seen.set(`${v.getX(i).toFixed(3)},${v.getY(i).toFixed(3)},${v.getZ(i).toFixed(3)}`, [v.getX(i), v.getY(i), v.getZ(i)]);
  const verts = [...seen.values()];
  const vp = new Float32Array(verts.length * 3);
  const vc = new Float32Array(verts.length * 3);
  const vs = new Float32Array(verts.length);
  verts.forEach((xyz, i) => {
    vp.set(xyz, i * 3);
    (i % 4 === 0 ? PINK : CYAN).toArray(vc, i * 3);
    vs[i] = i % 4 === 0 ? 12 : 7;
  });
  const vg = new THREE.BufferGeometry();
  vg.setAttribute('position', new THREE.BufferAttribute(vp, 3));
  vg.setAttribute('aColor', new THREE.BufferAttribute(vc, 3));
  vg.setAttribute('aSize', new THREE.BufferAttribute(vs, 1));
  core.add(new THREE.Points(vg, pointMaterial(U, 1)));
  const coreHolder = new THREE.Group();
  coreHolder.add(glow(5, CYAN, 0.28), core);
  root.add(coreHolder);

  let place = { narrow: false, halfW: 5, halfH: 3 };
  return {
    live: () => ({ x: coreHolder.position.x, y: coreHolder.position.y, s: coreHolder.scale.x, rx: core.rotation.x, ry: core.rotation.y }),
    // this scene lays out its own parts, so the root stays at the origin
    place: (halfW, halfH, narrow) => {
      place = { narrow, halfW, halfH };
      field.position.set(0, narrow ? halfH * 0.05 : -0.95, 0);
      field.rotation.x = 0.42;
      field.scale.setScalar(narrow ? 0.7 : 1);
      coreHolder.position.set(narrow ? 0 : halfW * 0.5, narrow ? halfH * 0.38 : 0.55, 0);
      coreHolder.scale.setScalar(narrow ? 0.72 : 1);
      return { x: 0, y: 0, s: 1 };
    },
    update({ t, scroll, px, py }) {
      core.rotation.y = t * 0.22 + scroll * 1.2 + px * 0.3;
      core.rotation.x = t * 0.09 - py * 0.2;
      core.children[1].rotation.y = -t * 0.5;
      coreHolder.position.y = (place.narrow ? place.halfH * 0.38 : 0.55) + Math.sin(t * 0.8) * 0.08 - scroll * 0.6;
      field.rotation.x = 0.42 + scroll * 0.25 + py * 0.05;
      field.rotation.y = px * 0.08;
    },
  };
}

const BUILDERS = { network, blocks, neural };

/* ---------------------------------------------------------------- runtime */
function init(host, kind) {
  const canvas = host.querySelector('canvas');
  const build = BUILDERS[kind];
  const probe = document.createElement('canvas');
  if (!build || !canvas || !(probe.getContext('webgl2') || probe.getContext('webgl'))) return fail();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false });
  } catch (e) {
    return fail();
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);
  const U = { uTime: { value: 0 }, uPixel: { value: 1 } };
  const root = new THREE.Group();
  scene.add(root);
  const s = build(root, U);

  const DPR_MAX = Math.min(window.devicePixelRatio || 1, 1.25);
  let dpr = DPR_MAX;
  let W = 1;
  let H = 1;
  let dirty = true;
  let baseScale = 1;
  const resize = () => {
    W = host.clientWidth;
    H = host.clientHeight;
    if (!W || !H) return;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    U.uPixel.value = dpr;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const halfH = CAM_Z * Math.tan((FOV / 2) * DEG);
    const halfW = halfH * camera.aspect;
    const p = s.place(halfW, halfH, camera.aspect < 0.9);
    root.position.set(p.x, p.y, 0);
    baseScale = p.s;
    root.scale.setScalar(p.s);
    dirty = true;
  };

  // pointer parallax (desktop, full motion only)
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (finePointer && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = -((e.clientY / innerHeight) * 2 - 1);
    }, { passive: true });
  }

  // drop resolution if frames run slow for two seconds in a row
  let acc = 0;
  let frames = 0;
  let slow = 0;
  const adapt = (dt) => {
    acc += dt;
    frames++;
    if (acc < 1) return;
    const avg = acc / frames;
    acc = 0;
    frames = 0;
    if (avg > 0.024 && dpr > 0.75) {
      if (++slow >= 2) { dpr = Math.max(0.75, dpr - 0.25); slow = 0; resize(); }
    } else slow = 0;
  };

  const clock = new THREE.Clock();
  let time = 0;
  let scroll = 0;
  const damp = (dt, rate) => 1 - Math.exp(-dt * rate);
  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const r = host.getBoundingClientRect();
    const target = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
    // with reduced motion nothing moves on its own: skip redraws once scroll has settled
    if (reduceMotion && !dirty && Math.abs(target - scroll) < 0.0005) return;
    dirty = false;
    if (!reduceMotion) time += dt;
    scroll += (target - scroll) * damp(dt, 8);
    pointer.x += (pointer.tx - pointer.x) * damp(dt, 3);
    pointer.y += (pointer.ty - pointer.y) * damp(dt, 3);
    U.uTime.value = reduceMotion ? 3.2 : time;
    s.update({ t: reduceMotion ? 3.2 : time, dt, scroll, px: pointer.x, py: pointer.y });
    root.scale.setScalar(baseScale);
    renderer.render(scene, camera);
    adapt(dt);
  };

  const ticker = window.gsap && window.gsap.ticker;
  let running = false;
  let raf = 0;
  const loop = () => { frame(); if (!ticker && running) raf = requestAnimationFrame(loop); };
  const play = () => {
    if (running) return;
    running = true;
    clock.getDelta();
    if (ticker) ticker.add(loop); else raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    if (ticker) ticker.remove(loop); else cancelAnimationFrame(raf);
  };

  resize();
  window.addEventListener('resize', resize);
  // compile every shader up front so the first scroll never stalls
  renderer.compile(scene, camera);
  frame();
  host.classList.add('is-ready');
  window.dispatchEvent(new CustomEvent('scene:ready'));

  let visible = true;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible && !document.hidden ? play() : pause();
  }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : visible && play()));
}

function fail() {
  document.documentElement.classList.add('no-webgl');
}

const host = document.querySelector('[data-scene]');
if (host) init(host, host.dataset.scene);
