(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  let theme = 'dark';
  function applyTheme(t){ theme = t; root.setAttribute('data-theme', t); }
  applyTheme('dark');
  toggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));

  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive:true });
  }

  document.querySelectorAll('.glass').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  const navCapsule = document.getElementById('navCapsule');
  window.addEventListener('scroll', () => {
    navCapsule.classList.toggle('scrolled', window.scrollY > 30);
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
  window.addEventListener('resize', () => movePill(document.querySelector('nav.links a.active')));

  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  revealEls.forEach(el => reveal.observe(el));

  const counters = document.querySelectorAll('[data-count]');
  const counted = new WeakSet();
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted.has(entry.target)){
        counted.add(entry.target);
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

  document.getElementById('resumeBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Wire this button to your hosted résumé PDF (e.g. /assets/resume.pdf).');
  });
})();