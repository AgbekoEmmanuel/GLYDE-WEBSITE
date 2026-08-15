/* =============================================================
   GLYDE — animations.js
   • Page transition system (Section 5)
   • IntersectionObserver scroll reveal (Section 6)
   • Custom cursor (Section 14)
   • Scroll hint hide
   • Body padding for fixed navbar
   ============================================================= */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1. PAGE TRANSITION SYSTEM
     Per DESIGN.md Section 5
     - navigateTo(url): green overlay slides up, then navigates
     - On page load: overlay slides off screen upward
  ═══════════════════════════════════════════════════════════ */
  const transition = document.getElementById('page-transition');

  /**
   * Navigate to a new page without transition.
   * @param {string} url - destination URL
   */
  function navigateTo(url) {
    window.location.href = url;
  }

  // Expose globally so page-specific scripts can call it
  window.navigateTo = navigateTo;

  // On page load
  function initPageTransitionExit() {
    // Transition removed
  }

  // Intercept all internal nav links for transition
  function initLinkInterception() {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip: external, hash-only, mailto, tel, new-tab
      const isExternal   = anchor.target === '_blank';
      const isHashOnly   = href.startsWith('#');
      const isMailto     = href.startsWith('mailto:');
      const isTel        = href.startsWith('tel:');
      const isAbsoluteExternal = /^https?:\/\//.test(href) &&
                                 !href.includes(window.location.hostname);

      if (isExternal || isHashOnly || isMailto || isTel || isAbsoluteExternal) {
        return; // let browser handle normally
      }

      // Internal page navigation — use transition
      e.preventDefault();
      navigateTo(href);
    });
  }


  /* ═══════════════════════════════════════════════════════════
     2. SCROLL REVEAL — INTERSECTIONOBSERVER
     Per DESIGN.md Section 6
     Observes all .reveal, .reveal-left, .reveal-right,
     .reveal-scale, .reveal-fade elements and adds .in-view
     when they enter the viewport. Fires once only.
  ═══════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    const revealSelector = [
      '.reveal',
      '.reveal-left',
      '.reveal-right',
      '.reveal-scale',
      '.reveal-fade',
    ].join(', ');

    const elements = document.querySelectorAll(revealSelector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // fire once only
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
  }


  /* ═══════════════════════════════════════════════════════════
     3. CUSTOM CURSOR (desktop / fine pointer only)
     Per DESIGN.md Section 14
     - cursor-dot: follows mouse precisely
     - cursor-follower: lags behind with lerp (smooth follow)
     - Grows on hover over interactive elements
  ═══════════════════════════════════════════════════════════ */
  function initCustomCursor() {
    // Only activate on fine-pointer devices (desktop mouse)
    const isFinePt = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePt) return;

    // Create elements
    const dot      = document.createElement('div');
    const follower = document.createElement('div');
    dot.className      = 'cursor-dot';
    follower.className = 'cursor-follower';
    document.body.appendChild(dot);
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let rafId;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Move dot instantly
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    // Lerp follower
    function animateCursor() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
      rafId = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Grow on interactive elements
    const interactiveSelector = 'a, button, .card-hover, .feature-card, input, select, textarea, label';

    function onEnter() { follower.classList.add('grow'); }
    function onLeave() { follower.classList.remove('grow'); }

    // Use event delegation for performance
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) onEnter();
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) onLeave();
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      follower.style.opacity = '1';
    });
  }


  /* ═══════════════════════════════════════════════════════════
     4. SCROLL HINT — HIDE AFTER 100px SCROLL
     The hero scroll indicator fades out when user scrolls
  ═══════════════════════════════════════════════════════════ */
  function initScrollHint() {
    const hint = document.querySelector('.scroll-hint');
    if (!hint) return;

    function onScroll() {
      if (window.scrollY > 100) {
        hint.classList.add('hidden');
      } else {
        hint.classList.remove('hidden');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════════
     5. NAVBAR BODY PADDING
     Adds top padding equal to navbar height so content
     isn't hidden beneath the fixed navbar.
  ═══════════════════════════════════════════════════════════ */
  function initNavBodyPad() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    function applyPad() {
      // Disabled: Floating pill navbar doesn't require body padding.
      // Hero sections handle their own top padding. Adding body padding causes a white gap.
      // document.body.style.paddingTop = navbar.offsetHeight + 'px';
    }

    // Apply immediately, then on resize
    // Use a small delay so nav.js finishes rendering navbar HTML
    setTimeout(applyPad, 0);
    window.addEventListener('resize', applyPad, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════════
     6. TICKER / MARQUEE BUILDER
     Builds the green ticker strip content if the element exists.
     Duplicates content for seamless looping.
  ═══════════════════════════════════════════════════════════ */
  function initTicker() {
    const wrap = document.querySelector('.ticker-wrap');
    if (!wrap) return;

    const items = [
      'App-Based Booking',
      'Accra–Oyibi',
      'Accra–Oyarifa',
      'Vetted Drivers',
      'Safety Certified',
      'Scheduled Departures',
      'Book in Seconds',
      '100% App-Based',
    ];

    function buildTrack() {
      const track = document.createElement('div');
      track.className = 'ticker-track';

      // Build content twice for seamless loop
      [1, 2].forEach(() => {
        items.forEach(text => {
          const item = document.createElement('span');
          item.className = 'ticker-item';
          item.innerHTML = `${text}<span class="ticker-dot" aria-hidden="true"></span>`;
          track.appendChild(item);
        });
      });

      return track;
    }

    // Only build if ticker-track doesn't already exist
    if (!wrap.querySelector('.ticker-track')) {
      wrap.appendChild(buildTrack());
    }
  }


  /* ═══════════════════════════════════════════════════════════
     7. FOOTER BUILDER
     Injects shared footer HTML — single source of truth.
  ═══════════════════════════════════════════════════════════ */
  function buildFooter() {
    const footer = document.getElementById('footer');
    if (!footer || footer.children.length > 0) return; // skip if already populated

    footer.innerHTML = `
      <div class="container">

        <!-- 4-column grid -->
        <div class="footer-grid">

          <!-- Col 1: Brand -->
          <div class="footer-brand">
            <a href="index.html" class="footer-logo" aria-label="GLYDE Home">
              <div class="footer-logo-mark" aria-hidden="true">
                <img src="assets/logo.svg" alt="" width="36" height="36">
              </div>
              <span class="footer-logo-wordmark">GLYDE</span>
            </a>
            <p class="footer-tagline">Moving Accra, one scheduled ride at a time.</p>
            <div class="footer-social" aria-label="Social media links">
              <a href="https://instagram.com/glydeghana" target="_blank" rel="noopener noreferrer" aria-label="GLYDE on Instagram">
                <i class="ph ph-instagram-logo" aria-hidden="true"></i>
              </a>
              <a href="https://twitter.com/glydeghana" target="_blank" rel="noopener noreferrer" aria-label="GLYDE on Twitter / X">
                <i class="ph ph-twitter-logo" aria-hidden="true"></i>
              </a>
              <a href="https://linkedin.com/company/glyde-ghana" target="_blank" rel="noopener noreferrer" aria-label="GLYDE on LinkedIn">
                <i class="ph ph-linkedin-logo" aria-hidden="true"></i>
              </a>
              <a href="https://wa.me/233000000000" target="_blank" rel="noopener noreferrer" aria-label="Chat with GLYDE on WhatsApp">
                <i class="ph ph-whatsapp-logo" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          <!-- Col 2: Navigation -->
          <nav aria-label="Footer navigation">
            <p class="footer-col-title">Navigate</p>
            <ul class="footer-links" role="list">
              <li><a href="index.html" class="hover-line">Home</a></li>
              <li><a href="about.html" class="hover-line">About</a></li>
              <li><a href="how-it-works.html" class="hover-line">How It Works</a></li>
              <li><a href="routes.html" class="hover-line">Routes</a></li>
              <li><a href="safety.html" class="hover-line">Safety</a></li>
              <li><a href="contact.html" class="hover-line">Contact</a></li>
            </ul>
          </nav>

          <!-- Col 3: Routes -->
          <nav aria-label="Route links">
            <p class="footer-col-title">Routes</p>
            <ul class="footer-links" role="list">
              <li><a href="routes.html#oyibi" class="hover-line">Accra → Oyibi</a></li>
              <li><a href="routes.html#oyarifa" class="hover-line">Accra → Oyarifa</a></li>
              <li><a href="routes.html#schedule" class="hover-line">View Schedules</a></li>
              <li><a href="routes.html#coming-soon-routes" class="hover-line">Coming Soon</a></li>
              <li><a href="contact.html" class="hover-line">Suggest a Route →</a></li>
            </ul>
          </nav>

          <!-- Col 4: Contact -->
          <div>
            <p class="footer-col-title">Contact</p>
            <div class="footer-contact-item">
              <span class="footer-contact-label">Call Us</span>
              <a href="tel:+233000000000" class="footer-contact-value">+233 XX XXX XXXX</a>
            </div>
            <div class="footer-contact-item">
              <span class="footer-contact-label">Email Us</span>
              <a href="mailto:info@glydegh.com" class="footer-contact-value">info@glydegh.com</a>
            </div>
            <div class="footer-contact-item">
              <span class="footer-contact-label">Find Us</span>
              <span class="footer-contact-value">Accra, Ghana</span>
            </div>
            <div class="footer-contact-item">
              <span class="footer-contact-label">Hours</span>
              <span class="footer-contact-value">Mon – Fri, 4:30 AM – 10:00 PM</span>
            </div>
          </div>

        </div><!-- /footer-grid -->

      </div><!-- /container -->

      <hr class="footer-divider">

      <!-- Bottom bar -->
      <div class="container">
        <div class="footer-bottom">
          <span class="footer-bottom-left">
            &copy; 2025 GLYDE. All rights reserved.
          </span>
          <span class="footer-bottom-badge">
           Made in Ghana
          </span>
          <div class="footer-bottom-right">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    `;
  }


  /* ═══════════════════════════════════════════════════════════
     8. INIT — wire everything up after DOM ready
  ═══════════════════════════════════════════════════════════ */
  function init() {
    initPageTransitionExit();
    initLinkInterception();
    initScrollReveal();
    initCustomCursor();
    initScrollHint();
    initNavBodyPad();
    initTicker();
    buildFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
