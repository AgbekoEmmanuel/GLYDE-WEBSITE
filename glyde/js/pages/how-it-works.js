/* =============================================================
   GLYDE — js/pages/how-it-works.js
   §9 — Hero entrance · Horizontal scroll steps · Clip-path detail
        reveals · FAQ accordion
   ============================================================= */

(function () {
  'use strict';


  /* ═══════════════════════════════════════════════════════════
     1. HERO ENTRANCE ANIMATIONS
     Fade-up each .anim-hero element using IntersectionObserver
     (complements the CSS transition classes)
  ═══════════════════════════════════════════════════════════ */
  function initHeroEntrance() {
    const els = document.querySelectorAll('.anim-hero');
    if (!els.length) return;

    // Trigger immediately (hero is above fold on load)
    function revealAll() {
      els.forEach(el => el.classList.add('visible'));
    }

    // Small delay to allow paint, then reveal staggered via CSS delays
    if (document.readyState === 'complete') {
      requestAnimationFrame(revealAll);
    } else {
      window.addEventListener('load', () => requestAnimationFrame(revealAll));
    }
  }


  /* ═══════════════════════════════════════════════════════════
     2. HORIZONTAL SCROLL STEPS — GSAP ScrollTrigger
     Per DESIGN.md §9 exact spec:
       gsap.to('.steps-track', {
         x: () => -(track.offsetWidth - window.innerWidth),
         ease: 'none',
         scrollTrigger: {
           trigger: '.steps-scroll-container',
           start: 'top top',
           end: () => '+=' + track.offsetWidth,
           scrub: 1,
           pin: true,
           anticipatePin: 1,
         }
       });
     Mobile (<768): skip pinning, render vertical stack.
  ═══════════════════════════════════════════════════════════ */
  function initHorizontalSteps() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const track     = document.getElementById('stepsTrack');
    const container = document.getElementById('stepsScrollContainer');

    if (!track || !container) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      // Per DESIGN.md §9 — exact JS spec
      gsap.to(track, {
        x    : () => -(track.offsetWidth - window.innerWidth),
        ease : 'none',
        scrollTrigger: {
          trigger      : container,
          start        : 'top top',
          end          : () => '+=' + track.offsetWidth,
          scrub        : 1,
          pin          : true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        // Cleanup on breakpoint exit
        gsap.set(track, { clearProps: 'x' });
      };
    });
  }


  /* ═══════════════════════════════════════════════════════════
     3. STEP DETAIL CLIP-PATH REVEALS — GSAP ScrollTrigger
     Per DESIGN.md §9: "Each uses the same wipe/clip reveal
     technique from §7E"
     clip-path: inset(0 100% 0 0) → inset(0 0% 0 0), scrub: 1.5
     Image scale 1.08 → 1 (Ken Burns), scrub: 2
  ═══════════════════════════════════════════════════════════ */
  function initDetailReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const clips = [
      { clip: 'sd1Clip', image: document.querySelector('#sd1-visual .sd-image'), section: 'step-1-detail' },
      { clip: 'sd2Clip', image: document.querySelector('#sd2-visual .sd-image'), section: 'step-2-detail' },
      { clip: 'sd3Clip', image: document.querySelector('#sd3-visual .sd-image'), section: 'step-3-detail' },
    ];

    clips.forEach(({ clip, image, section }) => {
      const clipEl    = document.getElementById(clip);
      const sectionEl = document.getElementById(section);

      if (!clipEl || !sectionEl) return;

      // ── Clip-path wipe: left → right (scrub: 1.5) ──
      gsap.to(clipEl, {
        clipPath: 'inset(0 0% 0 0)',
        ease    : 'none',
        scrollTrigger: {
          trigger : sectionEl,
          start   : 'top 80%',
          end     : 'top 20%',
          scrub   : 1.5,
        },
      });

      // ── Ken Burns: scale image 1.08 → 1 (scrub: 2) ──
      if (image) {
        gsap.fromTo(
          image,
          { scale: 1.08 },
          {
            scale: 1,
            ease : 'none',
            scrollTrigger: {
              trigger : sectionEl,
              start   : 'top bottom',
              end     : 'bottom top',
              scrub   : 2,
            },
          }
        );
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     4. FAQ ACCORDION — DESIGN.md §9 exact spec
     - maxHeight 0 → scrollHeight on open
     - maxHeight → 0 on close
     - Chevron: .faq-item.open .faq-chevron { transform: rotate(180deg) }
     - Only one item open at a time
  ═══════════════════════════════════════════════════════════ */
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    // Per DESIGN.md §9 exact spec
    faqItems.forEach(item => {
      const btn    = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      if (!btn || !answer) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all — per spec
        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = '0';
          const q = i.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        // Open clicked if was closed — per spec
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════
     5. INIT
  ═══════════════════════════════════════════════════════════ */
  function init() {
    initHeroEntrance();
    initHorizontalSteps();
    initDetailReveals();
    initFaqAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
