/* Hamdaz Technologies, site interactions.
   GSAP + ScrollTrigger (GreenSock standard licence) and Lenis (MIT), self-hosted in /assets/vendor. */
(() => {
  'use strict';

  const doc = document.documentElement;
  const reduce = doc.classList.contains('reduce');
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const ok = !!(gsap && ST);
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const EASE = 'expo.out';
  const earthApi = (window.HamdazEarth = window.HamdazEarth || { progress: 0 });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  if (ok) {
    gsap.registerPlugin(ST);
    doc.classList.add('ready');
  } else {
    doc.classList.remove('anim');
  }
  const animate = ok && !reduce;

  /* ---------------------------------------------------------------- Smooth scroll */
  // Smooth scrolling for everyone: with Windows "Animation effects" off, Chrome also turns off its own
  // wheel smoothing, so without this every wheel notch is a hard 100px jump.
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.075, wheelMultiplier: 1, touchMultiplier: 1.2 });
    if (ok) {
      lenis.on('scroll', ST.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const lockScroll = (on) => {
    if (lenis) on ? lenis.stop() : lenis.start();
    else doc.style.overflow = on ? 'hidden' : '';
  };
  const scrollToEl = (target, offset = -96) => {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------------------------------------------------------------- Split text into words */
  function split(el) {
    if (el.classList.contains('is-split')) return $$('.w > span', el);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
        const w = document.createElement('span');
        const inner = document.createElement('span');
        w.className = 'w';
        inner.textContent = part;
        w.appendChild(inner);
        frag.appendChild(w);
      });
      node.replaceWith(frag);
    });
    el.classList.add('is-split');
    return $$('.w > span', el);
  }
  const introScope = (el) => !!el.closest('.hero, .page-hero');
  if (animate) {
    $$('[data-split]').forEach((el) => gsap.set(split(el), { yPercent: 115 }));
  } else {
    $$('[data-split]').forEach((el) => el.classList.add('is-split'));
  }

  /* ---------------------------------------------------------------- Header */
  const header = $('[data-header]');
  let lastY = window.scrollY;
  let menuOpen = false;
  // Light header whenever it sits over the light content sheet
  const lightZones = $$('.content');
  const darkPanels = $$('.content [data-dark]');
  const spans = (el, y) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; };
  const updateHeaderTheme = () => {
    const mid = header.offsetHeight / 2;
    const overLight = lightZones.some((el) => spans(el, mid)) && !darkPanels.some((el) => spans(el, mid));
    header.classList.toggle('is-light', overLight && !menuOpen);
  };
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    updateHeaderTheme();
    if (Math.abs(y - lastY) < 8) return;
    header.classList.toggle('is-hidden', y > lastY && y > 200 && !menuOpen);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- Menu */
  const menuBtn = $('[data-menu-btn]');
  const menu = $('[data-menu]');
  const setMenu = (open) => {
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    doc.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    $('.menu-btn-label', menuBtn).textContent = open ? 'Close' : 'Menu';
    header.classList.remove('is-hidden');
    updateHeaderTheme();
    lockScroll(open);
    if (open && animate) gsap.fromTo($$('.menu-links a', menu), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: EASE, stagger: 0.05, delay: 0.25 });
  };
  menuBtn?.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && menuOpen && (setMenu(false), menuBtn.focus()));

  /* ---------------------------------------------------------------- Mega menu (What We Do) */
  // Opens on hover (with a short grace period so the pointer can travel into it) and with the caret
  // button; closes on Escape, a click outside, focus leaving it, or scrolling away.
  const mega = $('[data-mega]');
  const megaBtn = $('[data-mega-btn]');
  const megaItem = $('.nav-mega');
  if (mega && megaBtn && megaItem) {
    let megaT = 0;
    const isOpen = () => mega.classList.contains('is-open');
    const setMega = (on) => {
      clearTimeout(megaT);
      if (on === isOpen()) return;
      mega.classList.toggle('is-open', on);
      mega.inert = !on;
      megaBtn.setAttribute('aria-expanded', String(on));
      if (on) header.classList.remove('is-hidden');
    };
    mega.inert = true;
    if (fine) {
      [megaItem, mega].forEach((el) => {
        el.addEventListener('pointerenter', () => { clearTimeout(megaT); megaT = setTimeout(() => setMega(true), 90); });
        el.addEventListener('pointerleave', () => { clearTimeout(megaT); megaT = setTimeout(() => setMega(false), 220); });
      });
    }
    megaBtn.addEventListener('click', () => setMega(!isOpen()));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { setMega(false); megaBtn.focus(); } });
    document.addEventListener('click', (e) => { if (isOpen() && !mega.contains(e.target) && !megaItem.contains(e.target)) setMega(false); });
    mega.addEventListener('focusout', (e) => { if (e.relatedTarget && !mega.contains(e.relatedTarget) && !megaItem.contains(e.relatedTarget)) setMega(false); });
    mega.addEventListener('click', (e) => { if (e.target.closest('a')) setMega(false); });
    window.addEventListener('scroll', () => { if (isOpen() && !mega.matches(':hover')) setMega(false); }, { passive: true });
  }

  /* ---------------------------------------------------------------- Cursor + magnetic */
  if (fine && !reduce) {
    doc.classList.add('has-cursor');
    const cursor = $('.cursor');
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    const label = $('[data-cursor-label]');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }, { passive: true });
    const follow = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(follow);
    };
    follow();
    document.addEventListener('pointerover', (e) => {
      const l = e.target.closest('[data-cursor]');
      const h = e.target.closest('a, button, label, [data-magnetic]');
      cursor.classList.toggle('is-label', !!l);
      cursor.classList.toggle('is-hover', !l && !!h);
      cursor.classList.toggle('on-light', !!e.target.closest('[data-theme="light"], .modal') && !e.target.closest('.content [data-dark]'));
      label.textContent = l ? l.dataset.cursor : '';
    });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-hover', 'is-label'));
  }
  if (fine && animate) {
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------------------------------------------------------------- Live clocks */
  const formats = new Map();
  const tickClocks = () => {
    $$('[data-clock]').forEach((el) => {
      const tz = el.dataset.clock;
      try {
        if (!formats.has(tz)) formats.set(tz, new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }));
        el.textContent = `${formats.get(tz).format(new Date())} ${el.dataset.clockLabel}`;
      } catch (e) { /* unsupported time zone */ }
    });
  };
  tickClocks();
  setInterval(tickClocks, 15000);

  /* ---------------------------------------------------------------- Loader, curtain, intro */
  const loader = $('[data-loader]');
  const curtain = $('[data-curtain]');
  const fromNav = doc.classList.contains('from-nav');
  try { sessionStorage.removeItem('hz-nav'); } catch (e) { /* storage blocked */ }

  let introDone = false;
  function intro() {
    if (introDone) return;
    introDone = true;
    doc.classList.remove('from-nav');
    if (!animate) {
      $$('[data-intro]').forEach((el) => (el.style.opacity = 1));
      return;
    }
    const scope = $('.hero, .page-hero');
    if (!scope) return;
    const words = $$('[data-split] .w > span', scope);
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.to(words, { yPercent: 0, duration: 1.5, stagger: 0.05 }, 0.1)
      .fromTo($$('[data-intro], [data-reveal], .mono', scope), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.06 }, 0.45);
  }

  async function runLoader() {
    lockScroll(true);
    window.scrollTo(0, 0);
    const count = $('[data-loader-count]', loader);
    const bar = $('[data-loader-bar]', loader);
    let real = 0;
    const hasEarth = !!$('[data-earth]');
    if (!hasEarth) real = 1;
    window.addEventListener('earth:progress', (e) => (real = Math.max(real, e.detail || 0)));
    window.addEventListener('earth:ready', () => (real = 1));
    const start = performance.now();
    let shown = 0;
    await new Promise((resolve) => {
      const step = (now) => {
        const timeP = Math.min(1, (now - start) / 1900);
        const target = Math.min(real, timeP, 1);
        shown += (target - shown) * 0.12;
        if (target === 1 && shown > 0.995) shown = 1;
        const n = Math.round(shown * 100);
        count.textContent = String(n).padStart(3, '0');
        bar.style.transform = `scaleX(${shown})`;
        if (shown >= 1 || now - start > 9000) return resolve();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    await gsap.timeline()
      .to(count, { yPercent: -100, duration: 0.8, ease: 'expo.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.2');
    loader.remove();
    lockScroll(false);
    intro();
  }

  // Page switches: a parallax wipe (runs for everyone, including reduced-motion visitors).
  // Leaving, a colour band and then the navy panel sweep up over the page, each at its own pace, with the
  // logo and the next page's name rising inside the panel a little behind it. The next page opens covered
  // (html.from-nav, set in <head> before first paint) and waits until its 3D element has drawn, so nothing
  // stutters; then the panel lifts away while the page glides up behind it, slower, into place.
  const cAccent = $('[data-curtain-accent]', curtain);
  const cMain = $('[data-curtain-main]', curtain);
  const cInner = $('.curtain-inner', curtain);
  const cLabel = $('[data-curtain-label]', curtain);
  const cLogo = $('[data-curtain-logo]', curtain);
  const cLine = $('[data-curtain-line]', curtain);
  const pageMain = $('#main');
  const hideCurtain = () => {
    gsap.set(curtain, { visibility: 'hidden' });
    gsap.set([cAccent, cMain], { yPercent: 100, clearProps: 'borderRadius' });
    gsap.set(cLine, { scaleX: 0, transformOrigin: 'left' });
    gsap.set([cInner, cLabel, cLogo], { clearProps: 'transform,opacity' });
  };
  // resolves once this page's 3D element has drawn (or straight away when it has none)
  const elementReady = () => new Promise((resolve) => {
    const done = () => requestAnimationFrame(() => requestAnimationFrame(resolve));
    const host = $('[data-earth], [data-scene], [data-stage]');
    if (!host || host.classList.contains('is-ready') || doc.classList.contains('no-webgl')) return done();
    window.addEventListener('earth:ready', done, { once: true });
    window.addEventListener('scene:ready', done, { once: true });
    setTimeout(done, 1800);
  });
  const revealPage = async () => {
    gsap.set(curtain, { visibility: 'visible' });
    gsap.set([cAccent, cMain], { yPercent: 0 });
    gsap.set(cLine, { scaleX: 1 });
    await Promise.all([elementReady(), document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 500))]) : null]);
    gsap.timeline({ onComplete: () => { hideCurtain(); gsap.set(pageMain, { clearProps: 'transform' }); } })
      .to(cLabel, { yPercent: -110, duration: 0.45, ease: 'power3.in' }, 0)
      .to(cLogo, { opacity: 0, y: -16, duration: 0.35, ease: 'power2.in' }, 0)
      .to(cLine, { scaleX: 0, transformOrigin: 'right', duration: 0.35, ease: 'power3.in' }, 0)
      .to(cMain, { yPercent: -100, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, duration: 1, ease: 'power4.inOut' }, 0.2)
      .to(cAccent, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, 0.3)
      .fromTo(pageMain, { y: () => innerHeight * 0.16 }, { y: 0, duration: 1.25, ease: 'power3.out' }, 0.38)
      .add(intro, 0.55);
  };

  const loaderVisible = loader && getComputedStyle(loader).display !== 'none';
  if (loaderVisible && animate) runLoader();
  else {
    loader?.remove();
    if (fromNav && ok) {
      revealPage();
    } else {
      if (ok) hideCurtain();
      intro();
    }
  }

  // Page transitions between pages of the site
  const internal = (a) => {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname) || url.pathname === location.pathname) return null;
    return url;
  };
  let leaving = false;
  const PAGE_NAMES = { '': 'Home', 'index.html': 'Home', 'about.html': 'Who We Are', 'services.html': 'What We Do', 'solutions.html': 'How We Do', 'contact.html': 'Contact Us' };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!ok || leaving || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = internal(a);
    if (!url) return; // other sites, new tabs and same-page anchors behave normally
    e.preventDefault();
    leaving = true;
    if (menuOpen) setMenu(false);

    // the panel sweeps up over the page with the next page's name; the next page starts loading as soon
    // as the screen is covered, while the name settles
    try { sessionStorage.setItem('hz-nav', '1'); } catch (err) { /* ignore */ }
    cLabel.textContent = PAGE_NAMES[url.pathname.split('/').pop()] || '';
    gsap.set(curtain, { visibility: 'visible' });
    gsap.set(cLabel, { yPercent: 110 });
    gsap.set(cLogo, { opacity: 0, y: 16 });
    gsap.set(cLine, { scaleX: 0, transformOrigin: 'left' });
    gsap.set(cMain, { borderTopLeftRadius: 48, borderTopRightRadius: 48 });
    gsap.timeline()
      .fromTo(cAccent, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: 'power4.inOut' }, 0)
      .fromTo(cMain, { yPercent: 100 }, { yPercent: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, duration: 0.8, ease: 'power4.inOut' }, 0.08)
      .fromTo(cInner, { y: () => innerHeight * 0.3 }, { y: 0, duration: 0.95, ease: 'power3.out' }, 0.2)
      .to(cLogo, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.42)
      .to(cLabel, { yPercent: 0, duration: 0.55, ease: 'power3.out' }, 0.46)
      .to(cLine, { scaleX: 1, duration: 0.55, ease: 'power3.inOut' }, 0.5)
      .call(() => { location.href = url.href; }, null, 0.9);
  });
  // start loading the next page as soon as a link is hovered, so the switch feels instant
  const prefetched = new Set();
  document.addEventListener('pointerover', (e) => {
    const url = internal(e.target.closest && e.target.closest('a[href]'));
    if (!url || prefetched.has(url.pathname)) return;
    prefetched.add(url.pathname);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    document.head.appendChild(link);
  }, { passive: true });
  window.addEventListener('pageshow', (e) => { if (e.persisted && ok) { leaving = false; hideCurtain(); } });

  // Same-page anchors
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    if (url.hash === '#top') return scrollToEl(0, 0);
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    if (target.classList.contains('svc-row')) openService(target, true);
    else scrollToEl(target);
  });

  /* ---------------------------------------------------------------- Scroll animations */
  if (animate) {
    // headings outside the hero
    $$('[data-split]').filter((el) => !introScope(el)).forEach((el) => {
      ST.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to($$('.w > span', el), { yPercent: 0, duration: 1.3, ease: EASE, stagger: 0.04 }),
      });
    });
    ST.batch($$('[data-reveal]').filter((el) => !introScope(el)), {
      start: 'top 90%',
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: EASE, stagger: 0.08, overwrite: true }),
    });

    // counters
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const obj = { v: 0 };
      el.textContent = '0';
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(obj, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(obj.v)) }) });
    });

    // chat demo
    const chat = $('[data-chat]');
    if (chat) {
      const msgs = $$('.msg', chat);
      const body = $('.chat-body', chat);
      gsap.set(msgs, { display: 'none' });
      ST.create({
        trigger: chat, start: 'top 70%', once: true,
        onEnter: async () => {
          for (const m of msgs) {
            if (m.classList.contains('msg--bot')) {
              const t = document.createElement('div');
              t.className = 'msg msg--bot';
              t.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
              body.insertBefore(t, m);
              await wait(1100);
              t.remove();
            }
            gsap.set(m, { display: '' });
            gsap.from(m, { opacity: 0, y: 16, duration: 0.7, ease: EASE });
            await wait(m.classList.contains('msg--you') ? 600 : 900);
          }
        },
      });
    }

    const refresh = () => ST.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
  }

  /* ---------------------------------------------------------------- Home hero: the chip follows the scroll, the words hand over */
  const hero = $('[data-hero]');
  if (hero && ok) {
    ST.create({
      trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (self) => { earthApi.progress = self.progress; },
    });
    const a = $('[data-hero-a]');
    const b = $('[data-hero-b]');
    const glassHero = hero.classList.contains('hero--glass');
    if (glassHero) {
      // the glass hero plays its frames on its own (stage.js) and fits one screen, so the content is one
      // scroll away; the hint glides there too
      $('.hero-scroll')?.addEventListener('click', () => scrollToEl($('.content'), 0));
    } else {
      gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
        .to([a, $('[data-ticker]'), $('.hero-scroll')], { autoAlpha: 0, y: -80, duration: 0.35, ease: 'none' }, 0.02)
        .fromTo(b, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'none' }, 0.55)
        .to({}, { duration: 0.15 });
    }
  }

  // the scan horizon hero: while the header sits over its light side, the header's button turns dark
  if ($('.hero--scan')) {
    const heroEl = $('.hero--scan');
    const onTop = () => doc.classList.toggle('hero-scan-top', window.scrollY < heroEl.offsetHeight - window.innerHeight * 0.6);
    onTop();
    window.addEventListener('scroll', onTop, { passive: true });
  }
  const ticker = $('[data-ticker]');
  if (ticker) {
    const items = $$('.hero-ticker-item', ticker);
    const index = $('[data-ticker-index]', ticker);
    let i = 0;
    if (!reduce) {
      ticker.classList.add('is-running');
      setInterval(() => {
        items[i].classList.remove('is-active');
        i = (i + 1) % items.length;
        items[i].classList.add('is-active');
        index.textContent = String(i + 1).padStart(2, '0');
      }, 5000);
    }
  }
  /* ---------------------------------------------------------------- Marquee: speeds up with scroll, flips with scroll direction */
  // Runs for everyone (slower and without the scroll boost under reduced motion);
  // the Pause button and hovering stop it.
  const marquees = $$('[data-marquee]');
  if (marquees.length && ok) {
    const rows = marquees.map((el) => ({ el, track: $('.mq-track', el), dir: Number(el.dataset.marquee) || 1, x: 0, w: 0, on: false }));
    const measure = () => rows.forEach((r) => { r.w = r.track.firstElementChild.getBoundingClientRect().width; });
    rows.forEach((r) => r.el.classList.add('is-js'));
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const r = rows.find((row) => row.el === e.target);
      if (r) r.on = e.isIntersecting;
    }));
    rows.forEach((r) => io.observe(r.el));
    const BASE = reduce ? 28 : 70; // px per second when idle
    let boost = 0;
    let sign = 1;
    let paused = false;
    let hovered = false;
    let run = 1; // eases to 0 while paused or hovered
    marquees.forEach((el) => {
      el.addEventListener('pointerenter', () => { hovered = true; });
      el.addEventListener('pointerleave', () => { hovered = false; });
    });
    $$('[data-marquee-toggle]').forEach((btn) => btn.addEventListener('click', () => {
      paused = !paused;
      $$('[data-marquee-toggle]').forEach((b) => {
        b.setAttribute('aria-pressed', String(paused));
        $('[data-marquee-toggle-label]', b).textContent = paused ? 'Play' : 'Pause';
      });
    }));
    gsap.ticker.add((time, deltaMs) => {
      const v = lenis && !reduce ? lenis.velocity : 0;
      if (Math.abs(v) > 0.3) sign = v > 0 ? 1 : -1;
      boost += (Math.min(Math.abs(v), 80) - boost) * 0.08; // eased scroll speed
      run += ((paused || hovered ? 0 : 1) - run) * 0.08;
      if (run < 0.002 && (paused || hovered)) return;
      const step = (BASE + boost * 9) * run * (Math.min(deltaMs, 50) / 1000) * sign;
      rows.forEach((r) => {
        if (!r.on || !r.w) return;
        r.x = (((r.x + step * r.dir) % r.w) + r.w) % r.w;
        r.track.style.transform = `translate3d(${-r.x}px, 0, 0)`;
      });
    });
  }

  /* ---------------------------------------------------------------- Tabs (service finder) */
  $$('[data-tabs]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    let current = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    const select = (i, focus) => {
      if (i !== current) {
        current = i;
        tabs.forEach((t, k) => {
          const on = k === i;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          panels[k].hidden = !on;
        });
      }
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        select(i);
        // on narrow screens the results sit below the buttons: bring them into view
        if (innerWidth < 1024 && panels[i].getBoundingClientRect().top > innerHeight * 0.7) scrollToEl(panels[i], -90);
      });
      t.addEventListener('keydown', (e) => {
        const n = tabs.length;
        const to = { ArrowRight: current + 1, ArrowDown: current + 1, ArrowLeft: current - 1, ArrowUp: current - 1, Home: 0, End: n - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        select((to + n) % n, true);
      });
    });
  });

  /* ---------------------------------------------------------------- Home services: the panel shows the row you point at */
  $$('[data-svx]').forEach((box) => {
    const rows = $$('[data-svx-row]', box);
    const panels = $$('[data-svx-panel]', box);
    const set = (i) => {
      rows.forEach((r) => r.classList.toggle('is-on', r.dataset.svxRow === i));
      panels.forEach((p) => p.classList.toggle('is-on', p.dataset.svxPanel === i));
    };
    rows.forEach((r) => {
      r.addEventListener('pointerenter', () => set(r.dataset.svxRow));
      r.addEventListener('focus', () => set(r.dataset.svxRow));
    });
  });

  /* ---------------------------------------------------------------- Index lists: image follows the cursor */
  const lists = $$('[data-preview]');
  if (lists.length && fine && animate) {
    const preview = document.createElement('div');
    preview.className = 'preview';
    preview.setAttribute('aria-hidden', 'true');
    document.body.appendChild(preview);
    const imgs = new Map();
    const imgFor = (src) => {
      if (!imgs.has(src)) {
        const im = new Image();
        im.src = src;
        im.alt = '';
        im.decoding = 'async';
        preview.appendChild(im);
        imgs.set(src, im);
      }
      return imgs.get(src);
    };
    gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.85 });
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
    let shown = false;
    let current = null;
    const show = (on) => {
      if (on === shown) return;
      shown = on;
      gsap.to(preview, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.85, duration: 0.45, ease: on ? 'power3.out' : 'power2.in', overwrite: 'auto' });
    };
    lists.forEach((list) => {
      // load the images once the list is close to the viewport
      ST.create({ trigger: list, start: 'top 150%', once: true, onEnter: () => $$('[data-img]', list).forEach((el) => imgFor(el.dataset.img)) });
      list.addEventListener('pointermove', (e) => {
        const row = e.target.closest('[data-img]');
        if (!row) return show(false);
        if (row !== current) {
          current = row;
          const on = imgFor(row.dataset.img);
          imgs.forEach((im) => im.classList.toggle('is-on', im === on));
        }
        if (!shown) gsap.set(preview, { x: e.clientX + 40, y: e.clientY });
        xTo(e.clientX + 40);
        yTo(e.clientY);
        show(true);
      });
      list.addEventListener('pointerleave', () => { current = null; show(false); });
    });
    window.addEventListener('scroll', () => { if (shown) { current = null; show(false); } }, { passive: true });
  }

  /* ---------------------------------------------------------------- Service details popup (deep-linkable by #slug) */
  const modal = $('[data-modal]');
  let lastTile = null;
  function openService(tile, scroll) {
    if (!modal || !tile) return;
    lastTile = tile;
    const title = $('.svc-title, .ix-title', tile).textContent.trim();
    $('[data-modal-img]', modal).src = tile.dataset.img;
    $('[data-modal-num]', modal).textContent = $('.svc-num, .ix-num', tile).textContent;
    $('[data-modal-title]', modal).textContent = title;
    $('[data-modal-body]', modal).innerHTML = $('.svc-detail', tile).innerHTML;
    $('[data-modal-contact]', modal).href = `contact.html?about=${encodeURIComponent(title)}`;
    const wa = $('[data-modal-wa]', modal);
    wa.href = `${wa.href.split('?')[0]}?text=${encodeURIComponent(`Hello Hamdaz, I would like to know more about ${title}.`)}`;
    if (scroll) scrollToEl(tile, -140);
    $('.modal-panel', modal).scrollTop = 0;
    if (!modal.open) modal.showModal();
    lockScroll(true);
    history.replaceState(null, '', `#${tile.id}`);
  }
  if (modal) {
    $$('[data-svc-open]').forEach((b) => b.addEventListener('click', () => openService(b.closest('.svc-row'))));
    $('[data-modal-close]', modal).addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); }); // click on backdrop
    modal.addEventListener('close', () => {
      lockScroll(false);
      history.replaceState(null, '', location.pathname);
      $('[data-svc-open]', lastTile || document)?.focus({ preventScroll: true });
    });
  }

  const fromHash = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el && el.classList.contains('svc-row')) openService(el, true);
    else if (el) setTimeout(() => scrollToEl(el), 300);
  };
  if (location.hash) setTimeout(fromHash, loaderVisible ? 2600 : 500);
  window.addEventListener('hashchange', fromHash);

  /* ---------------------------------------------------------------- Contact form */
  const form = $('[data-form]');
  if (form) {
    const field = (n) => form.elements.namedItem(n);
    const fName = field('name'), fEmail = field('email'), fPhone = field('phone'), fMsg = field('message'), fCompany = field('company');
    const reach = $('#f-reach');
    const status = $('[data-status]', form);
    const params = new URLSearchParams(location.search);
    const about = params.get('about');
    const need = params.get('need');
    if (need && !fMsg.value) fMsg.value = `I need help to ${need}.`;
    else if (about && !fMsg.value) fMsg.value = `I would like to know more about ${about}.`;

    const setError = (input, message) => {
      const wrap = input.closest('.field');
      wrap.classList.toggle('is-invalid', !!message);
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      let error = $('.error', wrap);
      if (message) {
        if (!error) {
          error = document.createElement('p');
          error.className = 'error';
          error.id = `${input.id}-error`;
          wrap.appendChild(error);
          input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
        }
        error.textContent = message;
      } else if (error) {
        input.setAttribute('aria-describedby', (input.getAttribute('aria-describedby') || '').replace(error.id, '').trim());
        error.remove();
      }
    };
    [fName, fEmail, fPhone, fMsg].forEach((input) => input.addEventListener('input', () => {
      setError(input, '');
      if (input === fEmail || input === fPhone) reach.classList.remove('is-error');
    }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const via = (e.submitter && e.submitter.value) || 'email';
      const name = fName.value.trim(), email = fEmail.value.trim(), phone = fPhone.value.trim();
      const company = fCompany.value.trim(), message = fMsg.value.trim();
      let first = null;
      const check = (input, valid, text) => { setError(input, valid ? '' : text); if (!valid && !first) first = input; };
      check(fName, name.length > 1, 'Please enter your name');
      check(fEmail, !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Please enter a valid email address');
      const reachable = !!(email || phone);
      reach.classList.toggle('is-error', !reachable);
      if (!reachable && !first) first = fEmail;
      check(fMsg, message.length > 4, 'Please tell us a little about your project');
      if (first) {
        status.className = 'status full is-error';
        status.textContent = 'Please check the highlighted fields.';
        first.focus();
        return;
      }
      const topics = $$('input[name="topics"]:checked', form).map((i) => i.value);
      const lines = ['Hello Hamdaz,', '', message, '', `Name: ${name}`, company && `Company: ${company}`, email && `Email: ${email}`, phone && `Phone: ${phone}`, topics.length && `Interested in: ${topics.join(', ')}`].filter((l) => l !== false && l !== null && l !== undefined);
      const text = lines.join('\n');
      status.className = 'status full';
      if (via === 'whatsapp') {
        window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        status.textContent = 'WhatsApp is opening with your message ready. Just press send.';
      } else {
        const subject = encodeURIComponent(`Website enquiry from ${name}${company ? `, ${company}` : ''}`);
        window.location.href = `mailto:${form.dataset.email}?subject=${subject}&body=${encodeURIComponent(text)}`;
        status.textContent = `Your email app should open with the message ready. If it does not, write to ${form.dataset.email}.`;
      }
    });
  }

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
