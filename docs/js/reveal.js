/* Reveal-on-scroll + typing helper */
(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const lines = Array.from(document.querySelectorAll('.type-line'));

  // Ensure --chars and durations for all type-lines
  lines.forEach(el => {
    if (!el.style.getPropertyValue('--chars')) {
      const chars = [...el.textContent].length;
      el.style.setProperty('--chars', String(chars));
    }
    const chars = parseInt(el.style.getPropertyValue('--chars')) || [...el.textContent].length;
    const msPerChar = parseInt(el.getAttribute('data-ms-per-char') || '45');
    const dur = chars * msPerChar;

    el.style.animationDuration = `${dur}ms`;

    if (el.hasAttribute('data-delay')) {
      el.style.animationDelay = `${parseInt(el.getAttribute('data-delay'))}ms`;
    }

    el.dataset._dur = String(dur);
    el.style.animationFillMode = 'both';
  });

  // Measure hero pixel width & assign typingPx for hero lines
  function measureHero() {
    document.querySelectorAll('.hero .type-line').forEach(el => {
      const prevWidth = el.style.width;
      el.style.width = 'auto';
      const px = el.scrollWidth;
      el.style.setProperty('--px', `${px}px`);
      el.style.width = prevWidth;
      el.style.animationName = 'typingPx';
    });
  }

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
    .then(measureHero);

  // Cascade hero lines (title -> tag -> author), overlapping yet orderly
  (function cascadeHero() {
    const heroLines = Array.from(document.querySelectorAll('.hero .type-line'));
    if (!heroLines.length) return;

    let offset = 160; // lead-in before first keystroke
    heroLines.forEach(el => {
      const dur = parseInt(el.dataset._dur || '0');
      el.style.animationDelay = `${offset}ms`;
      offset += Math.max(120, Math.floor(dur * 0.85)); // overlap a little for rhythm
    });

    const tagLine = document.querySelector('.hero-line--tag');
    const authorCursor = document.querySelector('.cursor--author');

    if (tagLine && authorCursor) {
      const tagDelay = parseInt(tagLine.style.animationDelay || '0');
      const tagDur   = parseInt(tagLine.dataset._dur || '0');
      const showAuthorCursorAt = tagDelay + tagDur + 40; // small buffer

      authorCursor.style.visibility = 'hidden';
      setTimeout(() => {
        authorCursor.style.visibility = 'visible';
      }, showAuthorCursorAt);
    }

    // Breath micro-motion on tagline after author settles
    const tag = document.querySelector('.hero__tag');
    const last = heroLines[heroLines.length - 1];
    const lastDelay = parseInt(last.style.animationDelay || '0');
    const lastDur = parseInt(last.dataset._dur || '0');
    const breathDelay = lastDelay + lastDur + 300; // a small beat after settle
    tag.style.setProperty('--breath-delay', `${breathDelay}ms`);
    tag.classList.add('breathe');
  })();

  // Reveal-on-scroll
  reveals.forEach(el => {
    const stagger = Number(el.getAttribute('data-stagger') || 0);
    el.style.setProperty('--stagger', stagger);
  });

  Array.from(document.querySelectorAll('.coda .card')).forEach((card, i) => {
    card.style.setProperty('--index', i);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '20% 0px 20% 0px', threshold: 0 });

  reveals.forEach(el => io.observe(el));

  // Reveal already in view on load
  const vh = window.innerHeight || document.documentElement.clientHeight;
  reveals.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9 && r.bottom > 0) {
      el.classList.add('revealed');
      io.unobserve(el);
    }
  });

  root.classList.add('reveal-ready');
})();

/* Card back: auto-wrap detection */
(function(){
  const SEL = '.card .back__line';
  const lines = document.querySelectorAll(SEL);

  function chWidthFor(el){
    const probe = document.createElement('span');
    probe.textContent = '0';
    probe.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap;';
    el.appendChild(probe);
    const w = probe.getBoundingClientRect().width || 8;
    probe.remove();
    return w;
  }

  function updateBackLines(){
    lines.forEach(line=>{
      const type = line.querySelector('.type-line');
      if(!type) return;

      const text = type.textContent;
      const chars = [...text].length;
      type.style.setProperty('--chars', chars);

      const cw = chWidthFor(line);
      const pr = parseFloat(getComputedStyle(line).paddingRight) || 0;
      const usable = line.clientWidth - pr;
      const capacity = Math.floor(usable / cw) - 1;

      line.classList.toggle('wrap', chars > capacity);
    });
  }

  const defer = fn => Promise.resolve().then(fn);

  window.addEventListener('DOMContentLoaded', () => defer(updateBackLines), {once:true});
  window.addEventListener('resize', () => {
    clearTimeout(updateBackLines._t);
    updateBackLines._t = setTimeout(updateBackLines, 150);
  });
  document.addEventListener('change', e=>{
    if(e.target.matches('.flip-toggle')) {
      setTimeout(updateBackLines, 100);
    }
  });
})();

/* Desktop-only: cursor jumps down two lines after typing finishes (Oracle + Creator) */
(function(){
  const PAIRS = [
    { toggle: '#flip-oracle',  line: '#card-oracle .type-line',   container: '#card-oracle .back__line' },
    { toggle: '#flip-creator', line: '#card-creator .type-line',  container: '#card-creator .back__line' },
  ];
  const isDesktop = () => matchMedia('(min-width: 921px)').matches;
  const timers = new Map();

  function arm(pair){
    const t = document.querySelector(pair.toggle);
    const line = document.querySelector(pair.line);
    const cont = document.querySelector(pair.container);
    if(!t || !line || !cont) return;

    t.addEventListener('change', () => {
      if(!isDesktop()){
        cont.classList.remove('paragraph-cursor');
        if(timers.has(cont)){
          clearTimeout(timers.get(cont));
          timers.delete(cont);
        }
        return;
      }

      if(t.checked){
        const dur = parseInt(line.dataset._dur || '0');
        const delay = parseInt(line.style.animationDelay || '0');
        const when = dur + delay + 60; // a hair after the last glyph
        const id = setTimeout(() => cont.classList.add('paragraph-cursor'), when);
        timers.set(cont, id);
      }else{
        if(timers.has(cont)){
          clearTimeout(timers.get(cont));
          timers.delete(cont);
        }
        cont.classList.remove('paragraph-cursor');
      }
    });
  }

  PAIRS.forEach(arm);
})();
