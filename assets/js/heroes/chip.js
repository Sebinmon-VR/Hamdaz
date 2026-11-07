// Hero variant "chip": an AI processor on a circuit board.
// Data pulses run along the PCB traces into the chip, its compute cells flicker as they work, and a stream
// of data rises from the AI core. Scrolling raises the camera from a low view across the board to a
// top-down view of the whole chip, where labelled nodes show what it powers.
import * as THREE from '../../vendor/three.module.min.js';
import { CHIP, BOARD_R, circuit, along, rng } from '../circuit.js';

const CYAN = new THREE.Color('#30c1f8');
const PINK = new THREE.Color('#eb4b96');

// Where the floating labels sit on the board (chip units: x, z, label side).
const ANCHORS = {
  ai: [-1.17, -0.02, 'left'],
  cloud: [0.08, -1.25, 'left'],
  data: [1.1, 0.46, 'right'],
  security: [0.06, 1.4, 'left'],
};

// board fade: dims with distance from the chip and when very close to the camera
const BOARD_FADE = /* glsl */ `
  float boardFade(vec3 p, float viewZ) {
    float f = 1.0 - smoothstep(1.0, ${BOARD_R.toFixed(1)}, length(p.xz));
    return f * f * smoothstep(0.8, 2.6, viewZ);
  }`;

const traceMat = (color, opacity) =>
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color.clone() }, uOpacity: { value: opacity }, uReveal: { value: 0 } },
    vertexShader: /* glsl */ `
      ${BOARD_FADE}
      attribute float aD;
      varying float vA;
      varying float vD;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vA = boardFade(position, -mv.z);
        vD = aD;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uReveal;
      varying float vA;
      varying float vD;
      void main() {
        if (vD > uReveal) discard;
        gl_FragColor = vec4(uColor, uOpacity * vA);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

// soft points (pulses, data stream, board dots) and rings (vias)
const spriteMat = (U, { ring = false, opacity = 1 } = {}) =>
  new THREE.ShaderMaterial({
    uniforms: { uPixel: U.uPixel, uReveal: U.uReveal, uOpacity: { value: opacity } },
    vertexShader: /* glsl */ `
      ${BOARD_FADE}
      attribute float aSize;
      attribute vec4 aColor; // rgb + alpha
      uniform float uPixel;
      uniform float uReveal;
      varying vec4 vColor;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixel * (6.0 / -mv.z);
        float shown = step(length(position.xz), uReveal);
        vColor = vec4(aColor.rgb, aColor.a * boardFade(position, -mv.z) * shown);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec4 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        ${ring
          ? 'float a = smoothstep(0.5, 0.42, d) * smoothstep(0.2, 0.3, d) + smoothstep(0.16, 0.05, d) * 0.6;'
          : 'float a = smoothstep(0.5, 0.0, d); a *= a;'}
        gl_FragColor = vec4(vColor.rgb, vColor.a * a * uOpacity);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

const topVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
// the die: a grid of compute cells around the AI core
const topFragment = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uMark;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec3 cyan = vec3(0.19, 0.76, 0.97);
    vec3 pink = vec3(0.92, 0.29, 0.59);
    vec2 c = vUv - 0.5;
    float box = max(abs(c.x), abs(c.y));
    vec3 col = vec3(0.03, 0.08, 0.14);

    // compute cells
    vec2 g = vUv * 8.0;
    vec2 id = floor(g);
    vec2 f = fract(g);
    float cell = smoothstep(0.1, 0.16, f.x) * smoothstep(0.9, 0.84, f.x) * smoothstep(0.1, 0.16, f.y) * smoothstep(0.9, 0.84, f.y);
    float h = hash(id);
    float act = pow(0.5 + 0.5 * sin(uTime * (0.7 + h * 1.8) + h * 40.0), 10.0);
    vec3 cc = mix(cyan, pink, step(0.82, h));
    float outer = step(0.25, box);
    col += cell * outer * (0.07 + act * 0.75) * cc;

    // AI core (the centre 2 x 2 cells)
    float core = 1.0 - smoothstep(0.235, 0.24, box);
    float beat = 0.5 + 0.5 * sin(uTime * 2.1);
    col += core * mix(vec3(0.03, 0.17, 0.27), vec3(0.06, 0.32, 0.48), 1.0 - box / 0.24) * (0.8 + 0.25 * beat);
    float mark = texture2D(uMark, c / 0.48 + 0.5).r * core;
    col += mark * mix(cyan, vec3(1.0), 0.45) * (0.85 + 0.35 * beat);
    col += cyan * (smoothstep(0.228, 0.236, box) - smoothstep(0.24, 0.248, box)) * 1.4;

    // scan line sweeping across the die
    float sd = (vUv.x + vUv.y) * 0.5 - fract(uTime * 0.16) * 1.4 + 0.2;
    col += cyan * exp(-sd * sd * 1400.0) * 0.45;
    // die edge
    col += cyan * smoothstep(0.47, 0.5, box) * 0.7;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const streamVertex = /* glsl */ `
  attribute vec4 aSeed; // x, z, phase, speed
  uniform float uTime;
  uniform float uPixel;
  uniform float uBase;
  varying float vA;
  varying float vPink;
  void main() {
    float k = fract(aSeed.z + uTime * aSeed.w);
    vec3 p = vec3(aSeed.x * (1.0 - k * 0.55), uBase + k * 1.5, aSeed.y * (1.0 - k * 0.55));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + 3.0 * (1.0 - k)) * uPixel * (6.0 / -mv.z);
    vA = smoothstep(0.0, 0.06, k) * pow(1.0 - k, 1.6);
    vPink = step(0.8, fract(aSeed.z * 7.13));
  }
`;
const streamFragment = /* glsl */ `
  varying float vA;
  varying float vPink;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 c = mix(vec3(0.45, 0.85, 1.0), vec3(0.92, 0.29, 0.59), vPink);
    gl_FragColor = vec4(c, a * a * vA * 0.9);
  }
`;

