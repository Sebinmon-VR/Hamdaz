// Hero variant "waves": silky ribbons of light, each woven from dozens of fine threads, flowing across
// the screen in the brand's cyan, violet and pink. Sparks drift along them. When scrolled, the left side
// fades so the text reads clearly and labelled points appear along the main ribbon.
import * as THREE from '../../vendor/three.module.min.js';
import { rng } from '../circuit.js';

const THREADS = 56;
const STEPS = 220;
// per ribbon: [y offset, amplitude, frequency, speed], [phase, width, twist frequency, twist speed], colour A, colour B
const RIBBONS = [
  [[0.12, 0.55, 0.55, 0.35], [0.0, 0.8, 0.8, 0.25], '#30c1f8', '#7b5cff'],
  [[-0.32, 0.42, 0.75, -0.28], [2.0, 0.55, 1.1, 0.3], '#eb4b96', '#7b5cff'],
  [[0.5, 0.3, 0.42, 0.22], [4.0, 0.38, 0.6, -0.2], '#7fd8ff', '#30c1f8'],
];
// label anchors: position along the main ribbon (0 = left edge, 1 = right edge)
const ANCHORS = { ai: 0.6, cloud: 0.72, data: 0.84, security: 0.95 };

const RIBBON_GLSL = /* glsl */ `
  uniform vec4 uP1[3];
  uniform vec4 uP2[3];
  uniform float uSpan;
  uniform float uTime;
  vec3 ribbon(int r, float u, float th) {
    vec4 a = uP1[r];
    vec4 b = uP2[r];
    float x = u * uSpan;
    float c = a.x + a.y * sin(x * a.z + uTime * a.w + b.x) + 0.18 * sin(x * 1.3 - uTime * 0.4 + b.x);
    float w = b.y * (0.35 + 0.65 * (0.5 + 0.5 * sin(x * b.z + uTime * b.w + b.x))) + 0.04;
    float s = th - 0.5;
    return vec3(x, c + s * w * cos(x * 0.6 + uTime * 0.3 + b.x), s * w * sin(x * 0.6 + uTime * 0.3 + b.x) * 0.9);
  }
`;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function build({ root, U, reduceMotion }) {
  const rand = rng(107);
  const uSpan = { value: 4 };
  const uShift = { value: 0 };
  const uP1 = { value: RIBBONS.map((r) => new THREE.Vector4(...r[0])) };
  const uP2 = { value: RIBBONS.map((r) => new THREE.Vector4(...r[1])) };
  const uColA = { value: RIBBONS.map((r) => new THREE.Color(r[2])) };
  const uColB = { value: RIBBONS.map((r) => new THREE.Color(r[3])) };

  // soft background light
  const glow = glowTexture();
  const glowA = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#30c1f8', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  glowA.scale.set(7, 4, 1);
  const glowB = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#eb4b96', transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false }));
  glowB.scale.set(6, 3.4, 1);
  root.add(glowA, glowB);

  /* --- the threads: one batch of line segments for all ribbons --- */
  const data = [];
  for (let r = 0; r < RIBBONS.length; r++) {
    for (let t = 0; t < THREADS; t++) {
      const th = t / (THREADS - 1);
      for (let i = 0; i < STEPS; i++) {
        const u0 = (i / STEPS) * 2 - 1;
        const u1 = ((i + 1) / STEPS) * 2 - 1;
        data.push(u0, th, r, u1, th, r);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  const arr = new Float32Array(data);
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr.length), 3));
  g.setAttribute('aR', new THREE.BufferAttribute(arr, 3)); // u, thread, ribbon
  const threads = new THREE.LineSegments(g, new THREE.ShaderMaterial({
    uniforms: { uP1, uP2, uSpan, uTime: U.uTime, uIntro: U.uIntro, uShift, uColA, uColB },
    vertexShader: /* glsl */ `
      ${RIBBON_GLSL}
      attribute vec3 aR;
      uniform float uIntro;
      uniform float uShift;
      uniform vec3 uColA[3];
      uniform vec3 uColB[3];
      varying vec3 vColor;
      varying float vA;
      void main() {
        int r = int(aR.z + 0.5);
        vec3 p = ribbon(r, aR.x, aR.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        float edge = pow(abs(aR.y - 0.5) * 2.0, 3.0);
        vColor = mix(uColA[r], uColB[r], smoothstep(-1.0, 1.0, aR.x + sin(uTime * 0.2 + aR.z) * 0.4)) * (0.55 + 0.9 * edge);
        float ends = smoothstep(-1.0, -0.75, aR.x) * smoothstep(1.0, 0.8, aR.x);
        float reveal = smoothstep(aR.x - 0.3, aR.x, uIntro * 2.6 - 1.3);
        float left = mix(1.0, 0.18 + 0.82 * smoothstep(-0.35, 0.25, aR.x), uShift);
        vA = (r == 0 ? 0.26 : 0.2) * ends * reveal * left;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vA;
      void main() { gl_FragColor = vec4(vColor, vA); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  threads.frustumCulled = false;
  root.add(threads);

  /* --- sparks drifting along the ribbons --- */
  {
    const n = 340;
    const s = new Float32Array(n * 4); // start, thread, ribbon, speed
    for (let i = 0; i < n; i++) s.set([rand(), rand(), Math.floor(rand() * 3), 0.02 + rand() * 0.05], i * 4);
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    sg.setAttribute('aS', new THREE.BufferAttribute(s, 4));
    const sparks = new THREE.Points(sg, new THREE.ShaderMaterial({
      uniforms: { uP1, uP2, uSpan, uTime: U.uTime, uIntro: U.uIntro, uPixel: U.uPixel, uShift },
      vertexShader: /* glsl */ `
        ${RIBBON_GLSL}
        attribute vec4 aS;
        uniform float uIntro;
        uniform float uPixel;
        uniform float uShift;
        varying float vA;
        varying float vPink;
        void main() {
          float u = fract(aS.x + uTime * aS.w) * 2.0 - 1.0;
          vec3 p = ribbon(int(aS.z + 0.5), u, aS.y);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.0 + 3.0 * fract(aS.x * 13.0)) * uPixel * (6.0 / -mv.z);
          float left = mix(1.0, smoothstep(-0.35, 0.25, u), uShift);
          vA = sin((u * 0.5 + 0.5) * 3.14159) * uIntro * left * (0.5 + 0.5 * sin(uTime * 2.0 + aS.x * 50.0));
          vPink = step(0.75, fract(aS.x * 7.0));
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        varying float vPink;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(mix(vec3(0.85, 0.97, 1.0), vec3(1.0, 0.6, 0.8), vPink), a * a * vA);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    sparks.frustumCulled = false;
    root.add(sparks);
  }

  /* --- labelled points riding on the main ribbon (same formula as the shader, ribbon 0, centre thread) --- */
  const [a, b] = RIBBONS[0];
  const centreY = (u, t) => {
    const x = u * uSpan.value;
    return a[0] + a[1] * Math.sin(x * a[2] + t * a[3] + b[0]) + 0.18 * Math.sin(x * 1.3 - t * 0.4 + b[0]);
  };
  const anchors = {};
  const marks = [];
  const dotMat = new THREE.SpriteMaterial({ map: glow, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const [id, f] of Object.entries(ANCHORS)) {
    const obj = new THREE.Object3D();
    const dot = new THREE.Sprite(dotMat);
    dot.scale.setScalar(0.09);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: '#30c1f8', transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
    root.add(obj, dot, line);
    marks.push({ f, obj, dot, line, up: Object.keys(ANCHORS).indexOf(id) % 2 === 0 ? 1 : -1 });
    anchors[id] = { obj };
  }

  let span = 4;
  return {
    anchors,
    update({ t, e, p }) {
      span = p.span;
      uSpan.value = span;
      uShift.value = p.shift;
      glowA.position.set(-1.2 + Math.sin(t * 0.1) * 0.6, 0.5, -1);
      glowB.position.set(1.6 + Math.cos(t * 0.08) * 0.6, -0.4, -1);
      for (const m of marks) {
        const u = m.f * 2 - 1;
        const y = centreY(u, t);
        m.dot.position.set(u * span, y, 0);
        m.obj.position.set(u * span, y + m.up * 0.42, 0);
        m.line.geometry.attributes.position.array.set([u * span, y, 0, u * span, y + m.up * 0.42, 0]);
        m.line.geometry.attributes.position.needsUpdate = true;
        m.line.material.opacity = 0.7 * p.labels;
      }
      dotMat.opacity = p.labels * e;
    },
  };
}
