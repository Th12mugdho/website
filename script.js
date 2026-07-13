(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  let theme = 'dark';
  function applyTheme(t){ theme = t; root.setAttribute('data-theme', t); }
  applyTheme('dark');
  toggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer:fine)').matches;

  // ---------- Cursor glow: rAF-throttled, GPU-composited (transform, not left/top) ----------
  const glow = document.getElementById('cursorGlow');
  if (glow && isFinePointer && !reducedMotion){
    let mx = -500, my = -500, glowQueued = false;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!glowQueued){
        glowQueued = true;
        requestAnimationFrame(() => {
          glow.style.transform = `translate3d(${mx - 170}px, ${my - 170}px, 0)`;
          glowQueued = false;
        });
      }
    }, { passive:true });
  } else if (glow){
    glow.remove(); // decorative only — skip entirely on touch / reduced-motion
  }

  // NOTE: the old per-card mousemove "spotlight" effect (20+ elements each
  // running their own mousemove listener + style write) was the single
  // biggest source of jank on this page — it forced a style recalculation
  // on every pixel of mouse movement, for every glass card on screen at
  // once. It's replaced by a pure-CSS hover glow in style.css (`.glass:hover::before`),
  // which costs nothing until a card is actually hovered.

  // ---------- Nav capsule scroll state (rAF-throttled) ----------
  const navCapsule = document.getElementById('navCapsule');
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      navCapsule.classList.toggle('scrolled', window.scrollY > 30);
      scrollQueued = false;
    });
  }, { passive:true });

  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('nav.links a');
  const navPill = document.getElementById('navPill');

  function movePill(link){
    if (!link) return;
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
  const panels = { robotics: document.getElementById('robotics'), electronics: document.getElementById('electronics') };
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      Object.entries(panels).forEach(([key, el]) => { el.style.display = key === btn.dataset.cat ? 'grid' : 'none'; });
    });
  });

  const chatToggle = document.getElementById('chatToggle');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  function setChat(open){
    if (open){
      chatPanel.classList.add('open');
      requestAnimationFrame(() => chatPanel.classList.add('show'));
    } else {
      chatPanel.classList.remove('show');
      setTimeout(() => chatPanel.classList.remove('open'), 250);
    }
    chatToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  chatToggle.addEventListener('click', () => setChat(!chatPanel.classList.contains('open')));
  chatClose.addEventListener('click', () => setChat(false));

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

  // ---------- Twinkling sparkle field (kept deliberately light) ----------
  const sparkleField = document.getElementById('sparkleField');
  if (sparkleField && !reducedMotion){
    const colors = ['#3FE3C4', '#4C8DFF', '#8B6CFF'];
    const count = window.innerWidth < 640 ? 8 : 16;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++){
      const dot = document.createElement('span');
      dot.className = 'sparkle';
      const size = 2 + Math.random() * 2.5;
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      dot.style.color = colors[i % colors.length];
      dot.style.setProperty('--peak', (0.5 + Math.random() * 0.4).toFixed(2));
      dot.style.animationDuration = (3 + Math.random() * 4).toFixed(2) + 's';
      dot.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
      frag.appendChild(dot);
    }
    sparkleField.appendChild(frag);
  }

  // ---------- Marquee: duplicate content once so the -50% loop is seamless ----------
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack && marqueeTrack.children.length && !marqueeTrack.dataset.doubled){
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
    marqueeTrack.dataset.doubled = 'true';
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

  // ---------- Pause decorative infinite animations when the tab is hidden ----------
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('anim-paused', document.hidden);
  });
})();
