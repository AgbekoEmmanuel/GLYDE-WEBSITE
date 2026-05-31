/* =============================================================
   GLYDE — js/pages/routes.js
   §10 — Hero entrance · SVG Route Map Animation
   ============================================================= */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1. HERO ENTRANCE ANIMATIONS
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
     2. SVG ROUTE MAP ANIMATION — GSAP ScrollTrigger
     Per DESIGN.md §10: strokeDashoffset animation on scroll
     same technique as 7G.
  ═══════════════════════════════════════════════════════════ */
  function initRouteMap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const mapContainer = document.getElementById('networkMap');
    if (!mapContainer) return;

    // Animate both paths
    gsap.fromTo(
      '.svg-route-path',
      { strokeDashoffset: 1000 },
      {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: mapContainer,
          start: 'top 75%',
          end: 'bottom 40%',
          scrub: 1.5,
        },
      }
    );
  }


  /* ═══════════════════════════════════════════════════════════
     3. INIT
  ═══════════════════════════════════════════════════════════ */
  function init() {
    initHeroEntrance();
    initRouteMap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
