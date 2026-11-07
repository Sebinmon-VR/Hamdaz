// Element "glass" (home page hero): the hero plays as frames (main.js glides from one to the next). A dark
// abstract photo fills each frame and dissolves into the next frame's photo as the page glides on, and a
// tech object made of clear, iridescent glass floats in front of it, refracting the photo: an AI sparkle
// beside the headline and for AI, then a cloud, a data stack, a processor chip (infrastructure) and a
// shield (security), while the page shows that service area's details beside it. Between two frames the
// object turns away and the next one turns in, driven by the scroll itself, so it plays exactly with the
// glide, and backwards when scrolling up.
// points(n) gives points on the object showing, where the home page's particles start (stage.js).
// Photos (Unsplash License): Veli Batuhan Aytaç (c6), Logan Voss (c7, c8), Darkhan Basshybayev (c15).
import * as THREE from '../../vendor/three.module.min.js';

// the photos (with how much each is dimmed so the words read over it)
const BG = [
  { src: 'assets/img/hero/c6.jpg', tint: 0.85 }, // light curves on black
  { src: 'assets/img/hero/c8.jpg', tint: 0.46 }, // swirling chrome
  { src: 'assets/img/hero/c15.jpg', tint: 0.42 }, // rainbow liquid metal
  { src: 'assets/img/hero/c7.jpg', tint: 0.44 }, // liquid metal
];
// the frames: the headline, then one per service area (the page shows each one's details beside it)
const FRAMES = [
  { obj: 'spark', bg: 0, pos: [0.47, 0.02, 0.9] },
  { obj: 'spark', bg: 1, pos: [0.42, 0.02, 0.9] },
  { obj: 'cloud', bg: 2, pos: [0.42, 0.02, 0.92] },
  { obj: 'data', bg: 3, pos: [0.42, 0.02, 0.88] },
  { obj: 'chip', bg: 1, pos: [0.42, 0.02, 0.88] },
  { obj: 'shield', bg: 0, pos: [0.42, 0.02, 0.88] },
];
const BG_Z = -6;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };

/* ------------------------------------------------------------------ a small studio for the glass to reflect */
function studio(renderer) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x0c141e, side: THREE.BackSide })));
  const panel = (color, k, pos, w, h) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  panel(0xffffff, 3, [0, 4.8, 1], 6, 2.2);
  panel(0xffffff, 2.2, [-4.8, 1, 2], 2, 4);
  panel(0x9fe6ff, 2.5, [4.8, 0, -1], 1.4, 5);
  panel(0xff8fc0, 1.6, [0, -1.5, -4.8], 4, 1);
  panel(0xffffff, 1.2, [2, 2, 4.8], 2.5, 1.5);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.04).texture;
  pm.dispose();
  return tex;
}

