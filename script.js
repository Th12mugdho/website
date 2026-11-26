(function(){
  // ---------- Preloader boot sequence ----------
  const preloader = document.getElementById('preloader');
  if (preloader){
    const reduceMotionPref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Only play the boot sequence on the first page view of a browser session;
    // the inline <head> script adds .pl-skip on repeat views so it never flashes.
    const alreadyBooted = document.documentElement.classList.contains('pl-skip');
    try { sessionStorage.setItem('mth-booted', '1'); } catch(e){ /* storage unavailable — loader just plays each time */ }

    function dismissPreloader(){
      preloader.classList.add('hide');
      document.body.style.overflow = '';
      setTimeout(() => { preloader.style.display = 'none'; }, 550);
    }

    if (alreadyBooted){
      preloader.style.display = 'none';
    } else if (reduceMotionPref){
      preloader.style.transition = 'none';
      dismissPreloader();
      preloader.style.display = 'none';
    } else {
      document.body.style.overflow = 'hidden';
      const fill = document.getElementById('preloaderFill');
      requestAnimationFrame(() => { if (fill) fill.style.width = '100%'; });
      setTimeout(dismissPreloader, 2300);
    }
  }

  // ---------- Disable image dragging (prevents drag-out from exposing the hotlinked source URL) ----------
  document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });

  // ---------- Stop clicks on nested links from also triggering their parent card's click handler ----------
  document.querySelectorAll('.js-stop-propagation').forEach(el => {
    el.addEventListener('click', (e) => e.stopPropagation());
  });

  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  let theme = 'dark';
  function applyTheme(t){
    theme = t;
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('mth-theme', t); } catch(e){ /* storage unavailable — theme just won't persist */ }
  }
  let savedTheme = 'dark';
  try {
    const saved = localStorage.getItem('mth-theme');
    const sysLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    savedTheme = saved || (sysLight ? 'light' : 'dark');
  } catch(e){ /* ignore */ }
  applyTheme(savedTheme);
  toggle.addEventListener('click', () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    if (window.plotterSwitch) window.plotterSwitch(next, () => applyTheme(next));
    else applyTheme(next);
  });


  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer:fine)').matches;

  // ---------- Live Dhaka clock in the hero telemetry line ----------
  const dhakaClock = document.getElementById('dhakaClock');
  if (dhakaClock){
    let fmt = null;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Dhaka', hour:'2-digit', minute:'2-digit', hour12:false });
    } catch(e){ /* very old browser — leave the static GMT+6 label */ }
    if (fmt){
      const tickClock = () => { dhakaClock.textContent = fmt.format(new Date()) + ' GMT+6'; };
      tickClock();
      setInterval(tickClock, 30000);
    }
  }

  // ---------- Nav capsule scroll state + back-to-top + scroll-rail (rAF-throttled) ----------
  const navCapsule = document.getElementById('navCapsule');
  const backTop = document.getElementById('backTop');
  const scrollRailFill = document.getElementById('scrollRailFill');

  // ---------- Experience timeline "charges" as you scroll; nodes light when reached ----------
  const timeline = document.querySelector('.timeline');
  const tlNodes = timeline ? [...timeline.querySelectorAll('.tl-node')] : [];
  let tlCharge = 0;                                      // only ever rises: once powered, stays powered
  function chargeTimeline(){
    if (!timeline || tlCharge >= 1) return;
    const probe = window.innerHeight * 0.62;             // the "charge front" sits a bit below mid-screen
    const r = timeline.getBoundingClientRect();
    const span = r.height - 20;                          // bus runs from top:10px to bottom:10px
    const charge = Math.min(Math.max((probe - (r.top + 10)) / span, 0), 1);
    if (charge <= tlCharge) return;
    tlCharge = charge;
    timeline.style.setProperty('--charge', charge.toFixed(3));
    tlNodes.forEach(n => {
      const nr = n.getBoundingClientRect();
      if (nr.top + nr.height / 2 <= probe) n.classList.add('lit');   // stays lit once powered
    });
  }
  if (reducedMotion){
    if (timeline) timeline.style.setProperty('--charge', '1');
    tlNodes.forEach(n => n.classList.add('lit'));
  } else {
    chargeTimeline();
  }

  // ---------- Phones: collapse long lists, keep the chat button out of the hero ----------
  const mqPhone = window.matchMedia('(max-width: 640px)');
  function applyPhoneCollapse(){
    document.querySelectorAll('details.m-collapse').forEach(d => { d.open = !mqPhone.matches; });
  }
  applyPhoneCollapse();
  mqPhone.addEventListener('change', applyPhoneCollapse);
  document.querySelectorAll('details.m-collapse > summary').forEach(s => {
    s.addEventListener('click', (e) => { if (!mqPhone.matches) e.preventDefault(); });   // always open on desktop
  });
  const heroEl = document.getElementById('home');
  function updateFab(){
    const panel = document.getElementById('chatPanel');
    const inHero = heroEl && window.scrollY < heroEl.offsetHeight * 0.6;
    document.body.classList.toggle('fab-hidden', mqPhone.matches && inHero && !(panel && panel.classList.contains('open')));
  }
  updateFab();
  mqPhone.addEventListener('change', updateFab);

  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      updateFab();
      if (!reducedMotion) chargeTimeline();
      navCapsule.classList.toggle('scrolled', window.scrollY > 30);
      if (backTop) backTop.classList.toggle('show', window.scrollY > 600);
      if (scrollRailFill){
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        // Reveal the waveform left→right (clip, not scale, so the wave isn't squashed)
        scrollRailFill.style.clipPath = `inset(0 ${((1 - pct) * 100).toFixed(2)}% 0 0)`;
      }
      scrollQueued = false;
    });
  }, { passive:true });
  if (backTop){
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
  }

  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('nav.links a');
  const navPill = document.getElementById('navPill');

  function movePill(link){
    if (!link){ navPill.style.width = '0px'; return; } // section with no nav link (hero, achievements, gallery)
    navPill.style.width = link.offsetWidth + 'px';
    navPill.style.transform = `translateX(${link.offsetLeft}px)`;
  }
  movePill(document.querySelector('nav.links a.active'));

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.dataset.nav === id));
        movePill(document.querySelector('nav.links a.active'));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(sec => spy.observe(sec));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => movePill(document.querySelector('nav.links a.active')), 120);
  });

  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        reveal.unobserve(e.target); // stop watching once revealed — nothing left to do
      }
    });
  }, { threshold: 0 });
  revealEls.forEach(el => reveal.observe(el));

  const counters = document.querySelectorAll('[data-count]');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        countObs.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const isFloat = target % 1 !== 0;
        const duration = 1200;
        const start = performance.now();
        function tick(now){
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (isFloat ? val.toFixed(2) : Math.round(val)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => countObs.observe(c));

  const tabs = document.querySelectorAll('.tabbar button');
  const panels = {};
  document.querySelectorAll('.project-grid[data-panel]').forEach(el => { panels[el.dataset.panel] = el; });
  const projectsSection = document.getElementById('projects');
  const cardsOf = (grid) => [...grid.querySelectorAll(':scope > .project-card')];
  const allCards = Object.values(panels).flatMap(cardsOf);
  let activeTab = 'robotics';
  let activeFilter = '';

  // Group headings, only shown while a skill filter mixes cards from several tabs
  const PANEL_LABELS = { robotics: 'Robotics', electronics: 'Electronics & VLSI', ml: 'ML & Data' };
  const labelFor = new Map(), dotsFor = new Map();
  Object.entries(panels).forEach(([key, grid]) => {
    const h = document.createElement('h4');
    h.className = 'grid-label mono';
    h.textContent = PANEL_LABELS[key] || key;
    h.hidden = true;
    grid.before(h);
    labelFor.set(grid, h);
    // Phones: each grid is a swipeable row; dots show (and jump to) the position
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    grid.after(dots);
    dotsFor.set(grid, dots);
    let q = false;
    grid.addEventListener('scroll', () => {
      if (q) return; q = true;
      requestAnimationFrame(() => { q = false; updateDots(grid); });
    }, { passive: true });
  });
  const visibleCards = (grid) => cardsOf(grid).filter(c => !c.classList.contains('filtered-out'));
  function buildDots(grid){
    const dots = dotsFor.get(grid);
    dots.innerHTML = '';
    const cards = visibleCards(grid);
    dots.hidden = grid.style.display === 'none' || cards.length < 2;
    cards.forEach((card, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cdot';
      b.setAttribute('aria-label', `Show project ${i + 1} of ${cards.length}`);
      b.addEventListener('click', () => card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' }));
      dots.appendChild(b);
    });
    updateDots(grid);
  }
  function updateDots(grid){
    const cards = visibleCards(grid);
    const left = grid.getBoundingClientRect().left;
    let best = 0, bestD = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.getBoundingClientRect().left - left); if (d < bestD){ bestD = d; best = i; } });
    [...dotsFor.get(grid).children].forEach((b, i) => b.classList.toggle('on', i === best));
  }

  function showTab(cat){
    tabs.forEach(b => {
      const on = b.dataset.cat === cat;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    Object.entries(panels).forEach(([key, el]) => {
      el.style.display = key === cat ? '' : 'none';     // layout (grid / phone carousel) comes from CSS
      labelFor.get(el).hidden = true;
      buildDots(el);
    });
  }
  tabs.forEach(btn => btn.addEventListener('click', () => {
    activeTab = btn.dataset.cat;
    if (activeFilter) applyFilter(''); else showTab(activeTab);
  }));

  // ---------- Filter by skill: chips search across all three tabs at once ----------
  const filterBtns = [...document.querySelectorAll('.skill-filter button[data-filter]')];
  const clearBtn = document.querySelector('.skill-filter .sf-clear');
  const matches = (card, keys) => (card.dataset.skills || '').split(' ').some(s => keys.includes(s));
  filterBtns.forEach(b => {
    if (!b.dataset.filter) return;
    const n = allCards.filter(c => matches(c, b.dataset.filter.split(' '))).length;
    const count = document.createElement('span');
    count.className = 'sf-count';
    count.textContent = n;
    b.appendChild(count);
  });
  function applyFilter(f){
    activeFilter = f;
    filterBtns.forEach(b => b.setAttribute('aria-pressed', String(Boolean(f) && b.dataset.filter === f)));
    if (clearBtn) clearBtn.hidden = !f;
    if (projectsSection) projectsSection.classList.toggle('is-filtering', Boolean(f));
    if (!f){
      allCards.forEach(c => c.classList.remove('filtered-out'));
      showTab(activeTab);
    } else {
      const keys = f.split(' ');
      tabs.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      Object.values(panels).forEach(grid => {
        let n = 0;
        cardsOf(grid).forEach(c => {
          const ok = matches(c, keys);
          c.classList.toggle('filtered-out', !ok);
          if (ok){ n++; c.classList.add('in'); }
        });
        grid.style.display = n ? '' : 'none';
        labelFor.get(grid).hidden = !n;
        grid.scrollLeft = 0;
        buildDots(grid);
      });
    }
  }
  filterBtns.forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    applyFilter(f && f !== activeFilter ? f : '');      // clicking the active chip again clears it
  }));
  Object.values(panels).forEach(buildDots);

  // ---------- Quick peek: a one-line outcome slides up on hover / keyboard focus ----------
  document.querySelectorAll('.project-card[data-peek]').forEach(card => {
    const peek = document.createElement('div');
    peek.className = 'peek';
    peek.setAttribute('aria-hidden', 'true');      // same facts are in the card's popup for screen readers
    const label = document.createElement('span'); label.className = 'peek-label mono'; label.textContent = 'Outcome';
    const text = document.createElement('p'); text.textContent = card.dataset.peek;
    const more = document.createElement('span'); more.className = 'peek-more mono'; more.textContent = 'Click for full details →';
    peek.append(label, text, more);
    card.appendChild(peek);
  });

  // ---------- Skills matrix → evidence: click a skill to jump to the work that uses it ----------
  document.querySelectorAll('.skills-group li[data-skill]').forEach(li => {
    const key = li.dataset.skill;
    const targets = [...document.querySelectorAll('[data-skills]')].filter(el => el.dataset.skills.split(' ').includes(key));
    if (!targets.length) return;
    const names = targets.map(el => el.dataset.short || (el.dataset.title || '').split(' — ')[0]).filter(Boolean);
    const hint = document.createElement('small');
    hint.className = 'skill-hint mono';
    hint.textContent = '→ ' + (names.length <= 2 ? names.join(', ') : names.length + ' items');
    li.appendChild(hint);
    li.classList.add('skill-link');
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', li.querySelector('span').textContent + ': show ' + names.join(', '));

    function go(){
      const panel = targets[0].closest('[data-panel]');
      if (panel){ activeTab = panel.dataset.panel; if (activeFilter) applyFilter(''); else showTab(activeTab); }
      document.querySelectorAll('.skill-match').forEach(el => el.classList.remove('skill-match'));
      targets.forEach(el => {
        el.classList.add('in');           // make sure reveal-hidden cards are visible
        void el.offsetWidth;              // restart the highlight animation on repeat clicks
        el.classList.add('skill-match');
      });
      targets[0].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block:'center' });
      setTimeout(() => targets.forEach(el => el.classList.remove('skill-match')), 2600);
    }
    li.addEventListener('click', go);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); } });
  });

  // ---------- Before/after super-resolution slider (only shown once both images are set) ----------
  const srFig = document.getElementById('srCompare');
  if (srFig && srFig.dataset.before && srFig.dataset.after){
    const stage = srFig.querySelector('.ba-stage');
    const mk = (src, cls, label) => {
      const img = document.createElement('img');
      img.src = src; img.className = cls; img.alt = label; img.draggable = false;
      return img;
    };
    const after = mk(srFig.dataset.after, 'ba-img', srFig.dataset.afterLabel || 'After');
    const before = mk(srFig.dataset.before, 'ba-img ba-before', srFig.dataset.beforeLabel || 'Before');
    const handle = document.createElement('span'); handle.className = 'ba-handle'; handle.setAttribute('aria-hidden', 'true');
    const lb = document.createElement('span'); lb.className = 'ba-label ba-label-l mono'; lb.textContent = before.alt;
    const la = document.createElement('span'); la.className = 'ba-label ba-label-r mono'; la.textContent = after.alt;
    const range = document.createElement('input');
    range.type = 'range'; range.min = '0'; range.max = '100'; range.value = '50';
    range.className = 'ba-range'; range.setAttribute('aria-label', 'Compare ' + before.alt + ' with ' + after.alt);
    stage.append(after, before, handle, lb, la, range);
    const set = (v) => {
      stage.style.setProperty('--pos', v + '%');
    };
    range.addEventListener('input', () => set(range.value));
    set(50);
    let loaded = 0;
    const ready = () => { if (++loaded === 2) srFig.hidden = false; };
    after.addEventListener('load', ready); before.addEventListener('load', ready);
  }

  // ---------- Hover-to-play clips on project cards (add data-video="images/clip.mp4") ----------
  document.querySelectorAll('.project-card[data-video]').forEach(card => {
    const v = document.createElement('video');
    v.src = card.dataset.video;
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    v.className = 'project-thumb';
    v.setAttribute('aria-hidden', 'true');
    if (card.dataset.poster) v.poster = card.dataset.poster;
    card.classList.add('has-thumb');
    card.prepend(v);
    if (reducedMotion) return;  // poster frame only
    if (isFinePointer){
      card.addEventListener('mouseenter', () => { v.play().catch(() => {}); });
      card.addEventListener('mouseleave', () => { v.pause(); });
      card.addEventListener('focus', () => { v.play().catch(() => {}); });
      card.addEventListener('blur', () => { v.pause(); });
    } else {
      // touch: play while the card is mostly on screen
      new IntersectionObserver(([en]) => { en.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold:.6 }).observe(card);
    }
  });

  const chatToggle = document.getElementById('chatToggle');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatInput = document.getElementById('chatInput');
  let chatLastFocused = null;
  try {
    if (localStorage.getItem('mth-chat-seen')) chatToggle.classList.add('no-ping');
  } catch(e){ /* ignore */ }
  function markChatSeen(){
    chatToggle.classList.add('no-ping');
    try { localStorage.setItem('mth-chat-seen', '1'); } catch(e){ /* ignore */ }
  }
  function setChat(open){
    if (open){
      chatLastFocused = document.activeElement;
      chatPanel.classList.add('open');
      requestAnimationFrame(() => chatPanel.classList.add('show'));
      markChatSeen();
      if (chatInput) setTimeout(() => chatInput.focus(), 260);
    } else {
      chatPanel.classList.remove('show');
      setTimeout(() => chatPanel.classList.remove('open'), 250);
      if (chatLastFocused) chatLastFocused.focus();
    }
    chatToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  chatToggle.addEventListener('click', () => setChat(!chatPanel.classList.contains('open')));
  chatClose.addEventListener('click', () => setChat(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatPanel.classList.contains('open')) setChat(false);
  });
  window.openPortfolioChat = () => setChat(true);

  // "/" opens the assistant (unless the visitor is typing somewhere)
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (chatPanel.classList.contains('open')){ if (chatInput) chatInput.focus(); e.preventDefault(); return; }
    e.preventDefault();
    setChat(true);
  });

  // ---------- Copy email + toast ----------
  const toast = document.getElementById('toast');
  let toastTimer = 0;
  function showToast(msg){
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  async function copyText(text){
    try { await navigator.clipboard.writeText(text); return true; }
    catch(e){
      // fallback for older browsers / non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch(_){ ok = false; }
      ta.remove();
      return ok;
    }
  }
  document.querySelectorAll('.copy-email').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy);
      showToast(ok ? 'Email copied ✓' : 'Copy failed — the address is ' + btn.dataset.copy);
      if (ok){
        btn.textContent = 'Copied ✓';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    });
  });
  document.querySelectorAll('[data-open-chat]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); setChat(true); });
  });

  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn && (!resumeBtn.getAttribute('href') || resumeBtn.getAttribute('href') === '#')){
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Wire this button to your hosted résumé PDF (e.g. /assets/resume.pdf).');
    });
  }

  // ---------- Mobile drawer menu ----------
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('mobileDrawer');
  const scrim = document.getElementById('drawerScrim');
  if (burger && drawer){
    const drawerLinks = drawer.querySelectorAll('a[data-drawer-nav]');
    function setDrawer(open){
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.classList.toggle('open', open);
      if (scrim) scrim.classList.toggle('open', open);
      document.body.classList.toggle('drawer-open', open);
    }
    burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
    if (scrim) scrim.addEventListener('click', () => setDrawer(false));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setDrawer(false); });

    const drawerSpy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const id = entry.target.id;
          drawerLinks.forEach(a => a.classList.toggle('active', a.dataset.drawerNav === id));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(sec => drawerSpy.observe(sec));
  }

  // ---------- 3D hover tilt on the hero portrait (rAF-throttled) ----------
  const tiltStage = document.getElementById('tiltStage');
  const tiltContainer = document.getElementById('tiltContainer');
  if (tiltStage && tiltContainer && isFinePointer && !reducedMotion) {
    let tx = 0, ty = 0, tiltQueued = false;
    tiltStage.addEventListener('mousemove', (e) => {
      tiltContainer.classList.remove('resetting');
      const rect = tiltStage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      tx = ((y - rect.height / 2) / (rect.height / 2)) * -15;
      ty = ((x - rect.width / 2) / (rect.width / 2)) * 15;
      if (!tiltQueued){
        tiltQueued = true;
        requestAnimationFrame(() => {
          tiltContainer.style.transform = `rotateX(${tx}deg) rotateY(${ty}deg)`;
          tiltQueued = false;
        });
      }
    });
    tiltStage.addEventListener('mouseleave', () => {
      tiltContainer.classList.add('resetting');
      tiltContainer.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
  }

  // ---------- Detail lightbox (Gallery photos + Research papers) ----------
  const galleryModal = document.getElementById('galleryModal');
  if (galleryModal){
    // Escapes text before it's interpolated into innerHTML below. The values
    // here come from this site's own static data-* attributes today, but
    // escaping is cheap insurance against a future edit routing untrusted
    // text (e.g. a CMS field) through the same code path.
    function escapeHTML(str){
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
    // Render a cropped thumbnail + caption overlay for any tile that has
    // a real photo set via data-img, so photos slot in with consistent
    // framing the moment they're added — no markup changes needed.
    document.querySelectorAll('[data-gallery][data-img]').forEach(slot => {
      const img = escapeHTML(slot.dataset.img);
      const title = escapeHTML(slot.dataset.title || '');
      const caption = slot.innerHTML;
      slot.innerHTML = `<img src="${img}" alt="${title}" class="gallery-thumb" draggable="false"><span class="gallery-caption">${caption}</span>`;
    });
    // Tiles still awaiting a real photo get a dashed border + small
    // "Pending" tag, so unfinished content is visually distinct from
    // finished content rather than looking like a bug.
    // Project cards: add data-img="images/x.jpg" to an <article class="project-card">
    // and it gets a 16:9 cover photo on the card and in its detail modal.
    document.querySelectorAll('.project-card[data-img]').forEach(card => {
      const thumb = document.createElement('img');
      thumb.src = card.dataset.img;
      thumb.alt = card.dataset.title || '';
      thumb.className = 'project-thumb';
      thumb.loading = 'lazy';
      thumb.draggable = false;
      card.classList.add('has-thumb');
      card.prepend(thumb);
    });
    document.querySelectorAll('[data-gallery]:not([data-img])').forEach(slot => {
      slot.classList.add('pending');
      const tag = document.createElement('span');
      tag.className = 'pending-tag mono';
      tag.textContent = 'Pending';
      slot.appendChild(tag);
    });

    const modalScrim = document.getElementById('galleryModalScrim');
    const modalClose = document.getElementById('galleryModalClose');
    const modalMedia = document.getElementById('galleryModalMedia');
    const modalTitle = document.getElementById('galleryModalTitle');
    const modalDesc = document.getElementById('galleryModalDesc');
    const modalSections = document.getElementById('galleryModalSections');
    const modalTag = document.getElementById('galleryModalTag');
    const modalBody = document.querySelector('.gallery-modal-body');
    let lastFocused = null;

    function openGalleryModal(trigger){
      const isTextOnly = trigger.hasAttribute('data-detail') && !trigger.dataset.img;
      const title = trigger.dataset.title || '';
      const desc = trigger.dataset.desc || '';
      const img = trigger.dataset.img;
      const link = trigger.dataset.link;
      const linkLabel = trigger.dataset.linkLabel || 'View source ↗';
      const tag = trigger.dataset.tag || (isTextOnly ? 'Research' : 'Milestone');
      const problem = trigger.dataset.problem;
      const approach = trigger.dataset.approach;
      const outcome = trigger.dataset.outcome;
      const role = trigger.dataset.role; // optional: data-role="Firmware lead — wrote the ESP32 stabilizer"

      modalTag.textContent = tag;
      modalTitle.textContent = title;

      // Case-study cards (Problem/Approach/Outcome) render as labeled
      // sections instead of a single paragraph; everything else keeps
      // the simple single-description format.
      modalSections.innerHTML = '';
      if (problem || approach || outcome){
        modalDesc.style.display = 'none';
        modalDesc.textContent = '';
        [['My role', role], ['Problem', problem], ['Approach', approach], ['Outcome', outcome]].forEach(([label, text]) => {
          if (!text) return;
          const section = document.createElement('div');
          section.className = 'modal-section';
          const h4 = document.createElement('h4');
          h4.textContent = label;
          const p = document.createElement('p');
          p.textContent = text;
          section.appendChild(h4);
          section.appendChild(p);
          modalSections.appendChild(section);
        });
      } else {
        modalDesc.style.display = '';
        modalDesc.textContent = desc;
      }

      if (isTextOnly){
        modalMedia.style.display = 'none';
      } else {
        modalMedia.style.display = 'flex';
        modalMedia.innerHTML = img
          ? `<img src="${escapeHTML(img)}" alt="${escapeHTML(title)}" draggable="false">`
          : `<div class="media-placeholder">Photo pending upload —<br>swap in a real image via this slot's data-img attribute</div>`;
      }

      const existingLink = modalBody.querySelector('.modal-link');
      if (existingLink) existingLink.remove();
      if (link){
        const a = document.createElement('a');
        a.href = link;
        if (/^https?:/i.test(link)){ a.target = '_blank'; a.rel = 'noopener'; } // internal pages open in place
        a.className = 'modal-link mono';
        a.textContent = linkLabel;
        modalBody.appendChild(a);
      }

      lastFocused = document.activeElement;
      galleryModal.classList.add('open');
      galleryModal.setAttribute('aria-hidden', 'false');
      modalClose.focus();
      document.body.classList.add('drawer-open');
    }
    function closeGalleryModal(){
      galleryModal.classList.remove('open');
      galleryModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawer-open');
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('[data-gallery], [data-detail]').forEach(slot => {
      slot.addEventListener('click', () => openGalleryModal(slot));
      slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openGalleryModal(slot); }
      });
    });
    modalScrim.addEventListener('click', closeGalleryModal);
    modalClose.addEventListener('click', closeGalleryModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && galleryModal.classList.contains('open')) closeGalleryModal();
    });
  }

  // ---------- Pause decorative infinite animations when the tab is hidden ----------
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('anim-paused', document.hidden);
  });
})();
