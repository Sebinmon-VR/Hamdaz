// How We Do (solutions.html): live pictures (style A, studio dark) for the five steps of the method.
//   survey     01 Survey and understand: a 3D laser scanner on a tripod, scanning the room into points
//   blueprint  02 Design: a drafting board where a floor plan draws itself, the pencil following the line
//   deliver    03 Supply and deliver: an aluminium flight case; a server rises out of it, its lights on
//   handover   04 Hand over and train: the as-built handover folder, signed and stamped
//   support    05 Support and improve: a service-status screen with a support headset beside it
import { THREE, BUILD, DESCRIBE, M, CYAN, mesh, rbox, puck, glowMat, canvasTex, textures, lerp, smooth, hash, rng, V3, ledMats, unit } from '../../assets/js/live/kit.js';

const P = (o) => new THREE.MeshPhysicalMaterial(o);
const F = '"Segoe UI", system-ui, sans-serif';
const UP = new THREE.Vector3(0, 1, 0);
// a round bar from a to b
const rod = (a, b, r, mat, seg = 20) => { const d = new THREE.Vector3().subVectors(b, a), len = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, seg), mat); m.scale.set(1, len, 1); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); return m; };
const sprite = (col, size, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(size); return s; };
// a canvas texture that is redrawn while it animates
const dynTex = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, x: c.getContext('2d'), t }; };
const glassOver = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.1, clearcoat: 1, depthWrite: false }));
const rr = (x, px, py, w, h, r) => { x.beginPath(); x.roundRect(px, py, w, h, r); };

