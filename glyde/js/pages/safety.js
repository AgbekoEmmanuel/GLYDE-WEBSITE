/* =============================================================
   GLYDE — js/pages/safety.js
   §11 — Hero Stats count up · Driver checklist animation · 
         Vehicle SVG annotation lines
   ============================================================= */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1. HERO ENTRANCE
  ═══════════════════════════════════════════════════════════ */
  function initHeroEntrance() {
    const els = document.querySelectorAll('.anim-hero');
    if (!els.length) return;

    function revealAll() {
      els.forEach(el => el.classList.add('visible'));
    }

    if (document.readyState === 'complete') {
      requestAnimationFrame(revealAll);
    } else {
      window.addEventListener('load', () => requestAnimationFrame(revealAll));
    }
  }


  /* ═══════════════════════════════════════════════════════════
     2. STATS COUNT-UP ANIMATION
     Counts from 0 to target, ease-out cubic
  ═══════════════════════════════════════════════════════════ */
  function countUp(el, target, duration) {
    const startTime = performance.now();
    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initStatsCounter() {
    const statEls = document.querySelectorAll('.stat-num[data-target]');
    if (!statEls.length) return;
    setTimeout(() => {
      statEls.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;
        // 1.5s duration as per spec
        countUp(el, target, target === 0 ? 400 : 1500);
      });
    }, 1000); // delay to let hero animate in
  }


  /* ═══════════════════════════════════════════════════════════
     3. DRIVER CHECKLIST ANIMATION — GSAP ScrollTrigger
     Per DESIGN.md §11 spec:
     checkItems animate in with tick: scale 0 -> 1, back.out(2)
  ═══════════════════════════════════════════════════════════ */
  function initDriverChecklist() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const checkItems = document.querySelectorAll('.ds-check-item');
    if (!checkItems.length) return;

    checkItems.forEach((item, i) => {
      const tick = item.querySelector('.tick');
      if (!tick) return;

      gsap.fromTo(tick,
        { scale: 0, opacity: 0 },
        {
          scale: 1, 
          opacity: 1,
          scrollTrigger: { 
            trigger: item, 
            start: 'top 85%' 
          },
          delay: i * 0.1,
          ease: 'back.out(2)',
        }
      );
    });
  }


  /* ═══════════════════════════════════════════════════════════
     4. VEHICLE DIAGRAM ANNOTATIONS — GSAP ScrollTrigger
     Per DESIGN.md §11: "Labels animate in with connecting lines 
     drawing from right to left (SVG stroke animation)."
  ═══════════════════════════════════════════════════════════ */
  function initVehicleAnnotations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const diagramWrap = document.querySelector('.bus-diagram-wrap');
    if (!diagramWrap) return;

    const lines = document.querySelectorAll('.annotation-line');
    
    lines.forEach((line, i) => {
      gsap.to(line, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: diagramWrap,
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: 1, // draw on scroll
        }
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════
     5. INIT
  ═══════════════════════════════════════════════════════════ */
  function init() {
    initHeroEntrance();
    initStatsCounter();
    initDriverChecklist();
    initVehicleAnnotations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