// radial glow texture
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// "AI" etched on the core; redrawn once the brand font has loaded
function markTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  const draw = () => {
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 132px Archivo, "Arial Black", Arial, sans-serif';
    ctx.fillText('AI', 128, 136);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load('800 132px Archivo').then(draw, () => {});
  return tex;
}

/* ---------------------------------------------------------------- scene */
export function build({ root, U, reduceMotion }) {
  U.uReveal = { value: 0 };
  const { chip: traces, field } = circuit();
  const { half, height: H, pinLen, pins, pinGap } = CHIP;

  /* --- board: substrate dots, traces, vias --- */
  {
    const dots = [];
    const STEP = 0.24;
    for (let x = -BOARD_R; x <= BOARD_R; x += STEP) for (let z = -BOARD_R; z <= BOARD_R; z += STEP) {
      if (Math.hypot(x, z) < BOARD_R && Math.max(Math.abs(x), Math.abs(z)) > half + 0.05) dots.push(x, 0, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
    const n = dots.length / 3;
    g.setAttribute('aSize', new THREE.Float32BufferAttribute(new Array(n).fill(2.2), 1));
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(Array.from({ length: n }, () => [0.45, 0.62, 0.8, 0.55]).flat(), 4));
    root.add(new THREE.Points(g, spriteMat(U)));
  }

  const segs = (list, chipTrace) => {
    const pos = [];
    const d = [];
    for (const t of list) {
      for (let i = 1; i < t.pts.length; i++) {
        const [a, b] = [t.pts[i - 1], t.pts[i]];
        pos.push(a[0], 0.001, a[1], b[0], 0.001, b[1]);
        // reveal distance: along the trace for chip traces, radial for the rest
        if (chipTrace) d.push(half + pinLen + t.len[i - 1], half + pinLen + t.len[i]);
        else d.push(Math.hypot(a[0], a[1]), Math.hypot(b[0], b[1]));
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aD', new THREE.Float32BufferAttribute(d, 1));
    return g;
  };
  const chipTraceMat = traceMat(CYAN, 0.62);
  const fieldTraceMat = traceMat(new THREE.Color('#5d8fb8'), 0.34);
  chipTraceMat.uniforms.uReveal = U.uReveal;
  fieldTraceMat.uniforms.uReveal = U.uReveal;
  root.add(new THREE.LineSegments(segs(traces, true), chipTraceMat));
  root.add(new THREE.LineSegments(segs(field, false), fieldTraceMat));

  {
    const pos = [];
    const size = [];
    const col = [];
    const via = (p, c, s) => { pos.push(p[0], 0.002, p[1]); size.push(s); col.push(c.r, c.g, c.b, 0.9); };
    for (const t of traces) via(t.pts[t.pts.length - 1], t.pink ? PINK : CYAN, 9);
    for (const t of field) { via(t.pts[0], CYAN, 6); via(t.pts[t.pts.length - 1], CYAN, 6); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 4));
    root.add(new THREE.Points(g, spriteMat(U, { ring: true, opacity: 0.85 })));
  }

  /* --- data pulses: a bright head with a short tail on every chip trace, flowing into the chip --- */
  const TAIL = 4;
  const pulses = traces.map((t, i) => ({ t, speed: 0.55 + t.seed * 0.7, phase: (i * 0.618) % 1 }));
  const pulsePos = new Float32Array(pulses.length * TAIL * 3);
  const pulseCol = new Float32Array(pulses.length * TAIL * 4);
  const pulseSize = new Float32Array(pulses.length * TAIL);
  pulses.forEach((p, i) => {
    const c = p.t.pink ? PINK : new THREE.Color(0.7, 0.93, 1);
    for (let k = 0; k < TAIL; k++) {
      const j = i * TAIL + k;
      pulseSize[j] = k === 0 ? 13 : 9 - k * 1.6;
      pulseCol.set([c.r, c.g, c.b, 0], j * 4);
    }
  });
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  pulseGeo.setAttribute('aSize', new THREE.BufferAttribute(pulseSize, 1));
  pulseGeo.setAttribute('aColor', new THREE.BufferAttribute(pulseCol, 4));
  const pulsePoints = new THREE.Points(pulseGeo, spriteMat(U));
  pulsePoints.frustumCulled = false;
  root.add(pulsePoints);

  function updatePulses(time) {
    pulses.forEach((p, i) => {
      const total = p.t.total;
      const k = reduceMotion ? 0.55 : (p.phase + (time * p.speed) / total) % 1;
      const d = total * (1 - k); // from the via in towards the pin
      const fadeIn = Math.min(1, k / 0.12);
      const fadeOut = Math.min(1, (1 - k) / 0.06);
      for (let n = 0; n < TAIL; n++) {
        const j = i * TAIL + n;
        const [x, z] = along(p.t, d + n * 0.045);
        pulsePos[j * 3] = x;
        pulsePos[j * 3 + 1] = 0.004;
        pulsePos[j * 3 + 2] = z;
        pulseCol[j * 4 + 3] = fadeIn * fadeOut * (1 - n / TAIL) * (d + n * 0.045 < total ? 1 : 0);
      }
    });
    pulseGeo.attributes.position.needsUpdate = true;
    pulseGeo.attributes.aColor.needsUpdate = true;
  }

  /* --- the chip --- */
  const glowTex = glowTexture();
  const chipGroup = new THREE.Group();
  root.add(chipGroup);
  {
    // light spill on the board
    const spill = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    spill.rotation.x = -Math.PI / 2;
    chipGroup.add(spill);

    const body = new THREE.BoxGeometry(1, H, 1).translate(0, H / 2, 0);
    chipGroup.add(new THREE.Mesh(body, new THREE.MeshBasicMaterial({ color: 0x0a1b2c })));
    chipGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(body), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })));

    const top = new THREE.Mesh(
      new THREE.PlaneGeometry(0.88, 0.88),
      new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uMark: { value: markTexture() } }, vertexShader: topVertex, fragmentShader: topFragment }),
    );
    top.rotation.x = -Math.PI / 2;
    top.position.y = H + 0.001;
    chipGroup.add(top);

    // pins
    const pinMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(pinLen, 0.014, 0.03), new THREE.MeshBasicMaterial({ color: 0x8fd3f0 }), pins * 4);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const one = new THREE.Vector3(1, 1, 1);
    let n = 0;
    const turns = [0, Math.PI, -Math.PI / 2, Math.PI / 2]; // right, left, front, back (as circuit.js SIDES)
    turns.forEach((a) => {
      q.setFromAxisAngle(up, a);
      for (let k = 0; k < pins; k++) {
        const l = (k - (pins - 1) / 2) * pinGap;
        const v = new THREE.Vector3(half + pinLen / 2, 0.007, l).applyQuaternion(q);
        pinMesh.setMatrixAt(n++, m.compose(v, q, one));
      }
    });
    chipGroup.add(pinMesh);

    // halo over the chip
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: CYAN, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.position.y = 0.18;
    halo.scale.setScalar(2.3);
    chipGroup.add(halo);
  }

  /* --- data rising from the AI core --- */
  const STREAM = 240;
  const streamUniforms = { uTime: U.uTime, uPixel: U.uPixel, uBase: { value: H } };
  {
    const rand = rng(4);
    const seeds = new Float32Array(STREAM * 4);
    for (let i = 0; i < STREAM; i++) seeds.set([(rand() - 0.5) * 0.42, (rand() - 0.5) * 0.42, rand(), 0.12 + rand() * 0.2], i * 4);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STREAM * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const stream = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: streamUniforms, vertexShader: streamVertex, fragmentShader: streamFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    stream.frustumCulled = false;
    chipGroup.add(stream);
  }

  /* --- labelled nodes: a pulsing ring on the board and a short beam up to the label --- */
  const markers = [];
  const anchors = {};
  for (const [id, [x, z, side]] of Object.entries(ANCHORS)) {
    const g = new THREE.Group();
    g.position.set(x, 0.003, z);
    const core = new THREE.Mesh(new THREE.CircleGeometry(0.02, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false }));
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.034, 0.042, 48), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    core.rotation.x = ring.rotation.x = -Math.PI / 2;
    const beamTop = new THREE.Object3D();
    beamTop.position.y = 0.42;
    const beam = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), beamTop.position.clone()]),
      new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
    );
    g.add(core, ring, beam, beamTop);
    root.add(g);
    markers.push({ ring, core, beam });
    anchors[id] = { obj: beamTop, side };
  }

  return {
    anchors,
    update({ t, e, p }) {
      U.uReveal.value = 0.4 + e * (BOARD_R + 1.5);
      updatePulses(t);
      const k = reduceMotion ? 0.5 : (t * 0.6) % 1;
      for (const m of markers) {
        m.ring.scale.setScalar(1 + k * 1.3);
        m.ring.material.opacity = (1 - k) * p.labels;
        m.core.material.opacity = p.labels;
        m.beam.material.opacity = 0.8 * p.labels;
      }
    },
  };
}
