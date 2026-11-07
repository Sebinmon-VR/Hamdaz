// Hero "spark" (404): the story's shared frame on its own. A single point of light breathes softly
// while faint particles drift around it.
import * as THREE from '../../vendor/three.module.min.js';
import { rng } from '../circuit.js';

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function build({ root, U, reduceMotion }) {
  const rand = rng(137);
  const glow = glowTexture();
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.scale.setScalar(0.35);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#30c1f8', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(1.6);
  const haze = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#30c1f8', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
  haze.scale.setScalar(5);
  root.add(haze, halo, core);

  // particles drifting slowly around the light
  const N = 260;
  const seeds = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) seeds.set([rand() * Math.PI * 2, 0.3 + Math.pow(rand(), 0.7) * 2.2, (rand() - 0.5) * 1.6, rand()], i * 4);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const dust = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uPixel: U.uPixel, uIntro: U.uIntro },
    vertexShader: /* glsl */ `
      attribute vec4 aSeed; // angle, radius, height, phase
      uniform float uTime;
      uniform float uPixel;
      varying float vA;
      void main() {
        float a = aSeed.x + uTime * (0.05 + 0.08 / aSeed.y);
        vec3 p = vec3(cos(a) * aSeed.y, aSeed.z + sin(uTime * 0.3 + aSeed.w * 6.0) * 0.08, sin(a) * aSeed.y * 0.6);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.5 + 2.5 * aSeed.w) * uPixel * (6.0 / -mv.z);
        vA = (0.25 + 0.5 * aSeed.w) * (0.6 + 0.4 * sin(uTime * 1.5 + aSeed.w * 20.0)) * (1.0 - smoothstep(1.4, 2.6, aSeed.y));
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntro;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(0.6, 0.9, 1.0, a * a * vA * uIntro);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  dust.frustumCulled = false;
  root.add(dust);

  return {
    anchors: {},
    update({ t, e }) {
      const b = reduceMotion ? 1 : 0.82 + 0.18 * Math.sin(t * 1.4);
      core.scale.setScalar(0.32 + 0.06 * b);
      halo.material.opacity = 0.6 * b * e;
      haze.material.opacity = 0.18 * e;
    },
  };
}
