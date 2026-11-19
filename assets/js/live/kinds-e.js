// How We Do (solutions.html): live pictures (style A, studio dark) for the five industries with AI products.
//   oilgas    a pumpjack nodding over its wellhead, with an AI sensor ring on the well
//   sme       a small shopfront: lit window, awning, glass door, an OPEN sign
//   school    a white architect's model of a school with a clock tower and a flag
//   onlineedu a tablet on a stand with a stylus writing out a lesson
//   sports    a football on a disc of turf, with a tracking ring
import { THREE, BUILD, DESCRIBE, M, CYAN, U, mesh, rbox, puck, glowMat, canvasTex, textures, lerp, smooth, hash, V2, V3 } from './kit.js';

const P = (o) => new THREE.MeshPhysicalMaterial(o);
const UP = new THREE.Vector3(0, 1, 0);
// a round bar from a to b (and setRod moves it)
const setRod = (m, a, b) => { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); m.scale.set(1, len, 1); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); return m; };
const rod = (a, b, r, mat, seg = 20) => setRod(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, seg), mat), a, b);
const sprite = (col, size, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(size); return s; };
const F = '"Segoe UI", system-ui, sans-serif';

Object.assign(BUILD, {
  // Oil and Gas: the crank turns, the walking beam nods and the horse head lifts the rod out of the well; a cyan sensor
  // ring on the wellhead sends readings up. Hover: it pumps faster and the readings stream
  oilgas() {
    const g = new THREE.Group();
    const grey = P({ color: 0x9aa4af, metalness: 0.45, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 });
    g.add(mesh(rbox(1.9, 0.05, 0.56, 0.014), M.dark, 0.08, 0.025, 0));
    g.add(mesh(rbox(1.5, 0.05, 0.36, 0.01), M.paint, -0.05, 0.075, 0));
    // gearbox and motor at the back
    g.add(mesh(rbox(0.28, 0.2, 0.22, 0.03), M.paint, -0.5, 0.2, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.2, 40).rotateZ(Math.PI / 2), M.alu, -0.76, 0.17, 0));
    g.add(mesh(rbox(0.06, 0.12, 0.12, 0.01), M.dark, -0.64, 0.17, 0));
    // the crank: arms with counterweights, turning on the gearbox shaft
    const crank = new THREE.Group(); crank.position.set(-0.5, 0.25, 0); g.add(crank);
    for (const s of [-1, 1]) {
      crank.add(mesh(rbox(0.05, 0.34, 0.03, 0.012), grey, 0, -0.02, s * 0.13));
      crank.add(mesh(rbox(0.22, 0.13, 0.05, 0.02), M.dark, 0, -0.17, s * 0.14));
    }
    // samson post: two A-frames up to the saddle bearing
    const PV = new V3(0.05, 0.8, 0);
    for (const s of [-1, 1]) { g.add(rod(new V3(0.28, 0.1, s * 0.16), new V3(0.05, 0.76, s * 0.05), 0.018, grey)); g.add(rod(new V3(-0.2, 0.1, s * 0.16), new V3(0.05, 0.76, s * 0.05), 0.018, grey)); }
    g.add(mesh(rbox(0.1, 0.06, 0.16, 0.012), M.dark, 0.05, 0.77, 0));
    // the walking beam, the horse head (an arc round the pivot, so the bridle hangs straight) and the equaliser
    const beam = new THREE.Group(); beam.position.copy(PV); g.add(beam);
    beam.add(mesh(rbox(1.2, 0.085, 0.08, 0.012), grey, 0.06, 0, 0));
    const R0 = 0.62, R1 = 0.78, a0 = -0.42, a1 = 0.22, head = new THREE.Shape();
    head.absarc(0, 0, R1, a0, a1, false); head.lineTo(Math.cos(a1) * R0, Math.sin(a1) * R0); head.absarc(0, 0, R0, a1, a0, true); head.closePath();
    const hg = new THREE.ExtrudeGeometry(head, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 24 }); hg.translate(0, 0, -0.055);
    beam.add(mesh(hg, grey));
    beam.add(mesh(rbox(0.1, 0.06, 0.36, 0.012), M.dark, -0.52, -0.05, 0));
    // pitman arms (crank pin to equaliser), bridle and polished rod
    const pitman = [-1, 1].map((s) => { const m = rod(new V3(), new V3(0, 1, 0), 0.014, M.alu); g.add(m); return { m, s }; });
    const bridle = rod(new V3(), new V3(0, 1, 0), 0.006, M.dark); g.add(bridle);
    const carrier = mesh(rbox(0.12, 0.025, 0.05, 0.008), M.dark); g.add(carrier);
    const prod = rod(new V3(), new V3(0, 1, 0), 0.009, M.alu); g.add(prod);
    // the wellhead with its flowline and the sensor ring
    const WX = PV.x + R1 + 0.006;
    g.add(mesh(puck(0.085, 0.03, 0.01, 0), M.dark, WX, 0.05, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 32), M.alu, WX, 0.16, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 32), M.dark, WX, 0.15, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 24).rotateX(Math.PI / 2), M.alu, WX, 0.13, 0.17));
    g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 24).rotateX(Math.PI / 2), M.dark, WX, 0.13, 0.08));
    const ringM = glowMat(CYAN, 1.2); g.add(mesh(new THREE.TorusGeometry(0.058, 0.006, 10, 64).rotateX(Math.PI / 2), ringM, WX, 0.21, 0, { tone: 1 }));
    // an IoT box on the skid with its antenna
    g.add(mesh(rbox(0.12, 0.09, 0.07, 0.01), M.alu, 0.45, 0.145, 0.17));
    g.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 8), M.dark, 0.49, 0.25, 0.17));
    const iotLed = glowMat(CYAN, 1); g.add(mesh(new THREE.SphereGeometry(0.008, 12, 8), iotLed, 0.42, 0.16, 0.206, { tone: 1 }));
    // readings rising off the well
    const dots = Array.from({ length: 10 }, (_, i) => { const s = sprite(CYAN, 0.05, 0); s.userData.k = i / 10; g.add(s); return s; });
    let phi = 0, speed = 1.1;
    const a = new V3(), b = new V3(), pin = new V3(), eq = new V3();
    return {
      g, frame: { target: [0.08, 0.46, 0], dist: 3.55, az: 0.32, el: 0.12 }, top: 1.0, dustN: 14000,
      shadows: [[0.08, 0, 2.3, 0.8, 0.9]],
      anim(t, h, dt) {
        speed = lerp(speed, lerp(1.1, 2.4, h), 0.04); phi += (dt || 0) * speed;
        crank.rotation.z = -phi;
        const th = Math.sin(phi) * 0.2; beam.rotation.z = th;
        pin.set(0, 0.15, 0).applyAxisAngle(new V3(0, 0, 1), -phi).add(crank.position);
        for (const { m, s } of pitman) { eq.set(-0.52, -0.08, s * 0.16).applyAxisAngle(new V3(0, 0, 1), th).add(PV); setRod(m, a.set(pin.x, pin.y, s * 0.16), eq); }
        const cy = PV.y - 0.36 + R1 * th;
        setRod(bridle, a.set(WX, PV.y - 0.02, 0), b.set(WX, cy, 0)); carrier.position.set(WX, cy, 0);
        setRod(prod, a.set(WX, cy, 0), b.set(WX, 0.2, 0));
        ringM.color.set(CYAN).multiplyScalar(1 + h * 1.6 + Math.sin(t * 3) * 0.25);
        iotLed.color.set(CYAN).multiplyScalar(hash(Math.floor(t * (3 + h * 6))) > 0.4 ? 2.2 : 0.2);
        for (const s of dots) { const k = (s.userData.k + t * lerp(0.25, 0.6, h)) % 1; s.position.set(WX + Math.sin(k * 9 + s.userData.k * 20) * 0.04, 0.24 + k * 0.7, Math.cos(k * 7) * 0.04); s.material.opacity = Math.sin(k * Math.PI) * (0.25 + h * 0.6); }
      },
    };
  },

  // Small and Medium Enterprises: a shopfront with a lit window, an awning, a glass door and a sign; hover: the shop
  // opens (the lights come up and the OPEN sign glows)
  sme() {
    const g = new THREE.Group();
    const plaster = P({ color: 0xe8e4de, roughness: 0.7, clearcoat: 0.1 });
    g.add(mesh(rbox(1.36, 0.04, 0.86, 0.012), M.stone, 0, 0.02, 0.02));
    g.add(mesh(rbox(1.12, 0.82, 0.6, 0.016), plaster, 0, 0.45, -0.06));
    const fz = 0.24;
    // the window: the shop inside (shelves, a counter, pendant lights), glass in a metal frame
    const inside = canvasTex(512, 352, (x, w, h) => {
      const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a4636'); gr.addColorStop(1, '#2a2019'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      for (let r = 0; r < 3; r++) { const y = 70 + r * 72; x.fillStyle = '#c9b8a3'; x.fillRect(30, y + 38, 290, 5); for (let i = 0; i < 9; i++) { x.fillStyle = ['#d8c3a5', '#8fb6c9', '#e0a87e', '#b9c7a0', '#f0e2c8'][(i + r * 2) % 5]; x.fillRect(38 + i * 31, y + 38 - (16 + ((i * 7 + r * 5) % 4) * 5), 22, 16 + ((i * 7 + r * 5) % 4) * 5); } }
      x.fillStyle = '#3b2e24'; x.fillRect(340, 230, 150, 122); x.fillStyle = '#d9cbb8'; x.fillRect(340, 226, 150, 8);
      for (const cx of [120, 260, 410]) { const lg = x.createRadialGradient(cx, 30, 2, cx, 30, 90); lg.addColorStop(0, 'rgba(255,224,170,0.95)'); lg.addColorStop(1, 'rgba(255,224,170,0)'); x.fillStyle = lg; x.fillRect(cx - 90, 0, 180, 140); x.fillStyle = '#2a2019'; x.fillRect(cx - 1, 0, 2, 24); x.fillStyle = '#ffe2b0'; x.beginPath(); x.arc(cx, 28, 7, 0, 7); x.fill(); }
    });
    const insideM = new THREE.MeshBasicMaterial({ map: inside, color: new THREE.Color(0.55, 0.55, 0.55) });
    g.add(mesh(new THREE.PlaneGeometry(0.66, 0.46), insideM, -0.15, 0.35, fz + 0.001, { tone: 3 }));
    g.add(mesh(new THREE.PlaneGeometry(0.66, 0.46), M.smoke, -0.15, 0.35, fz + 0.012, { noDust: true }));
    const frame = (w, h, x, y, z, t = 0.018) => { g.add(mesh(rbox(w + t, t, 0.025, 0.004), M.alu, x, y + h / 2, z)); g.add(mesh(rbox(w + t, t, 0.025, 0.004), M.alu, x, y - h / 2, z)); g.add(mesh(rbox(t, h, 0.025, 0.004), M.alu, x - w / 2, y, z)); g.add(mesh(rbox(t, h, 0.025, 0.004), M.alu, x + w / 2, y, z)); };
    frame(0.66, 0.46, -0.15, 0.35, fz + 0.012);
    g.add(mesh(rbox(0.012, 0.46, 0.02, 0.004), M.alu, -0.15, 0.35, fz + 0.014));
    // the door
    g.add(mesh(new THREE.PlaneGeometry(0.2, 0.5), insideM, 0.36, 0.33, fz + 0.001, { tone: 3 }));
    g.add(mesh(new THREE.PlaneGeometry(0.2, 0.5), M.smoke, 0.36, 0.33, fz + 0.012, { noDust: true }));
    frame(0.2, 0.5, 0.36, 0.33, fz + 0.012);
    g.add(mesh(rbox(0.012, 0.14, 0.02, 0.005), M.alu, 0.29, 0.33, fz + 0.03));
    // the OPEN sign in the window
    const neon = canvasTex(256, 96, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.font = `700 62px ${F}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#eb4b96'; x.shadowBlur = 18; x.fillStyle = '#ff8cc0'; x.fillText('OPEN', w / 2, h / 2 + 3); x.shadowBlur = 0; x.strokeStyle = '#ff8cc0'; x.lineWidth = 4; x.strokeRect(8, 8, w - 16, h - 16); });
    const neonM = new THREE.MeshBasicMaterial({ map: neon, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(0.15, 0.15, 0.15) });
    g.add(mesh(new THREE.PlaneGeometry(0.2, 0.075), neonM, -0.33, 0.48, fz + 0.02, { noDust: true }));
    // fascia with a light line, and the awning in navy and white stripes
    g.add(mesh(rbox(1.08, 0.13, 0.04, 0.008), M.paint, 0, 0.7, fz + 0.01));
    const strip = glowMat(CYAN, 1); g.add(mesh(new THREE.BoxGeometry(0.9, 0.006, 0.006), strip, 0, 0.64, fz + 0.033, { tone: 1 }));
    const stripes = canvasTex(256, 64, (x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#f1efe9' : '#123352'; x.fillRect(i * 16, 0, 16, h); } });
    const awnM = M.knit.clone(); awnM.map = stripes; awnM.color = new THREE.Color(0xffffff);
    const awn = new THREE.Group(); awn.position.set(-0.15, 0.62, fz + 0.01); g.add(awn);
    const cloth = mesh(rbox(0.76, 0.012, 0.24, 0.004), awnM, 0, 0, 0.12); awn.add(cloth);
    g.add(mesh(rbox(1.14, 0.03, 0.62, 0.01), M.paint, 0, 0.875, -0.06));
    g.add(mesh(rbox(0.22, 0.12, 0.16, 0.012), M.alu, 0.3, 0.95, -0.15));
    g.add(mesh(new THREE.CircleGeometry(0.045, 32).rotateX(-Math.PI / 2), M.dark, 0.3, 1.012, -0.15));
    // a planter by the door
    g.add(mesh(rbox(0.12, 0.1, 0.12, 0.012), M.paint, 0.56, 0.09, fz + 0.12));
    g.add(mesh(new THREE.SphereGeometry(0.07, 24, 16), P({ color: 0x3c6b4a, roughness: 0.8, sheen: 0.6, sheenColor: new THREE.Color(0x8fd0a0) }), 0.56, 0.19, fz + 0.12));
    let open = 0;
    return {
      g, frame: { target: [0, 0.46, 0.05], dist: 2.85, az: 0.48, el: 0.13 }, top: 1.0, dustN: 14000,
      shadows: [[0, 0.02, 1.6, 1.0, 0.9]],
      anim(t, h) {
        open = lerp(open, h, 0.06);
        insideM.color.setScalar(0.5 + open * 0.55);
        neonM.color.setScalar(0.12 + open * (0.95 + Math.sin(t * 9) * 0.04));
        strip.color.set(CYAN).multiplyScalar(0.6 + open * 1.6);
        awn.rotation.x = 0.42 - open * 0.18;
      },
    };
  },

  // Schools and Educational Institutions: a white architect's model of a school on an oak base, with a clock tower
  // and a flag; hover: the classrooms light up row by row and the clock runs
  school() {
    const g = new THREE.Group();
    const white = P({ color: 0xf1f1ee, roughness: 0.55, clearcoat: 0.2 });
    g.add(mesh(rbox(1.8, 0.035, 1.0, 0.012), M.oak, 0, 0.0175, 0.05));
    const B = 0.035;
    g.add(mesh(rbox(1.36, 0.4, 0.42, 0.008), white, 0, B + 0.2, -0.05));
    g.add(mesh(rbox(1.38, 0.02, 0.44, 0.005), M.paint, 0, B + 0.41, -0.05));
    // classroom windows: two rows along the front and the side, lit one by one
    const uLit = { value: 0 };
    const winM = new THREE.ShaderMaterial({ uniforms: { uLit, uTime: U.time }, vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uLit, uTime; varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main() { vec2 n = vec2(11.0, 2.0), c = floor(vUv * n), f = fract(vUv * n);
          float win = step(0.16, f.x) * step(f.x, 0.84) * step(0.2, f.y) * step(f.y, 0.8);
          float order = ((1.0 - c.y) * n.x + c.x) / (n.x * n.y) * 0.85 + hash(c) * 0.15;
          float lit = smoothstep(order, order + 0.06, uLit + 0.08 * step(0.82, hash(c + 3.0)));
          vec3 glass = vec3(0.07, 0.1, 0.14) + vec3(0.2, 0.28, 0.36) * (1.0 - f.y) * 0.3;
          vec3 col = mix(vec3(0.94, 0.94, 0.92), mix(glass, vec3(1.0, 0.82, 0.55), lit), win);
          gl_FragColor = vec4(col, 1.0); }` });
    for (const s of [-1, 1]) g.add(mesh(new THREE.PlaneGeometry(0.5, 0.3), winM, s * 0.42, B + 0.2, 0.161, { tone: 3 }));
    // the clock tower with its roof, clock and entrance
    const tw = new THREE.Group(); tw.position.set(0, B, 0.06); g.add(tw);
    tw.add(mesh(rbox(0.28, 0.66, 0.26, 0.008), white, 0, 0.33, 0));
    tw.add(mesh(new THREE.ConeGeometry(0.22, 0.16, 4).rotateY(Math.PI / 4), M.paint, 0, 0.74, 0));
    tw.add(mesh(new THREE.CircleGeometry(0.075, 48), P({ color: 0xffffff, roughness: 0.3 }), 0, 0.53, 0.131));
    tw.add(mesh(new THREE.TorusGeometry(0.077, 0.007, 12, 64), M.alu, 0, 0.53, 0.132));
    const hh = mesh(new THREE.BoxGeometry(0.008, 0.045, 0.004).translate(0, 0.02, 0), M.dark, 0, 0.53, 0.135); tw.add(hh);
    const mh = mesh(new THREE.BoxGeometry(0.006, 0.065, 0.004).translate(0, 0.03, 0), M.dark, 0, 0.53, 0.137); tw.add(mh);
    tw.add(mesh(new THREE.PlaneGeometry(0.11, 0.17), M.smoke, 0, 0.1, 0.131));
    tw.add(mesh(rbox(0.13, 0.012, 0.02, 0.003), M.alu, 0, 0.19, 0.133));
    for (let i = 0; i < 3; i++) g.add(mesh(rbox(0.26 - i * 0.04, 0.012, 0.06, 0.003), white, 0, B + 0.006 + i * 0.012, 0.22 + 0.05 - i * 0.02));
    // the flag
    g.add(mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.82, 12), M.alu, 0.62, B + 0.41, 0.36));
    const flagGeo = new THREE.PlaneGeometry(0.2, 0.12, 12, 4).translate(0.1, 0, 0), base = flagGeo.attributes.position.array.slice();
    const flag = mesh(flagGeo, P({ color: new THREE.Color(CYAN), roughness: 0.6, side: THREE.DoubleSide, sheen: 0.5, sheenColor: new THREE.Color(0xffffff) }), 0.626, B + 0.74, 0.36); g.add(flag);
    // model trees (frosted, as on an architect's model)
    const leaf = P({ color: 0xd8ecdf, roughness: 0.5, transmission: 0, transparent: true, opacity: 0.85 });
    for (const [x, z, r] of [[-0.75, 0.32, 0.09], [-0.58, 0.38, 0.07], [0.78, 0.12, 0.08]]) { g.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8), M.dark, x, B + 0.06, z)); g.add(mesh(new THREE.SphereGeometry(r, 32, 20), leaf, x, B + 0.12 + r * 0.8, z)); }
    let lit = 0, clockT = 0;
    return {
      g, frame: { target: [0, 0.32, 0.06], dist: 3.0, az: 0.42, el: 0.2 }, top: 0.9, dustN: 14000,
      shadows: [[0, 0.05, 2.1, 1.25, 0.9]],
      anim(t, h, dt) {
        lit = lerp(lit, h > 0.05 ? Math.min(1, lit + 0.012) : Math.max(0, lit - 0.02), 0.6); uLit.value = 0.06 + lit;
        clockT += (dt || 0) * lerp(0.02, 0.6, h);
        mh.rotation.z = -clockT * Math.PI * 2; hh.rotation.z = -clockT * Math.PI * 2 / 12 - 1.1;
        const arr = flagGeo.attributes.position.array, sp = lerp(4, 8, h);
        for (let i = 0; i < arr.length; i += 3) { const x = base[i]; arr[i + 2] = base[i + 2] + Math.sin(x * 30 - t * sp) * 0.012 * (x / 0.2); }
        flagGeo.attributes.position.needsUpdate = true; flagGeo.computeVertexNormals();
      },
    };
  },

  // Online Education: a tablet on a stand showing a lesson; the stylus writes out a worked example (a triangle and
  // a² + b² = c²) while the lesson video plays beside it. Hover: it writes faster and the step is ticked
  onlineedu() {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.66, 0.016, 0.42, 0.008), M.alu, 0, 0.008, 0.02));
    const tab = new THREE.Group(); tab.position.set(0, 0.016, 0.16); tab.rotation.x = -1.05; g.add(tab);
    const TW = 0.64, TH = 0.44;
    tab.add(mesh(rbox(TW, TH, 0.018, 0.03), M.dark, 0, TH / 2, -0.009));
    g.add(mesh(rbox(0.5, 0.012, 0.2, 0.006), M.alu, 0, 0.12, -0.1).rotateX(0.5));
    // the lesson screen, redrawn as it is written
    const cv = document.createElement('canvas'); cv.width = 768; cv.height = 512; const x = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const SW = TW - 0.03, SH = TH - 0.03;
    tab.add(mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: tex }), 0, TH / 2, 0.0005, { tone: 3 }));
    tab.add(mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.1, clearcoat: 1, depthWrite: false }), 0, TH / 2, 0.001, { noDust: true }));
    // the strokes, in screen pixels: a right triangle, then the equation underneath
    const tri = [[90, 330], [330, 330], [90, 150], [90, 330]];
    const pts = []; for (let i = 0; i < tri.length - 1; i++) for (let k = 0; k <= 40; k++) pts.push([lerp(tri[i][0], tri[i + 1][0], k / 40), lerp(tri[i][1], tri[i + 1][1], k / 40)]);
    const eqStart = pts.length; for (let k = 0; k <= 80; k++) pts.push([80 + k * 3.4, 420 + Math.sin(k * 0.9) * 6]);
    const draw = (p, done, play) => {
      x.fillStyle = '#0b1826'; x.fillRect(0, 0, 768, 512);
      x.fillStyle = '#112538'; x.fillRect(0, 0, 768, 56); x.fillStyle = 'rgba(255,255,255,0.9)'; x.font = `600 24px ${F}`; x.fillText('Lesson 4 · Right triangles', 28, 37);
      x.fillStyle = '#0e2032'; x.fillRect(24, 76, 468, 412);
      const n = Math.floor(p * pts.length);
      x.lineCap = 'round'; x.lineJoin = 'round';
      x.strokeStyle = '#7fdcff'; x.lineWidth = 5; x.beginPath(); for (let i = 0; i < Math.min(n, eqStart); i++) { const [px, py] = pts[i]; if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke();
      if (n > eqStart * 0.98) { x.fillStyle = 'rgba(255,255,255,0.75)'; x.font = `500 22px ${F}`; x.fillText('a', 66, 250); x.fillText('b', 200, 362); x.fillText('c', 220, 228); x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = 2; x.strokeRect(90, 306, 24, 24); }
      if (n > eqStart) { const w = ((n - eqStart) / (pts.length - eqStart)) * 300; x.save(); x.beginPath(); x.rect(70, 380, w, 70); x.clip(); x.fillStyle = '#ffffff'; x.font = `600 40px ${F}`; x.fillText('a² + b² = c²', 80, 432); x.restore(); }
      // the lesson video and the steps
      const vg = x.createLinearGradient(512, 76, 744, 236); vg.addColorStop(0, '#24496b'); vg.addColorStop(1, '#13283d'); x.fillStyle = vg; x.fillRect(512, 76, 232, 150);
      x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.moveTo(612, 128); x.lineTo(612, 174); x.lineTo(650, 151); x.closePath(); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(524, 210, 208, 5); x.fillStyle = '#30c1f8'; x.fillRect(524, 210, 208 * play, 5);
      const steps = ['Watch the video', 'Draw the triangle', 'Write the rule'];
      steps.forEach((s, i) => { const y = 270 + i * 56, ok = i === 0 || (i === 1 && n >= eqStart) || (i === 2 && done); x.fillStyle = ok ? '#30c1f8' : 'rgba(255,255,255,0.15)'; x.beginPath(); x.arc(530, y, 13, 0, 7); x.fill(); if (ok) { x.strokeStyle = '#04213a'; x.lineWidth = 3; x.beginPath(); x.moveTo(523, y); x.lineTo(529, y + 6); x.lineTo(538, y - 6); x.stroke(); } x.fillStyle = 'rgba(255,255,255,0.8)'; x.font = `500 20px ${F}`; x.fillText(s, 556, y + 7); });
      x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(24, 498, 720, 6); x.fillStyle = '#30c1f8'; x.fillRect(24, 498, 720 * (0.25 + p * 0.5), 6);
      tex.needsUpdate = true;
      return n ? pts[Math.min(n, pts.length) - 1] : pts[0];
    };
    // the stylus, its tip on the current point of the stroke
    const pen = new THREE.Group(); tab.add(pen);
    const stick = new THREE.Group(); stick.rotation.set(1.0, 0, -0.4); pen.add(stick); // standing out of the screen, leaning right
    stick.add(mesh(new THREE.CylinderGeometry(0.0085, 0.0085, 0.24, 24), P({ color: 0xf3f3f3, roughness: 0.35, clearcoat: 0.6 }), 0, 0.135, 0));
    stick.add(mesh(new THREE.ConeGeometry(0.0085, 0.025, 24), M.alu, 0, 0.0125, 0).rotateX(Math.PI));
    stick.add(mesh(new THREE.CylinderGeometry(0.0088, 0.0088, 0.012, 24), M.alu, 0, 0.21, 0));
    let p = 0, hold = 0, play = 0;
    return {
      g, frame: { target: [0, 0.17, 0.02], dist: 1.42, az: 0.3, el: 0.5 }, top: 0.45, dustN: 12000,
      shadows: [[0, 0.02, 0.85, 0.6, 0.9]],
      anim(t, h, dt) {
        const d = dt || 0; play = (play + d * 0.05) % 1;
        if (hold > 0) { hold -= d; if (hold <= 0) p = 0; } else { p += d * lerp(0.16, 0.42, h); if (p >= 1) { p = 1; hold = 1.6; } }
        const [px, py] = draw(p, p >= 1, play);
        const lift = hold > 0 ? 0.03 : 0;
        pen.position.set((px / 768 - 0.5) * SW, TH / 2 + (0.5 - py / 512) * SH, 0.003 + lift);
      },
    };
  },

  // Sports: a football on a disc of turf, a tracking ring round it; hover: it lifts and spins, and the predicted
  // path of the ball lights up ahead of it
  sports() {
    const g = new THREE.Group();
    const turf = canvasTex(512, 512, (x, w, h) => {
      for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#2f6b3d' : '#367a46'; x.fillRect(i * 64, 0, 64, h); }
      for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'},0.05)`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = 7; x.beginPath(); x.arc(256, 256, 150, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.moveTo(256, 0); x.lineTo(256, 512); x.stroke(); x.fillStyle = '#fff'; x.beginPath(); x.arc(256, 256, 9, 0, 7); x.fill();
    });
    const turfM = P({ map: turf, roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color(0x9fe0a8) });
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.82, 0.05, 128), [M.dark, turfM, M.dark]).translateY(0.025));
    const ringM = glowMat(CYAN, 1.2); const ring = mesh(new THREE.TorusGeometry(0.2, 0.004, 8, 96).rotateX(Math.PI / 2), ringM, 0, 0.053, 0, { tone: 1 }); g.add(ring);
    const R = 0.17, ball = new THREE.Group(); ball.position.y = 0.05 + R; g.add(ball);
    ball.add(mesh(new THREE.SphereGeometry(R, 96, 64), P({ map: ballTex(), roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2 })));
    // the predicted path: dots on an arc
    const path = new THREE.QuadraticBezierCurve3(new V3(0, 0.22, 0), new V3(-0.1, 0.75, -0.55), new V3(-0.25, 0.25, -1.1));
    const dots = Array.from({ length: 14 }, (_, i) => { const s = sprite(CYAN, 0.05, 0); path.getPoint((i + 1) / 15, s.position); g.add(s); return s; });
    let lift = 0, spin = 0;
    return {
      g, frame: { target: [-0.05, 0.22, -0.15], dist: 2.2, az: 0.55, el: 0.24 }, top: 0.6, dustN: 12000,
      shadows: [[0, 0, 1.9, 1.9, 0.85]],
      anim(t, h, dt) {
        lift = lerp(lift, h, 0.05); spin += (dt || 0) * lerp(0.4, 5, lift);
        ball.position.y = 0.05 + R + lift * (0.12 + Math.abs(Math.sin(t * 2.4)) * 0.05);
        ball.rotation.set(spin * 0.8, spin * 0.3, 0);
        ring.scale.setScalar(1 + Math.sin(t * 2) * 0.04 + lift * 0.15); ringM.color.set(CYAN).multiplyScalar(0.8 + lift * 1.6);
        dots.forEach((s, i) => { s.material.opacity = lift * (0.35 + 0.55 * Math.max(0, Math.sin(t * 4 - i * 0.5))); });
      },
    };
  },
});

