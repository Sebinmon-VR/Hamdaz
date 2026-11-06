// Element "galaxy" (home page, before Contact): a spiral galaxy of glowing stars, a bright core and arms
// that run from cyan through violet to pink, turning slowly. Its stars are also the landing points of the
// particle transition from the people network above (stage.js), via galaxyPoints().
import * as THREE from '../../vendor/three.module.min.js';
import { rng } from '../circuit.js';

const ARMS = 3;
const R = 2.4;

// star positions on the galaxy's disc (x, z) with a little thickness (y), core first
export function galaxyPoints(n, seed = 171) {
  const rand = rng(seed);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const core = rand() < 0.16;
    const r = core ? Math.pow(rand(), 2) * 0.45 : 0.25 + Math.pow(rand(), 0.75) * R;
    const arm = Math.floor(rand() * ARMS);
    // stars bunch towards the middle of each arm, with a soft spread either side
    const spread = core ? (rand() - 0.5) * 6.3 : (rand() - 0.5) * Math.pow(rand(), 1.6) * (1.1 + r * 0.35);
    const a = (arm / ARMS) * Math.PI * 2 + r * 1.65 + spread;
    const y = (rand() - 0.5) * (core ? 0.25 : 0.12) * (1.2 - r / R);
    out.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
  }
  return out;
}

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

export function build({ root, U, reduceMotion }) {
  const rand = rng(173);
  const spin = new THREE.Group();
  root.add(spin);
  const glow = glowTexture();
  const uFade = { value: 1 };

  const N = 14000;
  const pos = galaxyPoints(N);
  const tone = new Float32Array(N);
  const size = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = Math.hypot(pos[i * 3], pos[i * 3 + 2]) / R;
    tone[i] = Math.min(1, r + (rand() - 0.5) * 0.25);
    size[i] = (r < 0.15 ? 2.8 : 1.8) + rand() * (rand() < 0.05 ? 4.5 : 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aTone', new THREE.BufferAttribute(tone, 1));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  spin.add(new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: { uPixel: U.uPixel, uTime: U.uTime, uFade },
    vertexShader: /* glsl */ `
      attribute float aTone;
      attribute float aSize;
      uniform float uPixel;
      uniform float uTime;
      varying vec3 vC;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.7 + 0.3 * sin(uTime * 1.7 + position.x * 40.0 + position.z * 23.0);
        gl_PointSize = aSize * tw * uPixel * (6.0 / -mv.z);
        // white-hot core, cyan arms, violet then pink at the rim
        vec3 c = mix(vec3(1.0, 0.95, 0.9), vec3(0.19, 0.76, 0.97), smoothstep(0.0, 0.25, aTone));
        c = mix(c, vec3(0.48, 0.36, 1.0), smoothstep(0.45, 0.75, aTone));
        c = mix(c, vec3(0.92, 0.29, 0.59), smoothstep(0.75, 1.0, aTone));
        vC = c;
        vA = tw * (1.0 - smoothstep(0.85, 1.05, aTone) * 0.5);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uFade;
      varying vec3 vC;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vC, a * a * vA * uFade * 1.15);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));

  // core glow and a faint halo of the disc
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#fff3e6', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.scale.setScalar(1.1);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#30c1f8', transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(5.5);
  root.add(halo, core);

  // distant stars around it
  let stars;
  {
    const n = 700;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set([(rand() - 0.5) * 14, (rand() - 0.5) * 8, -2 - rand() * 4], i * 3);
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(p, 3));
    stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#cfe6ff', size: 0.02, sizeAttenuation: true, transparent: true, opacity: 0.5, depthWrite: false }));
    root.add(stars);
  }

  return {
    anchors: {},
    frame: spin, // the particles land in this group's space (it turns)
    fade(k) {
      uFade.value = k;
      core.material.opacity = 0.9 * k;
      halo.material.opacity = 0.25 * k;
      stars.material.opacity = 0.5 * k;
    },
    update({ t }) {
      spin.rotation.y = reduceMotion ? 0.4 : -t * 0.06;
    },
  };
}
