/* Reveal-on-scroll + typing helper (robust at page load) */
(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  // All sections that reveal on scroll
  const reveals = Array.from(document.querySelectorAll('.reveal'));

  // -----------------------------
  // Typing setup (cards + hero)
  // -----------------------------
  const lines = Array.from(document.querySelectorAll('.type-line'));

  // 1) Ensure --chars exists for every line (course: steps() needs correct count)
  lines.forEach(el => {
    if (!el.style.getPropertyValue('--chars')) {
      const chars = [...el.textContent].length;
      el.style.setProperty('--chars', String(chars));
    }
    // Always hold pre/post states (animation-fill-mode: both)
    el.style.animationFillMode = 'both';
  });

  // 2) Duration per element (supports data-ms-per-char + optional data-delay)
  lines.forEach(el => {
    const chars = parseInt(el.style.getPropertyValue('--chars')) || [...el.textContent].length;
    const msPerChar = parseInt(el.getAttribute('data-ms-per-char') || '45'); // default speed
    const dur = chars * msPerChar;

    el.style.animationDuration = `${dur}ms`;
    if (el.hasAttribute('data-delay')) {
      el.style.animationDelay = `${parseInt(el.getAttribute('data-delay'))}ms`;
    }
    el.dataset._dur = String(dur); // stash for sequencing
  });

  // 3) HERO: measure true pixel width and switch to pixel-accurate animation
  function measureHero() {
    document.querySelectorAll('.hero .type-line').forEach(el => {
      const prevWidth = el.style.width;
      el.style.width = 'auto';                 // let it expand to full text
      const px = el.scrollWidth;               // real pixel width
      el.style.setProperty('--px', `${px}px`); // drives @keyframes typingPx
      el.style.width = prevWidth;              // restore
      el.style.animationName = 'typingPx';     // hero uses px-accurate typing
    });
  }
  if ('fonts' in document && document.fonts.ready) {
    document.fonts.ready.then(measureHero);
  } else {
    // Fallback
    window.addEventListener('load', measureHero, { once: true });
  }

  // 4) Cascade hero lines: title → tagline (course: deliberate sequencing)
  (function cascadeHero() {
    const heroLines = Array.from(document.querySelectorAll('.hero .type-line'));
    if (!heroLines.length) return;

    let offset = 160; // small lead-in before first keystroke
    heroLines.forEach(el => {
      const dur = parseInt(el.dataset._dur || '0');
      el.style.animationDelay = `${offset}ms`;
      offset += dur + 180; // gap between lines (breath)
    });
  })();

  // -----------------------------
  // Reveal-on-scroll wiring
  // -----------------------------
  reveals.forEach(el => {
    const stagger = Number(el.getAttribute('data-stagger') || 0);
    el.style.setProperty('--stagger', stagger);
  });

  // Index for coda cards (for staggered timing)
  Array.from(document.querySelectorAll('.coda .card')).forEach((card, i) => {
    card.style.setProperty('--index', i);
  });

  // IntersectionObserver: reveal when intersecting
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '20% 0px 20% 0px', threshold: 0 });

  // Observe all reveal sections
  reveals.forEach(el => io.observe(el));

  // Immediately reveal anything already in view (e.g., hero)
  const vh = window.innerHeight || document.documentElement.clientHeight;
  reveals.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9 && r.bottom > 0) {
      el.classList.add('revealed');
      io.unobserve(el);
    }
  });

  // Signal that the reveal system is mounted (CSS now safe to hide/animate)
  root.classList.add('reveal-ready');
})();

/* ----------------------------------------------- */
/* Card back: auto-wrap detection + --chars update */
/* ----------------------------------------------- */
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

      // ensure correct --chars
      const text = type.textContent;
      const chars = [...text].length;
      type.style.setProperty('--chars', chars);

      // capacity in ch (reserve 1ch for cursor padding)
      const cw = chWidthFor(line);
      const pr = parseFloat(getComputedStyle(line).paddingRight) || 0;
      const usable = line.clientWidth - pr;
      const capacity = Math.floor(usable / cw) - 1;

      line.classList.toggle('wrap', chars > capacity);
    });
  }

  // Run after layout has settled
  const defer = fn => Promise.resolve().then(fn);
  window.addEventListener('DOMContentLoaded', () => defer(updateBackLines), {once:true});
  window.addEventListener('resize', () => { clearTimeout(updateBackLines._t); updateBackLines._t = setTimeout(updateBackLines, 150); });
  document.addEventListener('change', e=>{
    if(e.target.matches('.flip-toggle')) setTimeout(updateBackLines, 100);
  });
})();
