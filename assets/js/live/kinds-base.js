// Data Center, Partner Services and Meeting Rooms: live pictures (style A, studio dark), plus the meeting room
// options the set is made from (display, conference camera, touch panel, 360° speaker).
import { THREE, BUILD, DESCRIBE, CYAN, LED_GEO, M, PANEL, T, U, U1, V2, V3, VS_UV, blink, canvasTex, clamp, fine, glowMat, hash, ledMats, lensGroup, lerp, materials, mesh, panelTex, puck, rack, rbox, reduce, rng, smooth, smoothed, textures, unit } from './kit.js';

Object.assign(BUILD, {
  // Data Center / Infrastructure: a row of three racks; on hover the middle door swings open and a server slides out
  server() {
    const g = new THREE.Group(), leds = ledMats();
    const a = rack(leds, 11, false), b = rack(leds, 3, true), c = rack(leds, 23, false);
    a.g.position.x = -0.61; c.g.position.x = 0.61; g.add(a.g, b.g, c.g);
    const z0 = b.slide.position.z;
    return {
      g, frame: { target: [0, 0.68, 0.1], dist: 4.15, az: 0.6, el: 0.16 }, top: 1.42, dustN: 26000,
      shadows: [[0, 0, 2.6, 1.5, 0.9]],
      anim(t, h) { b.door.rotation.y = -smooth(0, 0.65, h) * 1.55; b.slide.position.z = z0 + smooth(0.35, 1, h) * 0.3; blink(leds, t); },
    };
  },

  // Partner Services: one hub, four cloud platforms (Microsoft Azure, AWS, Google Cloud, Oracle) as glass tiles in
  // their colours, linked to it; on hover they pull in to the hub and the links run faster
  partner() {
    const g = new THREE.Group(), Hh = 0.12;
    g.add(mesh(puck(0.36, Hh, 0.045, 0.29), M.alu));
    g.add(mesh(new THREE.CircleGeometry(0.29, 96).rotateX(-Math.PI / 2), M.gloss, 0, Hh - 0.005, 0));
    const ringM = glowMat(CYAN, 2), ring = mesh(new THREE.TorusGeometry(0.2, 0.005, 8, 128).rotateX(Math.PI / 2), ringM, 0, Hh - 0.002, 0, { tone: 1 }); g.add(ring);
    g.add(mesh(new THREE.TorusGeometry(0.11, 0.003, 8, 96).rotateX(Math.PI / 2), glowMat(CYAN, 0.8), 0, Hh - 0.002, 0, { tone: 1 }));
    g.add(mesh(new THREE.CircleGeometry(0.028, 48).rotateX(-Math.PI / 2), glowMat('#ffffff', 1.6), 0, Hh - 0.0015, 0, { tone: 1 }));
    const hubGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: CYAN, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    hubGlow.scale.setScalar(0.9); hubGlow.position.y = Hh + 0.02; g.add(hubGlow);
    const COL = ['#2f8cff', '#ff9f1c', '#3ccf6e', '#ff4d3d'], Y = [0.42, 0.3, 0.5, 0.34], tiles = [];
    const lineM = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    const pulseM = new THREE.SpriteMaterial({ map: textures().radial, color: '#bdf0ff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    COL.forEach((c, i) => {
      const a = Math.PI / 4 + i * (Math.PI / 2), tg = new THREE.Group();
      tg.add(mesh(rbox(0.4, 0.06, 0.4, 0.026), M.glass, 0, 0, 0, { w: 0.6 }));
      tg.add(mesh(rbox(0.31, 0.012, 0.31, 0.006), M.alu, 0, -0.012, 0));
      tg.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 40), glowMat(c, 2.6), 0, -0.002, 0, { tone: 2 }));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: c, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.setScalar(0.5); tg.add(halo); g.add(tg);
      const line = new THREE.Line(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(41 * 3), 3)), lineM); line.frustumCulled = false; g.add(line);
      const pulses = [0, 1, 2].map(() => { const s = new THREE.Sprite(pulseM.clone()); s.scale.setScalar(0.06); g.add(s); return s; });
      tiles.push({ tg, a, y: Y[i], ph: i * 1.7, line, pulses });
    });
    const curve = new THREE.QuadraticBezierCurve3(new V3(), new V3(), new V3()), tmp = new V3();
    let spin = 0, K = 1;
    return {
      theme(light) { K = light ? 0.16 : 1; if (light) for (const o of tiles) for (const p of o.pulses) { p.material.color.set(CYAN); p.material.alphaMap = p.material.map; p.material.map = null; p.material.blending = THREE.NormalBlending; p.scale.setScalar(0.045); } for (const o of tiles) o.tg.children[3].material.opacity = 0.5 * K; lineM.opacity = light ? 0.9 : 0.55; lineM.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending; },
      g, frame: { target: [0, 0.2, 0], dist: 3.5, az: 0.7, el: 0.48 }, top: 0.6, dustN: 16000,
      shadows: [[0, 0, 1.2, 1.2, 0.85], [0, 0, 2.6, 2.6, 0.25]],
      anim(t, h, dt) {
        spin += (dt || 0) * lerp(0.06, 0.02, h); g.rotation.y = spin;
        const speed = lerp(0.28, 0.75, h);
        ringM.color.set(CYAN).multiplyScalar(1.6 + Math.sin(t * 2.2) * 0.5 + h * 1.6); hubGlow.material.opacity = (0.3 + h * 0.3) * K;
        for (const o of tiles) {
          const r = lerp(0.88, 0.7, h), y = o.y * lerp(1, 0.7, h) + Math.sin(t * 0.8 + o.ph) * 0.03;
          o.tg.position.set(Math.cos(o.a) * r, y, Math.sin(o.a) * r);
          o.tg.rotation.set(Math.sin(t * 0.6 + o.ph) * 0.06, 0, Math.cos(t * 0.5 + o.ph) * 0.06);
          curve.v0.set(Math.cos(o.a) * 0.34, Hh * 0.55, Math.sin(o.a) * 0.34);
          curve.v1.set(Math.cos(o.a) * r * 0.8, 0.04, Math.sin(o.a) * r * 0.8);
          curve.v2.set(o.tg.position.x, y - 0.035, o.tg.position.z);
          const arr = o.line.geometry.attributes.position.array;
          for (let k = 0; k <= 40; k++) { curve.getPoint(k / 40, tmp); arr.set([tmp.x, tmp.y, tmp.z], k * 3); }
          o.line.geometry.attributes.position.needsUpdate = true;
          o.pulses.forEach((s, j) => { const k = (t * speed + o.ph * 0.37 + j / 3) % 1; curve.getPoint(k, s.position); s.material.opacity = Math.sin(k * Math.PI) * (0.7 + h * 0.3) * (K < 1 ? 0.8 : 1); });
        }
      },
    };
  },

  // Meeting Rooms & Video Conferencing: the display on its stand at the back, the conference camera and the speaker
  // on low podiums either side, the touch panel in front; on hover everything reacts together (the screen wakes, the
  // camera and the speaker's light turn to the pointer, the Join button pulses)
  meetset() {
    const g = new THREE.Group(), parts = [], shadows = [];
    const podium = (r, h, x, z) => { g.add(mesh(new THREE.CylinderGeometry(r, r, h, 96), M.paint, x, h / 2, z)); g.add(mesh(new THREE.TorusGeometry(r - 0.004, 0.0025, 8, 128).rotateX(Math.PI / 2), glowMat(CYAN, 0.6), x, h - 0.001, z, { tone: 1 })); shadows.push([x, z, r * 3, r * 3, 0.9]); return h; };
    const place = (o, x, y, z, ry, sc, sh) => { o.g.position.set(x, y, z); o.g.rotation.y = ry; o.g.scale.setScalar(sc); g.add(o.g); parts.push(o); if (sh) shadows.push([x, z, sh[0] * sc, sh[1] * sc, sh[2]]); };
    place(BUILD.display(), -0.25, 0, -0.75, 0.12, 1, [0.95, 0.75, 0.9]);
    const hc = podium(0.34, 0.3, 0.95, 0.05); place(BUILD.ptz(), 0.95, hc, 0.05, -0.3, 0.95, null);
    const hs = podium(0.24, 0.16, -0.95, 0.3); place(BUILD.tower(), -0.95, hs, 0.3, 0, 1, null);
    place(BUILD.panel({ bar: false }), 0.08, 0, 0.55, -0.05, 0.85, [0.75, 0.6, 0.9]);
    return {
      g, frame: { target: [0, 0.86, -0.05], dist: 5.3, az: 0.32, el: 0.12 }, top: 1.9, dustN: 26000, shadows,
      anim(t, h, dt, st) { for (const o of parts) o.anim(t, h, dt, st); },
    };
  },

  // Meeting room option 1: a display on a floor stand with a video bar; a slide is being shared, three people on
  // camera beside it, the one speaking outlined; on hover the screen wakes and the camera light comes on
  display() {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.84, 0.036, 0.52, 0.015), M.dark, 0, 0.018, 0));
    g.add(mesh(rbox(0.13, 1.2, 0.06, 0.026), M.alu, 0, 0.62, -0.065));
    const disp = new THREE.Group(); disp.position.set(0, 1.42, -0.01); g.add(disp);
    disp.add(mesh(rbox(1.74, 0.99, 0.042, 0.014), M.alu));
    disp.add(mesh(new THREE.PlaneGeometry(1.71, 0.962), M.gloss, 0, 0, 0.0212));
    const uWake = { value: 0.85 };
    disp.add(mesh(new THREE.PlaneGeometry(1.68, 0.945), new THREE.ShaderMaterial({ uniforms: { uTime: U.time, uWake }, vertexShader: VS_UV, fragmentShader: SCREEN2 }), 0, 0, 0.0216, { tone: 3 }));
    disp.add(mesh(new THREE.PlaneGeometry(1.71, 0.962), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.12, clearcoat: 1, depthWrite: false }), 0, 0, 0.0222, { noDust: true }));
    const bar = new THREE.Group(); bar.position.set(0, 0.495 + 0.034, 0); disp.add(bar);
    bar.add(mesh(new THREE.CapsuleGeometry(0.032, 0.6, 8, 24).rotateZ(Math.PI / 2), M.knit));
    bar.add(mesh(rbox(0.26, 0.042, 0.012, 0.006), M.gloss, 0, 0, 0.029));
    const bl = lensGroup(0.014); bl.position.z = 0.035; bar.add(bl);
    const camLed = glowMat('#7dffb0', 0.2); bar.add(mesh(new THREE.SphereGeometry(0.0035, 12, 8), camLed, 0.034, 0.012, 0.036, { tone: 1 }));
    return {
      g, frame: { target: [0, 1.0, 0], dist: 4.4, az: 0.3, el: 0.1 }, top: 1.95, dustN: 16000,
      shadows: [[0, 0, 0.95, 0.75, 0.9], [0, 0, 2.2, 0.8, 0.3]],
      anim(t, h) { uWake.value = 0.95 + h * 0.15; camLed.color.set('#7dffb0').multiplyScalar(0.2 + h * 2.6); },
    };
  },

  // Meeting room option 2: a conference camera (pan and tilt). It slowly scans the room on its own; on hover it turns
  // to follow the pointer and its light ring and tally light come on
  ptz() {
    const g = new THREE.Group();
    g.add(mesh(puck(0.32, 0.075, 0.032, 0.22), M.alu));
    g.add(mesh(new THREE.CircleGeometry(0.22, 64).rotateX(-Math.PI / 2), M.gloss, 0, 0.0695, 0));
    const ring = glowMat(CYAN, 1); g.add(mesh(new THREE.TorusGeometry(0.262, 0.0035, 8, 128).rotateX(Math.PI / 2), ring, 0, 0.073, 0, { tone: 1 }));
    const pan = new THREE.Group(); pan.position.y = 0.07; g.add(pan);
    pan.add(mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.07, 64), M.dark, 0, 0.035, 0));
    pan.add(mesh(rbox(0.5, 0.045, 0.16, 0.018), M.alu, 0, 0.09, 0));
    for (const s of [-1, 1]) {
      pan.add(mesh(rbox(0.045, 0.3, 0.16, 0.018), M.alu, s * 0.2275, 0.24, 0));
      pan.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 48).rotateZ(Math.PI / 2), M.dark, s * 0.255, 0.3, 0));
    }
    const tilt = new THREE.Group(); tilt.position.y = 0.3; pan.add(tilt);
    tilt.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.396, 96).rotateZ(Math.PI / 2), M.gloss));
    for (const s of [-1, 1]) tilt.add(mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.006, 96).rotateZ(Math.PI / 2), M.alu, s * 0.2, 0, 0));
    const ln = lensGroup(0.088); ln.position.z = 0.148; tilt.add(ln);
    const tally = glowMat('#ff4d5e', 0.2); tilt.add(mesh(new THREE.SphereGeometry(0.008, 12, 8), tally, 0.115, 0.075, 0.125, { tone: 2 }));
    let pa = 0.3, ta = 0.05;
    return {
      g, frame: { target: [0, 0.27, 0], dist: 2.3, az: 0.45, el: 0.17 }, top: 0.55, dustN: 14000,
      shadows: [[0, 0, 0.95, 0.95, 0.95]],
      anim(t, h, dt, st) {
        const fx = st ? st.x : 0, fy = st ? st.y : 0;
        const scan = Math.sin(t * 0.32) * 0.55 + Math.sin(t * 0.11) * 0.2 + 0.3;
        pa = lerp(pa, lerp(scan, 0.45 + fx * 0.8, h), 0.06); ta = lerp(ta, lerp(0.04 + Math.sin(t * 0.23) * 0.06, -0.06 + fy * 0.4, h), 0.06);
        pan.rotation.y = pa; tilt.rotation.x = ta;
        ring.color.set(CYAN).multiplyScalar(0.7 + h * 1.8 + Math.sin(t * 1.8) * 0.15);
        tally.color.set('#ff4d5e').multiplyScalar(0.25 + h * 2.8);
      },
    };
  },

  // Meeting room option 3: a video bar on its stand and the touch panel on the table, ready to join; on hover the
  // join button pulses and the bar's camera light comes on
  panel(opt = {}) {
    const g = new THREE.Group();
    const bar = new THREE.Group(); bar.position.set(0, 0.6, -0.3); if (opt.bar !== false) g.add(bar);
    bar.add(mesh(new THREE.CapsuleGeometry(0.055, 0.9, 10, 40).rotateZ(Math.PI / 2), M.knit));
    bar.add(mesh(rbox(0.46, 0.072, 0.02, 0.012), M.gloss, 0, 0, 0.047));
    const bl = lensGroup(0.026); bl.position.z = 0.057; bar.add(bl);
    for (const s of [-1, 1]) bar.add(mesh(new THREE.CircleGeometry(0.005, 24), M.dark, s * 0.15, 0, 0.0575));
    const barLed = glowMat('#7dffb0', 0.2); bar.add(mesh(new THREE.SphereGeometry(0.004, 12, 8), barLed, 0.055, 0.022, 0.058, { tone: 1 }));
    const stand = new THREE.Group(); stand.position.set(0.02, 0, 0.22); stand.rotation.y = -0.1; stand.scale.setScalar(1.45); g.add(stand);
    stand.add(mesh(rbox(0.36, 0.02, 0.22, 0.008), M.alu, 0, 0.01, 0));
    const tab = new THREE.Group(); tab.position.set(0, 0.02, 0.06); tab.rotation.x = -0.62; stand.add(tab);
    tab.add(mesh(rbox(0.36, 0.25, 0.016, 0.01), M.dark, 0, 0.125, -0.008));
    tab.add(mesh(new THREE.PlaneGeometry(0.34, 0.225), new THREE.MeshBasicMaterial({ map: panelTex() }), 0, 0.125, 0.0005, { tone: 3 }));
    tab.add(mesh(new THREE.PlaneGeometry(0.34, 0.225), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.12, clearcoat: 1, depthWrite: false }), 0, 0.125, 0.001, { noDust: true }));
    const pulseM = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const pulse = mesh(new THREE.RingGeometry(0.85, 1, 64), pulseM, 0, 0.125 + (0.5 - 205 / 420) * 0.225, 0.0015, { noDust: true }); tab.add(pulse);
    const strut = mesh(rbox(0.24, 0.13, 0.012, 0.006), M.alu, 0, 0.08, -0.075); strut.rotation.x = 0.4; stand.add(strut);
    return {
      g, frame: { target: [0, 0.33, 0], dist: 2.35, az: 0.38, el: 0.2 }, top: 0.7, dustN: 14000,
      shadows: [[0, -0.3, 1.1, 0.3, 0.3], [0.02, 0.22, 0.75, 0.6, 0.9]],
      anim(t, h) {
        const k = (t * 0.7) % 1;
        pulse.scale.setScalar(0.04 + k * 0.035); pulseM.opacity = (1 - k) * (0.15 + h * 0.7);
        barLed.color.set('#7dffb0').multiplyScalar(0.2 + h * 2.6);
        bar.position.y = 0.6 + Math.sin(t * 0.8) * 0.008;
      },
    };
  },

  // Meeting room option 4: a 360° camera and speaker for the middle of the table; a bright arc on its light ring
  // turns to whoever is speaking (on hover, towards the pointer)
  tower() {
    const g = new THREE.Group(), R = 0.15, Ht = 0.4, rr = 0.06, prof = [new V2(0, 0)];
    for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * (Math.PI / 2); prof.push(new V2(R - rr + Math.cos(a) * rr, rr + Math.sin(a) * rr)); }
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * (Math.PI / 2); prof.push(new V2(R - rr + Math.cos(a) * rr, Ht - rr + Math.sin(a) * rr)); }
    prof.push(new V2(0, Ht));
    g.add(mesh(new THREE.LatheGeometry(prof, 128), M.knit));
    g.add(mesh(new THREE.CircleGeometry(R - rr + 0.004, 96).rotateX(-Math.PI / 2), M.gloss, 0, Ht + 0.0015, 0));
    g.add(mesh(new THREE.TorusGeometry(0.066, 0.0022, 8, 128).rotateX(Math.PI / 2), glowMat(CYAN, 0.45), 0, Ht + 0.003, 0, { tone: 1 }));
    const arcM = glowMat(CYAN, 2.6), dir = new THREE.Group(); dir.position.y = Ht + 0.003; g.add(dir);
    dir.add(mesh(new THREE.TorusGeometry(0.066, 0.0048, 8, 48, 0.95).rotateX(Math.PI / 2), arcM, 0, 0, 0, { tone: 1 }));
    g.add(mesh(new THREE.CircleGeometry(0.012, 32).rotateX(-Math.PI / 2), glowMat('#ffffff', 0.8), 0, Ht + 0.0025, 0, { tone: 1 }));
    g.add(mesh(new THREE.CylinderGeometry(R + 0.002, R + 0.002, 0.055, 128, 1, true), M.gloss, 0, Ht - rr - 0.04, 0));
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4, l = lensGroup(0.011); l.position.set(Math.sin(a) * (R + 0.002), Ht - rr - 0.04, Math.cos(a) * (R + 0.002)); l.rotation.y = a; g.add(l); }
    g.add(mesh(new THREE.TorusGeometry(0.1, 0.004, 8, 96).rotateX(Math.PI / 2), M.alu, 0, 0.004, 0));
    let spot = 0.4;
    return {
      g, frame: { target: [0, 0.2, 0], dist: 1.6, az: 0.4, el: 0.3 }, top: 0.42, dustN: 12000,
      shadows: [[0, 0, 0.5, 0.5, 0.95]],
      anim(t, h, dt, st) {
        const seat = [0.4, 1.9, -1.2, 2.9][Math.floor(t / 3.2) % 4], fx = st ? st.x : 0;
        spot = lerp(spot, lerp(seat, Math.PI / 2 - 0.4 - fx * 1.4, h), 0.05);
        dir.rotation.y = 0.475 - spot;
        arcM.color.set(CYAN).multiplyScalar(1.8 + h * 1.6 + Math.sin(t * 6) * Math.sin(t * 2.3) * 0.5);
      },
    };
  },

  // Meeting Rooms & Video Conferencing: a display with a video bar on a slatted wall, the end of the table with a
  // microphone and a laptop; the call cycles its speaker, and on hover the screen wakes up fully
  meeting() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.PlaneGeometry(6, 6).rotateX(-Math.PI / 2), M.carpet, 0, 0, 1.2, { noDust: true }));
    g.add(mesh(new THREE.BoxGeometry(3.8, 2.4, 0.04), M.felt, 0, 1.2, -0.09, { w: 0.05, e: 0.2 }));
    const n = 76, slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 2.4, 0.03), M.walnut, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) slats.setMatrixAt(i, m4.makeTranslation(-1.875 + i * 0.05, 1.2, -0.055));
    slats.userData.w = 0.12; slats.userData.e = 0.12; g.add(slats);
    const disp = new THREE.Group(); disp.position.set(0, 1.36, 0); g.add(disp);
    disp.add(mesh(rbox(1.66, 0.95, 0.045, 0.01), M.dark, 0, 0, 0));
    const uWake = { value: 0.75 };
    const screen = mesh(new THREE.PlaneGeometry(1.62, 0.912), new THREE.ShaderMaterial({ uniforms: { uTime: U.time, uWake }, vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: SCREEN }), 0, 0, 0.0235, { tone: 3, noDust: true });
    disp.add(screen);
    disp.add(mesh(new THREE.PlaneGeometry(1.62, 0.912), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.14, clearcoat: 1, depthWrite: false }), 0, 0, 0.0245, { noDust: true }));
    const bar = new THREE.Group(); bar.position.set(0, 0.475 + 0.036, 0.012); disp.add(bar);
    bar.add(mesh(new THREE.CapsuleGeometry(0.032, 0.62, 8, 24).rotateZ(Math.PI / 2), M.fabric));
    bar.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 40).rotateX(Math.PI / 2), M.gloss, 0, 0, 0.031));
    bar.add(mesh(new THREE.TorusGeometry(0.021, 0.0018, 8, 48), glowMat(CYAN, 1.2), 0, 0, 0.037, { tone: 1 }));
    const camLed = glowMat('#ffffff', 0.2); bar.add(mesh(new THREE.SphereGeometry(0.004, 12, 8), camLed, 0.045, 0, 0.03, { tone: 1 }));
    // the table, its pedestal, a microphone puck and a laptop
    g.add(mesh(rbox(1.1, 0.05, 1.5, 0.022), M.oak, 0, 0.745, 1.6, { w: 0.45 }));
    g.add(mesh(rbox(0.44, 0.72, 0.9, 0.02), M.dark, 0, 0.36, 1.6, { w: 0.4 }));
    g.add(mesh(puck(0.065, 0.018, 0.008, 0.05), M.dark, 0, 0.77, 1.1));
    const micM = glowMat(CYAN, 1.5); g.add(mesh(new THREE.TorusGeometry(0.055, 0.0025, 8, 64).rotateX(Math.PI / 2), micM, 0, 0.789, 1.1, { tone: 1 }));
    const lap = new THREE.Group(); lap.position.set(0.26, 0.77, 1.9); lap.rotation.y = 0.3; g.add(lap);
    lap.add(mesh(rbox(0.32, 0.014, 0.22, 0.006), M.alu, 0, 0.007, 0));
    const lid = new THREE.Group(); lid.position.set(0, 0.014, -0.108); lid.rotation.x = -0.28; lap.add(lid);
    lid.add(mesh(rbox(0.32, 0.215, 0.008, 0.005), M.alu, 0, 0.1075, 0));
    lid.add(mesh(new THREE.PlaneGeometry(0.29, 0.18), glowMat('#1b3a57', 1), 0, 0.11, 0.0045, { tone: 3 }));
    return {
      g, frame: { target: [0, 1.12, 0.5], dist: 4.05, az: 0.34, el: 0.17 }, top: 1.9, dustN: 24000,
      shadows: [[0, 1.6, 1.6, 2.2, 0.55], [0, 0, 3.8, 0.5, 0.5]],
      // the screen in the dust style: a dot-matrix grid showing the call
      dustGrid() {
        const pos = [], tint = [];
        for (let i = 0; i < 112; i++) for (let j = 0; j < 63; j++) {
          const x = ((i + 0.5) / 112 - 0.5) * 1.62, y = 1.36 + ((j + 0.5) / 63 - 0.5) * 0.912, k = this.dustTint(x, y);
          if (k > 0.1) { pos.push(x, y, 0.024); tint.push(k); }
        }
        return { pos, tint };
      },
      dustTint(x, y) {
        const px = (x / 1.62) * 1.7778, py = (y - 1.36) / 0.912;
        if (Math.abs(py + 0.442) < 0.03 && Math.abs(px) < 0.17) return 0.9;
        for (let i = 0; i < 4; i++) {
          const cx = i % 2 ? 0.405 : -0.405, cy = i < 2 ? 0.215 : -0.175, qx = px - cx, qy = py - cy;
          if (Math.abs(qx) > 0.39 || Math.abs(qy) > 0.185) continue;
          const ox = Math.sin(i * 3.7) * 0.06, head = Math.hypot(qx - ox, (qy - 0.035) * 0.86) < 0.055, sh = Math.hypot((qx - ox) / 0.15, (qy + 0.16) / 0.1) < 1;
          return head || sh ? 0.3 : 1.25;
        }
        return 0.08;
      },
      anim(t, h) {
        uWake.value = 0.72 + h * 0.4;
        camLed.color.set('#7dffb0').multiplyScalar(0.15 + h * 2.6);
        micM.color.set(CYAN).multiplyScalar(0.9 + (0.5 + 0.5 * Math.sin(t * 5.3) * Math.sin(t * 2.1)) * 1.4);
      },
    };
  },
});

