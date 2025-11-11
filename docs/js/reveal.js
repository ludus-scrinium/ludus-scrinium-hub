/* IntersectionObserver that toggles .revealed and sets stagger + index.
   Keeps animation logic purely in CSS (per Val Head’s approach). */

(function () {
  const reveals = document.querySelectorAll('.reveal');

  // Provide per-section stagger from data attribute
  reveals.forEach(el => {
    const stagger = Number(el.getAttribute('data-stagger') || 0);
    el.style.setProperty('--stagger', stagger);
  });

  // Assign a stable index to each .card for coda staggering
  document.querySelectorAll('.coda .card').forEach((card, i) => {
    card.style.setProperty('--index', i);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve once revealed to avoid retrigger
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  reveals.forEach(el => io.observe(el));
})();
