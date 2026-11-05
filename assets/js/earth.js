// Hamdaz, real-time night Earth.
// Three.js r160 (MIT). Imagery: NASA Black Marble (public domain), via the three-globe package (MIT).
import * as THREE from '../vendor/three.module.min.js';

const DEG = Math.PI / 180;
const OFFICES = {
  uae: { lat: 24.4539, lon: 54.3773 },
  india: { lat: 11.2588, lon: 75.7804 },
};
const FOCUS = { lat: 19, lon: 63 };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const api = (window.HamdazEarth = window.HamdazEarth || { progress: 0 });

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

function toVec(lat, lon, r = 1) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// Rotation that turns lat/lon towards the camera (+Z). dx shifts it right, dy shifts it up.
function facing(lat, lon, dx = 0, dy = 0) {
  return { x: lat * DEG - dy, y: Math.PI / 2 - (lon + 180) * DEG + dx };
}

// Framings. Values depend on the viewport aspect so the composition holds on phones.
function presets(aspect) {
  const narrow = aspect < 0.9;
  const halfH = 6 * Math.tan(15 * DEG);
  const halfW = halfH * aspect;
  const limbR = narrow ? halfW * 1.9 : Math.max(2.7, halfW * 1.08);
  const f = facing(FOCUS.lat, FOCUS.lon, narrow ? 0.25 : 0.5, narrow ? 0.95 : 1.1);
  const g = facing(FOCUS.lat, FOCUS.lon, 0, 0.08);
  return {
    limb: { x: 0, y: (narrow ? 0.05 : 0.2) - limbR, s: limbR, rx: f.x, ry: f.y, arc: 0, marks: 0, labels: 0 },
    globe: narrow
      ? { x: 0, y: -0.55, s: 0.82, rx: g.x, ry: g.y, arc: 1, marks: 1, labels: 1 }
      : { x: halfW * 0.42, y: -0.04, s: 1.18, rx: g.x, ry: g.y, arc: 1, marks: 1, labels: 1 },
    page: narrow
      ? { x: 0.35, y: -halfH * 0.95, s: 1.25, rx: g.x - 0.35, ry: g.y + 0.1, arc: 1, marks: 1, labels: 0 }
      : { x: halfW * 0.62, y: -0.15, s: 1.35, rx: g.x, ry: g.y + 0.15, arc: 1, marks: 1, labels: 1 },
  };
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a, b, t) => a + (b - a) * t;

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
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  void main() {
    vec3 night = texture2D(uNight, vUv).rgb;
    float water = texture2D(uWater, vUv).r;
    // moonlit terrain, oceans pushed darker
    vec3 base = night * mix(0.9, 0.42, water) * vec3(0.78, 0.88, 1.0);
    // city lights are warmer than the blue terrain
    float warm = clamp((night.r - night.b) * 5.0, 0.0, 1.0);
    float bright = smoothstep(0.1, 0.55, night.r);
    float lights = warm * bright * (1.0 - water);
    vec3 col = base + vec3(1.0, 0.74, 0.42) * lights * 2.2;
    // thin bright limb
    float ndv = max(dot(normalize(vNormalW), normalize(vViewW)), 0.0);
    col += vec3(0.33, 0.74, 1.0) * pow(1.0 - ndv, 4.0) * 1.1;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const atmoVertex = /* glsl */ `
  varying vec3 vNormalV;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmoFragment = /* glsl */ `
  varying vec3 vNormalV;
  void main() {
    float i = pow(0.66 - dot(vNormalV, vec3(0.0, 0.0, 1.0)), 4.0);
    gl_FragColor = vec4(vec3(0.24, 0.66, 1.0) * i * 1.6, 1.0);
  }
`;

const arcVertex = /* glsl */ `
  varying float vU;
  void main() { vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
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

function init(host) {
  const canvas = host.querySelector('canvas');
  const mode = host.dataset.earth || 'page';
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return fail();

  // Resolution: capped, and lowered automatically if frames run slow (see adapt()).
  const DPR_MAX = Math.min(window.devicePixelRatio || 1, 1.25);
  let dpr = DPR_MAX;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
  } catch (e) {
    return fail();
  }
  renderer.setClearColor(0x061423, 1);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 6);

  // Stars
  const starCount = 1600;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 40);
    if (v.z > 10) v.z *= -1; // keep stars behind the planet
    starPos.set([v.x, v.y, v.z], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdfe8f5, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false }));
  scene.add(stars);

  // Earth
  const globe = new THREE.Group();
  globe.rotation.order = 'XYZ';
  scene.add(globe);

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_, loaded, total) => emit('earth:progress', loaded / total);
  const loader = new THREE.TextureLoader(manager);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (url) => {
    const t = loader.load(url);
    t.anisotropy = Math.min(4, maxAniso);
    return t;
  };
  const earthMat = new THREE.ShaderMaterial({
    uniforms: { uNight: { value: tex('assets/img/earth/earth-night.jpg') }, uWater: { value: tex('assets/img/earth/earth-water.png') } },
    vertexShader: earthVertex,
    fragmentShader: earthFragment,
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), earthMat);
  globe.add(earth);

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 64, 48),
    new THREE.ShaderMaterial({ vertexShader: atmoVertex, fragmentShader: atmoFragment, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }),
  );
  globe.add(atmo);

  // Arc between the offices: a lifted great circle
  const a = toVec(OFFICES.uae.lat, OFFICES.uae.lon).normalize();
  const b = toVec(OFFICES.india.lat, OFFICES.india.lon).normalize();
  const pts = [];
  for (let i = 0; i <= 96; i++) {
    const t = i / 96;
    const p = new THREE.Vector3().copy(a).lerp(b, t).normalize();
    pts.push(p.multiplyScalar(1.004 + Math.sin(Math.PI * t) * 0.09));
  }
  const arcUniforms = { uDraw: { value: 0 }, uTime: { value: 0 } };
  const arc = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.0045, 8, false),
    new THREE.ShaderMaterial({ uniforms: arcUniforms, vertexShader: arcVertex, fragmentShader: arcFragment, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  globe.add(arc);

  // Office markers: a core, a pulsing ring and a short beam
  const markers = {};
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
    globe.add(g, beam);
    markers[id] = { group: g, ring, core, beam, normal, el: host.querySelector(`[data-earth-label="${id}"]`) };
  }

  // State
  let P = presets(1.6);
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = true;
  let running = false;
  let raf = 0;
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  const outward = new THREE.Vector3();
  let W = 1;
  let H = 1;
  let prog = api.progress || 0; // smoothed scroll progress, so the camera never steps

  function resize() {
    W = host.clientWidth;
    H = host.clientHeight;
    if (!W || !H) return;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    P = presets(camera.aspect);
    dirty = true;
    if (!running) frame();
  }

  // Adaptive resolution: drop pixel ratio on slow devices, restore when there is headroom.
  let acc = 0;
  let frames = 0;
  let good = 0;
  function adapt(dt) {
    acc += dt;
    frames++;
    if (acc < 1) return;
    const avg = acc / frames;
    acc = 0;
    frames = 0;
    // only ever step down, after two slow seconds in a row, so the canvas never ping-pongs
    if (avg > 0.024 && dpr > 0.75) {
      if (++good >= 2) {
        dpr = Math.max(0.75, dpr - 0.25);
        good = 0;
        resize();
      }
    } else good = 0;
  }

  function pose() {
    if (mode === 'hero') {
      const t = ease(Math.min(1, Math.max(0, prog)));
      const A = P.limb;
      const B = P.globe;
      return {
        x: mix(A.x, B.x, t), y: mix(A.y, B.y, t), s: mix(A.s, B.s, t),
        rx: mix(A.rx, B.rx, t), ry: mix(A.ry, B.ry, t), arc: t > 0.5 ? 1 : 0,
        marks: Math.max(0, (t - 0.45) / 0.4), labels: Math.max(0, (t - 0.55) / 0.45),
      };
    }
    return P.page;
  }

  let intro = mode === 'hero' ? 0 : 1;
  let dirty = true; // forces a redraw (resize, first frame)
  const damp = (dt, rate) => 1 - Math.exp(-dt * rate);
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;
    const target = api.progress || 0;
    // With reduced motion nothing moves on its own, so skip redraws once the camera has settled.
    if (reduceMotion && running && !dirty && intro >= 1 && Math.abs(target - prog) < 0.0002) return;
    dirty = false;
    prog += (target - prog) * (running ? damp(dt, 9) : 1);
    const p = pose();
    intro = Math.min(1, intro + dt * 0.6);
    const drift = reduceMotion ? 0 : Math.sin(time * 0.12) * 0.05;

    pointer.x += (pointer.tx - pointer.x) * damp(dt, 3);
    pointer.y += (pointer.ty - pointer.y) * damp(dt, 3);

    globe.position.set(p.x, p.y - (1 - ease(intro)) * 0.35, 0);
    globe.scale.setScalar(p.s);
    globe.rotation.set(p.rx + pointer.y * 0.05, p.ry + drift + pointer.x * 0.08, 0);
    camera.position.set(pointer.x * 0.12, pointer.y * 0.08, 6);
    camera.lookAt(0, 0, 0);
    stars.rotation.y = reduceMotion ? 0 : time * 0.004;

    arcUniforms.uTime.value = reduceMotion ? 0.3 : time;
    // frame-rate independent easing towards the target draw amount
    const k1 = reduceMotion || !running ? 1 : 1 - Math.exp(-dt * 2.2);
    arcUniforms.uDraw.value += (p.arc - arcUniforms.uDraw.value) * k1;

    globe.updateMatrixWorld();
    const marks = Math.min(1, p.marks ?? 1);
    for (const m of Object.values(markers)) {
      const k = reduceMotion ? 0.5 : (time * 0.6) % 1;
      // markers stay in the scene (opacity only) so their shaders are compiled up front
      m.ring.scale.setScalar(1 + k * 1.6);
      m.ring.material.opacity = (1 - k) * marks;
      m.core.material.opacity = marks;
      m.beam.material.opacity = 0.8 * marks;
      if (!m.el) continue;
      const show = p.labels > 0.001;
      if (!show) {
        if (m.lastOpacity !== '0') m.el.style.opacity = m.lastOpacity = '0';
        continue;
      }
      m.group.getWorldPosition(tmp);
      outward.copy(tmp).sub(globe.position).normalize();
      toCam.copy(camera.position).sub(tmp).normalize();
      const facing = outward.dot(toCam) > 0.15 ? 1 : 0;
      tmp.project(camera);
      const transform = `translate3d(${((tmp.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-tmp.y * 0.5 + 0.5) * H).toFixed(1)}px, 0)`;
      const opacity = (p.labels * facing).toFixed(2);
      if (transform !== m.lastTransform) m.el.style.transform = m.lastTransform = transform;
      if (opacity !== m.lastOpacity) m.el.style.opacity = m.lastOpacity = opacity;
    }

    renderer.render(scene, camera);
    api.drawn = prog; // camera progress actually on screen (used by the smoothness test)
    if (running) adapt(dt);
  }

  // Render in the same tick as GSAP/Lenis when available, so scroll and 3D never drift apart.
  const ticker = window.gsap && window.gsap.ticker;
  const loop = () => {
    frame();
    if (!ticker) raf = requestAnimationFrame(loop);
  };
  // The loop also runs with reduced motion: the camera then follows scroll smoothly,
  // while the idle drift, pulses and pointer parallax stay off.
  const play = () => {
    if (running) return;
    running = true;
    clock.getDelta();
    if (ticker) ticker.add(loop);
    else raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    if (ticker) ticker.remove(loop);
    else cancelAnimationFrame(raf);
  };

  manager.onLoad = () => {
    resize();
    // Compile every shader now, during the loading screen, instead of mid-scroll
    // (on Windows/Direct3D a first-time compile can freeze the page for over a second).
    renderer.compile(scene, camera);
    frame();
    host.classList.add('is-ready');
    emit('earth:ready', { ok: true });
    if (visible) play();
  };

  window.addEventListener('resize', resize);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible && !document.hidden ? play() : pause();
  }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : visible && play()));
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    });
  }
  resize();
  api.ready = true;
  api.host = host;
  // live globe placement in this camera (fov 30, z 6), read by morph.js
  api.live = () => ({ x: globe.position.x, y: globe.position.y, s: globe.scale.x });

  function fail() {
    document.documentElement.classList.add('no-webgl');
    emit('earth:progress', 1);
    emit('earth:ready', { ok: false });
  }
}

// After a page-switch morph the particles fly first; the globe is built once they land (morph.js),
// so its setup never interrupts their flight.
const whenSettled = (start) => {
  if (!document.documentElement.classList.contains('morphing') || window.__hzSettled) return start();
  let done = false;
  const go = () => { if (!done) { done = true; start(); } };
  window.addEventListener('hz:morph-settle', go, { once: true });
  setTimeout(go, 2500);
};
const host = document.querySelector('[data-earth]');
if (host) whenSettled(() => init(host));
else emit('earth:ready', { ok: false });
