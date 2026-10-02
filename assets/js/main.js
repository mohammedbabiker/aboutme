/* =========================================================
   Mohammed Babiker — Portfolio
   Modules: Theme · Nav · ScrollSpy · Reveal · Terminal · Form · ToTop
   ========================================================= */

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* =============== THEME =============== */
(() => {
  const root = document.documentElement;
  const btn = $('#theme-toggle');

  const setTheme = (theme) => {
    root.classList.toggle('dark-theme', theme === 'dark');
    try { localStorage.setItem('theme', theme); } catch { }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0a0c10' : '#f7f9fc';
  };

  const toggleTheme = () => {
    setTheme(root.classList.contains('dark-theme') ? 'light' : 'dark');
  };

  btn?.addEventListener('click', toggleTheme);
  document.addEventListener('toggle-theme', toggleTheme);

  // Respect OS changes only if the user hasn't chosen manually
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    try { if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light'); } catch { }
  });
})();

/* =============== NAV (mobile menu) =============== */
(() => {
  const menu = $('#nav-menu');
  const toggle = $('#nav-toggle');
  if (!menu || !toggle) return;

  const open = () => { menu.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
  const close = () => { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', () => menu.classList.contains('is-open') ? close() : open());

  $$('.nav__link').forEach((a) => a.addEventListener('click', close));

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) close();
  });
})();

/* =============== SCROLL: header bg + progress + to-top =============== */
(() => {
  const header = $('#header');
  const progress = $('#scroll-progress');
  const toTop = $('#to-top');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    header?.classList.toggle('is-scrolled', y > 20);
    toTop?.classList.toggle('is-visible', y > 600);
    if (progress) progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';

    ticking = false;
  };

  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  onScroll();
})();

/* =============== SCROLL SPY (IntersectionObserver) =============== */
(() => {
  const links = $$('.nav__link');
  const map = new Map(links.map((l) => [l.getAttribute('href')?.slice(1), l]));

  const sections = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.remove('active-link'));
      map.get(entry.target.id)?.classList.add('active-link');
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach((s) => io.observe(s));
})();