// meeting room option 1's screen: a shared slide (title, bar chart, donut) and three people on camera beside it
const SCREEN2 = `uniform float uTime, uWake; varying vec2 vUv;
  float box(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  float soft(float d, float w) { return 1.0 - smoothstep(-w, w, d); }
  vec3 cam(vec2 q, float i, float t) {
    vec3 wall = i < 0.5 ? vec3(0.42, 0.38, 0.33) : i < 1.5 ? vec3(0.24, 0.30, 0.37) : vec3(0.33, 0.34, 0.31);
    vec3 col = mix(wall * 0.55, wall, smoothstep(-0.12, 0.12, q.y));
    vec2 lq = q - vec2(0.12, 0.07); col += vec3(0.9, 0.8, 0.6) * 0.14 * exp(-dot(lq, lq) * 50.0);
    float sway = sin(t * 0.7 + i * 2.0) * 0.006;
    float body = 1.0 - smoothstep(0.8, 1.1, length((q - vec2(sway * 0.6, -0.11)) / vec2(0.115, 0.075)));
    float head = 1.0 - smoothstep(0.78, 1.12, length((q - vec2(sway, 0.012)) / vec2(0.04, 0.05)));
    float hair = (1.0 - smoothstep(0.8, 1.1, length((q - vec2(sway, 0.03)) / vec2(0.044, 0.036)))) * smoothstep(0.015, 0.03, q.y);
    vec3 skin = i < 0.5 ? vec3(0.55, 0.38, 0.28) : i < 1.5 ? vec3(0.45, 0.31, 0.23) : vec3(0.6, 0.43, 0.33);
    vec3 cloth = i < 0.5 ? vec3(0.12, 0.16, 0.24) : i < 1.5 ? vec3(0.62, 0.63, 0.65) : vec3(0.22, 0.13, 0.13);
    col = mix(col, cloth, body); col = mix(col, skin, head); col = mix(col, vec3(0.06, 0.05, 0.05), hair * 0.92);
    return col;
  }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(1.7778, 1.0);
    vec3 col = vec3(0.025, 0.035, 0.055);
    float act = mod(floor(uTime / 3.5), 3.0);
    vec2 q = p - vec2(-0.2, 0.03); float inS = soft(box(q, vec2(0.64, 0.4), 0.018), 0.0015);
    vec3 sl = vec3(0.95, 0.96, 0.975);
    sl = mix(sl, vec3(0.05, 0.16, 0.27), soft(box(q - vec2(-0.33, 0.31), vec2(0.26, 0.022), 0.008), 0.0015));
    sl = mix(sl, vec3(0.72, 0.76, 0.8), soft(box(q - vec2(-0.41, 0.255), vec2(0.18, 0.009), 0.004), 0.0015));
    for (int i = 0; i < 6; i++) { float fi = float(i); float hg = 0.12 + 0.3 * (0.5 + 0.5 * sin(uTime * 0.5 + fi * 1.1));
      sl = mix(sl, mod(fi, 2.0) < 0.5 ? vec3(0.19, 0.76, 0.97) : vec3(0.05, 0.16, 0.27), soft(box(q - vec2(-0.5 + fi * 0.085, -0.3 + hg * 0.5), vec2(0.028, hg * 0.5), 0.004), 0.0015)); }
    sl = mix(sl, vec3(0.8, 0.83, 0.87), soft(box(q - vec2(-0.29, -0.302), vec2(0.27, 0.002), 0.0), 0.0012));
    vec2 dq = q - vec2(0.36, -0.04); float ang = atan(dq.y, dq.x) / 6.2832 + 0.5;
    sl = mix(sl, ang < 0.55 + 0.15 * sin(uTime * 0.4) ? vec3(0.19, 0.76, 0.97) : vec3(0.86, 0.89, 0.92), soft(abs(length(dq) - 0.13) - 0.035, 0.0015));
    col = mix(col, sl, inS);
    for (int i = 0; i < 3; i++) { float fi = float(i); vec2 tq = p - vec2(0.66, 0.27 - fi * 0.275); float td = box(tq, vec2(0.205, 0.125), 0.014);
      col = mix(col, cam(tq, fi, uTime), soft(td, 0.0015));
      col += vec3(0.19, 0.76, 0.97) * (1.0 - smoothstep(0.0, 0.004, abs(td + 0.002))) * (1.0 - step(0.5, abs(act - fi))) * 1.2; }
    col = mix(col, vec3(0.08, 0.1, 0.13), soft(box(p - vec2(-0.2, -0.45), vec2(0.15, 0.026), 0.026), 0.0015));
    for (int k = 0; k < 4; k++) { float fk = float(k); col = mix(col, k == 3 ? vec3(0.9, 0.25, 0.3) : vec3(0.75, 0.8, 0.86), 1.0 - smoothstep(0.009, 0.012, length(p - vec2(-0.305 + fk * 0.07, -0.45)))); }
    gl_FragColor = vec4(col * uWake, 1.0);
  }`;

