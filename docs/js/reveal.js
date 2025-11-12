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

  // 1) Ensure --chars exists for every line
  lines.forEach(el => {
    if (!el.style.getPropertyValue('--chars')) {
      el.style.setProperty('--chars', String(el.textContent.length));
    }
  });

  // 2) Duration per element (supports data-ms-per-char + optional data-delay)
  lines.forEach(el => {
    const chars = parseInt(el.style.getPropertyValue('--chars')) || el.textContent.length;
    const msPerChar = parseInt(el.getAttribute('data-ms-per-char') || '45'); // default speed
    const dur = chars * msPerChar;

    el.style.animationDuration = `${dur}ms`;
    if (el.hasAttribute('data-delay')) {
      el.style.animationDelay = `${parseInt(el.getAttribute('data-delay'))}ms`;
    }
    el.dataset._dur = String(dur); // stash for sequencing
  });

  // 3) HERO: measure true pixel width and switch to pixel-accurate animation
  document.querySelectorAll('.hero .type-line').forEach(el => {
    const prevWidth = el.style.width;
    el.style.width = 'auto';                 // let it expand to full text
    const px = el.scrollWidth;               // real pixel width
    el.style.setProperty('--px', `${px}px`); // drives @keyframes typingPx
    el.style.width = prevWidth;              // restore
    el.style.animationName = 'typingPx';     // hero uses px-accurate typing
  });

  // 4) Cascade hero lines: title → tagline
  (function cascadeHero() {
    const heroLines = Array.from(document.querySelectorAll('.hero .type-line'));
    if (!heroLines.length) return;

    let offset = 120; // small lead-in before first keystroke
    heroLines.forEach(el => {
      const dur = parseInt(el.dataset._dur || '0');
      el.style.animationDelay = `${offset}ms`;
      offset += dur + 160; // gap between lines
    });
  })();

  // -----------------------------
  // Reveal-on-scroll wiring
  // -----------------------------
  // Pass stagger into a CSS var per section
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
