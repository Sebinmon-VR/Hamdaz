/* Home: "Latest from Hamdaz" (components.mjs linkedinFeed). Pointing at a headline in the moving list, focusing it
   or picking it shows that post in full on the left: its photo, date, title, its whole text and a link to it on
   LinkedIn. The first headline is the featured story, which brings the collage back. Without this script every
   headline is a plain link to the post on LinkedIn. Every value from the posts is set as text. */
(() => {
  const root = document.querySelector('[data-news]');
  if (!root) return;
  const panel = root.querySelector('[data-news-panel]');
  const items = [...root.querySelectorAll('[data-news-item]')];
  let posts = [];
  try { posts = JSON.parse(root.querySelector('[data-news-json]').textContent); } catch (e) { return; }
  const featured = panel.innerHTML;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const arrow = panel.querySelector('.news-go .i')?.outerHTML || '';
  let current = 0;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  // as components.mjs plain(): without emoji, single spaces
  const plain = (t) => t.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
  const isUrl = (s) => /^https:\/\/\S+$/.test(s);
  const link = (href, cls, text) => {
    const a = el('a', cls, text);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  };

  // the post's text as LinkedIn has it: blank lines start a new paragraph, a line that is only a link becomes one,
  // and the closing line of hashtags is set apart
  function body(lines) {
    const box = el('div', 'news-text news-text--full');
    // a long post scrolls inside the panel; the page's smooth scrolling leaves this box alone
    box.setAttribute('data-lenis-prevent', '');
    let p = null;
    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line) { p = null; return; }
      if (/^(#\S+\s*)+$/.test(line)) { box.appendChild(el('p', 'news-tags', line)); p = null; return; }
      if (!p) { p = el('p'); box.appendChild(p); } else p.appendChild(document.createElement('br'));
      if (isUrl(line)) p.appendChild(link(line, '', line));
      else p.appendChild(document.createTextNode(line));
    });
    return box;
  }

  function render(i) {
    if (i === 0) { panel.innerHTML = featured; return; }
    const post = posts[i];
    if (!post) return;
    panel.replaceChildren();
    if (post.img) {
      const media = link(post.url, 'news-single');
      media.tabIndex = -1;
      media.setAttribute('aria-hidden', 'true');
      // the whole picture: a square or tall one sits on navy, no taller than the panel allows; a wide one fills the width
      const img = el('img');
      img.src = post.img.src;
      img.alt = '';
      img.width = post.img.w;
      img.height = post.img.h;
      media.appendChild(img);
      panel.appendChild(media);
    }
    // the title is the post's first line, so the text starts after it (unless the title had to be shortened)
    const lines = [...post.lines];
    const first = lines.findIndex((l) => l.trim());
    if (first > -1 && plain(lines[first]) === post.title) lines.splice(0, first + 1);
    panel.append(el('p', 'news-kicker', `LinkedIn · ${post.date}`), el('h3', 'news-title', post.title), body(lines));
    const go = link(post.url, 'news-go', 'Read on LinkedIn');
    go.insertAdjacentHTML('beforeend', arrow);
    panel.appendChild(go);
    // a long text fades out at the bottom until it has been scrolled to the end
    const text = panel.querySelector('.news-text--full');
    const more = () => text.classList.toggle('is-more', text.scrollTop + text.clientHeight < text.scrollHeight - 4);
    text.addEventListener('scroll', more, { passive: true });
    requestAnimationFrame(more);
  }

  function show(i) {
    if (i === current) return;
    current = i;
    items.forEach((it) => it.classList.toggle('is-on', Number(it.dataset.newsItem) === i));
    panel.classList.add('is-swapping');
    setTimeout(() => {
      render(i);
      panel.classList.remove('is-swapping');
      window.ScrollTrigger && window.ScrollTrigger.refresh();
    }, 160);
  }

  items.forEach((it) => {
    const i = Number(it.dataset.newsItem);
    let timer = 0;
    if (fine) {
      it.addEventListener('pointerenter', () => { timer = setTimeout(() => show(i), 140); });
      it.addEventListener('pointerleave', () => clearTimeout(timer));
    }
    it.addEventListener('focus', () => show(i));
    it.addEventListener('click', (e) => {
      // a new tab or window with a modifier key still opens the post on LinkedIn
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      show(i);
      // on narrow screens the post appears above the list, so bring it into view
      if (!matchMedia('(min-width: 1024px)').matches) setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    });
  });
})();