// the call on the meeting room screen: four people in a grid, the one speaking outlined, a toolbar below
const SCREEN = `uniform float uTime, uWake; varying vec2 vUv;
  float box(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(1.7778, 1.0);
    vec3 col = vec3(0.02, 0.035, 0.06) + vec3(0.015, 0.03, 0.05) * (1.0 - vUv.y);
    float act = mod(floor(uTime / 3.2), 4.0);
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      vec2 c = vec2(mod(fi, 2.0) < 0.5 ? -0.405 : 0.405, fi < 1.5 ? 0.215 : -0.175);
      vec2 q = p - c;
      float d = box(q, vec2(0.39, 0.185), 0.025);
      float inside = 1.0 - smoothstep(-0.002, 0.002, d);
      vec3 t1 = fi < 0.5 ? vec3(0.40, 0.33, 0.28) : fi < 1.5 ? vec3(0.22, 0.29, 0.37) : fi < 2.5 ? vec3(0.30, 0.31, 0.33) : vec3(0.19, 0.32, 0.33);
      vec3 tile = mix(t1 * 0.55, t1, smoothstep(-0.2, 0.2, q.y));
      tile *= 1.0 - 0.4 * smoothstep(0.1, 0.5, length(q * vec2(0.8, 1.6)));
      float bob = sin(uTime * 0.9 + fi * 2.1) * 0.004, ox = sin(fi * 3.7) * 0.06;
      float head = 1.0 - smoothstep(0.05, 0.056, length((q - vec2(ox, 0.035 + bob)) * vec2(1.0, 0.86)));
      float sh = 1.0 - smoothstep(0.96, 1.04, length((q - vec2(ox, -0.16 + bob)) / vec2(0.15, 0.1)));
      tile = mix(tile, t1 * 0.28 + 0.025, max(head, sh));
      col = mix(col, tile, inside);
      float on = 1.0 - step(0.5, abs(act - fi));
      col += vec3(0.19, 0.76, 0.97) * (1.0 - smoothstep(0.0, 0.004, abs(d + 0.002))) * on * 1.2;
      col = mix(col, vec3(0.015, 0.02, 0.035), (1.0 - smoothstep(-0.001, 0.001, box(q - vec2(-0.29, -0.155), vec2(0.075, 0.014), 0.012))) * 0.7);
    }
    col = mix(col, vec3(0.08, 0.1, 0.13), 1.0 - smoothstep(-0.001, 0.001, box(p - vec2(0.0, -0.442), vec2(0.17, 0.028), 0.028)));
    for (int k = 0; k < 4; k++) { float fk = float(k); col = mix(col, k == 3 ? vec3(0.9, 0.25, 0.3) : vec3(0.75, 0.8, 0.86), 1.0 - smoothstep(0.011, 0.014, length(p - vec2(-0.12 + fk * 0.08, -0.442)))); }
    gl_FragColor = vec4(col * uWake, 1.0);
  }`;

Object.assign(DESCRIBE, {
  partner: 'One hub and the four cloud platforms. Hover: they pull in and the links speed up.',
  server: 'A row of racks. Hover: the middle door opens and a server slides out.',
  meetset: 'The display, the conference camera and the 360° speaker on podiums, and the touch panel. Hover: the screen wakes, the camera and the speaker\'s light turn to the pointer, and the Join button pulses.',
});
