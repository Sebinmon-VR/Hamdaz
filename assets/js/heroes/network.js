// Element "network" (Who We Are): a sphere of connected people with signals travelling between them.
// The same network scenes.js draws on the Who We Are page, built for the earth.js / stage.js camera.
import * as THREE from '../../vendor/three.module.min.js';
import { rng } from '../circuit.js';

const CYAN = new THREE.Color('#30c1f8');
const PINK = new THREE.Color('#eb4b96');
// depth fade around the element (it sits about 6 units from the camera)
const FADE = /* glsl */ 'float depthFade(float z) { return smoothstep(7.4, 5.0, z); }';

// nodes on a jittered Fibonacci sphere and the links to each node's three nearest neighbours
// (also used by stage.js for the particle transitions)
export function networkGraph() {
  const rand = rng(7);
  const N = 150;
  const R = 2.05;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const k = R * (0.84 + rand() * 0.3);
    nodes.push(new THREE.Vector3(Math.cos(golden * i) * r * k, y * k, Math.sin(golden * i) * r * k));
  }
  const edges = new Set();
  nodes.forEach((a, i) => {
    nodes.map((b, j) => [a.distanceToSquared(b), j]).filter(([, j]) => j !== i).sort((p, q) => p[0] - q[0]).slice(0, 3)
      .forEach(([, j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  return { nodes, pairs: [...edges].map((e) => e.split('-').map(Number)), rand };
}

function glow(size, color, strength) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color.clone() }, uStrength: { value: strength } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uStrength;
        varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 2.0;
          gl_FragColor = vec4(uColor, pow(max(0.0, 1.0 - d), 2.2) * uStrength);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

export function build({ root, U, reduceMotion }) {
  const { nodes, pairs, rand } = networkGraph();
  const spin = new THREE.Group();
  root.add(glow(7.5, CYAN, 0.22), spin);

  const linePos = new Float32Array(pairs.length * 6);
  pairs.forEach(([i, j], n) => { nodes[i].toArray(linePos, n * 6); nodes[j].toArray(linePos, n * 6 + 3); });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  spin.add(new THREE.LineSegments(lineGeo, new THREE.ShaderMaterial({
    uniforms: { uColor: { value: CYAN.clone() }, uOpacity: { value: 0.32 } },
    vertexShader: `${FADE}
      varying float vFade;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vFade = depthFade(-mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vFade;
      void main() { gl_FragColor = vec4(uColor, uOpacity * vFade); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));

  const N = nodes.length;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const size = new Float32Array(N);
  nodes.forEach((v, i) => {
    v.toArray(pos, i * 3);
    const hub = rand() < 0.06;
    (rand() < 0.18 ? PINK : CYAN).toArray(col, i * 3);
    size[i] = hub ? 15 : 6 + rand() * 3;
  });
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  nodeGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  spin.add(new THREE.Points(nodeGeo, new THREE.ShaderMaterial({
    uniforms: { uPixel: U.uPixel },
    vertexShader: `${FADE}
      attribute float aSize;
      attribute vec3 aColor;
      uniform float uPixel;
      varying vec3 vColor;
      varying float vFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixel * (6.0 / -mv.z);
        vColor = aColor;
        vFade = depthFade(-mv.z);
      }`,
    fragmentShader: `varying vec3 vColor; varying float vFade;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.05, d); gl_FragColor = vec4(vColor, a * a * vFade); }`,
    transparent: true,
    depthWrite: false,
  })));

  // signals travelling along random links
  const M = 42;
  const A = new Float32Array(M * 3);
  const B = new Float32Array(M * 3);
  const sp = new Float32Array(M);
  const off = new Float32Array(M);
  const pc = new Float32Array(M * 3);
  for (let m = 0; m < M; m++) {
    const [i, j] = pairs[Math.floor(rand() * pairs.length)];
    const flip = rand() < 0.5;
    nodes[flip ? i : j].toArray(A, m * 3);
    nodes[flip ? j : i].toArray(B, m * 3);
    sp[m] = 0.25 + rand() * 0.45;
    off[m] = rand();
    (rand() < 0.35 ? PINK : CYAN).toArray(pc, m * 3);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(M * 3), 3));
  pg.setAttribute('aA', new THREE.BufferAttribute(A, 3));
  pg.setAttribute('aB', new THREE.BufferAttribute(B, 3));
  pg.setAttribute('aSpeed', new THREE.BufferAttribute(sp, 1));
  pg.setAttribute('aOffset', new THREE.BufferAttribute(off, 1));
  pg.setAttribute('aColor', new THREE.BufferAttribute(pc, 3));
  const pulses = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPixel: U.uPixel },
    vertexShader: `${FADE}
      attribute vec3 aA; attribute vec3 aB; attribute float aSpeed; attribute float aOffset; attribute vec3 aColor;
      uniform float uTime; uniform float uPixel;
      varying vec3 vColor; varying float vA;
      void main() {
        float t = fract(uTime * aSpeed + aOffset);
        vec4 mv = modelViewMatrix * vec4(mix(aA, aB, t), 1.0);
        gl_Position = projectionMatrix * mv;
        float s = sin(t * 3.14159);
        gl_PointSize = (4.0 + 8.0 * s) * uPixel * (6.0 / -mv.z);
        vColor = aColor;
        vA = s * depthFade(-mv.z);
      }`,
    fragmentShader: `varying vec3 vColor; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vColor, a * a * vA); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  pulses.frustumCulled = false;
  spin.add(pulses);

  return {
    anchors: {},
    update({ t, pointer }) {
      spin.rotation.y = (reduceMotion ? 0.6 : t * 0.09) + pointer.x * 0.35;
      spin.rotation.x = 0.28 - pointer.y * 0.2;
    },
  };
}
