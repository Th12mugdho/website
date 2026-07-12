(function(){
  // --- THEME SETUP ---
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  let theme = localStorage.getItem('theme') || 'dark'; // Save theme across pages
  
  function applyTheme(t){ 
    theme = t; 
    root.setAttribute('data-theme', t); 
    localStorage.setItem('theme', t);
  }
  
  applyTheme(theme);
  toggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));

  // --- CURSOR GLOW ---
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive:true });
  }

  // --- GLASS HOVER EFFECT ---
  document.querySelectorAll('.glass').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // --- STICKY NAV BEHAVIOR ---
  const navCapsule = document.getElementById('navCapsule');
  window.addEventListener('scroll', () => {
    navCapsule.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive:true });

  // --- NAV PILL SLIDER ---
  const navPill = document.getElementById('navPill');
  function movePill(link){
    if (!link) return;
    navPill.style.width = link.offsetWidth + 'px';
    navPill.style.transform = `translateX(${link.offsetLeft}px)`;
  }
  
  // Initialize pill on the currently active page link
  const activeLink = document.querySelector('nav.links a.active');
  if(activeLink) {
    // Small timeout ensures fonts/layout have loaded before calculating width
    setTimeout(() => movePill(activeLink), 50); 
  }
  window.addEventListener('resize', () => movePill(document.querySelector('nav.links a.active')));

  // --- SCROLL REVEAL ANIMATIONS ---
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  revealEls.forEach(el => reveal.observe(el));

  // --- NUMBER COUNTERS ---
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

  // --- PROJECT TABS (Only runs if tabs exist on the current page) ---
  const tabs = document.querySelectorAll('.tabbar button');
  const panels = { robotics: document.getElementById('robotics'), electronics: document.getElementById('electronics') };
  if(tabs.length > 0) {
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
        btn.classList.add('active'); btn.setAttribute('aria-selected','true');
        Object.entries(panels).forEach(([key, el]) => { 
            if(el) el.style.display = key === btn.dataset.cat ? 'grid' : 'none'; 
        });
      });
    });
  }

  // --- RESUME BUTTON ALERT ---
  const resumeBtn = document.getElementById('resumeBtn');
  if(resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Wire this button to your hosted résumé PDF (e.g. /assets/resume.pdf).');
    });
  }
})();
