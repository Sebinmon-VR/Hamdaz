/* Hamdaz careers: open roles and application forms, live from the Hamdaz ERP (hamdaz-2.0, app/hr/public.py).
   careers.html lists GET /careers/openings; job.html?id=<token> shows GET /apply/<token>/form and posts the
   application (multipart) to the ERP. No cookies are sent, and every value from the ERP is set as text,
   never as HTML. The pages themselves are in src/pages/careers.mjs. */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const cfg = $('[data-careers]');
  if (!cfg) return;

  const api = cfg.dataset.api.replace(/\/+$/, '');
  const email = cfg.dataset.email;
  const TOKEN = /^[A-Za-z0-9_-]{20,200}$/;
  // what the ERP accepts (app/hr/documents.py): the extensions and the size per file, and files per application
  const EXTS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.csv', '.rtf'];
  const MAX_BYTES = 15 * 1048576;
  const MAX_FILES = 5;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const pad2 = (n) => String(n).padStart(2, '0');
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const isoDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const fmtDate = (iso) => {
    const d = new Date(`${iso}T00:00:00Z`);
    return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  };
  // a posting answer as a line of the advert (a checkbox or a multi-select may reach here)
  const asText = (v) => (v === true ? 'Yes' : v === false ? 'No' : Array.isArray(v) ? v.map(asText).join(', ') : isoDate(v) ? fmtDate(v) : String(v));
  const metaOf = (j) => [j.department, j.location, cap(j.employment_type)].filter(Boolean).join(' · ');
  // the page grew or shrank: let the scroll animations measure again
  const refresh = () => requestAnimationFrame(() => window.ScrollTrigger && window.ScrollTrigger.refresh());

  // JSON with a time limit (the ERP can take a few seconds to wake). The ERP's error responses carry no
  // CORS header, so a refusal (a wrong or closed link) arrives here as a failed fetch, like a network error.
  async function getJSON(url, ms = 25000) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctl.signal, credentials: 'omit', cache: 'no-store' });
      let body = null;
      try { body = await r.json(); } catch (e) { /* not JSON */ }
      return { ok: r.ok, body };
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------------------------------------------------------------- careers.html: the list */
  const list = $('[data-jobs-list]');
  if (list) {
    const box = $('[data-jobs]');
    const msg = $('[data-jobs-msg]');
    const alt = $('[data-jobs-alt]');
    const retry = $('[data-jobs-retry]');
    const count = $('[data-jobs-count]');
    const tpl = $('[data-job-tpl]');
    // the token is the last part of the ERP's apply link, wherever that link points (the ERP or hamdaz.com)
    const tokenOf = (url) => {
      try {
        const m = /\/apply\/([A-Za-z0-9_-]+)\/?$/.exec(new URL(url).pathname);
        return m && TOKEN.test(m[1]) ? m[1] : null;
      } catch (e) { return null; }
    };
    const row = (job, token, i) => {
      const li = tpl.content.firstElementChild.cloneNode(true);
      $('a', li).href = `job.html?id=${encodeURIComponent(token)}`;
      $('.ix-num', li).textContent = pad2(i + 1);
      $('.ix-title', li).textContent = job.title;
      $('.job-meta', li).textContent = [metaOf(job), job.closes_on && `Closes ${fmtDate(job.closes_on)}`].filter(Boolean).join(' · ');
      $('.ix-text', li).textContent = job.summary || '';
      return li;
    };
    const show = (state, text) => {
      box.dataset.state = state;
      msg.textContent = text;
      alt.hidden = state === 'loading' || state === 'ready';
      retry.hidden = state !== 'error';
      refresh();
    };
    const load = async () => {
      show('loading', 'Loading open roles…');
      let jobs;
      try {
        const r = await getJSON(`${api}/careers/openings`);
        if (!r.ok || !Array.isArray(r.body)) throw new Error('bad response');
        jobs = r.body;
      } catch (e) {
        return show('error', 'We could not load the open roles just now. Please try again in a moment.');
      }
      const rows = jobs.map((j) => [j, tokenOf(j.apply_url)]).filter(([j, t]) => t && j.title).map(([j, t], i) => row(j, t, i));
      if (!rows.length) {
        count.textContent = 'No open roles';
        return show('empty', 'There are no open roles right now. We are always glad to hear from good people.');
      }
      list.replaceChildren(...rows);
      list.hidden = false;
      count.textContent = `${rows.length} open role${rows.length > 1 ? 's' : ''}`;
      show('ready', `${rows.length} open role${rows.length > 1 ? 's' : ''}`);
    };
    retry.addEventListener('click', load);
    load();
  }

  /* ---------------------------------------------------------------- job.html: one role and its form */
  const jobSec = $('[data-job]');
  if (jobSec) {
    const token = new URLSearchParams(location.search).get('id') || '';
    const msg = $('[data-job-msg]');
    const alt = $('[data-job-alt]');
    const applySec = $('[data-apply-sec]');

    // the link is to a role that has closed, been filled or never existed (the ERP does not say which), or
    // the ERP could not be reached: either way, to the visitor there is no open position here
    const fail = () => {
      document.title = 'No open position – Careers – Hamdaz';
      $('[data-job-title]').textContent = 'No open position';
      $('[data-job-title]').classList.add('is-in');
      $('[data-job-crumb]').textContent = 'No open position';
      $('[data-job-lead]').textContent = 'This position has been filled or is no longer open.';
      msg.textContent = 'There is no open position here right now. Take a look at our other open roles, or send us your CV and we will keep you in mind for what opens next.';
      jobSec.classList.add('is-in');
      alt.hidden = false;
      applySec.remove(); // so the role section is the sheet's last and keeps its bottom space
      refresh();
    };

    (async () => {
      if (!TOKEN.test(token)) return fail();
      let view;
      try {
        const r = await getJSON(`${api}/apply/${encodeURIComponent(token)}/form`);
        if (!r.ok || !r.body || !r.body.title) throw new Error('bad response');
        view = r.body;
      } catch (e) {
        return fail();
      }
      renderRole(view);
      renderApply(view, token);
      refresh();
    })();

    /* the advert */
    function renderRole(v) {
      const meta = metaOf(v);
      document.title = `${v.title} – Careers – Hamdaz`;
      $('[data-job-title]').textContent = v.title;
      $('[data-job-crumb]').textContent = v.title;
      $('[data-job-lead]').textContent = meta || ' ';
      $('[data-job-title]').classList.add('is-in');
      if (v.closes_on) $('[data-job-closes]').textContent = `Applications close ${fmtDate(v.closes_on)}`;

      // short answers (reports to, hours, start date) read best as facts; longer ones as paragraphs
      const facts = [
        ['Department', v.department],
        ['Location', v.location],
        ['Employment', cap(v.employment_type)],
        ['Salary', v.salary_range],
        ['Applications close', v.closes_on && fmtDate(v.closes_on)],
      ];
      const blocks = [
        ['About the role', v.summary],
        ['What you would be doing', v.description],
        ['What we are looking for', v.requirements],
      ];
      (v.details || []).forEach((d) => {
        if (d.value == null || d.value === '') return;
        const text = asText(d.value);
        (text.length <= 60 && !text.includes('\n') ? facts : blocks).push([d.label, text]);
      });

      const dl = $('[data-job-facts]');
      facts.filter(([, val]) => val).forEach(([k, val]) => {
        const div = el('div', 'job-fact');
        div.append(el('dt', '', k), el('dd', '', val));
        dl.appendChild(div);
      });
      dl.hidden = !dl.children.length;

      const body = $('[data-job-body]');
      const parts = blocks.filter(([, t]) => t && String(t).trim()).map(([h, t]) => {
        const div = el('div', 'job-block');
        div.append(el('h3', 'job-block-title', h), el('p', 'job-text', String(t).trim()));
        return div;
      });
      if (!parts.length) parts.push(el('p', 'job-text', 'Get in touch to hear more about this role.'));
      body.replaceChildren(...parts);
      jobSec.classList.add('is-in');
    }

    /* the application form: the questions HR set up for this role in the ERP */
    function renderApply(v, tok) {
      $('[data-apply-role]').textContent = v.title;
      $('[data-apply-meta]').textContent = metaOf(v);
      applySec.hidden = false;

      if (!v.accepting) {
        $('[data-apply]').hidden = true;
        $('[data-apply-closed]').hidden = false;
        return;
      }

      // post only to the ERP itself, whatever the response said
      let submitUrl = `${api}/apply/${encodeURIComponent(tok)}`;
      try {
        const u = new URL(v.submit_url);
        if (u.origin === new URL(api).origin) submitUrl = u.href;
      } catch (e) { /* keep the default */ }

      const form = $('[data-apply]');
      const holder = $('[data-apply-fields]');
      const sections = new Map((v.sections || []).map((s) => [s.key, s]));
      const groups = new Map();
      (v.fields || []).forEach((f) => {
        const key = sections.has(f.section) ? f.section : '';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(f);
      });

      let n = 0;
      groups.forEach((fields, key) => {
        const s = sections.get(key);
        const set = el('fieldset', 'apply-set');
        set.appendChild(el('legend', 'apply-legend', s ? s.name : 'Your application'));
        if (s && s.help) set.appendChild(el('p', 'hint apply-help', s.help));
        const grid = el('div', 'apply-grid');
        fields.forEach((f) => grid.appendChild(control(f, n++)));
        set.appendChild(grid);
        holder.appendChild(set);
      });

      wireForm(form, submitUrl, v);
    }

    // one question, as the control its type asks for
    function control(f, i) {
      const id = `q-${i}`;
      const wrap = el('div', 'field');
      const star = () => {
        const s = el('span', 'req', ' *');
        s.setAttribute('aria-hidden', 'true');
        return s;
      };
      let input;

      if (f.type === 'checkbox') {
        wrap.classList.add('field--check', 'full');
        const label = el('label', 'check');
        input = el('input');
        input.type = 'checkbox';
        input.value = 'true';
        input.checked = f.default === true;
        const text = el('span', '', f.label);
        if (f.required) text.appendChild(star());
        label.append(input, text);
        wrap.appendChild(label);
      } else {
        const label = el('label', '', f.label);
        label.htmlFor = id;
        if (f.required) label.appendChild(star());
        if (f.type === 'select') {
          input = el('select');
          const none = el('option', '', 'Choose…');
          none.value = '';
          input.appendChild(none);
          (f.options || []).forEach((o) => {
            const opt = el('option', '', String(o));
            opt.value = String(o);
            if (f.default != null && String(o) === String(f.default)) opt.selected = true;
            input.appendChild(opt);
          });
        } else if (f.type === 'textarea' || f.type === 'table') {
          input = el('textarea');
          input.rows = 4;
          wrap.classList.add('full');
        } else if (f.type === 'file') {
          input = el('input');
          input.type = 'file';
          input.accept = EXTS.join(',');
          wrap.classList.add('full', 'field--file');
        } else {
          input = el('input');
          input.type = { number: 'number', currency: 'number', percent: 'number', date: 'date' }[f.type] || 'text';
          if (input.type === 'number') input.step = 'any';
          // the three contact answers the ERP files the application under
          if (f.key === 'candidate_email') { input.type = 'email'; input.autocomplete = 'email'; }
          if (f.key === 'candidate_name') input.autocomplete = 'name';
          if (f.key === 'candidate_phone') { input.type = 'tel'; input.autocomplete = 'tel'; }
        }
        if (f.default != null && f.type !== 'file' && f.type !== 'select') input.value = String(f.default);
        input.id = id;
        wrap.append(label, input);
      }

      input.name = f.key;
      input.required = !!f.required;
      if (f.help) {
        const help = el('p', 'hint', f.help);
        help.id = `${id}-help`;
        input.setAttribute('aria-describedby', help.id);
        wrap.appendChild(help);
      }
      return wrap;
    }

    function setError(input, message) {
      const wrap = input.closest('.field');
      wrap.classList.toggle('is-invalid', !!message);
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      let error = $('.error', wrap);
      if (message) {
        if (!error) {
          error = el('p', 'error');
          error.id = `${input.name}-error-${Math.random().toString(36).slice(2, 7)}`;
          wrap.appendChild(error);
          input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
        }
        error.textContent = message;
      } else if (error) {
        input.setAttribute('aria-describedby', (input.getAttribute('aria-describedby') || '').replace(error.id, '').trim());
        error.remove();
      }
    }

    // what is wrong with one answer, or ''
    function problem(input) {
      if (input.type === 'checkbox') return input.required && !input.checked ? 'Please tick this box' : '';
      if (input.type === 'file') {
        const file = input.files[0];
        if (!file) return input.required ? 'Please attach a file' : '';
        const ext = (/\.[^.]+$/.exec(file.name.toLowerCase()) || [''])[0];
        if (!EXTS.includes(ext)) return 'Please attach a PDF, Word, Excel, image or text file';
        if (file.size > MAX_BYTES) return 'This file is over 15 MB. Please attach a smaller one';
        return '';
      }
      const value = input.value.trim();
      if (!value) return input.required ? (input.tagName === 'SELECT' ? 'Please choose one' : 'Please fill this in') : '';
      if (input.name === 'candidate_email' && !EMAIL.test(value)) return 'Please enter a valid email address';
      if (input.type === 'number' && isNaN(Number(value))) return 'Please enter a number';
      return '';
    }

    function wireForm(form, submitUrl, v) {
      const status = $('[data-apply-status]', form);
      const submit = $('[data-apply-submit]', form);
      const label = $('span', submit);
      const inputs = $$('input, select, textarea', form).filter((i) => i.name);
      inputs.forEach((i) => i.addEventListener(i.type === 'checkbox' || i.type === 'file' || i.tagName === 'SELECT' ? 'change' : 'input', () => setError(i, '')));

      const say = (kind, ...parts) => {
        status.className = `status${kind ? ` is-${kind}` : ''}`;
        status.replaceChildren(...parts.map((p) => (typeof p === 'string' ? document.createTextNode(p) : p)));
      };
      const mailLink = () => {
        const a = el('a', '', email);
        a.href = `mailto:${email}?subject=${encodeURIComponent(`Application: ${v.title}`)}`;
        return a;
      };

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let first = null;
        inputs.forEach((i) => {
          const p = problem(i);
          setError(i, p);
          if (p && !first) first = i;
        });
        const files = inputs.filter((i) => i.type === 'file' && i.files.length);
        if (first) {
          say('error', 'Please check the highlighted answers.');
          first.focus();
          return;
        }
        if (files.length > MAX_FILES) return say('error', `Please attach at most ${MAX_FILES} files.`);

        const data = new FormData(form);
        // an unticked box posts nothing, which reads as "not answered" rather than "no"
        inputs.filter((i) => i.type === 'checkbox' && !i.checked).forEach((i) => data.set(i.name, 'false'));
        inputs.filter((i) => i.type === 'file' && !i.files.length).forEach((i) => data.delete(i.name));

        submit.disabled = true;
        label.textContent = 'Sending…';
        say('', 'Sending your application…');
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 90000);
        try {
          const r = await fetch(submitUrl, { method: 'POST', body: data, credentials: 'omit', signal: ctl.signal });
          let body = null;
          try { body = await r.json(); } catch (err) { /* not JSON */ }
          if (!r.ok) {
            say('error', (body && body.detail) || 'Your application could not be sent. Please check your answers and try again.');
            return;
          }
          say('');
          form.hidden = true;
          const done = $('[data-apply-done]');
          $('[data-apply-done-text]').textContent = (body && body.message) || `Thank you. Your application for ${v.title} has been received. We will be in touch by email.`;
          done.hidden = false;
          done.focus({ preventScroll: true });
          done.scrollIntoView({ behavior: 'smooth', block: 'center' });
          refresh();
        } catch (err) {
          // a network failure, a timeout, or a refusal from the ERP that the browser would not let us read
          say('error', 'We could not send your application. Please check your connection and try again. If it still does not go through, email your CV to ', mailLink(), ' with the role in the subject.');
        } finally {
          clearTimeout(timer);
          submit.disabled = false;
          label.textContent = 'Submit application';
        }
      });
    }
  }
})();
