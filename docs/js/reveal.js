/* ========================================= */
/* Enhanced Reveal-on-scroll + Typing       */
/* + Particles + Connections + Bursts       */
/* Performance optimized for mobile         */
/* ========================================= */
(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const lines = Array.from(document.querySelectorAll('.type-line'));
  
  // Mobile detection for performance optimization
  const isMobile = () => window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile() ? 12 : 20; // Reduced count on mobile

  // =====================
  // Typing Setup
  // =====================
  lines.forEach(el => {
    if (!el.style.getPropertyValue('--chars')) {
      const chars = Array.from(el.textContent).length;
      el.style.setProperty('--chars', String(chars));
    }
    const chars = parseInt(el.style.getPropertyValue('--chars')) || Array.from(el.textContent).length;
    const msPerChar = parseInt(el.getAttribute('data-ms-per-char') || '45');
    const dur = chars * msPerChar;
    el.style.animationDuration = `${dur}ms`;
    if (el.hasAttribute('data-delay')) {
      el.style.animationDelay = `${parseInt(el.getAttribute('data-delay'))}ms`;
    }
    el.dataset._dur = String(dur);
    el.style.animationFillMode = 'both';
  });

  // Measure hero pixel width for typingPx
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
  
  // Wait for fonts to load before measuring
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
    .then(measureHero)
    .then(() => {
      // Fix: cursor visibility after font load
      setTimeout(() => {
        const heroLines = Array.from(document.querySelectorAll('.hero .type-line'));
        const tagLine = document.querySelector('.hero-line--tag');
        const authorCursor = document.querySelector('.cursor--author');

        if (tagLine && authorCursor) {
          const tagDelay = parseInt(tagLine.style.animationDelay || '0');
          const tagDur   = parseInt(tagLine.dataset._dur || '0');
          const showAuthorCursorAt = tagDelay + tagDur + 40;

          authorCursor.style.visibility = 'hidden';
          setTimeout(() => {
            authorCursor.style.visibility = 'visible';
          }, showAuthorCursorAt);
        }
      }, 100);
    });

  // =====================
  // Hero Cascade (with anticipation)
  // =====================
  (function cascadeHero() {
    const heroLines = Array.from(document.querySelectorAll('.hero .type-line'));
    if (!heroLines.length) return;

    let offset = 200; // Extended lead-in for anticipation
    heroLines.forEach(el => {
      const dur = parseInt(el.dataset._dur || '0');
      el.style.animationDelay = `${offset}ms`;
      offset += Math.max(140, Math.floor(dur * 0.88));
    });

    // Breath micro-motion on tagline (follow-through)
    const tag = document.querySelector('.hero__tag');
    const last = heroLines[heroLines.length - 1];
    if (tag && last) {
      const lastDelay = parseInt(last.style.animationDelay || '0');
      const lastDur = parseInt(last.dataset._dur || '0');
      const breathDelay = lastDelay + lastDur + 350;
      tag.style.setProperty('--breath-delay', `${breathDelay}ms`);
      tag.classList.add('breathe');
    }
  })();

  // =====================
  // Reveal-on-Scroll
  // =====================
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

  // Reveal items already in view
  const vh = window.innerHeight || document.documentElement.clientHeight;
  reveals.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.9 && r.bottom > 0) {
      el.classList.add('revealed');
      io.unobserve(el);
    }
  });

  root.classList.add('reveal-ready');

  // =====================
  // Card Back: Auto-wrap Detection
  // Batched reads for performance
  // =====================
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
      // Batch reads
      const measurements = Array.from(lines).map(line => {
        const type = line.querySelector('.type-line');
        if (!type) return null;
        
        const text = type.textContent;
        const chars = Array.from(text).length;
        const cw = chWidthFor(line);
        const pr = parseFloat(getComputedStyle(line).paddingRight) || 0;
        const usable = line.clientWidth - pr;
        const capacity = Math.floor(usable / cw) - 1;
        
        return { line, type, chars, capacity };
      }).filter(Boolean);

      // Batch writes
      measurements.forEach(({ line, type, chars, capacity }) => {
        type.style.setProperty('--chars', chars);
        line.classList.toggle('wrap', chars > capacity);
      });
    }

    const defer = fn => Promise.resolve().then(fn);
    window.addEventListener('DOMContentLoaded', () => defer(updateBackLines), {once:true});
    
    // Throttled resize handler
    let resizeTimer;
    window.addEventListener('resize', () => { 
      clearTimeout(resizeTimer); 
      resizeTimer = setTimeout(updateBackLines, 200); 
    });
    
    document.addEventListener('change', e=>{
      if(e.target.matches('.flip-toggle')) setTimeout(updateBackLines, 150);
    });
  })();

  // =====================
  // Desktop: Cursor Paragraph Jump
  // =====================
  (function(){
    const PAIRS = [
      { toggle: '#flip-oracle', line: '#card-oracle .type-line', container: '#card-oracle .back__line' },
      { toggle: '#flip-creator', line: '#card-creator .type-line', container: '#card-creator .back__line' },
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
          if(timers.has(cont)){ clearTimeout(timers.get(cont)); timers.delete(cont); }
          return;
        }
        if(t.checked){
          const dur = parseInt(line.dataset._dur || '0');
          const delay = parseInt(line.style.animationDelay || '0');
          const when = dur + delay + 80;
          const id = setTimeout(() => cont.classList.add('paragraph-cursor'), when);
          timers.set(cont, id);
        }else{
          if(timers.has(cont)){ clearTimeout(timers.get(cont)); timers.delete(cont); }
          cont.classList.remove('paragraph-cursor');
        }
      });
    }

    PAIRS.forEach(arm);
  })();

  // ================================
  // Floating Particles (Depth-Aware)
  // Mobile-optimized count
  // ================================
  (function initParticles(){
    const container = document.getElementById('particles');
    if(!container) return;

    const particles = [];

    for(let i = 0; i < PARTICLE_COUNT; i++){
      const p = document.createElement('div');
      p.className = 'particle';
      
      const duration = 7 + Math.random() * 9; // 7-16s
      const delay = Math.random() * 6;
      const opacity = 0.25 + Math.random() * 0.35;
      const xStart = Math.random() * 100;
      const yStart = 25 + Math.random() * 55;
      const xMid = xStart + (Math.random() - 0.5) * 35;
      const yMid = yStart + (Math.random() - 0.5) * 45;
      const xEnd = xMid + (Math.random() - 0.5) * 25;
      const yEnd = yStart + 45 + Math.random() * 45;
      const scaleMid = 0.85 + Math.random() * 0.7;

      p.style.cssText = `
        --duration: ${duration}s;
        --delay: ${delay}s;
        --opacity: ${opacity};
        --x-start: ${xStart}vw;
        --y-start: ${yStart}vh;
        --x-mid: ${xMid}vw;
        --y-mid: ${yMid}vh;
        --x-end: ${xEnd}vw;
        --y-end: ${yEnd}vh;
        --scale-mid: ${scaleMid};
      `;

      container.appendChild(p);
      particles.push(p);
    }

    // Fade in particles after hero settles
    setTimeout(() => {
      particles.forEach(p => p.style.opacity = '1');
    }, 2400);
  })();

  // ================================
  // Particle Burst System
  // Triggered on card flip
  // ================================
  (function initParticleBursts(){
    const burstContainer = document.getElementById('particle-bursts');
    if(!burstContainer) return;

    function createBurst(x, y){
      const burstCount = 8;
      const particles = [];

      for(let i = 0; i < burstCount; i++){
        const p = document.createElement('div');
        p.className = 'burst-particle';
        
        const angle = (Math.PI * 2 * i) / burstCount;
        const distance = 40 + Math.random() * 60;
        const burstX = Math.cos(angle) * distance;
        const burstY = Math.sin(angle) * distance;

        p.style.cssText = `
          left: ${x}px;
          top: ${y}px;
          --burst-x: ${burstX}px;
          --burst-y: ${burstY}px;
        `;

        burstContainer.appendChild(p);
        particles.push(p);

        // Remove after animation
        setTimeout(() => p.remove(), 900);
      }
    }

    // Attach to all flip toggles
    document.querySelectorAll('.flip-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        if(e.target.checked){
          const card = e.target.nextElementSibling;
          if(card){
            const rect = card.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            createBurst(x, y);
          }
        }
      });
    });
  })();

  // ================================
  // Depth-Aware Starfield
  // Smooth opacity transitions
  // ================================
  (function depthStarfield(){
    let lastDepth = 0;
    
    function updateDepth(){
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / Math.max(docHeight, 1), 1);
      
      let depth = 0;
      if(progress > 0.25) depth = 1;
      if(progress > 0.5) depth = 2;
      if(progress > 0.75) depth = 3;

      if(depth !== lastDepth){
        document.body.classList.remove('depth-1', 'depth-2', 'depth-3');
        if(depth > 0) document.body.classList.add(`depth-${depth}`);
        lastDepth = depth;
      }
    }

    // Throttled scroll handler
    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateDepth, 100);
    }, {passive: true});

    updateDepth();
  })();

  // ================================
  // Connection Lines - Immersive
  // Continuous pulsing animation
  // Optimized with RAF management
  // ================================
  (function initConnections(){
    const canvas = document.getElementById('connections');
    if(!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animFrame = null;
    let pulsePhase = 0;
    let lineProgress = 0;
    let animationStartTime = null;
    let isAnimating = false;

    // Resize canvas
    function resize(){
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    }
    resize();
    
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if(canvas.classList.contains('visible')) drawConnections();
      }, 200);
    });

    // Get all card positions (batched reads)
    function getAllCardPositions(){
      const cards = Array.from(document.querySelectorAll('.card'));
      return cards.map((card, index) => {
        const rect = card.getBoundingClientRect();
        const section = card.closest('[data-project]');
        
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY + rect.height / 2,
          bottom: rect.top + window.scrollY + rect.height,
          top: rect.top + window.scrollY,
          project: section ? section.getAttribute('data-project') : null,
          index: index,
          element: card,
          rect: rect
        };
      }).filter(c => c.element.offsetParent !== null);
    }

    // Draw curved line with pulsing glow
    function drawCurvedLine(from, to, progress, mobile){
      if(progress <= 0) return;

      ctx.save();
      
      // Pulsing opacity and glow (cosmic feel)
      const pulseValue = 0.6 + Math.sin(pulsePhase) * 0.35;
      const baseOpacity = 0.28;
      ctx.globalAlpha = baseOpacity * progress * pulseValue;

      // Base line
      ctx.strokeStyle = '#E1C699';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 7]);
      ctx.lineCap = 'round';

      if(mobile){
        // Mobile: Simplified vertical lines
        const offsetX = 18 * Math.sin(from.index);
        ctx.beginPath();
        ctx.moveTo(from.x + offsetX, from.bottom);
        ctx.lineTo(to.x + offsetX, to.top);
        ctx.stroke();
      } else {
        // Desktop: Complex bezier curves (cosmic paths)
        const midX = from.x + (to.x - from.x) * 0.5;
        const midY = from.y + (to.y - from.y) * 0.5;
        
        const curveOffset = 90 + (from.index * 35);
        const direction = from.index % 2 === 0 ? 1 : -1;
        
        const cp1x = from.x + direction * curveOffset;
        const cp1y = from.bottom + 120;
        const cp2x = to.x - direction * (curveOffset * 0.75);
        const cp2y = to.top - 120;

        ctx.beginPath();
        ctx.moveTo(from.x, from.bottom);
        
        // Draw bezier in segments for smooth progress
        const steps = Math.floor(progress * 100);
        for(let i = 0; i <= steps; i++){
          const t = i / 100;
          const t1 = 1 - t;
          const x = t1*t1*t1*from.x + 3*t1*t1*t*cp1x + 3*t1*t*t*cp2x + t*t*t*to.x;
          const y = t1*t1*t1*from.bottom + 3*t1*t1*t*cp1y + 3*t1*t*t*cp2y + t*t*t*to.top;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Enhanced glow layer when pulse is high
        if(pulseValue > 0.7){
          ctx.globalAlpha = (pulseValue - 0.7) * 0.5 * progress;
          ctx.strokeStyle = '#D4B589';
          ctx.lineWidth = 5;
          ctx.filter = 'blur(8px)';
          ctx.beginPath();
          ctx.moveTo(from.x, from.bottom);
          
          for(let i = 0; i <= steps; i++){
            const t = i / 100;
            const t1 = 1 - t;
            const x = t1*t1*t1*from.x + 3*t1*t1*t*cp1x + 3*t1*t*t*cp2x + t*t*t*to.x;
            const y = t1*t1*t1*from.bottom + 3*t1*t1*t*cp1y + 3*t1*t*t*cp2y + t*t*t*to.top;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    function drawConnections(){
      const cards = getAllCardPositions();
      if(cards.length < 2) return;

      canvas.classList.add('visible');
      lineProgress = 0;
      animationStartTime = Date.now();
      isAnimating = true;
      
      animate();
    }

    function animate(){
      if(!canvas.classList.contains('visible') || !isAnimating) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cards = getAllCardPositions();
      const mobile = isMobile();

      // Animate line drawing
      if(animationStartTime && lineProgress < 1){
        const elapsed = Date.now() - animationStartTime;
        lineProgress = Math.min(elapsed / 2400, 1); // 2.4s to draw
      }

      // Continuous pulse
      pulsePhase += 0.025;

      // Draw lines connecting sequential cards
      for(let i = 0; i < cards.length - 1; i++){
        const from = cards[i];
        const to = cards[i + 1];
        
        // Stagger line appearance
        const staggerDelay = i * 0.18;
        const thisLineProgress = Math.max(0, Math.min(1, (lineProgress - staggerDelay) / 0.82));
        
        drawCurvedLine(from, to, thisLineProgress, mobile);
      }

      animFrame = requestAnimationFrame(animate);
    }

    // Stop animation when not visible (performance)
    function stopAnimation(){
      if(animFrame){
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
      isAnimating = false;
    }

    // Start when first card revealed
    const firstCard = document.querySelector('.tarot.reveal');
    if(firstCard){
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting && entry.target.classList.contains('revealed')){
            setTimeout(() => {
              drawConnections();
            }, 1000);
            observer.disconnect();
          }
        });
      }, {threshold: 0.3});
      
      observer.observe(firstCard);
    }

    // Maintain animation on scroll (throttled)
    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if(canvas.classList.contains('visible') && lineProgress >= 1){
          // Refresh card positions without restarting animation
          const cards = getAllCardPositions();
          if(cards.length >= 2 && !isAnimating){
            isAnimating = true;
            animate();
          }
        }
      }, 100);
    }, {passive: true});

    // Cleanup on page unload
    window.addEventListener('beforeunload', stopAnimation);
  })();

  // ================================
  // Keyboard Navigation Enhancement
  // ARIA state management
  // ================================
  (function keyboardNav(){
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          const toggle = card.previousElementSibling;
          if(toggle && toggle.classList.contains('flip-toggle')){
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change'));
            
            // Update ARIA state
            card.setAttribute('aria-pressed', toggle.checked ? 'true' : 'false');
          }
        }
      });
    });
  })();

  // ================================
  // Prevent Card Flip Viewport Jump
  // Lock scroll position precisely
  // ================================
  (function preventFlipJump(){
    document.querySelectorAll('.flip-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const card = e.target.nextElementSibling;
        if(!card) return;

        // Lock scroll position during flip
        const currentScrollY = window.scrollY;
        const currentScrollX = window.scrollX;
        
        let isFlipping = true;
        let frameCount = 0;
        const maxFrames = 60; // ~850ms at 60fps
        
        const maintainPosition = () => {
          if(isFlipping && frameCount < maxFrames){
            window.scrollTo(currentScrollX, currentScrollY);
            frameCount++;
            requestAnimationFrame(maintainPosition);
          } else {
            isFlipping = false;
          }
        };
        
        requestAnimationFrame(maintainPosition);
      });
    });
  })();

})();