/* =============== REVEAL ON SCROLL =============== */
(() => {
  const els = $$('.reveal');
  if (!els.length) return;

  if (prefersReduced) { els.forEach((el) => el.classList.add('is-visible')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  els.forEach((el) => io.observe(el));
})();

/* =============== TERMINAL =============== */
(() => {
  const root = $('#terminal');
  if (!root) return;

  const output = $('#terminal-output');
  const form = $('#terminal-form');
  const input = $('#terminal-input');
  const chips = $$('.terminal__chip');

  const history = [];
  let historyIdx = -1;

  /* ---- output helpers ---- */
  const print = (line) => {
    const el = document.createElement('div');
    el.className = 'term-line';

    if (line.type === 'cmd') {
      el.innerHTML = '<span class="term-prompt">$</span> ';
      el.append(Object.assign(document.createElement('span'), { textContent: line.text }));
    } else if (line.type === 'ok') {
      el.innerHTML = '<span class="term-ok">[ OK ]</span> ';
      el.append(Object.assign(document.createElement('span'), { textContent: line.text }));
    } else if (line.type === 'err') {
      el.innerHTML = '<span class="term-err">error:</span> ';
      el.append(Object.assign(document.createElement('span'), { textContent: line.text }));
    } else {
      // Trusted output only (our own strings)
      el.innerHTML = line.text;
    }

    output.append(el);
    output.scrollTop = output.scrollHeight;
  };

  const printAll = (lines) => (Array.isArray(lines) ? lines : [lines]).forEach(print);

  /* ---- command definitions ---- */
  const commands = {
    help: () => [
      { text: 'Available commands:' },
      { text: '  <b>whoami</b>    who I am' },
      { text: '  <b>skills</b>    tech I work with' },
      { text: '  <b>projects</b>  selected work' },
      { text: '  <b>contact</b>   how to reach me' },
      { text: '  <b>theme</b>     toggle dark / light' },
      { text: '  <b>ls</b>        list the site sections' },
      { text: '  <b>clear</b>     clear the screen' },
    ],
    whoami: () => [
      { text: '<b>Mohammed Babiker</b> — Full-Stack &amp; DevOps Engineer.' },
      { text: 'Based in Sudan. Building secure, automated web systems.' },
    ],
    skills: () => [
      { text: '<b>Frontend:</b> HTML · CSS · JavaScript · React' },
      { text: '<b>Design:</b>   Figma · Photoshop · Canva' },
      { text: '<b>DevOps:</b>   Docker · Ansible · CI/CD' },
    ],
    projects: () => [
      { text: '1. Tailwind Static    — <a href="https://mohammedbabiker.me/Tailwindcss-Static/" target="_blank" rel="noopener">view →</a>' },
      { text: '2. Teashop Store      — <a href="https://next-js-mohammedbabiker.vercel.app" target="_blank" rel="noopener">view →</a>' },
      { text: '3. Next Photography   — <a href="https://mohammedbabiker.me/Next-12.0.0/" target="_blank" rel="noopener">view →</a>' },
      { text: '4. DKeeper Web3       — <a href="https://accgo-sqaaa-aaaal-ajdnq-cai.icp0.io" target="_blank" rel="noopener">view →</a>' },
    ],
    contact: () => [
      { text: 'email: <a href="mailto:mohammedbabikerbabai@outlook.com">mohammedbabikerbabai@outlook.com</a>' },
      { text: 'phone: +249 11 078 9825' },
      { text: 'or scroll down to the form ↓' },
    ],
    ls: () => [{ text: 'skills/  projects/  contact.md  README.md' }],
    sudo: () => ({ type: 'err', text: 'permission denied: nice try.' }),
    clear: () => 'CLEAR',
    theme: () => { document.dispatchEvent(new CustomEvent('toggle-theme')); return { type: 'ok', text: 'theme toggled' }; },
  };

  /* ---- execution ---- */
  const run = (raw) => {
    const [name, ...args] = raw.trim().split(/\s+/);
    const cmd = commands[name.toLowerCase()];

    if (!cmd) {
      print({ type: 'err', text: `command not found: ${name}. Try 'help'.` });
      return;
    }

    const result = cmd(args);
    if (result === 'CLEAR') { output.innerHTML = ''; return; }
    if (result) printAll(result);
  };

  const submit = () => {
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;

    history.push(raw);
    historyIdx = history.length;
    print({ type: 'cmd', text: raw });
    run(raw);
  };

  /* ---- keyboard ---- */
  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      historyIdx = Math.max(0, historyIdx - 1);
      input.value = history[historyIdx] ?? '';
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!history.length) return;
      historyIdx = Math.min(history.length, historyIdx + 1);
      input.value = history[historyIdx] ?? '';
    }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.value.trim().toLowerCase();
      if (!partial) return;
      const match = Object.keys(commands).find((c) => c.startsWith(partial));
      if (match) input.value = match + ' ';
    }
    else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); output.innerHTML = ''; }
  };

  /* ---- boot sequence ---- */
  const boot = async () => {
    const lines = [
      { type: 'cmd', text: './init.sh' },
      { type: 'ok', text: 'loading profile…' },
      { type: 'ok', text: 'mounting skills' },
      { type: 'ok', text: 'services online' },
      { text: 'Welcome. Type <b>help</b> to explore, or tap a chip below.' },
    ];

    for (const line of lines) {
      if (!prefersReduced) await sleep(line.type === 'cmd' ? 280 : 220);
      print(line);
    }
  };

  /* ---- wiring ---- */
  form?.addEventListener('submit', (e) => { e.preventDefault(); submit(); });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.cmd || '';
      input.focus();
      submit();
    });
  });

  input.addEventListener('keydown', onKey);
  root.addEventListener('click', (e) => {
    if (!e.target.closest('button') && !e.target.closest('a')) input.focus();
  });

  boot();
})();

/* =============== CONTACT FORM (EmailJS) =============== */
(() => {
  const form = $('#contact-form');
  if (!form || typeof emailjs === 'undefined') return;

  const name = $('#contact-name');
  const email = $('#contact-email');
  const project = $('#contact-project');
  const message = $('#contact-message');
  const submit = $('#contact-submit');

  const setMessage = (text, kind = '') => {
    message.textContent = text;
    message.classList.toggle('is-error', kind === 'error');
    message.classList.toggle('is-success', kind === 'success');
  };

  const validate = () => {
    let ok = true;
    [[name, 'Please enter your name.'], [email, 'Please enter your email.'], [project, 'Tell me about your project.']]
      .forEach(([field, msg]) => {
        const invalid = !field.value.trim() || (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value));
        field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
        if (invalid && ok) { setMessage(msg, 'error'); ok = false; }
      });
    return ok;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    submit.disabled = true;
    setMessage('Sending…');

    try {
      await emailjs.sendForm('service_jry8rp8', 'template_dsfngzq', form, 'Pr8W8NGG9EdB1wINQ');
      setMessage('Message sent — I\'ll get back to you soon. ✅', 'success');
      form.reset();
      [name, email, project].forEach((f) => f.setAttribute('aria-invalid', 'false'));
      setTimeout(() => setMessage(''), 6000);
    } catch (err) {
      console.error('EmailJS error:', err);
      setMessage('Something went wrong. Try emailing me directly.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
})();

/* =============== YEAR =============== */
(() => {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();