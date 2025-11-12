/* Reveal-on-scroll helper (robust at page load) */
(function () {
  const root = document.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  // Auto-size typing: set --chars from actual text length
  document.querySelectorAll('.type-line').forEach(el => {
    // Only set if not already provided inline
    if (!el.style.getPropertyValue('--chars')) {
      el.style.setProperty('--chars', String(el.textContent.length));
    }
  // Adjust typing duration to match text length (+ allow per-element speed)
  document.querySelectorAll('.type-line').forEach(el => {
    const chars = parseInt(el.style.getPropertyValue('--chars')) || el.textContent.length;
    const msPerChar = parseInt(el.getAttribute('data-ms-per-char') || '45'); // default speed
    const dur = chars * msPerChar;
    el.style.animationDuration = `${dur}ms`;
    // keep any explicit delay if you add data-delay later, else leave default from CSS
    if (el.hasAttribute('data-delay')) {
      el.style.animationDelay = `${parseInt(el.getAttribute('data-delay'))}ms`;
    }
    el.dataset._dur = String(dur); // stash for sequencing
  });

  // Make the HERO cascade: title finishes, then tagline starts
  (function cascadeHero(){
    const lines = Array.from(document.querySelectorAll('.hero .type-line'));
    if (!lines.length) return;
    let offset = 120; // small lead-in before first keystroke
    lines.forEach((el, i) => {
      const dur = parseInt(el.dataset._dur || '0');
      // give each line its own delay so line 2 waits for line 1, etc.
      el.style.animationDelay = `${offset}ms`;
      offset += dur + 160; // gap between lines
    });
  })();  
  // Adjust typing duration to match text length
  document.querySelectorAll('.type-line').forEach(el => {
    const chars = parseInt(el.style.getPropertyValue('--chars')) || el.textContent.length;
    const msPerChar = 45; // tweak: smaller = faster typing
    el.style.animationDuration = `${chars * msPerChar}ms`; 
  });

  // Pass stagger into CSS var
  for (const el of reveals) {
    const stagger = Number(el.getAttribute('data-stagger') || 0);
    el.style.setProperty('--stagger', stagger);
  }
  // Index for coda
  document.querySelectorAll('.coda .card').forEach((card, i) => {
    card.style.setProperty('--index', i);
  });

  // Observer: fire on any intersection at all, generous top/bottom margins
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: '20% 0px 20% 0px', threshold: 0 });

  // Observe everything
  for (const el of reveals) io.observe(el);

  // ALSO: immediately reveal elements already in view on load (hero, etc.)
  const vh = window.innerHeight || document.documentElement.clientHeight;
  for (const el of reveals) {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9 && r.bottom > 0) {
      el.classList.add('revealed');
      io.unobserve(el);
    }
  }
  
  // signal that the reveal system is mounted; CSS can now hide/animate safely
  document.documentElement.classList.add('reveal-ready');
})();
