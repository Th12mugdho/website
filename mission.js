// mission.js — hero intro.
//
//   $ px4-commander takeoff      ← typed in the hero (PX4 SITL's bash wrapper for the commander module)
//   then a small log window above the photo prints PX4-style lines one by one:
//   ready → armed → takeoff → waypoint reached → payload box stabilising → payload lowered ✓
//   and ends on a blinking "$" prompt.
//
// Plays once per page load. Waits for the boot loader on a first visit. Visitors who
// prefer reduced motion see the finished state immediately. Log window hidden ≤960px (CSS).
(function(){
  const cmdEl = document.getElementById('heroCmd');
  const term = document.getElementById('heroTerm');
  const lines = term ? [...term.querySelectorAll('.term-body p')] : [];
  const state = document.getElementById('termState');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const firstVisit = !document.documentElement.classList.contains('pl-skip');
  const startDelay = firstVisit ? 2700 : 500;          // the drone loader runs ~2.3 s on a first visit
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const setState = (s) => { if (state) state.textContent = s; };

  function finalState(){
    if (cmdEl) cmdEl.textContent = cmdEl.dataset.cmd;
    if (!term) return;
    term.classList.add('on');
    lines.forEach(l => l.classList.add('shown'));
    setState('done');
  }
  if (reduce){ finalState(); return; }

  async function typeCommand(){
    if (!cmdEl) return;
    const text = cmdEl.dataset.cmd || '';
    cmdEl.textContent = '';
    for (let i = 1; i <= text.length; i++){
      cmdEl.textContent = text.slice(0, i);
      await wait(text[i - 1] === ' ' ? 90 : 45 + Math.random() * 40);
    }
  }

  async function printLog(){
    if (!term) return;
    term.classList.add('on', 'running');
    setState('running');
    await wait(350);
    for (const line of lines){
      line.classList.add('shown');
      // a little irregularity so it reads like real output, with a pause before the payload drops
      const isPayload = line.dataset.lvl === 'ok';
      await wait(isPayload ? 200 : line.dataset.lvl === 'node' ? 900 : 380 + Math.random() * 260);
    }
    term.classList.remove('running');
    setState('done');
  }

  // Pause the PCB's ambient data packets while the hero is off screen
  const pcb = document.getElementById('heroPcb');
  if (pcb && 'IntersectionObserver' in window){
    new IntersectionObserver(([en]) => pcb.classList.toggle('is-paused', !en.isIntersecting)).observe(pcb);
  }

  if (cmdEl) cmdEl.textContent = '';
  setTimeout(async () => {
    await typeCommand();
    if (cmdEl) cmdEl.parentElement.classList.add('typed');
    await wait(300);
    printLog();
  }, startDelay);
})();