// a football's panels: twelve black pentagons and twenty white hexagons with seams between them, drawn once into an
// equirectangular texture (the sphere's own mapping), from the icosahedron the pattern is cut from
let BALL = null;
function ballTex() {
  if (BALL) return BALL;
  const ph = (1 + Math.sqrt(5)) / 2, V = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) V.push([0, a, b * ph], [a, b * ph, 0], [b * ph, 0, a]);
  const nrm = (v) => { const l = Math.hypot(...v); return v.map((c) => c / l); };
  const pent = V.map(nrm), hexs = [];
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
    const d = (p, q) => Math.hypot(V[p][0] - V[q][0], V[p][1] - V[q][1], V[p][2] - V[q][2]);
    if (Math.abs(d(i, j) - 2) < 1e-6 && Math.abs(d(j, k) - 2) < 1e-6 && Math.abs(d(i, k) - 2) < 1e-6) hexs.push(nrm([0, 1, 2].map((c) => V[i][c] + V[j][c] + V[k][c])));
  }
  const centers = [...pent.map((v) => [v, 0.3, 1]), ...hexs.map((v) => [v, 0.352, 0])];
  BALL = canvasTex(1024, 512, (x, w, h) => {
    const img = x.createImageData(w, h), D = img.data;
    for (let py = 0; py < h; py++) {
      const th = ((py + 0.5) / h) * Math.PI, st = Math.sin(th), ct = Math.cos(th);
      for (let px = 0; px < w; px++) {
        const fi = ((px + 0.5) / w) * Math.PI * 2, d = [-Math.cos(fi) * st, ct, Math.sin(fi) * st];
        let b1 = 9, b2 = 9, isP = 0;
        for (const [c, r, p] of centers) { const s = Math.acos(Math.min(1, c[0] * d[0] + c[1] * d[1] + c[2] * d[2])) - r; if (s < b1) { b2 = b1; b1 = s; isP = p; } else if (s < b2) b2 = s; }
        const seam = 1 - Math.min(1, Math.max(0, (b2 - b1 - 0.006) / 0.01));
        let v = isP ? 24 : 238; v = v * (1 - seam * 0.55) + (isP ? 70 : 120) * seam * 0.55;
        const i = (py * w + px) * 4; D[i] = D[i + 1] = D[i + 2] = v; D[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
  });
  return BALL;
}

Object.assign(DESCRIBE, {
  oilgas: 'A pumpjack nodding over its well, with a sensor ring sending readings. Hover: it pumps faster and the readings stream.',
  sme: 'A small shopfront with its window, awning and door. Hover: the shop opens, the lights come up and the OPEN sign glows.',
  school: 'A white model of a school with a clock tower and a flag. Hover: the classrooms light up row by row and the clock runs.',
  onlineedu: 'A tablet with a stylus writing out a lesson beside the lesson video. Hover: it writes faster and ticks off the step.',
  sports: 'A football on a disc of turf with a tracking ring. Hover: it lifts and spins, and its predicted path lights up.',
});
