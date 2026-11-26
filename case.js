// Minimal script for standalone case-study pages (payra.html):
// theme toggle, scroll-reveal, and the waveform scroll indicator.

(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  if (toggle){
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      const apply = () => {
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('mth-theme', next); } catch(e){ /* storage unavailable */ }
      };
      if (window.plotterSwitch) window.plotterSwitch(next, apply); else apply();
    });
  }

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){ e.target.classList.add('in'); reveal.unobserve(e.target); }
    });
  }, { threshold: 0 });
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

  // Architecture diagram: run the signal-flow animation only while it's on screen
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('svg.diagram').forEach(svg => {
    if (typeof svg.pauseAnimations !== 'function') return;
    if (reducedMotion){ svg.pauseAnimations(); svg.classList.add('dg-paused'); return; }
    svg.pauseAnimations(); svg.classList.add('dg-paused');
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting){ svg.unpauseAnimations(); svg.classList.remove('dg-paused'); }
      else { svg.pauseAnimations(); svg.classList.add('dg-paused'); }
    }, { threshold: 0.2 }).observe(svg);
  });

  const fill = document.getElementById('scrollRailFill');
  if (fill){
    let queued = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      fill.style.clipPath = `inset(0 ${((1 - pct) * 100).toFixed(2)}% 0 0)`;
      queued = false;
    };
    window.addEventListener('scroll', () => { if (!queued){ queued = true; requestAnimationFrame(update); } }, { passive:true });
    update();
  }
})();