/* ------------------------------------------------------------------ the objects */
const V2 = THREE.Vector2;
const bevel = (depth, t = 0.12, s = 0.07) => ({ depth, bevelEnabled: true, bevelThickness: t, bevelSize: s, bevelSegments: 8, curveSegments: 48 });
function fit(group, target = 1.4) {
  const box = new THREE.Box3().setFromObject(group);
  const c = box.getCenter(new THREE.Vector3());
  const r = box.getBoundingSphere(new THREE.Sphere()).radius;
  const inner = new THREE.Group();
  group.children.slice().forEach((m) => inner.add(m));
  inner.position.copy(c).negate();
  const out = new THREE.Group();
  out.add(inner);
  out.scale.setScalar(target / r);
  return out;
}
function sparkShape(k = 0.2) {
  const s = new THREE.Shape();
  s.moveTo(0, 1); s.quadraticCurveTo(k, k, 1, 0); s.quadraticCurveTo(k, -k, 0, -1); s.quadraticCurveTo(-k, -k, -1, 0); s.quadraticCurveTo(-k, k, 0, 1);
  return s;
}
function roundRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function discGeo(r = 0.9, h = 0.34, e = 0.1) {
  const pts = [new V2(0, -h / 2)];
  for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i / 10) * (Math.PI / 2); pts.push(new V2(r - e + Math.cos(a) * e, -h / 2 + e + Math.sin(a) * e)); }
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * (Math.PI / 2); pts.push(new V2(r - e + Math.cos(a) * e, h / 2 - e + Math.sin(a) * e)); }
  pts.push(new V2(0, h / 2));
  return new THREE.LatheGeometry(pts, 96);
}
// one smooth surface: the outline of overlapping spheres, traced from the centre outwards
function cloudGeo() {
  const g = new THREE.SphereGeometry(1, 160, 110), p = g.attributes.position, v = new THREE.Vector3();
  const S = [[-0.66, -0.14, 0, 0.48], [0, 0.16, 0, 0.66], [0.64, -0.1, 0, 0.52], [0.3, -0.26, 0, 0.46], [-0.3, -0.28, 0, 0.46]];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let r = 0;
    for (const [cx, cy, cz, R] of S) { const b = v.x * cx + v.y * cy + v.z * cz, c = cx * cx + cy * cy + cz * cz - R * R, d = b * b - c; if (d >= 0) r = Math.max(r, b + Math.sqrt(d)); }
    let y = v.y * r;
    if (y < -0.52) y = -0.52 + (y + 0.52) * 0.12;
    p.setXYZ(i, v.x * r, y, v.z * r * 0.6);
  }
  g.computeVertexNormals();
  return g;
}
function shieldShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 1.1); s.bezierCurveTo(0.45, 0.96, 0.78, 0.9, 0.95, 0.84); s.lineTo(0.95, 0.1); s.bezierCurveTo(0.95, -0.55, 0.42, -0.95, 0, -1.15);
  s.bezierCurveTo(-0.42, -0.95, -0.95, -0.55, -0.95, 0.1); s.lineTo(-0.95, 0.84); s.bezierCurveTo(-0.78, 0.9, -0.45, 0.96, 0, 1.1);
  const h = new THREE.Path();
  h.moveTo(-0.075, -0.46); h.lineTo(0.075, -0.46); h.lineTo(0.075, 0.013); h.absarc(0, 0.2, 0.2, -1.19, Math.PI + 1.19, false); h.lineTo(-0.075, -0.46);
  s.holes.push(h);
  return s;
}

function makeObjects(glass, chrome, neon) {
  const mesh = (geo, mat = glass) => new THREE.Mesh(geo, mat);
  return {
    spark() {
      const g = new THREE.Group();
      g.add(mesh(new THREE.ExtrudeGeometry(sparkShape(0.24), bevel(0.5, 0.16, 0.07))));
      return fit(g);
    },
    chip() {
      const g = new THREE.Group();
      g.add(mesh(new THREE.ExtrudeGeometry(roundRect(1.78, 1.78, 0.14), bevel(0.14, 0.06, 0.06))));
      const die = mesh(new THREE.ExtrudeGeometry(roundRect(0.95, 0.95, 0.1), bevel(0.12, 0.05, 0.05))); die.position.z = 0.24; g.add(die);
      for (const [x, y, w, h] of [[0, 0.4, 0.7, 0.025], [0, -0.4, 0.7, 0.025], [0.4, 0, 0.025, 0.7], [-0.4, 0, 0.025, 0.7]]) {
        const m = mesh(new THREE.BoxGeometry(w, h, 0.01), neon); m.position.set(x * 1.05, y * 1.05, 0.42); g.add(m);
      }
      const pin = new THREE.ExtrudeGeometry(roundRect(0.075, 0.3, 0.03), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 3 });
      for (let s = 0; s < 4; s++) for (let i = 0; i < 7; i++) {
        const o = (i - 3) * 0.22, a = (s * Math.PI) / 2, m = mesh(pin, chrome);
        m.position.set(Math.cos(a) * 1.02 - Math.sin(a) * o, Math.sin(a) * 1.02 + Math.cos(a) * o, 0.02); m.rotation.z = a + Math.PI / 2; g.add(m);
      }
      return fit(g);
    },
    cloud() { const g = new THREE.Group(); g.add(mesh(cloudGeo())); return fit(g, 1.45); },
    data() {
      const g = new THREE.Group(), d = discGeo(), led = new THREE.SphereGeometry(0.035, 16, 12);
      for (const y of [-0.47, 0, 0.47]) {
        const m = mesh(d); m.position.y = y; g.add(m);
        const l = mesh(led, neon); l.position.set(0.45, y, 0.8); g.add(l);
      }
      return fit(g, 1.35);
    },
    shield() { const g = new THREE.Group(); g.add(mesh(new THREE.ExtrudeGeometry(shieldShape(), bevel(0.3, 0.12, 0.07)))); return fit(g, 1.4); },
  };
}

