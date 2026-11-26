// Plotter-style theme switch, shared by index.html and payra.html.
// Switching to Blueprint: a pen-carriage line sweeps DOWN the screen and the new
// theme is "plotted" behind it. Switching back to Dark: the sweep runs UP.
// Uses the View Transitions API; falls back to an instant switch where it isn't
// supported or when the visitor prefers reduced motion.
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running = false;

  window.plotterSwitch = function(nextTheme, apply){
    if (reduce || running || typeof document.startViewTransition !== 'function'){ apply(); return; }
    running = true;
    const root = document.documentElement;
    root.classList.add('vt-plot');
    root.classList.toggle('vt-up', nextTheme === 'dark');

    let line = null;
    const t = document.startViewTransition(() => {
      apply();
      // The carriage only exists in the "new" snapshot, so it animates on its own layer above the page.
      line = document.createElement('div');
      line.className = 'plotter-line';
      line.setAttribute('aria-hidden', 'true');
      line.innerHTML = '<span class="plotter-head"></span>';
      document.body.appendChild(line);
    });
    t.finished.finally(() => {
      if (line) line.remove();
      root.classList.remove('vt-plot', 'vt-up');
      running = false;
    });
  };
})();
