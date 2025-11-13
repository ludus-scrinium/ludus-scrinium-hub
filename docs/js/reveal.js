/* Enhanced Reveal-on-scroll + Typing + Particles + Connections + Depth-aware Starfield */
(function () {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const lines = Array.from(document.querySelectorAll('.type-line'));

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
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(measureHero);

  // =====================
  // Hero Cascade (with anticipation)
  // =====================
  (function cascadeHero() {
    const heroLines = Array.from(document.querySelectorAll('.hero .type-line'));
    if (!heroLines.length) return;

    let offset = 160; // lead-in before first keystroke
    heroLines.forEach(el => {
      const dur = parseInt(el.dataset._dur || '0');
      el.style.animationDelay = `${offset}ms`;
      offset += Math.max(120, Math.floor(dur * 0.85));
    });

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

    // Breath micro-motion on tagline
    const tag = document.querySelector('.hero__tag');
    const last = heroLines[heroLines.length - 1];
    const lastDelay = parseInt(last.style.animationDelay || '0');
    const lastDur = parseInt(last.dataset._dur || '0');
    const breathDelay = lastDelay + lastDur + 300;
    tag.style.setProperty('--breath-delay', `${breathDelay}ms`);
    tag.classList.add('breathe');
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
      lines.forEach(line=>{
        const type = line.querySelector('.type-line');
        if(!type) return;
        const text = type.textContent;
        const chars = Array.from(text).length;
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
      if(e.target.matches('.flip-toggle')) setTimeout(updateBackLines, 100);
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
          const when = dur + delay + 60;
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

  // =====================
  // Floating Particles (Depth-Aware)
  // =====================
  (function initParticles(){
    const container = document.getElementById('particles');
    if(!container) return;

    const PARTICLE_COUNT = 20;
    const particles = [];

    for(let i = 0; i < PARTICLE_COUNT; i++){
      const p = document.createElement('div');
      p.className = 'particle';
      
      // Random properties
      const duration = 6 + Math.random() * 8; // 6-14s
      const delay = Math.random() * 5;
      const opacity = 0.2 + Math.random() * 0.3;
      const xStart = Math.random() * 100;
      const yStart = 20 + Math.random() * 60;
      const xMid = xStart + (Math.random() - 0.5) * 30;
      const yMid = yStart + (Math.random() - 0.5) * 40;
      const xEnd = xMid + (Math.random() - 0.5) * 20;
      const yEnd = yStart + 40 + Math.random() * 40;
      const scaleMid = 0.8 + Math.random() * 0.6;

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
    }, 2000);
  })();

  // =====================
  // Depth-Aware Starfield
  // =====================
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

    window.addEventListener('scroll', () => {
      clearTimeout(updateDepth._timer);
      updateDepth._timer = setTimeout(updateDepth, 50);
    }, {passive: true});

    updateDepth();
  })();

  // =====================
  // Connection Lines (Systems Thinking) - Adaptive to card transforms
  // =====================
  (function initConnections(){
    const canvas = document.getElementById('connections');
    if(!canvas) return;

    const ctx = canvas.getContext('2d');
    let connections = [];
    let animFrame = null;

    // Resize canvas
    function resize(){
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Get card centers - accounts for transforms
    function getCardCenters(){
      const cards = Array.from(document.querySelectorAll('.card'));
      return cards.map(card => {
        const rect = card.getBoundingClientRect();
        
        // Get transform matrix to account for scale/rotation
        const style = window.getComputedStyle(card);
        const matrix = style.transform;
        let scale = 1;
        if(matrix && matrix !== 'none'){
          const values = matrix.match(/matrix.*\((.+)\)/);
          if(values){
            const arr = values[1].split(', ');
            scale = Math.sqrt(arr[0] * arr[0] + arr[1] * arr[1]);
          }
        }
        
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2 + window.scrollY,
          scale: scale,
          element: card,
          visible: rect.top < window.innerHeight && rect.bottom > 0
        };
      }).filter(c => c.element.offsetParent !== null);
    }

    // Define connections (systems thinking relationships)
    const RELATIONSHIPS = [
      ['playlens', 'asset-atlas'],     // A/B testing needs assets
      ['asset-atlas', 'localization'], // Assets need localization
      ['patch-notes', 'creator-ops'],  // Player feedback connects to creator content
      ['localization', 'almanac'],     // Localization process documented in almanac
    ];

    function findCardByProject(centers, projectName){
      return centers.find(c => {
        const section = c.element.closest('[data-project]');
        return section && section.getAttribute('data-project') === projectName;
      });
    }

    function drawConnections(){
      if(!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centers = getCardCenters();
      connections = [];

      RELATIONSHIPS.forEach(([from, to]) => {
        const fromCard = findCardByProject(centers, from);
        const toCard = findCardByProject(centers, to);
        
        if(fromCard && toCard){
          connections.push({
            from: fromCard, 
            to: toCard, 
            progress: 0,
            visible: fromCard.visible && toCard.visible
          });
          
          // Show connector dots on cards
          fromCard.element.classList.add('show-connector');
          toCard.element.classList.add('show-connector');
        }
      });

      // Check if coda is visible to show connections
      const codaSection = document.querySelector('.coda');
      if(codaSection && codaSection.classList.contains('revealed')){
        canvas.classList.add('visible');
        animateConnections();
      }
    }

    function animateConnections(){
      if(animFrame) cancelAnimationFrame(animFrame);
      
      const startTime = Date.now();
      
      function draw(){
        if(!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 1500, 1); // 1.5s to draw all

        connections.forEach((conn, i) => {
          if(!conn.visible) return;
          
          const connProgress = Math.max(0, Math.min(1, (progress - i * 0.15) * 2));
          
          if(connProgress > 0){
            ctx.save();
            
            // Adaptive opacity based on card scale (hover effect)
            const avgScale = (conn.from.scale + conn.to.scale) / 2;
            const baseOpacity = 0.2;
            const scaleOpacity = avgScale > 1 ? 0.35 : baseOpacity;
            
            ctx.globalAlpha = scaleOpacity * connProgress;
            ctx.strokeStyle = '#E1C699';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);

            // Draw curve with control points
            const cp1x = conn.from.x + (conn.to.x - conn.from.x) * 0.25;
            const cp1y = conn.from.y + 50;
            const cp2x = conn.from.x + (conn.to.x - conn.from.x) * 0.75;
            const cp2y = conn.to.y - 50;

            ctx.beginPath();
            ctx.moveTo(conn.from.x, conn.from.y);
            
            // Partial bezier based on progress
            const steps = Math.floor(connProgress * 60);
            for(let t = 0; t <= steps; t++){
              const ratio = t / 60;
              const t1 = 1 - ratio;
              const x = t1*t1*t1*conn.from.x + 3*t1*t1*ratio*cp1x + 3*t1*ratio*ratio*cp2x + ratio*ratio*ratio*conn.to.x;
              const y = t1*t1*t1*conn.from.y + 3*t1*t1*ratio*cp1y + 3*t1*ratio*ratio*cp2y + ratio*ratio*ratio*conn.to.y;
              ctx.lineTo(x, y);
            }

            ctx.stroke();
            
            // Draw subtle glow
            if(connProgress > 0.5 && avgScale > 1){
              ctx.globalAlpha = (avgScale - 1) * 0.15;
              ctx.strokeStyle = '#D4B589';
              ctx.lineWidth = 3;
              ctx.filter = 'blur(4px)';
              ctx.stroke();
            }
            
            ctx.restore();
          }
        });

        if(progress < 1){
          animFrame = requestAnimationFrame(draw);
        }
      }

      draw();
    }

    // Trigger drawing when coda is revealed
    const codaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting && entry.target.classList.contains('revealed')){
          setTimeout(drawConnections, 400);
        }
      });
    }, {threshold: 0.3});

    const codaSection = document.querySelector('.coda');
    if(codaSection) codaObserver.observe(codaSection);

    // Continuous redraw on scroll/hover to update with transforms
    let rafId = null;
    function continuousUpdate(){
      if(canvas.classList.contains('visible')){
        const centers = getCardCenters();
        
        // Check if any cards are being hovered (scaled)
        const anyHovered = centers.some(c => c.scale > 1.01);
        
        if(anyHovered || window._forceDraw){
          drawConnections();
        }
        
        rafId = requestAnimationFrame(continuousUpdate);
      }
    }

    // Start continuous updates when canvas is visible
    const visibilityObserver = new MutationObserver(() => {
      if(canvas.classList.contains('visible')){
        if(!rafId) continuousUpdate();
      } else {
        if(rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    });
    
    visibilityObserver.observe(canvas, {attributes: true, attributeFilter: ['class']});

    // Redraw on scroll
    let scrollTimer;
    window.addEventListener('scroll', () => {
      window._forceDraw = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        window._forceDraw = false;
      }, 100);
    }, {passive: true});

    // Redraw on resize
    window.addEventListener('resize', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        resize();
        if(canvas.classList.contains('visible')){
          drawConnections();
        }
      }, 150);
    });
  })();

  // =====================
  // Keyboard Navigation Enhancement
  // =====================
  (function keyboardNav(){
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          const toggle = card.previousElementSibling;
          if(toggle && toggle.classList.contains('flip-toggle')){
            toggle.checked = !toggle.checked;
            toggle.dispatchEvent(new Event('change'));
          }
        }
      });
    });
  })();

  // =====================
  // Prevent Card Flip Viewport Jump
  // =====================
  (function preventFlipJump(){
    document.querySelectorAll('.flip-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const card = e.target.nextElementSibling;
        const section = card.closest('.tarot');
        
        if(!section) return;

        // Get current scroll position and card position
        const scrollY = window.scrollY;
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.top + cardRect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        
        // If card is near center, keep it centered during flip
        if(Math.abs(cardCenter - viewportCenter) < 200){
          section.classList.add('flipping');
          
          // Smooth scroll to keep card centered
          requestAnimationFrame(() => {
            const newCardRect = card.getBoundingClientRect();
            const newCardTop = newCardRect.top + scrollY;
            const offset = (window.innerHeight - newCardRect.height) / 2;
            const targetScroll = newCardTop - offset;
            
            window.scrollTo({
              top: targetScroll,
              behavior: 'instant' // Instant to avoid double animation
            });
            
            setTimeout(() => {
              section.classList.remove('flipping');
            }, 750);
          });
        }
      });
    });
  })();

})();
