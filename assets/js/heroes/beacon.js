// Hero "beacon" (Contact): the signal. A bright point of light rests on a dark, faintly gridded floor,
// sending slow rings of light across it, with a beam rising from it and data drifting up the beam.
import * as THREE from '../../vendor/three.module.min.js';
import { rng } from '../circuit.js';

const CYAN = new THREE.Color('#30c1f8');
const PINK = new THREE.Color('#eb4b96');
const RINGS = 6;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.4)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const softPoints = (U) =>
  new THREE.ShaderMaterial({
    uniforms: { uPixel: U.uPixel },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute vec4 aColor;
      uniform float uPixel;
      varying vec4 vColor;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixel * (6.0 / -mv.z);
        float fade = 1.0 - smoothstep(1.5, 4.2, length(position.xz));
        vColor = vec4(aColor.rgb, aColor.a * fade);
      }`,
    fragmentShader: /* glsl */ `
      varying vec4 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor.rgb, vColor.a * a * a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

export function build({ root, U, reduceMotion }) {
  const rand = rng(131);
  const glow = glowTexture();

  // floor: a faint dot grid fading out from the beacon
  {
    const p = [];
    const c = [];
    const s = [];
    for (let x = -4.2; x <= 4.2; x += 0.22) for (let z = -4.2; z <= 4.2; z += 0.22) {
      if (Math.hypot(x, z) > 4.2) continue;
      p.push(x, 0, z);
      c.push(0.45, 0.62, 0.8, 0.5);
      s.push(2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(c, 4));
    g.setAttribute('aSize', new THREE.Float32BufferAttribute(s, 1));
    root.add(new THREE.Points(g, softPoints(U)));
  }
  // light pooling on the floor
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: glow, color: CYAN, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2;
  root.add(pool);

  // rings travelling outwards across the floor
  const rings = Array.from({ length: RINGS }, (_, i) => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.985, 1, 128),
      new THREE.MeshBasicMaterial({ color: i === 2 ? PINK : CYAN, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.002;
    root.add(m);
    return { m, offset: i / RINGS };
  });

  // the beam: two crossed planes, so it reads from every angle
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uIntro: U.uIntro },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntro;
      varying vec2 vUv;
      void main() {
        float a = pow(1.0 - vUv.y, 1.6) * smoothstep(0.5, 0.0, abs(vUv.x - 0.5));
        a *= 0.65 + 0.35 * sin(vUv.y * 26.0 - uTime * 4.0);
        gl_FragColor = vec4(vec3(0.55, 0.9, 1.0), a * 0.85 * uIntro);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const beamGeo = new THREE.PlaneGeometry(0.16, 2.6).translate(0, 1.3, 0);
  const beamA = new THREE.Mesh(beamGeo, beamMat);
  const beamB = new THREE.Mesh(beamGeo, beamMat);
  beamB.rotation.y = Math.PI / 2;
  root.add(beamA, beamB);

  // the point of light itself
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.scale.setScalar(0.5);
  core.position.y = 0.06;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: CYAN, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(1.8);
  halo.position.y = 0.1;
  root.add(halo, core);

  // data drifting up the beam
  const N = 160;
  const seeds = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) seeds.set([(rand() - 0.5) * 0.35, (rand() - 0.5) * 0.35, rand(), 0.1 + rand() * 0.18], i * 4);
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  sg.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const stream = new THREE.Points(sg, new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPixel: U.uPixel, uIntro: U.uIntro },
    vertexShader: /* glsl */ `
      attribute vec4 aSeed;
      uniform float uTime;
      uniform float uPixel;
      varying float vA;
      varying float vPink;
      void main() {
        float k = fract(aSeed.z + uTime * aSeed.w);
        vec3 p = vec3(aSeed.x * (1.0 - k * 0.6), 0.05 + k * 2.2, aSeed.y * (1.0 - k * 0.6));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.0 + 3.0 * (1.0 - k)) * uPixel * (6.0 / -mv.z);
        vA = smoothstep(0.0, 0.08, k) * pow(1.0 - k, 1.4);
        vPink = step(0.82, fract(aSeed.z * 9.1));
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntro;
      varying float vA;
      varying float vPink;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(mix(vec3(0.6, 0.92, 1.0), vec3(0.92, 0.29, 0.59), vPink), a * a * vA * uIntro);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  stream.frustumCulled = false;
  root.add(stream);

  return {
    anchors: {},
    update({ t, e }) {
      for (const r of rings) {
        const k = reduceMotion ? r.offset : (t * 0.16 + r.offset) % 1;
        r.m.scale.setScalar(0.15 + k * 3.6);
        r.m.material.opacity = Math.pow(1 - k, 1.6) * 0.75 * e;
      }
      const beat = reduceMotion ? 1 : 0.85 + 0.15 * Math.sin(t * 2.6);
      core.material.opacity = beat;
      halo.material.opacity = 0.55 * beat * e;
      pool.material.opacity = 0.35 * e;
    },
  };
}
