/* =============================================================
   GLYDE — js/pages/home.js
   Hero: parallax watermark · stats countUp
   §7C  Why Glyde: handled by animations.js IntersectionObserver
   §7D  Sticky Compare: GSAP pin + scrub blocks + progress dots
   §7E  Full-Bleed Reveal: clip-path wipe + Ken Burns + overlay fade
   §7F  Services Card Stack: GSAP cascade from left, progress dots
   §7G  Route Preview: SVG strokeDashoffset scrub animation
   §7H  Waitlist Form: submit handler, success state, no reload
   §7I  App Notify Form: notify-me submission handler
   ============================================================= */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1. PARALLAX WATERMARK
     Per DESIGN.md §7A — "GLYDE" moves at 0.3× scroll speed
  ═══════════════════════════════════════════════════════════ */
  function initParallaxWatermark() {
    const watermark = document.getElementById('heroWatermark');
    if (!watermark) return;

    function onScroll() {
      const y = window.scrollY;
      watermark.style.transform = `translate(-50%, calc(-50% + ${y * 0.3}px))`;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ═══════════════════════════════════════════════════════════
     1B. HERO PARALLAX SCRUB
     Fades out the hero text and creates a slight parallax motion
     as the user scrolls down, preventing a "rigid" raw scroll.
  ═══════════════════════════════════════════════════════════ */
  function initHeroParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    gsap.registerPlugin(ScrollTrigger);

    const heroSection = document.getElementById('hero');
    const heroLeft = document.querySelector('.hero-left');
    const heroRight = document.querySelector('.hero-right');

    if (!heroSection) return;

    // Fade out and push text up
    if (heroLeft) {
      gsap.to(heroLeft, {
        y: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom 40%',
          scrub: true
        }
      });
    }

    // Push the bus image down slightly to create depth
    if (heroRight) {
      gsap.to(heroRight, {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom 40%',
          scrub: true
        }
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════
     2. STATS COUNT-UP ANIMATION
     Per DESIGN.md §7A — counts from 0 to target, ease-out cubic
  ═══════════════════════════════════════════════════════════ */
  function countUp(el, target, duration) {
    const startTime = performance.now();
    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
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
        countUp(el, target, target === 0 ? 400 : 1400);
      });
    }, 1000);
  }


  /* ═══════════════════════════════════════════════════════════
     3. §7D STICKY COMPARE — GSAP ScrollTrigger
     Per DESIGN.md §7D spec:
     - Pin .compare-left for full scroll duration of .compare-section
     - Each .compare-block fades in from y:60 → y:0, scrub: 1
     - Progress dots highlight as corresponding block enters
  ═══════════════════════════════════════════════════════════ */
  function initCompareSection() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const compareSection = document.querySelector('.compare-section');
    if (!compareSection) return;

    const mm = gsap.matchMedia();

    // ── Desktop: Pin left panel + scrub right blocks ──
    mm.add('(min-width: 768px)', () => {
      ScrollTrigger.create({
        trigger   : '.compare-section',
        start     : 'top top',
        end       : 'bottom bottom',
        pin       : '.compare-left',
        pinSpacing: false,
      });

      const progressDots = document.querySelectorAll('#compareProgress .progress-dot');

      gsap.utils.toArray('.compare-block').forEach((block, i) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 60 },
          {
            opacity : 1,
            y       : 0,
            scrollTrigger: {
              trigger    : block,
              start      : 'top 70%',
              end        : 'top 30%',
              scrub      : 1,
              onEnter    : () => updateProgressDot(progressDots, i),
              onEnterBack: () => updateProgressDot(progressDots, i),
            },
          }
        );
      });
    });

    // ── Mobile: no pin, simple fade ──
    mm.add('(max-width: 767px)', () => {
      gsap.utils.toArray('.compare-block').forEach(block => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y      : 0,
            scrollTrigger: {
              trigger: block,
              start  : 'top 85%',
              end    : 'top 55%',
              scrub  : 1,
            },
          }
        );
      });
    });
  }

  function updateProgressDot(dots, activeIndex) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }


  /* ═══════════════════════════════════════════════════════════
     4. §7E FULL-BLEED REVEAL — GSAP ScrollTrigger
     Per DESIGN.md §7E spec:
     A. clip-path: inset(0 100% 0 0) → inset(0 0% 0 0)  scrub: 1.5
     B. Ken Burns: reveal-image scale(1.1) → scale(1)    scrub: 2
     C. Overlay: fades in when clip is ~60% done
  ═══════════════════════════════════════════════════════════ */
  function initRevealSection() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const revealClip    = document.getElementById('revealClip');
    const revealImage   = document.getElementById('revealImage');
    const revealOverlay = document.getElementById('revealOverlay');
    const revealSection = document.getElementById('image-reveal');

    if (!revealClip || !revealSection) return;

    // ── A. Clip-path wipe: left → right (scrub: 1.5) ──
    // Exactly as specified in DESIGN.md §7E
    gsap.to(revealClip, {
      clipPath: 'inset(0 0% 0 0)',
      ease    : 'none',
      scrollTrigger: {
        trigger : revealSection,
        start   : 'top 80%',
        end     : 'top 10%',
        scrub   : 1.5,
      },
    });

    // ── B. Ken Burns: image scale 1.1 → 1 (scrub: 2) ──
    if (revealImage) {
      gsap.to(revealImage, {
        scale: 1,
        ease : 'none',
        scrollTrigger: {
          trigger : revealSection,
          start   : 'top bottom',
          end     : 'bottom top',
          scrub   : 2,
        },
      });
    }

    // ── C. Overlay fade at ~60% clip progress ──
    // Clip range: 'top 80%' → 'top 10%' = 70vh window
    // 60% of 70vh = 42vh → offset start point to 'top 38%'
    if (revealOverlay) {
      gsap.to(revealOverlay, {
        opacity : 1,
        ease    : 'power2.out',
        scrollTrigger: {
          trigger : revealSection,
          start   : 'top 36%',
          end     : 'top 10%',
          scrub   : 1,
        },
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════
     5. §7F SERVICE CARD STACK — GSAP ScrollTrigger
     Per DESIGN.md §7F spec:
     - Cards start x:-400, rotate:-8, opacity:0
     - Cascade in with back.out(1.4), stagger 0.15s per card
     - Progress dots update as each card arrives
  ═══════════════════════════════════════════════════════════ */
  function initServiceCards() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const cards     = gsap.utils.toArray('.service-card');
    const cardsWrap = document.querySelector('.services-cards-wrap');
    const dotsEl    = document.querySelectorAll('#servicesDotsNav .svc-dot');

    if (!cards.length || !cardsWrap) return;

    // Responsive checks for mobile
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    
    // Trigger relative to the cards wrapper itself
    const triggerBase = isMobile ? 85 : 85; 

    cards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { x: isMobile ? -100 : -200, y: 40, rotation: -4, opacity: 0 },
        {
          x        : 0,
          y        : 0,
          rotation : 0,
          opacity  : 1,
          duration : 0.8,
          ease     : 'back.out(1.2)',
          delay    : isMobile ? 0 : i * 0.1, // Stagger on desktop, individually on mobile
          scrollTrigger: {
            trigger      : isMobile ? card : cardsWrap, // Mobile triggers per card, desktop triggers once
            start        : `top ${triggerBase}%`,
            toggleActions: 'play none none reverse',
            onToggle     : self => {
              if (self.isActive) updateSvcDot(dotsEl, i);
            },
          },
        }
      );
    });
  }

  function updateSvcDot(dots, activeIndex) {
    dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
  }


  /* ═══════════════════════════════════════════════════════════
     6. §7G ROUTE MAP — SVG strokeDashoffset scrub animation
     Per DESIGN.md §7G spec:
     - .route-path: strokeDashoffset 1000 → 0, scrub: 1.5
     - trigger: .route-map, start: top 60%, end: bottom 40%
  ═══════════════════════════════════════════════════════════ */
  function initRouteMap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const routeMap = document.getElementById('routeMap');
    if (!routeMap) return;

    gsap.fromTo(
      '.route-path',
      { strokeDashoffset: 1000 },
      {
        strokeDashoffset: 0,
        ease            : 'none',
        scrollTrigger   : {
          trigger : routeMap,
          start   : 'top 60%',
          end     : 'bottom 40%',
          scrub   : 1.5,
        },
      }
    );
  }


  /* ═══════════════════════════════════════════════════════════
     7. §7H WAITLIST FORM — submission handler
     Per DESIGN.md §7H spec:
     - No page reload on submit
     - Button text changes to "✓ You're on the list!"
     - Success message fades in below button
  ═══════════════════════════════════════════════════════════ */
  function initWaitlistForm() {
    const form    = document.getElementById('waitlistForm');
    const btn     = document.getElementById('waitlistSubmit');
    const success = document.getElementById('waitlistSuccess');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate: shake invalid fields per DESIGN.md §13
      const inputs = form.querySelectorAll('[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          shakeInput(input);
        }
      });

      if (!valid) return;

      // Hide all form rows and the privacy note
      const rows = form.querySelectorAll('.wf-row');
      rows.forEach(row => row.style.display = 'none');
      
      const privacyNote = document.querySelector('.wf-privacy');
      if (privacyNote) privacyNote.style.display = 'none';

      if (success) {
        success.style.minHeight = '300px'; // Keep card height consistent
        success.classList.add('visible');
        success.removeAttribute('aria-hidden');
        
        const goBackBtn = document.getElementById('waitlistGoBack');
        if (goBackBtn) {
          goBackBtn.onclick = () => {
            success.classList.remove('visible');
            success.setAttribute('aria-hidden', 'true');
            form.reset();
            
            // Restore visibility
            rows.forEach(row => row.style.display = '');
            if (privacyNote) privacyNote.style.display = '';
            
            // Re-hide "other" fields
            const otherOffice = document.getElementById('wf-other-office-location-row');
            if (otherOffice) otherOffice.style.display = 'none';
            const otherRoute = document.getElementById('wf-other-route-row');
            if (otherRoute) otherRoute.style.display = 'none';
          };
        }
      }
    });
  }

  /* shakeInput — DESIGN.md §13 exact spec */
  function shakeInput(input) {
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
    // Reset on next user input
    input.addEventListener('input', () => {
      input.style.borderColor = '';
    }, { once: true });
  }


  /* ═══════════════════════════════════════════════════════════
     8. §7I APP NOTIFY FORM — launch notification handler
  ═══════════════════════════════════════════════════════════ */
  function initAppNotifyForm() {
    const form = document.getElementById('appNotifyForm');
    const btn  = document.getElementById('app-notify-submit');
    const inp  = document.getElementById('app-notify-email');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!inp?.value.trim()) return;

      btn.innerHTML = '✓ Noted!';
      btn.disabled  = true;
      btn.style.opacity = '0.75';
      inp.disabled  = true;
      inp.style.opacity = '0.5';
    });
  }


  /* ═══════════════════════════════════════════════════════════
     9. INIT
  ═══════════════════════════════════════════════════════════ */
  function init() {
    initParallaxWatermark();
    initHeroParallax();
    initStatsCounter();
    initCompareSection();
    initRevealSection();
    initServiceCards();
    initRouteMap();
    initWaitlistForm();
    initAppNotifyForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
