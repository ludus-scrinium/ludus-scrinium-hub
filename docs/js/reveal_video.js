/* ========================================= */
/* Enhanced Reveal + Typing + Particles     */
/* + Global Hint + Adaptive Coda            */
/* Performance optimized, mobile-first      */
/* All fixes and 12 animation principles    */
/* ========================================= */
(function () {
  'use strict';
  
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const lines = Array.from(document.querySelectorAll('.type-line'));
  
  // =====================
  // Performance: RAF batching
  // =====================
  const rafTasks = new Set();
  let rafId = null;
  
  function scheduleRaf(task) {
    rafTasks.add(task);
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        const tasks = Array.from(rafTasks);
        rafTasks.clear();
        rafId = null;
        tasks.forEach(fn => fn());
      });
    }
  }
  
  // =====================
  // Utility: Enhanced Throttle
  // =====================
  function throttle(func, wait) {
    let timeout = null;
    let previous = 0;
    let pending = false;
    
    return function(...args) {
      const now = Date.now();
      const remaining = wait - (now - previous);
      
      const execute = () => {
        previous = Date.now();
        timeout = null;
        pending = false;
        func.apply(this, args);
      };
      
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        execute();
      } else if (!pending) {
        pending = true;
        timeout = setTimeout(execute, remaining);
      }
    };
  }

  // =====================
  // Device Detection
  // =====================
  const isMobile = () => window.innerWidth < 768;
  const isLowEnd = () => navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const prefersReducedMotion = () => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const PARTICLE_COUNT = prefersReducedMotion() ? 0 : 
    (isMobile() ? (isLowEnd() ? 8 : 12) : 20);
  const isDesktopWide = () =>
    window.matchMedia('(min-width: 1024px)').matches;

  const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // =====================
  // Typing Setup with Performance
  // =====================
  lines.forEach(el => {
    if (!el.style.getPropertyValue('--chars')) {
      const chars = Array.from(el.textContent).length;
      el.style.setProperty('--chars', String(chars));
    }
    const chars = parseInt(el.style.getPropertyValue('--chars')) || 
      Array.from(el.textContent).length;
    const msPerChar = parseInt(el.getAttribute('data-ms-per-char') || '45');
    const dur = chars * msPerChar;
    el.style.animationDuration = `${dur}ms`;
    if (el.hasAttribute('data-delay')) {
      el.style.animationDelay = `${parseInt(el.getAttribute('data-delay'))}ms`;
    }
    el.dataset._dur = String(dur);
    el.style.animationFillMode = 'both';
  });

  // Measure hero with RAF batching
  function measureHero() {
    scheduleRaf(() => {
      document.querySelectorAll('.hero .type-line').forEach(el => {
        const prevWidth = el.style.width;
        el.style.width = 'auto';
        const px = el.scrollWidth;
        el.style.setProperty('--px', `${px}px`);
        el.style.width = prevWidth;
        el.style.animationName = 'typingPx';
      });
    });
  }
  
  // Wait for fonts with proper timing
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
    .then(measureHero)
    .then(() => {
      // Fix: Enhanced cursor visibility with proper initial state
      scheduleRaf(() => {
        const tagLine = document.querySelector('.hero-line--tag');
        const authorLine = document.querySelector('.hero-line--author');
        const authorCursor = document.querySelector('.cursor--author');

        if (tagLine && authorCursor && authorLine) {
          const tagDelay = parseInt(tagLine.style.animationDelay || '0');
          const tagDur = parseInt(tagLine.dataset._dur || '0');
          const showAuthorCursorAt = tagDelay + tagDur + 40;

          // Set initial state properly
          authorCursor.style.visibility = 'hidden';
          authorCursor.style.opacity = '0';
          
          setTimeout(() => {
            scheduleRaf(() => {
              authorCursor.style.visibility = 'visible';
              authorCursor.style.opacity = '0.9';
              authorCursor.style.transition = 'opacity 300ms ease-out';
            });
          }, showAuthorCursorAt);
        }
      });
    });

  // =====================
  // Hero Cascade with Spring
  // =====================
  (function cascadeHero() {
    const heroLines = Array.from(document.querySelectorAll('.hero .type-line'));
    if (!heroLines.length) return;

    let offset = 200;
    heroLines.forEach(el => {
      const dur = parseInt(el.dataset._dur || '0');
      el.style.animationDelay = `${offset}ms`;
      offset += Math.max(140, Math.floor(dur * 0.88));
    });

    // Enhanced breath with anticipation
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
  // Enhanced Reveal-on-Scroll
  // =====================
  reveals.forEach(el => {
    const stagger = Number(el.getAttribute('data-stagger') || 0);
    el.style.setProperty('--stagger', stagger);
  });
  
  Array.from(document.querySelectorAll('.coda .card')).forEach((card, i) => {
    card.style.setProperty('--index', i);
  });

  // Improved intersection observer
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        scheduleRaf(() => {
          entry.target.classList.add('revealed');
        });
        io.unobserve(entry.target);
      }
    });
  }, { 
    rootMargin: '20% 0px 20% 0px', 
    threshold: 0 
  });

  reveals.forEach(el => io.observe(el));

  // Reveal items already in view
  scheduleRaf(() => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    reveals.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) {
        el.classList.add('revealed');
        io.unobserve(el);
      }
    });
  });

  root.classList.add('reveal-ready');

  // ================================
  // Card Back: Auto-wrap with Performance
  // ================================
  (function(){
    const SEL = '.card .back__line';
    const lines = document.querySelectorAll(SEL);

    function chWidthFor(el){
      const probe = document.createElement('span');
      probe.textContent = '0';
      probe.style.cssText = 
        'visibility:hidden;position:absolute;white-space:nowrap;';
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
      scheduleRaf(() => {
        measurements.forEach(({ line, type, chars, capacity }) => {
          type.style.setProperty('--chars', chars);
          line.classList.toggle('wrap', chars > capacity);
        });
      });
    }

    const defer = fn => Promise.resolve().then(fn);
    window.addEventListener('DOMContentLoaded', () => defer(updateBackLines), {once:true});
    
    const throttledUpdate = throttle(updateBackLines, 200);
    window.addEventListener('resize', throttledUpdate, {passive: true});
    
    document.addEventListener('change', e => {
      if(e.target.matches('.flip-toggle')) {
        setTimeout(updateBackLines, 150);
      }
    });
  })();

  // =====================
  // Desktop: Enhanced Cursor Jump
  // =====================
  (function(){
    const PAIRS = [
      { toggle: '#flip-oracle', line: '#card-oracle .type-line', 
        container: '#card-oracle .back__line' },
      { toggle: '#flip-creator', line: '#card-creator .type-line', 
        container: '#card-creator .back__line' },
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
          const when = dur + delay + 80;
          const id = setTimeout(() => {
            scheduleRaf(() => {
              cont.classList.add('paragraph-cursor');
            });
          }, when);
          timers.set(cont, id);
        } else {
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

  // ================================
  // Enhanced Floating Particles with Orbits
  // ================================
  (function initParticles(){
    if (prefersReducedMotion()) return;
    
    const container = document.getElementById('particles');
    if(!container) return;

    const particles = [];

    for(let i = 0; i < PARTICLE_COUNT; i++){
      const p = document.createElement('div');
      p.className = 'particle';
      
      // Enhanced particle physics
      const duration = 7 + Math.random() * 9;
      const delay = Math.random() * 6;
      const opacity = 0.25 + Math.random() * 0.35;
      const xStart = Math.random() * 100;
      const yStart = 25 + Math.random() * 55;
      
      // Arc motion paths
      const xMid = xStart + (Math.random() - 0.5) * 40;
      const yMid = yStart + (Math.random() - 0.5) * 50;
      const xEnd = xMid + (Math.random() - 0.5) * 30;
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

      // Fix: Set initial opacity before append
      p.style.opacity = '0';
      container.appendChild(p);
      particles.push(p);
    }

    // Smooth fade-in
    setTimeout(() => {
      scheduleRaf(() => {
        particles.forEach(p => {
          p.style.transition = 'opacity 1200ms ease-out';
          p.style.opacity = '1';
        });
      });
    }, 2400);
  })();

  // ================================
  // Enhanced Particle Burst with Spring
  // ================================
  (function initParticleBursts(){
    if (prefersReducedMotion()) return;
    
    const burstContainer = document.getElementById('particle-bursts');
    if(!burstContainer) return;

    function createBurst(x, y){
      const burstCount = 8;

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
        setTimeout(() => p.remove(), 900);
      }
    }

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
  // Enhanced Global Hint System
  // ================================
  (function initGlobalHint(){
    const hint = document.getElementById('globalHint');
    if(!hint) return;

    let currentCard = null;
    let hintVisible = false;
    let anyCardFlipped = false;
    let debounceTimer = null;

    // Check flip state with proper debouncing
    function updateFlipState(){
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const flipped = document.querySelector('.flip-toggle:checked');
        const wasFlipped = anyCardFlipped;
        anyCardFlipped = !!flipped;

        if(anyCardFlipped !== wasFlipped){
          scheduleRaf(() => {
            document.body.classList.toggle('cards-flipped', anyCardFlipped);
          });
          
          if(anyCardFlipped){
            hideHint();
          }
        }
      }, 50);
    }

    // Show hint with improved boundary detection
    function showHint(card){
      if(anyCardFlipped) return;
      
      currentCard = card;
      const rect = card.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Enhanced boundary detection
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      hint.classList.remove('above');
      
      if(spaceBelow < 120 && spaceAbove > 180){
        hint.classList.add('above');
      }
      
      scheduleRaf(() => {
        hint.classList.add('visible');
        hint.classList.remove('hidden');
        hint.setAttribute('aria-hidden', 'false');
      });
      hintVisible = true;
    }

    function hideHint(){
      scheduleRaf(() => {
        hint.classList.remove('visible');
        hint.classList.add('hidden');
        hint.setAttribute('aria-hidden', 'true');
      });
      currentCard = null;
      hintVisible = false;
    }

    // Monitor all cards
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
      // Mouse events
      card.addEventListener('mouseenter', () => {
        if(!anyCardFlipped){
          showHint(card);
        }
      });

      card.addEventListener('mouseleave', () => {
        hideHint();
      });

      // Touch events with passive flag
      let touchTimer;
      card.addEventListener('touchstart', () => {
        if(anyCardFlipped) return;
        
        touchTimer = setTimeout(() => {
          showHint(card);
        }, 100);
      }, {passive: true});

      card.addEventListener('touchend', () => {
        clearTimeout(touchTimer);
        setTimeout(hideHint, 300);
      }, {passive: true});

      // Focus events with ARIA sync
      card.addEventListener('focus', () => {
        if(!anyCardFlipped){
          showHint(card);
        }
      });

      card.addEventListener('blur', () => {
        hideHint();
      });
    });

    // Monitor flip state
    document.querySelectorAll('.flip-toggle').forEach(toggle => {
      toggle.addEventListener('change', updateFlipState);
    });

    updateFlipState();

    // Hide on scroll with passive flag
    const throttledHideOnScroll = throttle(() => {
      if(hintVisible && !anyCardFlipped){
        hideHint();
      }
    }, 150);
    
    window.addEventListener('scroll', throttledHideOnScroll, {passive: true});
  })();

  // ================================
    // ================================
  // Enhanced Coda Collision Prevention
  // ================================
  (function fixCodaCollision(){
    const coda = document.querySelector('.coda');
    if (!coda) return;

    const codaToggles = coda.querySelectorAll('.flip-toggle');

    function updateCodaSpacing(){
      const anyFlipped = Array.from(codaToggles).some(t => t.checked);
      scheduleRaf(() => {
        coda.classList.toggle('has-flipped-card', anyFlipped);
      });
    }

    // Update spacing when a coda card flips
    codaToggles.forEach(toggle => {
      toggle.addEventListener('change', () => {
        setTimeout(updateCodaSpacing, 50);
      });
    });

    // Initial state
    updateCodaSpacing();

    // Re-check on resize with passive flag
    const throttledResize = throttle(updateCodaSpacing, 200);
    window.addEventListener('resize', throttledResize, { passive: true });
  })();


  // ================================
  // Enhanced Depth-Aware Starfield
  // ================================
  (function depthStarfield(){
    let lastDepth = 0;
    
    function updateDepth(){
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrolled / Math.max(docHeight, 1), 1);
      
      // Enhanced parallax depth calculation
      let depth = 0;
      if(progress > 0.2) depth = 1;
      if(progress > 0.45) depth = 2;
      if(progress > 0.7) depth = 3;

      if(depth !== lastDepth){
        scheduleRaf(() => {
          document.body.classList.remove('depth-1', 'depth-2', 'depth-3');
          if(depth > 0) document.body.classList.add(`depth-${depth}`);
        });
        lastDepth = depth;
      }
    }

    const throttledDepth = throttle(updateDepth, 100);
    window.addEventListener('scroll', throttledDepth, {passive: true});

    updateDepth();
  })();

  // ================================
  // Enhanced Connection Lines with Arc Motion
  // ================================
  (function initConnections(){
    if (prefersReducedMotion()) return;
    // Only run on true desktop (avoid tablets / big phones)
    if (!isDesktopWide()) return;
  
    const canvas = document.getElementById('connections');
    if(!canvas) return;
    
    const canvas = document.getElementById('connections');
    if(!canvas) return;

    let ctx;
    try {
      ctx = canvas.getContext('2d', { 
        alpha: true,
        desynchronized: true 
      });
    } catch(e) {
      console.warn('Canvas not supported:', e);
      return;
    }

    let animFrame = null;
    let pulsePhase = 0;
    let lineProgress = 0;
    let animationStartTime = null;
    let isAnimating = false;

    // High-DPI canvas scaling
    function resize(){
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

       // Cap height so we don't create a gigantic buffer on long pages
      const fullHeight = document.documentElement.scrollHeight;
      const maxHeight = Math.min(fullHeight, window.innerHeight * 3);
      
      canvas.width = rect.width * dpr;
      canvas.height = document.documentElement.scrollHeight * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = document.documentElement.scrollHeight + 'px';
      
      ctx.scale(dpr, dpr);
    }
    resize();
    
    const throttledResize = throttle(() => {
      resize();
      if(canvas.classList.contains('visible')) drawConnections();
    }, 200);
    window.addEventListener('resize', throttledResize, {passive: true});

    // Get card positions with caching
    let cachedPositions = null;
    function getAllCardPositions(force = false){
      if (!force && cachedPositions) return cachedPositions;
      
      const cards = Array.from(document.querySelectorAll('.card'));
      cachedPositions = cards.map((card, index) => {
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
      
      return cachedPositions;
    }

    // Draw curved line with arc principle
    function drawCurvedLine(from, to, progress, mobile){
      if(progress <= 0) return;

      ctx.save();
      
      const pulseValue = 0.6 + Math.sin(pulsePhase) * 0.35;
      const baseOpacity = 0.28;
      ctx.globalAlpha = baseOpacity * progress * pulseValue;

      ctx.strokeStyle = '#E1C699';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 7]);
      ctx.lineCap = 'round';

      if(mobile){
        // Simple arc for mobile
        const offsetX = 18 * Math.sin(from.index);
        ctx.beginPath();
        ctx.moveTo(from.x + offsetX, from.bottom);
        
        const cp1x = from.x + offsetX + 20;
        const cp1y = (from.bottom + to.top) / 2;
        
        ctx.quadraticCurveTo(cp1x, cp1y, to.x + offsetX, to.top);
        ctx.stroke();
      } else {
        // Enhanced bezier curve with arc motion
        const curveOffset = 90 + (from.index * 35);
        const direction = from.index % 2 === 0 ? 1 : -1;
        
        const cp1x = from.x + direction * curveOffset;
        const cp1y = from.bottom + 120;
        const cp2x = to.x - direction * (curveOffset * 0.75);
        const cp2y = to.top - 120;

        ctx.beginPath();
        ctx.moveTo(from.x, from.bottom);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.top);
        ctx.stroke();

        // Enhanced glow effect
        if(pulseValue > 0.7){
          ctx.globalAlpha = (pulseValue - 0.7) * 0.5 * progress;
          ctx.strokeStyle = '#D4B589';
          ctx.lineWidth = 5;
          ctx.filter = 'blur(8px)';
          ctx.beginPath();
          ctx.moveTo(from.x, from.bottom);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.top);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    function drawConnections(){
      const cards = getAllCardPositions(true);
      if(cards.length < 2) return;

      canvas.classList.add('visible');
      lineProgress = 0;
      animationStartTime = Date.now();
      isAnimating = true;
      
      animate();
    }

    function animate(){
      if(!canvas.classList.contains('visible') || !isAnimating) {
        stopAnimation();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cards = getAllCardPositions();
      const mobile = isMobile();

      if(animationStartTime && lineProgress < 1){
        const elapsed = Date.now() - animationStartTime;
        lineProgress = Math.min(elapsed / 2400, 1);
      }

      pulsePhase += 0.025;

      for(let i = 0; i < cards.length - 1; i++){
        const from = cards[i];
        const to = cards[i + 1];
        
        const staggerDelay = i * 0.18;
        const thisLineProgress = Math.max(0, 
          Math.min(1, (lineProgress - staggerDelay) / 0.82));
        
        drawCurvedLine(from, to, thisLineProgress, mobile);
      }

      // Auto-stop after completion
      if(lineProgress >= 1 && !document.querySelector('.card:hover')){
        const timeSinceComplete = Date.now() - (animationStartTime + 2400);
        if(timeSinceComplete > 5000){
          stopAnimation();
          return;
        }
      }

      animFrame = requestAnimationFrame(animate);
    }

    function stopAnimation(){
      if(animFrame){
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
      isAnimating = false;
      cachedPositions = null;
    }

    // Start when first card revealed
    const firstCard = document.querySelector('.tarot.reveal');
    if(firstCard){
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting && entry.target.classList.contains('revealed')){
            setTimeout(drawConnections, 1000);
            observer.disconnect();
          }
        });
      }, {threshold: 0.3});
      
      observer.observe(firstCard);
    }

    // Restart on card hover
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        if(canvas.classList.contains('visible') && !isAnimating){
          isAnimating = true;
          animate();
        }
      });
    });

    // Cleanup
    window.addEventListener('beforeunload', stopAnimation);
  })();

  // ================================
  // Enhanced Keyboard Navigation
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
            
            // Update ARIA states properly
            scheduleRaf(() => {
              const pressed = toggle.checked ? 'true' : 'false';
              card.setAttribute('aria-pressed', pressed);
              card.setAttribute('aria-expanded', pressed);
            });
          }
        }
        
        // Add arrow key navigation
        if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
          const cards = Array.from(document.querySelectorAll('.card'));
          const currentIndex = cards.indexOf(card);
          let nextIndex = currentIndex;
          
          if(e.key === 'ArrowRight'){
            nextIndex = Math.min(currentIndex + 1, cards.length - 1);
          } else {
            nextIndex = Math.max(currentIndex - 1, 0);
          }
          
          if(nextIndex !== currentIndex){
            cards[nextIndex].focus();
          }
        }
      });
    });
  })();

  // ================================
  // Enhanced Viewport Jump Prevention
  // ================================
  (function preventFlipJump(){
    // Don't fight gestures on touch / mobile
    if (isTouchDevice() || isMobile()) return;

    document.querySelectorAll('.flip-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const card = e.target.nextElementSibling;
        if(!card) return;

        const currentScrollY = window.scrollY;
        const currentScrollX = window.scrollX;
      
        let frameCount = 0;
        const maxFrames = 4; // was 10 — shorter lock
      
        const maintainPosition = () => {
          if(frameCount < maxFrames){
            window.scrollTo(currentScrollX, currentScrollY);
            frameCount++;
            requestAnimationFrame(maintainPosition);
          }
        };
      
        requestAnimationFrame(maintainPosition);
      });
    });
  })();

  // ================================
  // Optional: Single Card Mode
  // ================================
  (function improveFlipBehavior(){
    const SINGLE_CARD_MODE = false;
    
    if(SINGLE_CARD_MODE){
      const toggles = document.querySelectorAll('.flip-toggle');
      
      toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
          if(e.target.checked){
            toggles.forEach(other => {
              if(other !== e.target && other.checked){
                other.checked = false;
                const otherCard = other.nextElementSibling;
                if(otherCard){
                  scheduleRaf(() => {
                    otherCard.setAttribute('aria-pressed', 'false');
                    otherCard.setAttribute('aria-expanded', 'false');
                  });
                }
              }
            });
          }
        });
      });
    }
  })();

  // ================================
  // Video Demo Handling
  // ================================
  (function initVideoDemos(){
    const videos = document.querySelectorAll('.video-demo__player');
    const videoStates = new Map();

    const canAutoplayVideo = () => {
    // Be nice to motion + low-power devices
    if (prefersReducedMotion()) return false;
    if (isMobile() || isLowEnd()) return false;
    return true;
  };
    
    // Initialize video states
    videos.forEach(video => {
      videoStates.set(video, {
        hasPlayed: false,
        isLoading: false,
        hasError: false
      });
      
      // Add error handling
      video.addEventListener('error', (e) => {
        const state = videoStates.get(video);
        state.hasError = true;
        const container = video.closest('.video-demo');
        if(container){
          container.classList.add('video-demo--error');
          container.classList.remove('video-demo--loading');
          
          // Create error message if not exists
          if(!container.querySelector('.video-demo__error')){
            const errorMsg = document.createElement('div');
            errorMsg.className = 'video-demo__error';
            errorMsg.textContent = 'Demo video unavailable. Please check the repository.';
            container.appendChild(errorMsg);
          }
        }
        console.warn('Video error:', e);
      });
      
      // Add loading states
      video.addEventListener('loadstart', () => {
        const state = videoStates.get(video);
        state.isLoading = true;
        const container = video.closest('.video-demo');
        if(container){
          container.classList.add('video-demo--loading');
          
          // Create loading indicator if not exists
          if(!container.querySelector('.video-demo__loading')){
            const loadingMsg = document.createElement('div');
            loadingMsg.className = 'video-demo__loading';
            loadingMsg.textContent = 'Loading demo...';
            container.appendChild(loadingMsg);
          }
        }
      });
      
      video.addEventListener('loadeddata', () => {
        const state = videoStates.get(video);
        state.isLoading = false;
        const container = video.closest('.video-demo');
        if(container){
          container.classList.remove('video-demo--loading');
        }
      });
      
      // Prevent autoplay on page load
      video.removeAttribute('autoplay');
    });
    
    // Handle video autoplay on card flip
    document.querySelectorAll('.flip-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const card = e.target.nextElementSibling;
        if(!card) return;
        
        const video = card.querySelector('.video-demo__player');
        if(!video) return;
        
        const state = videoStates.get(video);
        if(!state) return;
        
        if(e.target.checked && video.hasAttribute('data-autoplay-on-flip')){
          // On mobile / low-end, don't autoplay — just start loading lightly
          if (!canAutoplayVideo()) {
            if (video.preload === 'none') {
              video.preload = 'metadata';
            }
            return;
          }
          
          // Card flipped to show back - try to play video
          if(!state.hasPlayed && !state.hasError){
            // Small delay to ensure flip animation has started
            setTimeout(() => {
              // Set preload to auto to start loading
              video.preload = 'auto';
              
              // Try to play with promise handling
              const playPromise = video.play();
              if(playPromise !== undefined){
                playPromise.then(() => {
                  state.hasPlayed = true;
                  
                  // Add playing class for any CSS hooks
                  const container = video.closest('.video-demo');
                  if(container){
                    container.classList.add('video-demo--playing');
                  }
                }).catch(error => {
                  // Autoplay prevented, likely due to browser policy
                  console.log('Autoplay prevented:', error);
                  // User can still manually play via controls
                });
              }
            }, 600); // Wait for flip animation to be well underway
          }
        } else if(!e.target.checked && video){
          // Card flipped back to front - pause video
          video.pause();
          
          // Remove playing class
          const container = video.closest('.video-demo');
          if(container){
            container.classList.remove('video-demo--playing');
          }
        }
      });
    });
    
    // Pause videos when another card is flipped (performance optimization)
    document.querySelectorAll('.flip-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        if(e.target.checked){
          // Pause all other videos
          videos.forEach(video => {
            const videoCard = video.closest('.card');
            const currentCard = e.target.nextElementSibling;
            if(videoCard && videoCard !== currentCard && !video.paused){
              video.pause();
              
              // Remove playing class
              const container = video.closest('.video-demo');
              if(container){
                container.classList.remove('video-demo--playing');
              }
            }
          });
        }
      });
    });
    
    // Handle visibility change (pause videos when tab is not visible)
    document.addEventListener('visibilitychange', () => {
      if(document.hidden){
        videos.forEach(video => {
          if(!video.paused){
            video.pause();
            video.dataset.wasPlaying = 'true';
            
            // Remove playing class
            const container = video.closest('.video-demo');
            if(container){
              container.classList.remove('video-demo--playing');
            }
          }
        });
      } else {
        // Optional: resume videos that were playing
        videos.forEach(video => {
          if(video.dataset.wasPlaying === 'true'){
            delete video.dataset.wasPlaying;
            // Check if the card is still flipped
            const card = video.closest('.card');
            if(card){
              const toggle = card.previousElementSibling;
              if(toggle && toggle.checked){
                video.play().then(() => {
                  // Add playing class back
                  const container = video.closest('.video-demo');
                  if(container){
                    container.classList.add('video-demo--playing');
                  }
                }).catch(() => {
                  // Autoplay prevented after tab switch
                });
              }
            }
          }
        });
      }
    });
    
    // Intersection Observer for lazy loading
    if('IntersectionObserver' in window){
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          if(entry.isIntersecting){
            // Start loading video when card is near viewport
            if(video.preload === 'none'){
              video.preload = 'metadata';
            }
          }
        });
      }, {
        rootMargin: '50% 0px',
        threshold: 0
      });
      
      videos.forEach(video => {
        videoObserver.observe(video);
      });
    }
    
    // Mobile optimization: Reduce video quality on mobile
    if(isMobile() && !isLowEnd()){
      videos.forEach(video => {
        // Prefer lower quality sources if available
        const sources = video.querySelectorAll('source');
        sources.forEach(source => {
          if(source.src.includes('-mobile')){
            // Move mobile source to top priority
            video.insertBefore(source, video.firstChild);
          }
        });
      });
    }
    
    // Cleanup function
    window.ludusVideoCleanup = function(){
      videos.forEach(video => {
        video.pause();
        video.src = '';
        video.load();
      });
      videoStates.clear();
    };
  })();

  // ================================
  // Performance monitoring
  // ================================
  if (window.performance && performance.mark) {
    performance.mark('ludus-scrinium-initialized');
  }

  // ================================
  // Cleanup on SPA navigation
  // ================================
  window.ludusCleanup = function(){
    console.log('Cleaning up Ludus Scrinium animations...');
    
    // Clear all timers and animations
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    rafTasks.clear();
    
    // Remove event listeners if needed
    reveals.forEach(el => io.unobserve(el));
    
    // Clean up video resources
    if(window.ludusVideoCleanup){
      window.ludusVideoCleanup();
    }
  };

})();
