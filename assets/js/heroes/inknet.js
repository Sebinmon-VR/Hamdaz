// Element "inknet": the people network drawn for the white content sheet, as navy, cyan and pink dots
// joined by fine ink lines, with small signals travelling along them. Same nodes as heroes/network.js, so
// the particle transition (stage.js) lands exactly on it. Normal blending, as it sits on light paper.
import * as THREE from '../../vendor/three.module.min.js';
import { networkGraph } from './network.js';

const INK = new THREE.Color('#33475b');
const CYAN = new THREE.Color('#0aa3dc');
const PINK = new THREE.Color('#d0216f');

export function build({ root, U, reduceMotion }) {
  const { nodes, pairs, rand } = networkGraph();
  const spin = new THREE.Group();
  root.add(spin);

  // fine lines, fainter at the back
  const linePos = new Float32Array(pairs.length * 6);
  pairs.forEach(([i, j], n) => { nodes[i].toArray(linePos, n * 6); nodes[j].toArray(linePos, n * 6 + 3); });
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: INK.clone() }, uOpacity: { value: 0.14 } },
    vertexShader: `varying float vF; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vF = smoothstep(7.2, 5.0, -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vF; void main() { gl_FragColor = vec4(uColor, uOpacity * (0.3 + 0.7 * vF)); }`,
    transparent: true,
    depthWrite: false,
  });
  spin.add(new THREE.LineSegments(lg, lineMat));

  // the people: mostly ink, some cyan and pink, a few larger hubs
  const N = nodes.length;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const size = new Float32Array(N);
  nodes.forEach((v, i) => {
    v.toArray(pos, i * 3);
    const r = rand();
    (r < 0.16 ? PINK : r < 0.5 ? CYAN : INK).toArray(col, i * 3);
    size[i] = rand() < 0.07 ? 10 : 4 + rand() * 2.5;
  });
  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  ng.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  ng.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const nodeMat = new THREE.ShaderMaterial({
    uniforms: { uPixel: U.uPixel, uOpacity: { value: 1 } },
    vertexShader: `attribute float aSize; attribute vec3 aColor; uniform float uPixel; varying vec3 vC; varying float vF;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPixel * (6.0 / -mv.z); vC = aColor; vF = smoothstep(7.2, 5.0, -mv.z); }`,
    fragmentShader: `uniform float uOpacity; varying vec3 vC; varying float vF;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.36, d); gl_FragColor = vec4(vC, a * (0.25 + 0.55 * vF) * uOpacity); }`,
    transparent: true,
    depthWrite: false,
  });
  spin.add(new THREE.Points(ng, nodeMat));

  // signals travelling along the links
  const M = 36;
  const A = new Float32Array(M * 3);
  const B = new Float32Array(M * 3);
  const sp = new Float32Array(M);
  const off = new Float32Array(M);
  for (let m = 0; m < M; m++) {
    const [i, j] = pairs[Math.floor(rand() * pairs.length)];
    nodes[i].toArray(A, m * 3);
    nodes[j].toArray(B, m * 3);
    sp[m] = 0.25 + rand() * 0.4;
    off[m] = rand();
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(M * 3), 3));
  pg.setAttribute('aA', new THREE.BufferAttribute(A, 3));
  pg.setAttribute('aB', new THREE.BufferAttribute(B, 3));
  pg.setAttribute('aSpeed', new THREE.BufferAttribute(sp, 1));
  pg.setAttribute('aOffset', new THREE.BufferAttribute(off, 1));
  const pulseMat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPixel: U.uPixel, uColor: { value: CYAN.clone() }, uOpacity: { value: 1 } },
    vertexShader: `attribute vec3 aA; attribute vec3 aB; attribute float aSpeed; attribute float aOffset; uniform float uTime; uniform float uPixel; varying float vA;
      void main() { float t = fract(uTime * aSpeed + aOffset); vec4 mv = modelViewMatrix * vec4(mix(aA, aB, t), 1.0); gl_Position = projectionMatrix * mv; float s = sin(t * 3.14159); gl_PointSize = (3.0 + 6.0 * s) * uPixel * (6.0 / -mv.z); vA = s; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vA; void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.2, d); gl_FragColor = vec4(uColor, a * vA * uOpacity); }`,
    transparent: true,
    depthWrite: false,
  });
  const pulses = new THREE.Points(pg, pulseMat);
  pulses.frustumCulled = false;
  spin.add(pulses);

  return {
    anchors: {},
    frame: spin, // the particles land in this group's space (it turns)
    // fade: 0..1, used while the particles are still settling into it
    fade(k) { lineMat.uniforms.uOpacity.value = 0.14 * k; nodeMat.uniforms.uOpacity.value = k; pulseMat.uniforms.uOpacity.value = k; },
    update({ t, pointer }) {
      spin.rotation.y = (reduceMotion ? 0.6 : t * 0.08) + pointer.x * 0.3;
      spin.rotation.x = 0.25 - pointer.y * 0.15;
    },
  };
}
