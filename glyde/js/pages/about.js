/* =============================================================
   GLYDE — js/pages/about.js
   §8 — Scroll reveals only, no GSAP
   ============================================================= */

(function () {
  'use strict';

  // Entry point for about page specific JS
  // IntersectionObserver reveals (.reveal, .reveal-left, etc) 
  // are already handled globally by js/animations.js
  
  function initAboutHero() {
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

  function init() {
    initAboutHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
