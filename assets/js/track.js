/* Hamdaz: where a visit came from, and, when a Google tag is set up (src/data.mjs `tracking`), the cookie
   choice and the conversions Google Ads counts.

   1. Where the visit came from: the first page of the visit, the site that sent it and any ad tags in its
      address (utm_*, gclid), kept in this tab's sessionStorage. Nothing is sent anywhere; the contact form
      adds it to a message, so the ERP shows which search or ad brought each enquiry.
   2. The cookie choice (only with a Google tag): a small banner until the visitor accepts or declines,
      remembered in localStorage and reopened from the footer's "Cookie settings". Until "Accept", Google's
      tag runs in Consent Mode with every storage denied (set in the page head by src/layout.mjs).
   3. Conversions: window.hzTrack('lead' | 'call' | 'whatsapp' | 'email'). Taps on tel:, WhatsApp and mailto:
      links are counted here; the contact form calls hzTrack('lead') once the ERP has the message. */
(() => {
  'use strict';

  const SRC = 'hz-src';
  const CONSENT = 'hz-consent';
  const ss = (() => { try { return window.sessionStorage; } catch (e) { return null; } })();
  const ls = (() => { try { return window.localStorage; } catch (e) { return null; } })();

  /* ---------------------------------------------------------------- 1. where the visit came from */
  try {
    if (ss && !ss.getItem(SRC)) {
      const q = new URLSearchParams(location.search);
      const src = { landing: (location.pathname + location.search).slice(0, 500) };
      // another site only, and without its query, which can carry the visitor's own details
      try {
        const r = new URL(document.referrer);
        if (r.host !== location.host) src.referrer = (r.origin + r.pathname).slice(0, 500);
      } catch (e) { /* no referrer */ }
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach((k) => {
        const v = q.get(k);
        if (v) src[k] = v.slice(0, 300);
      });
      ss.setItem(SRC, JSON.stringify(src));
    }
  } catch (e) { /* storage blocked: the form sends without it */ }
  window.hzSource = () => {
    try { return JSON.parse(ss.getItem(SRC)) || {}; } catch (e) { return {}; }
  };

  /* ---------------------------------------------------------------- 3. conversions */
  const tag = window.hzTag;
  const gtag = typeof window.gtag === 'function' ? window.gtag : null;
  window.hzTrack = (kind) => {
    if (!tag || !gtag) return;
    const label = tag.conv && tag.conv[kind];
    if (label) gtag('event', 'conversion', { send_to: `${tag.ads}/${label}` });
    gtag('event', kind === 'lead' ? 'generate_lead' : 'contact', { method: kind });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (/^tel:/i.test(href)) window.hzTrack('call');
    else if (/^mailto:/i.test(href)) window.hzTrack('email');
    else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) window.hzTrack('whatsapp');
  }, true);

  /* ---------------------------------------------------------------- 2. the cookie choice */
  if (!tag || !gtag) return;
  const apply = (v) => {
    const g = v === 'granted' ? 'granted' : 'denied';
    gtag('consent', 'update', { ad_storage: g, ad_user_data: g, ad_personalization: g, analytics_storage: g });
  };
  let saved = null;
  try { saved = ls && ls.getItem(CONSENT); } catch (e) { /* blocked */ }

  let box = null;
  const close = () => {
    if (!box) return;
    box.classList.remove('is-in');
    const b = box;
    box = null;
    setTimeout(() => b.remove(), 400);
  };
  const open = () => {
    if (box) return;
    box = document.createElement('div');
    box.className = 'consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Cookie choice');
    const p = document.createElement('p');
    p.append('We use cookies to see which of our ads bring people here and to improve the site. ');
    const more = document.createElement('a');
    more.href = '/privacy.html#cookies';
    more.textContent = 'Privacy policy';
    p.append(more);
    const row = document.createElement('div');
    row.className = 'consent-row';
    [['denied', 'Decline'], ['granted', 'Accept']].forEach(([v, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `consent-btn${v === 'granted' ? ' is-main' : ''}`;
      b.textContent = label;
      b.addEventListener('click', () => {
        try { ls && ls.setItem(CONSENT, v); } catch (e) { /* not remembered: asked again next visit */ }
        apply(v);
        close();
      });
      row.appendChild(b);
    });
    box.append(p, row);
    document.body.appendChild(box);
    requestAnimationFrame(() => requestAnimationFrame(() => box && box.classList.add('is-in')));
  };

  if (saved !== 'granted' && saved !== 'denied') open();
  document.querySelectorAll('[data-consent-open]').forEach((b) => b.addEventListener('click', open));
})();