/* ------------------------------------------------------------------ the two photos, dissolving into each other */
function background() {
  const blank = new THREE.DataTexture(new Uint8Array([6, 12, 20, 255]), 1, 1);
  blank.needsUpdate = true;
  const mat = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { tA: { value: blank }, tB: { value: blank }, aA: { value: 1.78 }, aB: { value: 1.78 }, aP: { value: 1.6 }, uMix: { value: 0 }, uTime: { value: 0 }, uTintA: { value: 0.8 }, uTintB: { value: 0.8 }, uFade: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform sampler2D tA, tB; uniform float aA, aB, aP, uMix, uTime, uTintA, uTintB, uFade; varying vec2 vUv;
      vec2 cover(vec2 uv, float a) { vec2 s = aP > a ? vec2(1.0, a / aP) : vec2(aP / a, 1.0); return (uv - 0.5) * s + 0.5; }
      float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n(p); p *= 2.03; a *= 0.5; } return v; }
      void main() {
        vec3 a = texture2D(tA, cover(vUv, aA)).rgb, b = texture2D(tB, cover(vUv, aB)).rgb;
        float f = fbm(vUv * vec2(1.3 * aP, 1.3) + vec2(uTime * 0.015, -uTime * 0.01)) * 0.75 + vUv.x * 0.25;
        float e = uMix * 1.7 - 0.35;
        float m = 1.0 - smoothstep(e - 0.35, e + 0.35, f);
        vec3 c = mix(a * uTintA, b * uTintB, m);
        gl_FragColor = vec4(mix(c, vec3(0.0235, 0.0784, 0.137), uFade), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  plane.position.z = BG_Z;
  plane.renderOrder = -1;
  return { plane, mat, blank };
}

/* ------------------------------------------------------------------ points on the showing object, for the particles */
const tri = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
function samplePoints(obj, root, n, seed = 7) {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const tris = [];
  let total = 0;
  obj.traverse((m) => {
    if (!m.isMesh) return;
    const M = new THREE.Matrix4();
    for (let o = m; o && o !== root; o = o.parent) { o.updateMatrix(); M.premultiply(o.matrix); }
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
    const p = g.attributes.position;
    for (let i = 0; i + 2 < p.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(M);
      const b = new THREE.Vector3().fromBufferAttribute(p, i + 1).applyMatrix4(M);
      const c = new THREE.Vector3().fromBufferAttribute(p, i + 2).applyMatrix4(M);
      const area = tri[0].subVectors(b, a).cross(tri[1].subVectors(c, a)).length() / 2;
      if (area > 1e-7) { total += area; tris.push([a, b, c, total]); }
    }
  });
  const out = new Float32Array(n * 3);
  if (!tris.length) return out;
  for (let i = 0; i < n; i++) {
    const x = rand() * total;
    let lo = 0, hi = tris.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (tris[mid][3] < x) lo = mid + 1; else hi = mid; }
    const [a, b, c] = tris[lo];
    let u = rand(), v = rand();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    out[i * 3] = a.x + (b.x - a.x) * u + (c.x - a.x) * v;
    out[i * 3 + 1] = a.y + (b.y - a.y) * u + (c.y - a.y) * v;
    out[i * 3 + 2] = a.z + (b.z - a.z) * u + (c.z - a.z) * v;
  }
  return out;
}

