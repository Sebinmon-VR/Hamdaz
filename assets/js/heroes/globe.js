// Element "globe" (Contact): the night-side Earth with the Abu Dhabi and India offices marked, joined by
// a glowing arc with a signal running along it, under a soft atmosphere and a field of stars.
// Imagery: NASA Black Marble (public domain), via the three-globe package (MIT).
import * as THREE from '../../vendor/three.module.min.js';

const DEG = Math.PI / 180;
export const OFFICES = {
  uae: { lat: 24.4539, lon: 54.3773 },
  india: { lat: 11.2588, lon: 75.7804 },
};
export const FOCUS = { lat: 19, lon: 63 };

function toVec(lat, lon, r = 1) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// rotation that turns lat/lon towards the camera (+Z); dx shifts it right, dy up
export function facing(lat, lon, dx = 0, dy = 0) {
  return { x: lat * DEG - dy, y: Math.PI / 2 - (lon + 180) * DEG + dx };
}

const earthVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewW = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const earthFragment = /* glsl */ `
  uniform sampler2D uNight;
  uniform sampler2D uWater;
  uniform float uIntro;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vec3 night = texture2D(uNight, vUv).rgb;
    float water = texture2D(uWater, vUv).r;
    vec3 base = night * mix(0.9, 0.42, water) * vec3(0.78, 0.88, 1.0);
    float warm = clamp((night.r - night.b) * 5.0, 0.0, 1.0);
    float bright = smoothstep(0.1, 0.55, night.r);
    vec3 col = base + vec3(1.0, 0.74, 0.42) * warm * bright * (1.0 - water) * 2.2;
    float ndv = max(dot(normalize(vNormalW), normalize(vViewW)), 0.0);
    col += vec3(0.33, 0.74, 1.0) * pow(1.0 - ndv, 4.0) * 1.1;
    gl_FragColor = vec4(col * uIntro, 1.0);
  }
`;
const atmoVertex = /* glsl */ `
  varying vec3 vNormalV;
  void main() { vNormalV = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const atmoFragment = /* glsl */ `
  uniform float uIntro;
  varying vec3 vNormalV;
  void main() {
    float i = pow(0.66 - dot(vNormalV, vec3(0.0, 0.0, 1.0)), 4.0);
    gl_FragColor = vec4(vec3(0.24, 0.66, 1.0) * i * 1.6 * uIntro, 1.0);
  }
`;
const arcVertex = 'varying float vU; void main() { vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const arcFragment = /* glsl */ `
  uniform float uDraw;
  uniform float uTime;
  varying float vU;
  void main() {
    if (vU > uDraw) discard;
    float head = fract(uTime * 0.28);
    float pulse = exp(-pow((vU - head) * 9.0, 2.0));
    vec3 col = mix(vec3(0.19, 0.76, 0.97), vec3(1.0), pulse);
    gl_FragColor = vec4(col * (0.55 + pulse * 1.4), 1.0);
  }
`;

export async function build({ root, scene, renderer, U, reduceMotion }) {
  // stars, behind the planet (in the scene, so they don't scale with it)
  {
    const n = 1600;
    const p = new Float32Array(n * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      v.randomDirection().multiplyScalar(40 + Math.random() * 40);
      if (v.z > 10) v.z *= -1;
      v.toArray(p, i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdfe8f5, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false })));
  }

  const loader = new THREE.TextureLoader();
  const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const [night, water] = await Promise.all(['assets/img/earth/earth-night.jpg', 'assets/img/earth/earth-water.png'].map((u) => loader.loadAsync(u)));
  night.anisotropy = water.anisotropy = aniso;

  root.add(new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), new THREE.ShaderMaterial({ uniforms: { uNight: { value: night }, uWater: { value: water }, uIntro: U.uIntro }, vertexShader: earthVertex, fragmentShader: earthFragment })));
  root.add(new THREE.Mesh(new THREE.SphereGeometry(1.06, 64, 48), new THREE.ShaderMaterial({ uniforms: { uIntro: U.uIntro }, vertexShader: atmoVertex, fragmentShader: atmoFragment, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));

  // the arc between the offices: a lifted great circle
  const a = toVec(OFFICES.uae.lat, OFFICES.uae.lon).normalize();
  const b = toVec(OFFICES.india.lat, OFFICES.india.lon).normalize();
  const pts = [];
  for (let i = 0; i <= 96; i++) {
    const t = i / 96;
    pts.push(new THREE.Vector3().copy(a).lerp(b, t).normalize().multiplyScalar(1.004 + Math.sin(Math.PI * t) * 0.09));
  }
  const arcU = { uDraw: { value: 0 }, uTime: U.uTime };
  root.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.0045, 8, false),
    new THREE.ShaderMaterial({ uniforms: arcU, vertexShader: arcVertex, fragmentShader: arcFragment, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  ));

  // office markers: a core, a pulsing ring and a short beam; the label sits at the marker
  const markers = [];
  const anchors = {};
  const tmp = new THREE.Vector3();
  const out = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  for (const [id, o] of Object.entries(OFFICES)) {
    const pos = toVec(o.lat, o.lon, 1.002);
    const normal = pos.clone().normalize();
    const g = new THREE.Group();
    g.position.copy(pos);
    g.lookAt(pos.clone().multiplyScalar(2));
    const core = new THREE.Mesh(new THREE.CircleGeometry(0.011, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false }));
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.024, 48), new THREE.MeshBasicMaterial({ color: 0x30c1f8, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    g.add(core, ring);
    const beam = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([pos.clone(), normal.clone().multiplyScalar(1.09)]),
      new THREE.LineBasicMaterial({ color: 0x30c1f8, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
    );
    root.add(g, beam);
    markers.push({ ring });
    // shown only while the office faces the camera
    anchors[id] = {
      obj: g,
      side: id === 'uae' ? 'left' : 'right',
      visible: () => {
        g.getWorldPosition(tmp);
        root.getWorldPosition(out);
        out.subVectors(tmp, out).normalize();
        toCam.set(0, 0, 6).sub(tmp).normalize();
        return out.dot(toCam) > 0.15 ? 1 : 0;
      },
    };
  }

  return {
    anchors,
    update({ t, dt, e }) {
      arcU.uDraw.value += ((e > 0.6 ? 1 : 0) - arcU.uDraw.value) * (reduceMotion ? 1 : 1 - Math.exp(-dt * 2.2));
      const k = reduceMotion ? 0.5 : (t * 0.6) % 1;
      for (const m of markers) {
        m.ring.scale.setScalar(1 + k * 1.6);
        m.ring.material.opacity = 1 - k;
      }
    },
  };
}