Object.assign(BUILD, {
  // 01 Survey and understand: a laser scanner on a tripod turns slowly, its laser line sweeping the floor and the
  // room appearing as points behind it. Hover: it turns faster and the whole scan lights up
  survey() {
    const g = new THREE.Group();
    const white = P({ color: 0xe9ecef, metalness: 0.1, roughness: 0.36, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const hubY = 0.52;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5, foot = new V3(Math.cos(a) * 0.38, 0.02, Math.sin(a) * 0.38), top = new V3(Math.cos(a) * 0.05, hubY, Math.sin(a) * 0.05);
      g.add(rod(top, foot, 0.012, M.alu));
      g.add(rod(top.clone().lerp(foot, 0.4), top.clone().lerp(foot, 0.48), 0.018, M.dark));
      g.add(mesh(new THREE.ConeGeometry(0.015, 0.035, 12).rotateX(Math.PI), M.dark, foot.x, 0.018, foot.z));
    }
    g.add(mesh(puck(0.085, 0.035, 0.012, 0), M.dark, 0, hubY - 0.01, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.065, 0.072, 0.03, 48), M.alu, 0, hubY + 0.04, 0));
    const head = new THREE.Group(); head.position.y = hubY + 0.055; g.add(head);
    head.add(mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.05, 64), M.dark, 0, 0.025, 0));
    const ring = glowMat(CYAN, 1.2); head.add(mesh(new THREE.TorusGeometry(0.096, 0.003, 8, 96).rotateX(Math.PI / 2), ring, 0, 0.048, 0, { tone: 1 }));
    for (const s of [-1, 1]) head.add(mesh(rbox(0.055, 0.26, 0.17, 0.022), white, s * 0.088, 0.18, 0));
    head.add(mesh(rbox(0.235, 0.035, 0.17, 0.015), white, 0, 0.325, 0));
    head.add(mesh(rbox(0.13, 0.028, 0.045, 0.012), M.dark, 0, 0.36, 0));
    // the spinning mirror between the uprights
    const rotor = new THREE.Group(); rotor.position.set(0, 0.185, 0); head.add(rotor);
    rotor.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.118, 48).rotateZ(Math.PI / 2), M.lens));
    rotor.add(mesh(new THREE.PlaneGeometry(0.1, 0.07).rotateX(-Math.PI / 4), M.alu));
    // a small status screen on the side
    const scr = canvasTex(160, 112, (x, w, h) => { x.fillStyle = '#0c1c2c'; x.fillRect(0, 0, w, h); x.fillStyle = '#30c1f8'; x.fillRect(14, 70, 100, 8); x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(114, 70, 32, 8); x.fillStyle = 'rgba(255,255,255,0.8)'; x.font = `600 22px ${F}`; x.fillText('Scan', 14, 44); });
    const sm = mesh(new THREE.PlaneGeometry(0.11, 0.075), new THREE.MeshBasicMaterial({ map: scr }), 0.1165, 0.2, 0, { tone: 3 }); sm.rotation.y = Math.PI / 2; head.add(sm);
    // the laser line on the floor, turning with the head
    const lineTex = canvasTex(256, 8, (x, w) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(48,193,248,0)'); gr.addColorStop(0.1, 'rgba(48,193,248,1)'); gr.addColorStop(1, 'rgba(48,193,248,0)'); x.fillStyle = '#000'; x.fillRect(0, 0, w, 8); x.fillStyle = gr; x.fillRect(0, 0, w, 8); }, false);
    const lineM = new THREE.MeshBasicMaterial({ color: CYAN, map: lineTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 });
    const sweep = new THREE.Group(); sweep.position.y = 0.006; g.add(sweep);
    for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.01).translate(0.6, 0, 0).rotateX(-Math.PI / 2), lineM); l.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; sweep.add(l); }
    // the scan: points on the floor and on the walls of the room behind
    const pts = [], rnd = rng(11);
    for (let i = 0; i < 420; i++) { const r = 0.45 + Math.sqrt(rnd()) * 1.0, a = rnd() * Math.PI * 2; pts.push([Math.cos(a) * r, 0.006, Math.sin(a) * r]); }
    for (let i = 0; i < 520; i++) { const s = rnd(), y = Math.pow(rnd(), 1.4) * 0.9; let p; if (s < 0.5) p = [(rnd() - 0.5) * 2.8, y, -1.25]; else if (s < 0.75) p = [-1.4, y, -1.25 + rnd() * 2.0]; else p = [1.4, y, -1.25 + rnd() * 2.0]; pts.push(p); }
    const N = pts.length, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), ang = new Float32Array(N);
    pts.forEach((p, i) => { pos.set(p, i * 3); ang[i] = Math.atan2(p[2], p[0]); });
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const cloud = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.022, map: textures().radial, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    cloud.frustumCulled = false; cloud.userData.noDust = true; g.add(cloud);
    const cy = new THREE.Color(CYAN);
    let th = 0, spin = 0, on = 0;
    return {
      g, frame: { target: [0, 0.46, -0.1], dist: 2.95, az: 0.45, el: 0.2 }, top: 0.9, dustN: 12000,
      shadows: [[0, 0, 0.95, 0.95, 0.85]],
      anim(t, h, dt) {
        const d = dt || 0; on = lerp(on, h, 0.05);
        th += d * lerp(0.35, 1.4, on); spin += d * 20;
        head.rotation.y = th; sweep.rotation.y = th; rotor.rotation.x = spin;
        ring.color.copy(cy).multiplyScalar(0.9 + on * 1.6);
        const la = Math.PI / 2 - th;
        for (let i = 0; i < N; i++) {
          let dd = (ang[i] - la) % Math.PI; if (dd < 0) dd += Math.PI;
          const trail = Math.exp(-dd * 2.2), b = 0.05 + on * 0.5 + trail * (0.9 + on * 0.6);
          col[i * 3] = cy.r * b; col[i * 3 + 1] = cy.g * b; col[i * 3 + 2] = cy.b * b;
        }
        pg.attributes.color.needsUpdate = true;
      },
    };
  },

  // 02 Design: a drafting board with a blueprint; the floor plan draws itself (walls, doors, windows, then the
  // cameras and access points), the pencil following the line. Hover: it draws faster and the finished plan lights up
  blueprint() {
    const g = new THREE.Group();
    g.add(mesh(rbox(1.14, 0.05, 0.3, 0.015), M.paint, 0, 0.025, 0.06));
    const board = new THREE.Group(); board.position.set(0, 0.07, 0.16); board.rotation.x = 0.42; g.add(board);
    const BW = 1.04, BD = 0.74;
    board.add(mesh(rbox(BW, 0.03, BD, 0.012), P({ color: 0xdfe3e7, roughness: 0.55, clearcoat: 0.3 }), 0, -0.015, -BD / 2));
    board.add(mesh(rbox(BW + 0.02, 0.035, 0.035, 0.008), M.alu, 0, 0.012, 0.0));
    for (const s of [-1, 1]) g.add(rod(new V3(s * 0.4, 0.02, -0.55), new V3(s * 0.4, 0.3, -0.42), 0.012, M.alu));
    // the blueprint, drawn line by line
    const SW = 0.9, SH = 0.62, { x, t: tex } = dynTex(1024, 704);
    const sheet = mesh(new THREE.PlaneGeometry(SW, SH).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex }), 0, 0.0015, -BD / 2 - 0.01, { tone: 3 }); board.add(sheet);
    const strokes = [];
    const line = (pts, w = 5) => strokes.push({ pts, w });
    const seg = (x0, y0, x1, y1, w) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 8)); line(Array.from({ length: n + 1 }, (_, k) => [lerp(x0, x1, k / n), lerp(y0, y1, k / n)]), w); };
    const arc = (cx, cy, r, a0, a1) => line(Array.from({ length: 13 }, (_, k) => [cx + Math.cos(lerp(a0, a1, k / 12)) * r, cy + Math.sin(lerp(a0, a1, k / 12)) * r]), 3);
    seg(100, 100, 924, 100, 7); seg(924, 100, 924, 600, 7); seg(924, 600, 100, 600, 7); seg(100, 600, 100, 100, 7);
    seg(430, 100, 430, 300, 5); seg(430, 370, 430, 600, 5); seg(100, 380, 330, 380, 5); seg(400, 380, 430, 380, 5);
    seg(430, 300, 924, 300, 5); seg(680, 300, 680, 470, 5); seg(680, 540, 680, 600, 5);
    arc(430, 300, 70, Math.PI / 2, Math.PI); arc(330, 380, 70, 0, -Math.PI / 2); arc(680, 470, 70, Math.PI / 2, 0);
    for (const [x0, x1] of [[170, 300], [560, 720], [770, 880]]) { seg(x0, 92, x1, 92, 3); seg(x0, 108, x1, 108, 3); }
    const sym = [[260, 220], [690, 190], [560, 470], [800, 460], [230, 500]];
    for (const [cx, cy] of sym) arc(cx, cy, 16, 0, Math.PI * 2);
    const all = []; strokes.forEach((s, i) => s.pts.forEach((p, k) => all.push([i, k])));
    const draw = (p, done) => {
      x.fillStyle = '#103a63'; x.fillRect(0, 0, 1024, 704);
      x.strokeStyle = 'rgba(160,210,255,0.09)'; x.lineWidth = 1; for (let i = 0; i < 1024; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 704); x.stroke(); } for (let i = 0; i < 704; i += 32) { x.beginPath(); x.moveTo(0, i); x.lineTo(1024, i); x.stroke(); }
      x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 2; x.strokeRect(700, 628, 300, 60); x.beginPath(); x.moveTo(800, 628); x.lineTo(800, 688); x.stroke();
      x.fillStyle = 'rgba(255,255,255,0.6)'; x.font = `600 18px ${F}`; x.fillText('LEVEL 1', 716, 664); x.font = `500 15px ${F}`; x.fillText('Floor plan · rev B', 816, 664);
      if (done > 0) { x.fillStyle = `rgba(48,193,248,${0.16 * done})`; x.fillRect(430, 300, 494, 300); }
      const n = Math.floor(p * all.length);
      x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#f2f7ff';
      let last = all[0] ? strokes[0].pts[0] : [0, 0];
      for (let i = 0, c = 0; i < strokes.length && c < n; i++) {
        const s = strokes[i], m = Math.min(s.pts.length, n - c); x.lineWidth = s.w; x.beginPath();
        for (let k = 0; k < m; k++) { const [px, py] = s.pts[k]; if (k) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); c += m; last = s.pts[m - 1];
      }
      if (done > 0) for (const [cx, cy] of sym) { x.fillStyle = `rgba(48,193,248,${0.85 * done})`; x.beginPath(); x.arc(cx, cy, 10, 0, 7); x.fill(); x.strokeStyle = `rgba(48,193,248,${0.4 * done})`; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, 40, 0, 7); x.stroke(); }
      tex.needsUpdate = true;
      return last;
    };
    // the pencil, its tip on the line being drawn
    const pen = new THREE.Group(); board.add(pen);
    const stick = new THREE.Group(); stick.rotation.set(0.55, 0, -0.5); pen.add(stick);
    stick.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.2, 6), P({ color: 0x2a3540, roughness: 0.4, clearcoat: 0.5 }), 0, 0.125, 0));
    stick.add(mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.02, 16), M.alu, 0, 0.23, 0));
    stick.add(mesh(new THREE.ConeGeometry(0.009, 0.025, 6).rotateX(Math.PI), P({ color: 0xd8b98f, roughness: 0.7 }), 0, 0.0125, 0));
    // a scale ruler resting on the ledge
    board.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.46, 3).rotateZ(Math.PI / 2), M.alu, 0.2, 0.034, -0.012));
    let p = 0, hold = 0, done = 0;
    return {
      g, frame: { target: [0, 0.2, -0.12], dist: 2.25, az: 0.3, el: 0.58 }, top: 0.5, dustN: 12000,
      shadows: [[0, -0.12, 1.4, 1.0, 0.85]],
      anim(t, h, dt) {
        const d = dt || 0;
        if (hold > 0) { hold -= d; if (hold <= 0) p = 0; } else { p += d * lerp(0.1, 0.32, h); if (p >= 1) { p = 1; hold = 2.4; } }
        done = lerp(done, p >= 1 ? 1 : 0, 0.08);
        const [px, py] = draw(p, done);
        pen.position.set((px / 1024 - 0.5) * SW, 0.002 + (hold > 0 ? 0.04 : 0), -BD / 2 - 0.01 - (0.5 - py / 704) * SH);
      },
    };
  },

  // 03 Supply and deliver: an aluminium flight case. Hover: the lid opens and a server rises out of the foam, its
  // lights coming on
  deliver() {
    const g = new THREE.Group();
    const W = 0.9, D = 0.58, HB = 0.22, HL = 0.09;
    const caseM = P({ color: 0xc6ccd3, metalness: 0.9, roughness: 0.34 });
    const foam = M.knit.clone(); foam.color = new THREE.Color(0x15181c);
    const shell = (grp, h, top) => {
      grp.add(mesh(rbox(W, 0.02, D, 0.008), caseM, 0, top ? h - 0.01 : 0.01, 0));
      for (const s of [-1, 1]) { grp.add(mesh(rbox(W, h, 0.02, 0.008), caseM, 0, h / 2, s * (D / 2 - 0.01))); grp.add(mesh(rbox(0.02, h, D, 0.008), caseM, s * (W / 2 - 0.01), h / 2, 0)); }
      for (const s of [-1, 1]) { grp.add(mesh(rbox(W + 0.012, 0.022, 0.03, 0.008), M.dark, 0, top ? 0.011 : h - 0.011, s * (D / 2))); grp.add(mesh(rbox(0.03, 0.022, D + 0.012, 0.008), M.dark, s * (W / 2), top ? 0.011 : h - 0.011, 0)); }
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) grp.add(mesh(rbox(0.055, 0.05, 0.055, 0.02), M.alu, sx * (W / 2 - 0.012), top ? h - 0.022 : 0.022, sz * (D / 2 - 0.012)));
    };
    const base = new THREE.Group(); g.add(base); shell(base, HB, false);
    base.add(mesh(rbox(W - 0.05, 0.07, D - 0.05, 0.01), foam, 0, 0.055, 0));
    for (const s of [-1, 1]) base.add(mesh(new THREE.PlaneGeometry(W - 0.05, HB - 0.03), foam, 0, HB / 2 + 0.01, s * (D / 2 - 0.022)).rotateY(s > 0 ? Math.PI : 0));
    // latches and the handle on the front
    for (const s of [-1, 1]) { base.add(mesh(rbox(0.09, 0.055, 0.014, 0.006), M.alu, s * 0.27, HB - 0.02, D / 2 + 0.012)); base.add(mesh(rbox(0.05, 0.02, 0.01, 0.004), M.dark, s * 0.27, HB - 0.03, D / 2 + 0.02)); }
    base.add(mesh(rbox(0.2, 0.024, 0.03, 0.01), M.dark, 0, HB * 0.5, D / 2 + 0.025));
    for (const s of [-1, 1]) base.add(mesh(rbox(0.03, 0.05, 0.02, 0.006), M.alu, s * 0.11, HB * 0.5, D / 2 + 0.012));
    // the lid, hinged along the back
    const lid = new THREE.Group(); lid.position.set(0, HB, -D / 2); g.add(lid);
    const lidIn = new THREE.Group(); lidIn.position.z = D / 2; lid.add(lidIn); shell(lidIn, HL, true);
    lidIn.add(mesh(new THREE.PlaneGeometry(W - 0.05, D - 0.05).rotateX(Math.PI / 2), foam, 0, HL - 0.022, 0));
    // the server inside, and a glow when the case is open
    const leds = ledMats(), rnd = rng(5);
    const srv = new THREE.Group(); g.add(srv);
    const u = unit('u2', 0.56, 0.38, leds, rnd); u.position.z = 0.19; srv.add(u);
    const glow = sprite(CYAN, 0.9, 0); glow.position.set(0, 0.2, 0); g.add(glow);
    let open = 0;
    return {
      g, frame: { target: [0, 0.3, -0.02], dist: 2.65, az: 0.5, el: 0.34 }, top: 0.6, dustN: 12000,
      shadows: [[0, 0, 1.2, 0.85, 0.9]],
      anim(t, h) {
        open = lerp(open, h, 0.05);
        lid.rotation.x = -smooth(0, 0.6, open) * 1.95;
        const rise = smooth(0.35, 1, open);
        srv.position.set(0, 0.12 + 0.062 + rise * 0.3, 0); srv.rotation.set(-rise * 0.12, rise * 0.25, 0);
        for (const m of leds) { const ud = m.userData, k = Math.floor(t * ud.rate + ud.ph); m.color.copy(ud.base).multiplyScalar((hash(k * 1.37 + ud.ph) > ud.duty ? 2.6 : 0.12) * (0.1 + rise * 0.9)); }
        glow.material.opacity = open * 0.35;
      },
    };
  },

  // 04 Hand over and train: the handover folder, the checklist on the left ticking itself off. Hover: the client signs
  // the as-built sheet and the stamp comes down, leaving a cyan check
  handover() {
    const g = new THREE.Group();
    const fold = new THREE.Group(); fold.rotation.y = -0.12; g.add(fold);
    const leather = P({ color: 0x1b2d45, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color(0x5a7ea8) });
    const paper = P({ color: 0xf3f3ef, roughness: 0.9 });
    for (const s of [-1, 1]) fold.add(mesh(rbox(0.5, 0.012, 0.7, 0.01), leather, s * 0.262, 0.006, 0));
    fold.add(mesh(rbox(0.03, 0.014, 0.7, 0.006), M.dark, 0, 0.007, 0));
    // left: the handover checklist, ticked off one by one
    const { x: lx, t: ltex } = dynTex(512, 704);
    fold.add(mesh(rbox(0.44, 0.012, 0.62, 0.004), paper, -0.262, 0.018, 0));
    fold.add(mesh(new THREE.PlaneGeometry(0.43, 0.61).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: ltex }), -0.262, 0.0245, 0, { tone: 3 }));
    const items = ['Test reports', 'As-built drawings', 'O&M manuals', 'Training record', 'Warranties'];
    let lastTicks = -1;
    const drawList = (ticks) => {
      if (ticks === lastTicks) return; lastTicks = ticks;
      lx.fillStyle = '#f6f6f2'; lx.fillRect(0, 0, 512, 704);
      lx.fillStyle = '#123352'; lx.font = `700 34px ${F}`; lx.fillText('Handover pack', 44, 92);
      lx.fillStyle = '#7c8a99'; lx.font = `500 20px ${F}`; lx.fillText('Project close-out', 44, 126);
      lx.fillStyle = '#d7dde3'; lx.fillRect(44, 150, 424, 2);
      items.forEach((s, i) => { const y = 214 + i * 92, ok = i < ticks; lx.strokeStyle = ok ? '#1aa6dc' : '#b5c0ca'; lx.lineWidth = 3; rr(lx, 44, y - 24, 36, 36, 8); lx.stroke(); if (ok) { lx.fillStyle = '#30c1f8'; rr(lx, 44, y - 24, 36, 36, 8); lx.fill(); lx.strokeStyle = '#ffffff'; lx.lineWidth = 4; lx.beginPath(); lx.moveTo(52, y - 6); lx.lineTo(60, y + 3); lx.lineTo(73, y - 13); lx.stroke(); } lx.fillStyle = '#25384b'; lx.font = `500 26px ${F}`; lx.fillText(s, 100, y + 3); });
      ltex.needsUpdate = true;
    };
    // right: the stack of as-built sheets; the top one gets the signature
    fold.add(mesh(rbox(0.44, 0.03, 0.62, 0.004), paper, 0.262, 0.027, 0));
    const { x: rx, t: rtex } = dynTex(512, 704);
    fold.add(mesh(new THREE.PlaneGeometry(0.43, 0.61).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: rtex }), 0.262, 0.0425, 0, { tone: 3 }));
    const sig = Array.from({ length: 60 }, (_, k) => { const u = k / 59; return [300 + u * 150, 600 - Math.sin(u * 14) * 14 * (1 - u * 0.4) - u * 12]; });
    let lastSig = -1;
    const drawSheet = (q) => {
      const n = Math.round(q * sig.length); if (n === lastSig) return; lastSig = n;
      rx.fillStyle = '#f6f6f2'; rx.fillRect(0, 0, 512, 704);
      rx.strokeStyle = '#9fb0c2'; rx.lineWidth = 3; rx.strokeRect(40, 40, 432, 400);
      rx.lineWidth = 2; for (const [a, b, c, d] of [[40, 200, 260, 200], [260, 40, 260, 300], [260, 300, 472, 300], [160, 200, 160, 440], [360, 300, 360, 440]]) { rx.beginPath(); rx.moveTo(a, b); rx.lineTo(c, d); rx.stroke(); }
      rx.fillStyle = '#123352'; rx.font = `700 26px ${F}`; rx.fillText('AS-BUILT', 40, 492); rx.fillStyle = '#7c8a99'; rx.font = `500 18px ${F}`; rx.fillText('Drawing set · issued for handover', 40, 522);
      rx.fillStyle = '#7c8a99'; rx.font = `500 18px ${F}`; rx.fillText('Client sign-off', 40, 612); rx.fillStyle = '#c3ccd5'; rx.fillRect(40, 624, 432, 2);
      if (n > 1) { rx.strokeStyle = '#1e2f44'; rx.lineWidth = 3.5; rx.lineCap = 'round'; rx.lineJoin = 'round'; rx.beginPath(); sig.slice(0, n).forEach(([a, b], i) => (i ? rx.lineTo(a, b) : rx.moveTo(a, b))); rx.stroke(); }
      rtex.needsUpdate = true;
    };
    // the approval mark the stamp leaves
    const badge = canvasTex(256, 256, (x, w) => { x.clearRect(0, 0, w, w); x.strokeStyle = '#30c1f8'; x.lineWidth = 14; x.beginPath(); x.arc(128, 128, 104, 0, 7); x.stroke(); x.lineWidth = 4; x.beginPath(); x.arc(128, 128, 84, 0, 7); x.stroke(); x.lineWidth = 18; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(84, 132); x.lineTo(116, 164); x.lineTo(176, 98); x.stroke(); });
    const badgeM = new THREE.MeshBasicMaterial({ map: badge, transparent: true, opacity: 0, depthWrite: false });
    const BX = 0.38, BZ = 0.02;
    fold.add(mesh(new THREE.PlaneGeometry(0.15, 0.15).rotateX(-Math.PI / 2), badgeM, BX, 0.044, BZ, { noDust: true }));
    // the stamp: a dark base with a metal handle
    const stamp = new THREE.Group(); fold.add(stamp);
    stamp.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 48), M.gloss, 0, 0.015, 0));
    stamp.add(mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.006, 48), glowMat(CYAN, 0.6), 0, 0.003, 0, { tone: 1 }));
    stamp.add(mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.08, 24), M.alu, 0, 0.07, 0));
    stamp.add(mesh(new THREE.SphereGeometry(0.035, 32, 20), M.dark, 0, 0.125, 0));
    const REST = new V3(0.68, 0, -0.14), OVER = new V3(BX, 0.12, BZ), DOWN = new V3(BX, 0.045, BZ), tgt = new V3();
    stamp.position.copy(REST);
    let T = 0, ticks = 0, bop = 0, sq = 0;
    return {
      g, frame: { target: [0.08, 0.04, 0.0], dist: 2.1, az: 0.32, el: 0.82 }, top: 0.3, dustN: 12000,
      shadows: [[0, 0, 1.25, 0.9, 0.85]],
      anim(t, h, dt) {
        const d = dt || 0;
        ticks = Math.min(items.length, Math.floor((t * 0.8) % (items.length + 2)));
        drawList(h > 0.5 ? items.length : ticks);
        if (h > 0.5) T += d; else T = 0;
        sq = lerp(sq, h > 0.5 ? smooth(0.1, 1.3, T) : 0, 0.15); drawSheet(sq);
        if (T < 1.3) tgt.copy(REST); else if (T < 1.8) tgt.copy(OVER); else if (T < 2.05) tgt.copy(DOWN); else tgt.copy(OVER);
        if (T > 3.0) tgt.copy(REST);
        stamp.position.lerp(tgt, T > 1.8 && T < 2.1 ? 0.35 : 0.12);
        bop = lerp(bop, h > 0.5 && T > 1.95 ? 1 : 0, 0.1); badgeM.opacity = bop;
      },
    };
  },

  // 05 Support and improve: a monitor with the service status; now and then one service turns amber and is put right.
  // A support headset lies beside it. Hover: everything is green and the uptime line rises
  support() {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.38, 0.016, 0.26, 0.008), M.alu, 0, 0.008, 0));
    const neck = mesh(rbox(0.07, 0.36, 0.03, 0.012), M.alu, 0, 0.19, -0.07); neck.rotation.x = -0.12; g.add(neck);
    const disp = new THREE.Group(); disp.position.set(0, 0.5, -0.03); g.add(disp);
    disp.add(mesh(rbox(1.0, 0.58, 0.03, 0.012), M.dark));
    const SW = 0.97, SH = 0.55, { x, t: tex } = dynTex(970, 550);
    disp.add(mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: tex }), 0, 0, 0.0155, { tone: 3 }));
    const gl = glassOver(SW, SH); gl.position.z = 0.016; gl.userData.noDust = true; disp.add(gl);
    const names = ['Network', 'Servers', 'Backup', 'Security', 'Wi-Fi', 'CCTV'];
    const spark = names.map((_, i) => Array.from({ length: 12 }, (_, k) => 0.35 + 0.4 * hash(i * 13 + k)));
    let lastKey = '';
    const draw = (amber, up) => {
      const key = `${amber}|${Math.round(up * 60)}`; if (key === lastKey) return; lastKey = key;
      x.fillStyle = '#0a1724'; x.fillRect(0, 0, 970, 550);
      x.fillStyle = 'rgba(255,255,255,0.92)'; x.font = `600 30px ${F}`; x.fillText('Service status', 40, 62);
      const ok = amber < 0;
      x.fillStyle = ok ? 'rgba(61,214,140,0.16)' : 'rgba(255,181,71,0.16)'; rr(x, 690, 32, 240, 42, 21); x.fill();
      x.fillStyle = ok ? '#3dd68c' : '#ffb547'; x.beginPath(); x.arc(714, 53, 7, 0, 7); x.fill(); x.font = `600 19px ${F}`; x.fillText(ok ? 'All systems normal' : 'Being resolved', 732, 60);
      names.forEach((n, i) => {
        const cx = 40 + (i % 3) * 302, cy = 100 + Math.floor(i / 3) * 132, warn = i === amber;
        x.fillStyle = '#10243a'; rr(x, cx, cy, 286, 116, 14); x.fill();
        if (warn) { x.strokeStyle = 'rgba(255,181,71,0.8)'; x.lineWidth = 2; rr(x, cx, cy, 286, 116, 14); x.stroke(); }
        x.fillStyle = warn ? '#ffb547' : '#3dd68c'; x.beginPath(); x.arc(cx + 26, cy + 32, 7, 0, 7); x.fill();
        x.fillStyle = 'rgba(255,255,255,0.88)'; x.font = `600 22px ${F}`; x.fillText(n, cx + 44, cy + 40);
        x.strokeStyle = warn ? 'rgba(255,181,71,0.9)' : '#30c1f8'; x.lineWidth = 3; x.beginPath();
        spark[i].forEach((v, k) => { const px = cx + 24 + k * 21, py = cy + 100 - v * 40 - (warn && k > 8 ? 18 : 0); if (k) x.lineTo(px, py); else x.moveTo(px, py); }); x.stroke();
      });
      // uptime line
      // no figure here: a number would read as a promise the site does not make
      x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = `500 18px ${F}`; x.fillText('Service health', 40, 400);
      x.strokeStyle = 'rgba(255,255,255,0.08)'; x.lineWidth = 1; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(200, 400 + i * 32); x.lineTo(930, 400 + i * 32); x.stroke(); }
      const grd = x.createLinearGradient(0, 380, 0, 500); grd.addColorStop(0, 'rgba(48,193,248,0.35)'); grd.addColorStop(1, 'rgba(48,193,248,0)');
      const pts = Array.from({ length: 30 }, (_, k) => [200 + k * 25, 490 - (0.2 + 0.6 * (k / 29) * (0.6 + up * 0.4) + 0.06 * Math.sin(k * 1.3)) * 100]);
      x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a, b) : x.moveTo(a, b))); x.lineTo(925, 500); x.lineTo(200, 500); x.closePath(); x.fillStyle = grd; x.fill();
      x.strokeStyle = '#30c1f8'; x.lineWidth = 3; x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke();
      tex.needsUpdate = true;
    };
    // the headset, lying on the desk beside the monitor
    const hs = new THREE.Group(); hs.position.set(0.72, 0, 0.12); hs.rotation.y = -0.5; g.add(hs);
    const R = 0.12;
    hs.add(mesh(new THREE.TorusGeometry(R, 0.012, 12, 64, Math.PI).rotateX(Math.PI / 2).rotateY(-Math.PI / 2), M.alu, 0, 0.014, 0));
    for (const s of [-1, 1]) {
      hs.add(mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.04, 48).rotateX(Math.PI / 2), M.dark, 0, 0.062, s * (R + 0.01)));
      hs.add(mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.025, 48).rotateX(Math.PI / 2), M.knit, 0, 0.062, s * (R - 0.02)));
      hs.add(mesh(new THREE.TorusGeometry(0.062, 0.003, 8, 64), glowMat(CYAN, 0.8), 0, 0.062, s * (R + 0.031), { tone: 1 }));
    }
    const boom = new THREE.CatmullRomCurve3([new V3(0, 0.04, R + 0.04), new V3(0.09, 0.03, R + 0.06), new V3(0.17, 0.02, R + 0.01)]);
    hs.add(mesh(new THREE.TubeGeometry(boom, 24, 0.005, 8), M.dark));
    hs.add(mesh(rbox(0.035, 0.022, 0.022, 0.008), M.dark, 0.18, 0.02, R + 0.005));
    const micLed = glowMat(CYAN, 0.2); hs.add(mesh(new THREE.SphereGeometry(0.005, 10, 8), micLed, 0.198, 0.026, R + 0.005, { tone: 1 }));
    let up = 0;
    return {
      g, frame: { target: [0.14, 0.34, 0], dist: 2.45, az: 0.3, el: 0.14 }, top: 0.85, dustN: 12000,
      shadows: [[0, 0, 0.6, 0.45, 0.85], [0.72, 0.12, 0.45, 0.4, 0.8]],
      anim(t, h) {
        up = lerp(up, h, 0.04);
        const cyc = t % 7, amber = h < 0.3 && cyc > 4.2 && cyc < 6 ? Math.floor(t / 7) % 6 : -1;
        draw(amber, up);
        micLed.color.set(CYAN).multiplyScalar(0.2 + up * 2.4);
      },
    };
  },
});

Object.assign(DESCRIBE, {
  survey: 'A laser scanner on a tripod, its laser line sweeping the room into points. Hover: it turns faster and the whole scan lights up.',
  blueprint: 'A drafting board where the floor plan draws itself, cameras and access points last. Hover: it draws faster and the plan lights up.',
  deliver: 'An aluminium flight case. Hover: the lid opens and a server rises out of the foam, its lights coming on.',
  handover: 'The handover pack ticking itself off. Hover: the client signs the as-built sheet and the stamp leaves a cyan check.',
  support: 'A service-status screen and a support headset; now and then one service turns amber and is put right. Hover: all green, uptime rising.',
});