/* ------------------------------------------------------------------ the element */
export async function build({ root, scene, renderer, reduceMotion }) {
  const env = studio(renderer);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.03, transmission: 1, thickness: 1.5, ior: 1.5,
    iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 720],
    clearcoat: 1, clearcoatRoughness: 0.04, attenuationColor: new THREE.Color(0xbfe9ff), attenuationDistance: 4,
    envMap: env, envMapIntensity: 1.1,
  });
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xdfe6ee, metalness: 1, roughness: 0.12, clearcoat: 1, envMap: env });
  const neon = new THREE.MeshBasicMaterial({ color: 0x30c1f8, toneMapped: false });
  const OBJ = makeObjects(glass, chrome, neon);
  const built = {};
  const get = (k) => built[k] || (built[k] = OBJ[k]());

  // light for the glass's highlights (only the glass uses lit materials on this layer)
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 4, 5); scene.add(key);
  const rimC = new THREE.DirectionalLight(0x30c1f8, 2); rimC.position.set(4, 1, -2); scene.add(rimC);
  const rimP = new THREE.DirectionalLight(0xfb4994, 1.4); rimP.position.set(-4, -2, -1); scene.add(rimP);

  const bg = background();
  scene.add(bg.plane);
  const loader = new THREE.TextureLoader();
  const tex = await Promise.all(BG.map((b) => loader.loadAsync(b.src).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }).catch(() => null)));
  const texOf = (i) => tex[i] || tex.find(Boolean) || bg.blank;
  const aspectOf = (i) => { const t = texOf(i); return t.image && t.image.width ? t.image.width / t.image.height : 1.78; };

  // a soft backlight behind the object: the glass hides it where it sits in front, so it shows as a glow
  // round the object's outline and separates it from the photo
  const haloTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: haloTex, color: 0x5fd0ff, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  halo.position.z = -1.3;
  root.add(halo);

  // where the object sits in each frame (x and y as shares of half the screen, its scale)
  const N = FRAMES.length - 1;
  const at = (i, narrow) => (narrow ? [0, 0.34, 0.72] : FRAMES[i].pos);
  let hover = 0, current = null, showing = null;
  const show = (key) => {
    if (key === showing) return;
    if (current) root.remove(current);
    current = get(key); showing = key; root.add(current);
    if (api.onSwap) api.onSwap(showing);
  };
  const api = {
    anchors: {},
    labels: 0,
    lit: null,
    onSwap: null,
    frame: 0, // where the story is, in frames (0 .. N), for the page's own panels
    showing: () => showing,
    points: (n) => (current ? samplePoints(current, root, n) : new Float32Array(n * 3)),
    // hero progress, time, the scroll stream (frozen once the object starts breaking up), pointer, screen
    update({ p, t, dt, outK, frozen, pointer, aspect, halfH }) {
      const narrow = aspect < 0.9;
      // where we are between two frames; everything below is driven by this, so it plays exactly with the
      // scroll's own glide, and backwards when scrolling up
      const f = clamp01(p) * N, i = Math.min(N - 1, Math.floor(f)), u = f - i;
      api.frame = f;
      const A = FRAMES[i], B = FRAMES[i + 1];
      // the object: the one leaving turns away and shrinks through the first half of the glide, the next one
      // turns in and grows through the second half (frames that keep their object just glide)
      const same = A.obj === B.obj;
      const leaving = !same && u < 0.5;
      if (!frozen) show(same || u < 0.5 ? A.obj : B.obj);
      const vis = same ? 1 : leaving ? 1 - smooth(0.12, 0.5, u) : smooth(0.5, 0.88, u);
      const turn = same ? 0 : leaving ? smooth(0.12, 0.5, u) : -(1 - smooth(0.5, 0.88, u));
      const pa = at(i, narrow), pb = at(i + 1, narrow), k = smooth(0, 1, u);
      const sx = pa[0] + (pb[0] - pa[0]) * k, sy = pa[1] + (pb[1] - pa[1]) * k, sc = pa[2] + (pb[2] - pa[2]) * k;
      const halfW = halfH * aspect;
      const s = sc * halfH * 0.52 * (1 + 0.015 * Math.sin(t * 1.1));

      // hover: with the cursor over the object it leans after the cursor, turns to face it, grows a touch,
      // and its reflections and rainbow sheen shift as the cursor moves across it
      const cx = sx * halfW, cy = sy * halfH;
      const rN = (1.4 * s) / halfH;
      const lx = ((pointer.x * halfW - cx) / halfH) / rN, ly = ((pointer.y * halfH - cy) / halfH) / rN;
      const over = !narrow && Math.hypot(lx, ly) < 1.05 && vis > 0.9 ? 1 : 0;
      hover += (over - hover) * (1 - Math.exp(-dt * (over ? 5 : 2.5)));
      const hx = Math.max(-1, Math.min(1, lx)) * hover, hy = Math.max(-1, Math.min(1, ly)) * hover;
      root.position.set(cx + hx * s * 0.12, cy + hy * s * 0.12 + Math.sin(t * 0.8) * 0.02, hover * 0.25);
      const e = vis * vis * (3 - 2 * vis);
      root.scale.setScalar(s * Math.max(0.001, e) * (0.8 + 0.2 * outK) * (1 + 0.07 * hover));
      root.rotation.set(
        0.14 - pointer.y * 0.12 - hy * 0.45 + Math.sin(t * 0.4) * 0.05 + turn * 0.35,
        -0.3 + Math.sin(f * Math.PI) * 0.35 + Math.sin(t * 0.3) * 0.18 + pointer.x * 0.25 + hx * 0.55 + turn * 2.2,
        Math.sin(t * 0.3) * 0.05 - turn * 0.2,
      );
      glass.envMapIntensity = 1.1 + 0.7 * hover;
      glass.iridescenceThicknessRange[0] = 120 + 180 * hover * (0.5 + 0.5 * hx);
      glass.iridescenceThicknessRange[1] = 720 + 320 * hover * (0.5 + 0.5 * hy);
      api.hover = hover;
      halo.material.opacity = (0.3 + 0.25 * hover) * e;
      halo.quaternion.copy(root.quaternion).invert(); // keep it facing the camera

      // the photos: the two frames' photos dissolve into each other through the glide, while the view zooms
      // slowly; at a frame the next pair takes over on exactly the photo showing, so there is no seam
      const U = bg.mat.uniforms;
      U.tA.value = texOf(A.bg); U.tB.value = texOf(B.bg);
      U.aA.value = aspectOf(A.bg); U.aB.value = aspectOf(B.bg);
      U.uTintA.value = BG[A.bg].tint; U.uTintB.value = BG[B.bg].tint;
      U.uMix.value = A.bg === B.bg ? 0 : smooth(0.1, 0.9, u);
      U.uTime.value = t;
      const d = 6 - BG_Z, h = 2 * d * Math.tan((15 * Math.PI) / 180), w = h * aspect, zoom = 1.1 + p * 0.12;
      bg.plane.scale.set(w * zoom, h * zoom, 1);
      bg.plane.position.set(-pointer.x * 0.12, -p * 0.3, BG_Z);
      U.aP.value = w / h;
    },
    // the photo layer: shown while the hero is on screen, darkened to the page navy as the sheet covers it
    background(visible, fade) { bg.plane.visible = visible; bg.mat.uniforms.uFade.value = fade; },
  };
  return api;
}
