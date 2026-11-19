// ELV & Security Systems and Audio Visual: live pictures (style A) for docs/all-pictures.html
// cctv, barrier, anpr, cooling (ELV & Security), videowall, proaudio, immersive, projector (Audio Visual).
// Meeting Rooms (meetset) lives in live2.js.
import { THREE, BUILD, DESCRIBE, M, CYAN, U, VS_UV, mesh, rbox, puck, glowMat, lensGroup, canvasTex, textures, lerp, smooth, hash, rng, V2, V3 } from './kit.js';

const PINK = '#eb4b96', GREEN = '#3ddc84';

/* ------------------------------------------------------------------ local materials and helpers */
let L = null;
function lm() {
  if (L) return L;
  const P = (o) => new THREE.MeshPhysicalMaterial(o);
  L = {
    white: P({ color: 0xeef1f4, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
    matte: P({ color: 0xd9dee4, roughness: 0.55, metalness: 0.1 }),
    rubber: P({ color: 0x0f1114, roughness: 0.9 }),
    baffle: P({ color: 0x121418, roughness: 0.75, metalness: 0.1 }),
    cone: P({ color: 0x17191c, roughness: 0.82, sheen: 0.5, sheenColor: new THREE.Color(0x353b43), sheenRoughness: 0.5 }),
    blade: P({ color: 0x2a2f36, roughness: 0.45, metalness: 0.4 }),
  };
  return L;
}
const add = (hex, op) => new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
const glow = (hex, scale, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textures().radial, color: hex, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(scale); return s; };
// a rod between two points
const rod = (a, b, r, mat) => { const d = new V3().subVectors(b, a), m = mesh(new THREE.CylinderGeometry(r, r, d.length(), 20), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); return m; };
// a lathe whose axis points along +z (profile: [radius, depth] pairs, depth along +z)
const latheZ = (pts, seg = 96) => new THREE.LatheGeometry(pts.map(([r, z]) => new V2(r, z)), seg).rotateX(Math.PI / 2);
// a podium with a fine ring of light round its top edge
function podium(g, r, h, x = 0, z = 0) {
  g.add(mesh(new THREE.CylinderGeometry(r, r, h, 96), M.paint, x, h / 2, z));
  g.add(mesh(new THREE.TorusGeometry(r - 0.004, 0.0025, 8, 128).rotateX(Math.PI / 2), glowMat(CYAN, 0.6), x, h - 0.001, z, { tone: 1 }));
  return h;
}
// a small screen drawn on a canvas, redrawn only when asked
function canvasScreen(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const redraw = (...a) => { draw(c.getContext('2d'), w, h, ...a); t.needsUpdate = true; };
  return { tex: t, redraw };
}
const FONT = '"Segoe UI", system-ui, sans-serif';

Object.assign(BUILD, {
  /* ================================================================ ELV & SECURITY SYSTEMS */

  // CCTV: a bullet camera with a sun hood on a wall-mount arm, on a slim pole. It patrols slowly on its own; on hover it
  // turns to follow the pointer and its ring of infrared LEDs glows
  cctv() {
    const l = lm(), g = new THREE.Group();
    g.add(mesh(puck(0.24, 0.035, 0.014, 0.0), M.dark));
    g.add(mesh(new THREE.CylinderGeometry(0.034, 0.04, 0.82, 40), M.alu, 0, 0.44, 0));
    g.add(mesh(rbox(0.17, 0.2, 0.13, 0.03), l.white, 0, 0.9, 0));
    g.add(mesh(new THREE.CircleGeometry(0.012, 24), glowMat(CYAN, 1.4), 0.05, 0.96, 0.0655, { tone: 1 }));
    g.add(mesh(rbox(0.07, 0.07, 0.24, 0.025), l.white, 0, 0.93, 0.16));
    g.add(mesh(new THREE.SphereGeometry(0.04, 32, 16), M.alu, 0, 0.97, 0.28));
    const pan = new THREE.Group(); pan.position.set(0, 0.99, 0.28); g.add(pan);
    const tilt = new THREE.Group(); pan.add(tilt);
    tilt.add(mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.07, 24), M.alu, 0, 0.035, 0));
    const body = new THREE.Group(); body.position.set(0, 0.155, 0.05); tilt.add(body);
    body.add(mesh(rbox(0.2, 0.18, 0.48, 0.075), l.white));
    body.add(mesh(rbox(0.25, 0.018, 0.58, 0.009), l.white, 0, 0.1, 0.045));
    body.add(mesh(rbox(0.205, 0.05, 0.05, 0.02), l.matte, 0, 0, -0.235));
    const F = 0.24;
    body.add(mesh(rbox(0.17, 0.15, 0.012, 0.045), M.gloss, 0, 0, F - 0.004));
    const ln = lensGroup(0.034); ln.position.z = F + 0.003; body.add(ln);
    const ir = glowMat(PINK, 0.12);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; body.add(mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.004, 16).rotateX(Math.PI / 2), ir, Math.cos(a) * 0.058, Math.sin(a) * 0.055, F + 0.004, { tone: 2 })); }
    const irGlow = glow(PINK, 0.32, 0); irGlow.position.z = F + 0.03; body.add(irGlow);
    const led = glowMat(CYAN, 1.2); body.add(mesh(new THREE.SphereGeometry(0.006, 12, 8), led, 0.07, 0.06, F + 0.002, { tone: 1 }));
    let pa = 0.3, ta = 0.12;
    return {
      g, frame: { target: [0, 0.74, 0.18], dist: 3.15, az: 0.55, el: 0.12 }, top: 1.2, dustN: 14000,
      shadows: [[0, 0, 0.62, 0.62, 0.9], [0, 0.3, 0.5, 0.7, 0.35]],
      anim(t, h, dt, st) {
        const fx = st ? st.x : 0, fy = st ? st.y : 0;
        const patrol = Math.sin(t * 0.3) * 0.5 + 0.35;
        pa = lerp(pa, lerp(patrol, 0.55 + fx * 0.75, h), 0.06);
        ta = lerp(ta, lerp(0.14 + Math.sin(t * 0.21) * 0.04, 0.06 + fy * 0.35, h), 0.06);
        pan.rotation.y = pa; tilt.rotation.x = ta;
        ir.color.set(PINK).multiplyScalar(0.12 + h * 1.8); irGlow.material.opacity = h * 0.45;
        led.color.set(CYAN).multiplyScalar(0.6 + 0.6 * (Math.sin(t * 2.4) > 0.6 ? 1 : 0.2));
      },
    };
  },

  // Access Control & Gate Barriers: a boom barrier with an LED strip along its arm, and a face and card reader on a
  // slim pedestal. Hover: the reader turns green, the strip goes from pink to green and the arm lifts
  barrier() {
    const l = lm(), g = new THREE.Group();
    const cab = new THREE.Group(); cab.position.set(-0.85, 0, 0); g.add(cab);
    cab.add(mesh(rbox(0.36, 0.05, 0.32, 0.015), M.dark, 0, 0.025, 0));
    cab.add(mesh(rbox(0.31, 0.92, 0.27, 0.035), M.paint, 0, 0.51, 0));
    cab.add(mesh(rbox(0.33, 0.035, 0.29, 0.014), M.alu, 0, 0.985, 0));
    cab.add(mesh(rbox(0.2, 0.5, 0.01, 0.02), M.alu, 0, 0.5, 0.136));
    const strip = glowMat(PINK, 1.5); cab.add(mesh(new THREE.BoxGeometry(0.01, 0.42, 0.004), strip, 0, 0.5, 0.142, { tone: 2 }));
    cab.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.035, 48).rotateZ(Math.PI / 2), M.alu, 0.17, 0.82, 0));
    const arm = new THREE.Group(); arm.position.set(0.2, 0.82, 0); cab.add(arm);
    const len = 1.8;
    arm.add(mesh(rbox(len, 0.075, 0.05, 0.022), l.white, len / 2, 0, 0));
    for (let i = 0; i < 4; i++) arm.add(mesh(new THREE.BoxGeometry(0.11, 0.077, 0.052), M.paint, 0.32 + i * 0.42, 0, 0));
    const armLed = glowMat(PINK, 1.7); arm.add(mesh(new THREE.BoxGeometry(len - 0.12, 0.01, 0.004), armLed, len / 2 + 0.02, -0.012, 0.027, { tone: 2 }));
    arm.add(mesh(rbox(0.16, 0.06, 0.045, 0.02), M.dark, -0.1, 0, 0));
    // the rest at the far end
    const rx = -0.85 + 0.2 + len - 0.06;
    g.add(mesh(rbox(0.12, 0.03, 0.12, 0.01), M.dark, rx, 0.015, 0));
    g.add(mesh(rbox(0.045, 0.74, 0.045, 0.016), M.paint, rx, 0.4, 0));
    for (const s of [-1, 1]) g.add(mesh(rbox(0.016, 0.07, 0.016, 0.006), M.alu, rx, 0.8, s * 0.04));
    // the reader on its pedestal, facing the lane
    const ped = new THREE.Group(); ped.position.set(-0.3, 0, 0.55); ped.rotation.y = 0.25; g.add(ped);
    ped.add(mesh(rbox(0.2, 0.03, 0.14, 0.012), M.dark, 0, 0.015, 0));
    ped.add(mesh(rbox(0.1, 1.0, 0.07, 0.03), M.alu, 0, 0.52, 0));
    ped.add(mesh(rbox(0.13, 0.22, 0.04, 0.03), M.dark, 0, 1.08, 0.012));
    ped.add(mesh(rbox(0.11, 0.2, 0.006, 0.026), M.gloss, 0, 1.08, 0.033));
    const camL = lensGroup(0.01); camL.position.set(0, 1.155, 0.036); ped.add(camL);
    const ringM = glowMat(CYAN, 1.4); ped.add(mesh(new THREE.TorusGeometry(0.03, 0.003, 8, 64), ringM, 0, 1.06, 0.037, { tone: 1 }));
    const dotM = glowMat(CYAN, 0.3); ped.add(mesh(new THREE.CircleGeometry(0.018, 40), dotM, 0, 1.06, 0.0368, { tone: 1 }));
    const okGlow = glow(GREEN, 0.35, 0); okGlow.position.set(0, 1.06, 0.06); ped.add(okGlow);
    const cG = new THREE.Color(GREEN), cC = new THREE.Color(CYAN), cP = new THREE.Color(PINK), tmp = new THREE.Color();
    return {
      g, frame: { target: [0.1, 0.55, 0.15], dist: 3.75, az: 0.33, el: 0.13 }, top: 1.3, dustN: 15000,
      shadows: [[-0.85, 0, 0.75, 0.6, 0.9], [0.1, 0, 2.5, 0.35, 0.35], [-0.3, 0.55, 0.38, 0.3, 0.8], [rx, 0, 0.25, 0.25, 0.8]],
      anim(t, h) {
        const ok = smooth(0.08, 0.3, h), up = smooth(0.3, 1, h);
        arm.rotation.z = up * 1.42;
        tmp.copy(cC).lerp(cG, ok); ringM.color.copy(tmp).multiplyScalar(1.4 + ok * 0.8); dotM.color.copy(tmp).multiplyScalar(0.25 + ok * 1.3);
        okGlow.material.opacity = ok * 0.5;
        tmp.copy(cP).lerp(cG, ok); armLed.color.copy(tmp).multiplyScalar(1.7); strip.color.copy(tmp).multiplyScalar(1.5 + Math.sin(t * 2) * 0.2);
      },
    };
  },

  // ANPR, Intercom & Car Parks: an intercom and ticket pillar with a recognition camera, screen, speaker, call button
  // and ticket slot, and a licence plate in front of it. Hover: a scan line crosses the plate, the plate is outlined
  // green and the screen shows the plate as recognised
  anpr() {
    const l = lm(), g = new THREE.Group();
    const pil = new THREE.Group(); pil.position.set(-0.3, 0, -0.05); pil.rotation.y = 0.3; g.add(pil);
    pil.add(mesh(rbox(0.38, 0.05, 0.28, 0.015), M.dark, 0, 0.025, 0));
    pil.add(mesh(rbox(0.33, 1.32, 0.22, 0.055), M.paint, 0, 0.71, 0));
    pil.add(mesh(rbox(0.27, 1.12, 0.012, 0.03), M.alu, 0, 0.73, 0.111));
    pil.add(mesh(rbox(0.22, 0.13, 0.01, 0.035), M.gloss, 0, 1.2, 0.12));
    const cam = lensGroup(0.032); cam.position.set(0, 1.2, 0.124); pil.add(cam);
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) pil.add(mesh(new THREE.CircleGeometry(0.006, 16), glowMat(PINK, 0.25), s * (0.068 + k * 0.016), 1.2, 0.1255, { tone: 2 }));
    pil.add(mesh(rbox(0.22, 0.155, 0.008, 0.012), M.gloss, 0, 0.94, 0.119));
    const scr = canvasScreen(320, 220, (x, w, h, k) => {
      const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0f2337'); gr.addColorStop(1, '#06121f'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.textAlign = 'center';
      if (k < 0.5) {
        x.fillStyle = 'rgba(255,255,255,0.92)'; x.font = `600 34px ${FONT}`; x.fillText('Welcome', w / 2, 104);
        x.fillStyle = 'rgba(255,255,255,0.45)'; x.font = `500 20px ${FONT}`; x.fillText('Drive up to the barrier', w / 2, 140);
      } else {
        x.fillStyle = '#f2f4f6'; x.beginPath(); x.roundRect(52, 48, w - 104, 62, 10); x.fill();
        x.fillStyle = '#10161d'; x.font = `700 36px ${FONT}`; x.fillText('ABC 1234', w / 2, 92);
        x.fillStyle = GREEN; x.beginPath(); x.arc(w / 2 - 74, 160, 13, 0, 7); x.fill();
        x.strokeStyle = '#06121f'; x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2 - 80, 160); x.lineTo(w / 2 - 75, 166); x.lineTo(w / 2 - 67, 154); x.stroke();
        x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = `600 22px ${FONT}`; x.textAlign = 'left'; x.fillText('Recognised', w / 2 - 52, 168);
      }
    });
    scr.redraw(0); let shown = 0;
    pil.add(mesh(new THREE.PlaneGeometry(0.2, 0.1375), new THREE.MeshBasicMaterial({ map: scr.tex }), 0, 0.94, 0.1236, { tone: 3 }));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) pil.add(mesh(new THREE.CircleGeometry(0.0045, 12), M.gloss, (c - 3) * 0.018, 0.79 - r * 0.018, 0.1176));
    pil.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 48).rotateX(Math.PI / 2), M.alu, 0, 0.65, 0.12));
    const callM = glowMat(CYAN, 1.3); pil.add(mesh(new THREE.TorusGeometry(0.033, 0.0028, 8, 64), callM, 0, 0.65, 0.1265, { tone: 1 }));
    pil.add(mesh(rbox(0.14, 0.03, 0.01, 0.01), M.gloss, 0, 0.5, 0.119));
    const slotLed = glowMat(GREEN, 0.8); pil.add(mesh(new THREE.BoxGeometry(0.1, 0.004, 0.003), slotLed, 0, 0.475, 0.12, { tone: 1 }));
    // the plate, floating in front, turned to the camera
    const plate = new THREE.Group(); plate.position.set(0.48, 0.5, 0.45); plate.rotation.y = -0.38; g.add(plate);
    plate.add(mesh(rbox(0.56, 0.125, 0.014, 0.012), l.white));
    const ptex = canvasTex(560, 120, (x, w, h) => {
      x.fillStyle = '#f4f5f7'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1b2026'; x.lineWidth = 5; x.strokeRect(8, 8, w - 16, h - 16);
      x.fillStyle = '#13181e'; x.font = `700 74px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ABC 1234', w / 2, h / 2 + 4);
    });
    plate.add(mesh(new THREE.PlaneGeometry(0.54, 0.116), new THREE.MeshStandardMaterial({ map: ptex, roughness: 0.35, metalness: 0.1 }), 0, 0, 0.0075));
    const frameM = add(GREEN, 0); const fr = (w, hh, x, y) => plate.add(mesh(new THREE.PlaneGeometry(w, hh), frameM, x, y, 0.009));
    fr(0.6, 0.006, 0, 0.083); fr(0.6, 0.006, 0, -0.083); fr(0.006, 0.172, 0.3, 0); fr(0.006, 0.172, -0.3, 0);
    const scanM = add(CYAN, 0); const scan = mesh(new THREE.PlaneGeometry(0.012, 0.16), scanM, 0, 0, 0.01); plate.add(scan);
    const scanGlow = glow(CYAN, 0.22, 0); scan.add(scanGlow);
    return {
      g, frame: { target: [0.05, 0.64, 0.15], dist: 3.05, az: 0.35, el: 0.12 }, top: 1.35, dustN: 14000,
      shadows: [[-0.3, -0.05, 0.6, 0.48, 0.9], [0.48, 0.45, 0.6, 0.25, 0.3]],
      anim(t, h) {
        plate.position.y = 0.5 + Math.sin(t * 0.8) * 0.01;
        const k = smooth(0.05, 0.62, h), done = smooth(0.62, 0.78, h);
        scan.position.x = lerp(-0.28, 0.28, k); scanM.opacity = Math.sin(k * Math.PI) * 0.9; scanGlow.material.opacity = Math.sin(k * Math.PI) * 0.5;
        frameM.opacity = done * 0.9;
        const want = done > 0.5 ? 1 : 0; if (want !== shown) { shown = want; scr.redraw(want); }
        callM.color.set(CYAN).multiplyScalar(0.9 + 0.5 * Math.sin(t * 2.2));
        slotLed.color.set(GREEN).multiplyScalar(0.4 + done * 1.6);
      },
    };
  },

  // Data Centre Build, Power & Cooling: an in-row cooling unit with three large fans behind round grilles and a
  // temperature display, beside a UPS cabinet with its load bar. Hover: the fans speed up, cool air streams out and
  // the temperature drops
  cooling() {
    const l = lm(), g = new THREE.Group(), Hc = 1.5, Wc = 0.5, Dc = 0.62, FZ = Dc / 2;
    const cool = new THREE.Group(); cool.position.x = -0.26; g.add(cool);
    const ups = new THREE.Group(); ups.position.x = 0.26; g.add(ups);
    for (const c of [cool, ups]) {
      c.add(mesh(rbox(Wc - 0.01, 0.07, Dc - 0.04, 0.012), M.dark, 0, 0.035, 0));
      for (const s of [-1, 1]) c.add(mesh(rbox(0.02, Hc - 0.07, Dc, 0.007), M.paint, s * (Wc / 2 - 0.01), 0.07 + (Hc - 0.07) / 2, 0));
      c.add(mesh(rbox(Wc, 0.035, Dc, 0.012), M.paint, 0, Hc - 0.0175, 0));
      c.add(mesh(new THREE.BoxGeometry(Wc - 0.04, Hc - 0.1, 0.012), M.paint, 0, Hc / 2, -Dc / 2 + 0.01));
      c.add(mesh(new THREE.BoxGeometry(Wc - 0.12, 0.004, 0.004), glowMat(CYAN, 2), 0, Hc - 0.045, FZ + 0.002, { tone: 1 }));
    }
    // the cooling unit's front: a panel with three fan openings
    cool.add(mesh(new THREE.BoxGeometry(Wc - 0.04, Hc - 0.12, 0.02), M.paint, 0, (Hc + 0.03) / 2, FZ - 0.075));
    const fanY = [0.33, 0.73, 1.13], R = 0.17, rotors = [];
    for (const fy of fanY) {
      const f = new THREE.Group(); f.position.set(0, fy, FZ - 0.012); cool.add(f);
      f.add(mesh(new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.05, 72, 1, true).rotateX(Math.PI / 2), M.dark, 0, 0, -0.02));
      f.add(mesh(new THREE.CircleGeometry(R + 0.01, 64), l.rubber, 0, 0, -0.044));
      f.add(mesh(new THREE.TorusGeometry(R + 0.016, 0.009, 12, 96), M.dark, 0, 0, 0.004));
      const rot = new THREE.Group(); rot.position.z = -0.018; f.add(rot); rotors.push(rot);
      for (let b = 0; b < 7; b++) {
        const bg = new THREE.Group(); bg.rotation.z = (b / 7) * Math.PI * 2; rot.add(bg);
        const blade = mesh(rbox(R * 0.78, 0.004, R * 0.42, 0.002), l.blade, R * 0.53, 0, 0); blade.rotation.x = Math.PI / 2 - 0.5; bg.add(blade);
      }
      rot.add(mesh(new THREE.CylinderGeometry(R * 0.27, R * 0.29, 0.03, 48).rotateX(Math.PI / 2), M.alu, 0, 0, 0.008));
      rot.add(mesh(new THREE.TorusGeometry(R * 0.2, 0.0025, 8, 48), glowMat(CYAN, 1.2), 0, 0, 0.024, { tone: 1 }));
      for (let k = 1; k <= 4; k++) f.add(mesh(new THREE.TorusGeometry(R * (0.22 + k * 0.19), 0.0022, 6, 96), M.alu, 0, 0, 0.012, { w: 0.4 }));
      for (let k = 0; k < 4; k++) { const s = mesh(new THREE.BoxGeometry(R * 2, 0.005, 0.004), M.alu, 0, 0, 0.012, { w: 0.4 }); s.rotation.z = (k / 4) * Math.PI + Math.PI / 8; f.add(s); }
    }
    // temperature display
    const temp = canvasScreen(256, 120, (x, w, h, v) => {
      x.fillStyle = '#071321'; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,0.45)'; x.font = `500 18px ${FONT}`; x.fillText('SUPPLY AIR', 18, 32);
      x.fillStyle = '#e8f6ff'; x.font = `600 52px ${FONT}`; x.fillText(`${v.toFixed(1)}°`, 18, 92);
      x.fillStyle = CYAN; x.beginPath(); x.arc(w - 30, 30, 7, 0, 7); x.fill();
    });
    let tShown = 0; temp.redraw(23.5);
    cool.add(mesh(rbox(0.2, 0.1, 0.01, 0.01), M.gloss, 0, 1.38, FZ - 0.06));
    cool.add(mesh(new THREE.PlaneGeometry(0.18, 0.084), new THREE.MeshBasicMaterial({ map: temp.tex }), 0, 1.38, FZ - 0.0545, { tone: 3 }));
    // the UPS: a door with vent slots, a display and a five-step load bar
    ups.add(mesh(rbox(Wc - 0.03, Hc - 0.11, 0.025, 0.012), M.paint, 0, (Hc + 0.03) / 2, FZ - 0.02));
    for (let k = 0; k < 14; k++) ups.add(mesh(rbox(0.3, 0.012, 0.006, 0.004), M.gloss, 0, 0.22 + k * 0.034, FZ - 0.006, { w: 0.3 }));
    ups.add(mesh(rbox(0.22, 0.16, 0.01, 0.012), M.gloss, 0, 1.2, FZ - 0.006));
    const bars = [];
    for (let k = 0; k < 5; k++) { const m = glowMat(k < 4 ? CYAN : PINK, 0.15); bars.push(m); ups.add(mesh(new THREE.BoxGeometry(0.026, 0.05, 0.002), m, -0.06 + k * 0.03, 1.2, FZ - 0.0005, { tone: 1 })); }
    ups.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 32).rotateX(Math.PI / 2), M.alu, 0, 1.06, FZ - 0.005));
    const pwr = glowMat(GREEN, 1.4); ups.add(mesh(new THREE.TorusGeometry(0.02, 0.002, 8, 48), pwr, 0, 1.06, FZ - 0.0005, { tone: 1 }));
    // cool air leaving the fans: points drawn in the shader, travelling forward and spreading
    const N = 420, seed = new Float32Array(N * 4), rnd = rng(31);
    for (let i = 0; i < N; i++) seed.set([i % 3, rnd() * Math.PI * 2, Math.sqrt(rnd()), rnd()], i * 4);
    const ag = new THREE.BufferGeometry(); ag.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); ag.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    const au = { uPhase: { value: 0 }, uFlow: { value: 0 } };
    const air = new THREE.Points(ag, new THREE.ShaderMaterial({ uniforms: au, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec4 aSeed; uniform float uPhase, uFlow; varying float vA;
        void main() { float fy = aSeed.x < 0.5 ? ${fanY[0]} : aSeed.x < 1.5 ? ${fanY[1]} : ${fanY[2]};
          float k = fract(aSeed.w + uPhase * (0.8 + aSeed.z * 0.4));
          float r = aSeed.z * ${R} * (1.0 + k * 1.6);
          vec3 p = vec3(cos(aSeed.y) * r, fy + sin(aSeed.y) * r + k * k * 0.06, ${FZ} + 0.02 + k * 1.1);
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.0 + aSeed.z * 2.5) * 12.0 / -mv.z;
          vA = sin(k * 3.14159) * (1.0 - k) * (0.08 + uFlow * 0.9); }`,
      fragmentShader: 'varying float vA; void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.55, 0.88, 1.0) * smoothstep(0.5, 0.0, d) * vA, 1.0); }' }));
    air.frustumCulled = false; cool.add(air);
    return {
      g, frame: { target: [0, 0.74, 0.1], dist: 3.85, az: 0.42, el: 0.12 }, top: 1.5, dustN: 18000,
      shadows: [[0, 0, 1.5, 0.95, 0.9]],
      anim(t, h, dt) {
        dt = dt || 0;
        for (const r of rotors) r.rotation.z -= dt * (2.2 + h * 15);
        au.uPhase.value += dt * (0.22 + h * 0.75); au.uFlow.value = h;
        const v = Math.round(lerp(23.6, 20.8, smooth(0.1, 1, h)) * 10) / 10; if (v !== tShown) { tShown = v; temp.redraw(v); }
        const load = 2.6 + Math.sin(t * 0.7) * 0.6;
        bars.forEach((m, k) => m.color.set(k < 4 ? CYAN : PINK).multiplyScalar(k < load ? 1.5 : 0.12));
      },
    };
  },

  /* ================================================================ AUDIO VISUAL */

  // LED Video Walls & Digital Signage: a 3 x 3 LED wall with hairline gaps on a floor stand, showing slow flowing colour
  // across all nine panels. Hover: rings ripple out through the picture and the panels ripple forward with them
  videowall() {
    const g = new THREE.Group(), tw = 0.6, th = 0.3375, gap = 0.005, W = tw * 3 + gap * 2, Hh = th * 3 + gap * 2, cy = 1.06;
    for (const s of [-1, 1]) {
      g.add(mesh(rbox(0.07, cy + Hh / 2 - 0.12, 0.05, 0.02), M.alu, s * 0.55, (cy + Hh / 2 - 0.12) / 2, -0.07));
      g.add(mesh(rbox(0.1, 0.03, 0.62, 0.012), M.dark, s * 0.55, 0.015, 0.02));
    }
    g.add(mesh(rbox(1.2, 0.06, 0.04, 0.015), M.dark, 0, cy - 0.3, -0.07));
    g.add(mesh(rbox(1.2, 0.06, 0.04, 0.015), M.dark, 0, cy + 0.3, -0.07));
    const shared = { uTime: U.time, uWake: { value: 0.92 }, uRip: { value: 0 } }, tiles = [];
    const FRAG = `uniform float uTime, uWake, uRip; uniform vec2 uOff, uSz; varying vec2 vUv;
      void main() {
        vec2 p = uOff + vUv * uSz, q = (p - 0.5) * vec2(1.7778, 1.0);
        float t = uTime * 0.12;
        float a = sin(q.x * 2.2 + t * 2.0 + sin(q.y * 3.0 - t * 1.3) * 0.8);
        float b = sin(q.y * 3.4 - t * 1.6 + sin(q.x * 2.6 + t) * 0.9);
        vec3 col = vec3(0.025, 0.06, 0.13);
        col = mix(col, vec3(0.1, 0.28, 0.72), smoothstep(-0.6, 0.9, a) * 0.8);
        col = mix(col, vec3(0.19, 0.76, 0.97), smoothstep(0.3, 1.0, a * b) * 0.85);
        col = mix(col, vec3(0.92, 0.29, 0.59), smoothstep(0.55, 1.0, b) * smoothstep(0.0, 0.8, -a) * 0.6);
        float r = length(q), rip = sin((r - uTime * 0.85) * 20.0) * exp(-r * 1.4) * uRip;
        col += vec3(0.6, 0.9, 1.0) * max(rip, 0.0) * 0.35; col *= 1.0 + rip * 0.2;
        vec2 e = min(vUv, 1.0 - vUv); col *= 0.9 + 0.1 * smoothstep(0.0, 0.025, min(e.x, e.y));
        gl_FragColor = vec4(col * uWake, 1.0);
      }`;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const x = (i - 1) * (tw + gap), y = cy + (j - 1) * (th + gap), tg = new THREE.Group(); tg.position.set(x, y, 0); g.add(tg);
      tg.add(mesh(rbox(tw - 0.002, th - 0.002, 0.045, 0.004), M.dark, 0, 0, -0.0225));
      tg.add(mesh(new THREE.PlaneGeometry(tw - 0.006, th - 0.006), new THREE.ShaderMaterial({ uniforms: { ...shared, uOff: { value: new V2(i / 3, j / 3) }, uSz: { value: new V2(1 / 3, 1 / 3) } }, vertexShader: VS_UV, fragmentShader: FRAG }), 0, 0, 0.0008, { tone: 3 }));
      tiles.push({ tg, d: Math.hypot(x, (y - cy) * 1.0) });
    }
    return {
      g, frame: { target: [0, 0.93, 0], dist: 4.1, az: 0.38, el: 0.1 }, top: 1.6, dustN: 16000,
      shadows: [[0, 0.02, 1.7, 0.8, 0.85]],
      anim(t, h) {
        shared.uRip.value = h; shared.uWake.value = 0.88 + h * 0.15;
        for (const o of tiles) o.tg.position.z = h * 0.028 * Math.max(0, Math.sin(t * 3.2 - o.d * 6));
      },
    };
  },

  // Pro Audio, PA & Background Music: a two-way loudspeaker on a tripod stand, its woofer cone moving to the beat.
  // Hover: the beat gets stronger and rings of sound spread across the floor
  proaudio() {
    const l = lm(), g = new THREE.Group(), hubY = 0.34;
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.45, foot = new V3(Math.cos(a) * 0.44, 0.012, Math.sin(a) * 0.44); g.add(rod(new V3(0, hubY, 0), foot, 0.011, M.dark)); g.add(mesh(new THREE.SphereGeometry(0.016, 16, 10), l.rubber, foot.x, 0.012, foot.z)); }
    g.add(mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.07, 32), M.dark, 0, hubY + 0.01, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 32), M.alu, 0, hubY + 0.26, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 32), M.dark, 0, 0.62, 0));
    const cab = new THREE.Group(); cab.position.set(0, 1.0, 0); cab.rotation.y = 0.12; g.add(cab);
    cab.add(mesh(rbox(0.46, 0.7, 0.4, 0.055), M.paint));
    cab.add(mesh(rbox(0.06, 0.03, 0.12, 0.012), M.alu, 0, 0.36, -0.02));
    cab.add(mesh(rbox(0.42, 0.66, 0.02, 0.035), l.baffle, 0, 0, 0.195));
    const FZ = 0.206;
    // woofer: trim ring, rubber surround, cone, dust cap
    const wf = new THREE.Group(); wf.position.set(0, -0.11, FZ); cab.add(wf);
    wf.add(mesh(new THREE.TorusGeometry(0.168, 0.009, 16, 96), M.alu, 0, 0, 0.003));
    wf.add(mesh(new THREE.TorusGeometry(0.15, 0.014, 16, 96), l.rubber, 0, 0, -0.004));
    const cone = new THREE.Group(); wf.add(cone);
    cone.add(mesh(latheZ([[0.137, -0.006], [0.115, -0.022], [0.09, -0.038], [0.062, -0.052], [0.05, -0.056]]), l.cone));
    cone.add(mesh(new THREE.SphereGeometry(0.075, 48, 16, 0, Math.PI * 2, 0, 0.72).rotateX(Math.PI / 2), M.alu, 0, 0, -0.105));
    // tweeter in its waveguide
    const tw = new THREE.Group(); tw.position.set(0, 0.19, FZ); cab.add(tw);
    tw.add(mesh(latheZ([[0.115, 0.002], [0.1, -0.006], [0.075, -0.018], [0.045, -0.03], [0.028, -0.034]]), M.dark));
    tw.add(mesh(new THREE.TorusGeometry(0.116, 0.005, 12, 96), M.alu, 0, 0, 0.002));
    tw.add(mesh(new THREE.SphereGeometry(0.03, 32, 16, 0, Math.PI * 2, 0, 1.0).rotateX(Math.PI / 2), M.alu, 0, 0, -0.05));
    cab.add(mesh(rbox(0.26, 0.026, 0.01, 0.012), M.gloss, 0, -0.3, FZ - 0.004));
    const ledM = glowMat(CYAN, 1.2); cab.add(mesh(new THREE.CircleGeometry(0.006, 20), ledM, 0.17, -0.3, FZ + 0.0005, { tone: 1 }));
    // rings of sound on the floor
    const rings = [0, 1, 2].map(() => { const m = add(CYAN, 0), r = mesh(new THREE.RingGeometry(0.97, 1, 128).rotateX(-Math.PI / 2), m, 0, 0.004, 0.1, { noDust: true }); g.add(r); return r; });
    const cZ = cone.position.z;
    return {
      g, frame: { target: [0, 0.76, 0.05], dist: 3.2, az: 0.5, el: 0.09 }, top: 1.4, dustN: 15000,
      shadows: [[0, 0, 1.0, 1.0, 0.85]],
      anim(t, h) {
        const beat = t * 2.0, kick = Math.exp(-(beat % 1) * 7), soft = Math.exp(-((beat + 0.5) % 1) * 9) * 0.35;
        cone.position.z = cZ + (kick + soft) * (0.004 + h * 0.013);
        ledM.color.set(CYAN).multiplyScalar(0.8 + kick * (0.6 + h * 1.2));
        rings.forEach((r, i) => { const k = ((beat * 0.5 + i / 3) % 1); r.scale.setScalar(0.35 + k * 1.5); r.material.opacity = (1 - k) * (1 - k) * h * 0.55; });
      },
    };
  },

  // Immersive & Smart Spaces: a mixed-reality headset (curved glass front, aluminium frame, knit light seal and strap)
  // floating over a podium. Hover: colour flows across the glass and the headset turns towards the pointer
  immersive() {
    const g = new THREE.Group();
    const ph = podium(g, 0.32, 0.12);
    const hs = new THREE.Group(); hs.position.set(0, ph + 0.27, 0); g.add(hs);
    const ell = (r, sx, sy, sz, mat, ps = 0, pl = Math.PI * 2, ts = 0, tl = Math.PI) => { const m = mesh(new THREE.SphereGeometry(r, 128, 64, ps, pl, ts, tl), mat); m.scale.set(sx, sy, sz); return m; };
    hs.add(ell(0.2, 1, 0.58, 0.44, M.alu));
    hs.add(ell(0.2035, 1, 0.585, 0.46, M.gloss, 0.06, Math.PI - 0.12, 0.2, Math.PI - 0.4));
    const vis = { uTime: U.time, uOn: { value: 0 } };
    hs.add(ell(0.205, 1, 0.587, 0.465, new THREE.ShaderMaterial({ uniforms: vis, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: VS_UV,
      fragmentShader: `uniform float uTime, uOn; varying vec2 vUv;
        void main() { vec2 p = vUv; float a = sin(p.x * 8.0 + uTime * 1.1) * sin(p.y * 6.0 - uTime * 0.8 + p.x * 2.0);
          vec3 col = mix(vec3(0.19, 0.76, 0.97), vec3(0.92, 0.29, 0.59), 0.5 + 0.5 * sin(p.x * 4.0 - uTime * 0.6 + p.y * 3.0));
          col = mix(col, vec3(0.3, 0.4, 1.0), 0.5 + 0.5 * sin(p.y * 5.0 + uTime * 0.5));
          float e = smoothstep(0.0, 0.22, p.y) * smoothstep(1.0, 0.78, p.y) * smoothstep(0.0, 0.18, p.x) * smoothstep(1.0, 0.82, p.x);
          float m = (0.35 + 0.65 * smoothstep(-0.3, 0.9, a)) * e * (0.06 + uOn * 0.9);
          gl_FragColor = vec4(col * m * 0.75, 1.0); }` }), 0.06, Math.PI - 0.12, 0.2, Math.PI - 0.4));
    const soft = M.knit.clone(); soft.color = new THREE.Color(0x8d96a1); soft.sheenColor = new THREE.Color(0xcfd8e2);
    const seal = mesh(rbox(0.35, 0.19, 0.11, 0.07), soft, 0, 0, -0.085); hs.add(seal);
    const strap = mesh(new THREE.TorusGeometry(0.19, 0.024, 16, 128).rotateX(Math.PI / 2), soft, 0, 0, -0.22); strap.scale.set(1.0, 2.0, 1.25); hs.add(strap);
    hs.add(mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.022, 40), M.alu, 0.13, 0.112, -0.03));
    hs.add(mesh(rbox(0.05, 0.012, 0.016, 0.005), M.alu, -0.13, 0.112, -0.03));
    const halo = glow(CYAN, 0.9, 0.12); halo.position.set(0, ph + 0.02, 0); g.add(halo);
    let ry = 0.25, rx = 0;
    return {
      g, frame: { target: [0, 0.34, -0.05], dist: 1.8, az: 0.95, el: 0.3 }, top: 0.6, dustN: 14000,
      shadows: [[0, 0, 0.95, 0.95, 0.9]],
      anim(t, h, dt, st) {
        const fx = st ? st.x : 0, fy = st ? st.y : 0;
        hs.position.y = ph + 0.27 + Math.sin(t * 0.9) * 0.012;
        ry = lerp(ry, lerp(0.22 + Math.sin(t * 0.25) * 0.18, 0.55 + fx * 0.45, h), 0.06);
        rx = lerp(rx, lerp(Math.sin(t * 0.33) * 0.04, fy * 0.3, h), 0.06);
        hs.rotation.set(rx, ry, 0); vis.uOn.value = h; halo.material.opacity = 0.12 + h * 0.18;
      },
    };
  },

  // AV Setup, Meeting Room Solutions: an ultra-short-throw laser projector on a low plinth, throwing a fan of light up
  // onto a floating screen. Hover: the beam brightens and the picture comes up on the screen
  projector() {
    const l = lm(), g = new THREE.Group();
    g.add(mesh(rbox(0.95, 0.24, 0.52, 0.03), M.paint, 0, 0.12, 0.28));
    g.add(mesh(new THREE.BoxGeometry(0.9, 0.003, 0.003), glowMat(CYAN, 1.2), 0, 0.235, 0.541, { tone: 1 }));
    const pj = new THREE.Group(); pj.position.set(0, 0.24, 0.3); g.add(pj);
    pj.add(mesh(rbox(0.6, 0.13, 0.36, 0.045), l.white, 0, 0.065, 0));
    pj.add(mesh(rbox(0.56, 0.08, 0.01, 0.02), M.knit, 0, 0.06, 0.177));
    pj.add(mesh(rbox(0.2, 0.012, 0.07, 0.005), M.gloss, 0, 0.128, -0.1));
    const winM = glowMat('#bfe9ff', 0.5); pj.add(mesh(new THREE.PlaneGeometry(0.15, 0.03).rotateX(-Math.PI / 2), winM, 0, 0.1345, -0.1, { tone: 1 }));
    const st = glowMat(CYAN, 1.2); pj.add(mesh(new THREE.CircleGeometry(0.006, 20), st, 0.24, 0.06, 0.1825, { tone: 1 }));
    // the screen
    const SW = 1.6, SH = 0.9, sc = new THREE.Group(); sc.position.set(0, 1.12, -0.32); g.add(sc);
    sc.add(mesh(rbox(SW + 0.05, SH + 0.05, 0.03, 0.01), M.alu, 0, 0, -0.016));
    const su = { uTime: U.time, uOn: { value: 0.15 } };
    sc.add(mesh(new THREE.PlaneGeometry(SW, SH), new THREE.ShaderMaterial({ uniforms: su, vertexShader: VS_UV, fragmentShader: `uniform float uTime, uOn; varying vec2 vUv;
      float box(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main() {
        vec2 p = (vUv - 0.5) * vec2(1.7778, 1.0);
        vec3 off = vec3(0.16, 0.17, 0.19);
        vec3 col = mix(vec3(0.04, 0.1, 0.2), vec3(0.06, 0.2, 0.36), vUv.y);
        float a = sin(p.x * 2.0 + uTime * 0.2) * sin(p.y * 3.0 - uTime * 0.15);
        col = mix(col, vec3(0.19, 0.76, 0.97), smoothstep(0.4, 1.0, a) * 0.35);
        col = mix(col, vec3(0.95), 1.0 - smoothstep(-0.002, 0.002, box(p - vec2(-0.48, 0.3), vec2(0.3, 0.03), 0.01)));
        col = mix(col, vec3(0.6, 0.7, 0.8), 1.0 - smoothstep(-0.002, 0.002, box(p - vec2(-0.56, 0.22), vec2(0.22, 0.012), 0.006)));
        for (int i = 0; i < 6; i++) { float fi = float(i); float hg = 0.1 + 0.28 * (0.5 + 0.5 * sin(uTime * 0.5 + fi * 1.2));
          col = mix(col, mod(fi, 2.0) < 0.5 ? vec3(0.19, 0.76, 0.97) : vec3(0.92, 0.29, 0.59), 1.0 - smoothstep(-0.002, 0.002, box(p - vec2(-0.66 + fi * 0.13, -0.32 + hg * 0.5), vec2(0.04, hg * 0.5), 0.006))); }
        vec2 dq = p - vec2(0.5, -0.02); float ang = atan(dq.y, dq.x) / 6.2832 + 0.5;
        col = mix(col, ang < 0.62 ? vec3(0.19, 0.76, 0.97) : vec3(0.85, 0.88, 0.92), 1.0 - smoothstep(-0.002, 0.002, abs(length(dq) - 0.2) - 0.05));
        gl_FragColor = vec4(mix(off, col, uOn), 1.0);
      }` }), 0, 0, 0.0005, { tone: 3 }));
    // the fan of light, from the window on top of the projector to the screen's corners
    const win = [[-0.075, -0.015], [0.075, -0.015], [0.075, 0.015], [-0.075, 0.015]].map(([x, z]) => new V3(x, 0.24 + 0.135, 0.3 - 0.1 + z));
    const scr = [[-SW / 2, -SH / 2], [SW / 2, -SH / 2], [SW / 2, SH / 2], [-SW / 2, SH / 2]].map(([x, y]) => new V3(x, 1.12 + y, -0.315));
    const pos = [], uv = [];
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; pos.push(...win[i].toArray(), ...win[j].toArray(), ...scr[j].toArray(), ...win[i].toArray(), ...scr[j].toArray(), ...scr[i].toArray()); uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1); }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const bu = { uOn: { value: 0.3 } };
    g.add(mesh(bg, new THREE.ShaderMaterial({ uniforms: bu, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, vertexShader: VS_UV,
      fragmentShader: `uniform float uOn; varying vec2 vUv;
        void main() { float a = (0.25 + 0.75 * pow(1.0 - vUv.y, 1.5)) * (0.35 + 0.65 * sin(vUv.x * 3.14159)) * uOn;
          gl_FragColor = vec4(vec3(0.7, 0.88, 1.0) * a * 0.16, 1.0); }` }), 0, 0, 0, { noDust: true }));
    // dust in the beam
    const N = 160, rnd = rng(7), dp = new Float32Array(N * 3), ds = new Float32Array(N);
    for (let i = 0; i < N; i++) { const v = rnd(), u = rnd(), w = rnd(); const a = new V3().lerpVectors(win[0], win[2], u * 0.9 + 0.05), b = new V3(lerp(-SW / 2, SW / 2, u), 1.12 + lerp(-SH / 2, SH / 2, w), -0.315); a.y = lerp(win[0].y, win[2].y, w); const p = a.lerp(b, 0.1 + v * 0.85); dp.set([p.x, p.y, p.z], i * 3); ds[i] = rnd(); }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); dg.setAttribute('aS', new THREE.BufferAttribute(ds, 1));
    const du = { uTime: U.time, uOn: bu.uOn };
    const motes = new THREE.Points(dg, new THREE.ShaderMaterial({ uniforms: du, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aS; uniform float uTime, uOn; varying float vA;
        void main() { vec3 p = position + vec3(sin(uTime * 0.3 + aS * 30.0), sin(uTime * 0.23 + aS * 17.0), cos(uTime * 0.27 + aS * 11.0)) * 0.02;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (1.5 + aS * 2.0) * 12.0 / -mv.z;
          vA = (0.4 + 0.6 * sin(uTime * (0.8 + aS) + aS * 40.0)) * uOn; }`,
      fragmentShader: 'varying float vA; void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.8, 0.93, 1.0) * smoothstep(0.5, 0.0, d) * vA * 0.7, 1.0); }' }));
    motes.frustumCulled = false; g.add(motes);
    const wg = glow('#bfe9ff', 0.4, 0.2); wg.position.set(0, 0.39, 0.2); g.add(wg);
    return {
      g, frame: { target: [0, 0.74, 0.05], dist: 3.75, az: 0.36, el: 0.12 }, top: 1.6, dustN: 14000,
      shadows: [[0, 0.28, 1.3, 0.75, 0.9], [0, -0.3, 1.5, 0.3, 0.25]],
      anim(t, h) {
        const on = smooth(0, 1, h);
        bu.uOn.value = 0.28 + on * 0.85; su.uOn.value = 0.12 + smooth(0.15, 0.85, h) * 0.95;
        winM.color.set('#bfe9ff').multiplyScalar(0.5 + on * 1.8); wg.material.opacity = 0.18 + on * 0.4;
      },
    };
  },
});

Object.assign(DESCRIBE, {
  cctv: 'A bullet camera with a sun hood on a wall-mount arm. It patrols slowly on its own. Hover: it turns to follow the pointer and its infrared LEDs glow.',
  barrier: 'A boom barrier with an LED strip along its arm, and a face and card reader on a pedestal. Hover: the reader turns green, the strip goes green and the arm lifts.',
  anpr: 'An intercom and ticket pillar with a number-plate camera, and a licence plate in front. Hover: a scan line crosses the plate and the screen shows it recognised.',
  cooling: 'An in-row cooling unit with three large fans and a temperature display, beside a UPS cabinet. Hover: the fans speed up, cool air streams out and the temperature drops.',
  videowall: 'A 3 × 3 LED video wall on a floor stand, with slow flowing colour across all nine panels. Hover: rings ripple through the picture and the panels ripple forward.',
  proaudio: 'A two-way loudspeaker on a tripod stand, its woofer moving to the beat. Hover: the beat gets stronger and rings of sound spread across the floor.',
  immersive: 'A mixed-reality headset with a curved glass front, floating over a podium. Hover: colour flows across the glass and it turns towards the pointer.',
  projector: 'An ultra-short-throw laser projector throwing a fan of light up onto a screen. Hover: the beam brightens and the picture comes up.',
});
