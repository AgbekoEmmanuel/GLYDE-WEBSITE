/* =============================================================
   GLYDE — nav.js
   Navbar: scroll shrink, active link detection, mobile overlay,
   page transition integration
   ============================================================= */

(function () {
  'use strict';

  /* ───────────────────────────────────────────────────────────
     CONSTANTS
  ─────────────────────────────────────────────────────────── */
  const SCROLL_THRESHOLD = 60; // px before navbar shrinks
  let CURRENT_PAGE       = window.location.pathname.split('/').pop() || 'index.html';
  CURRENT_PAGE           = CURRENT_PAGE.replace('.html', '');
  if (CURRENT_PAGE === 'index' || CURRENT_PAGE === '') CURRENT_PAGE = 'home';

  /* ───────────────────────────────────────────────────────────
     INJECT NAVBAR HTML
     (Single source of truth — rendered by JS so it's consistent
     across all pages without server-side includes)
  ─────────────────────────────────────────────────────────── */
  function buildNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    navbar.innerHTML = `
      <div class="nav-inner">

        <!-- Logo -->
        <a href="index.html" class="nav-logo" id="nav-logo-link" aria-label="GLYDE Home">
          <div class="nav-logo-mark" aria-hidden="true">
            <img src="assets/logo.svg" alt="" width="32" height="32">
          </div>
          <span class="nav-logo-wordmark">GLYDE</span>
        </a>

        <!-- Desktop Nav Links -->
        <ul class="nav-links" role="list" aria-label="Primary navigation">
          <li><a href="index.html"         id="nav-home"     class="hover-line">Home</a></li>
          <li><a href="about.html"         id="nav-about"    class="hover-line">About</a></li>
          <li><a href="how-it-works.html"  id="nav-hiw"      class="hover-line">How It Works</a></li>
          <li><a href="routes.html"        id="nav-routes"   class="hover-line">Routes</a></li>
          <li><a href="safety.html"        id="nav-safety"   class="hover-line">Safety</a></li>
          <li><a href="contact.html"       id="nav-contact"  class="hover-line">Contact</a></li>
        </ul>

        <!-- Right side: CTA + Hamburger -->
        <div class="nav-right">
          <a href="${CURRENT_PAGE === 'home' ? '#refer-earn' : 'index.html#refer-earn'}" class="nav-cta nav-cta--refer" id="nav-cta-refer" aria-label="Refer & Earn">
            Refer a Friend
          </a>
          <a href="${CURRENT_PAGE === 'home' ? '#waitlist' : 'index.html#waitlist'}" class="nav-cta" id="nav-cta-btn" aria-label="Join the GLYDE waitlist">
            Waitlist&nbsp;&rarr;
          </a>
          <button
            class="nav-hamburger"
            id="nav-hamburger"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="nav-overlay"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

      </div>
    `;

    // Append mobile overlay to body to escape navbar's backdrop-filter stacking context
    const overlayHtml = `
      <!-- Mobile Full-Screen Overlay -->
      <div class="nav-overlay" id="nav-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">

        <button class="nav-overlay-close" id="nav-overlay-close" aria-label="Close navigation menu">
          <i class="ph ph-x" aria-hidden="true"></i>
        </button>

        <ul class="nav-overlay-links" role="list">
          <li><a href="index.html"        class="hover-line">Home</a></li>
          <li><a href="about.html"        class="hover-line">About</a></li>
          <li><a href="how-it-works.html" class="hover-line">How It Works</a></li>
          <li><a href="routes.html"       class="hover-line">Routes</a></li>
          <li><a href="safety.html"       class="hover-line">Safety</a></li>
          <li><a href="contact.html"      class="hover-line">Contact</a></li>
        </ul>

        <div class="nav-overlay-ctas">
          <a href="${CURRENT_PAGE === 'home' ? '#refer-earn' : 'index.html#refer-earn'}" class="nav-overlay-cta nav-overlay-cta--refer">
            Refer a Friend
          </a>
          <a href="${CURRENT_PAGE === 'home' ? '#waitlist' : 'index.html#waitlist'}" class="nav-overlay-cta">
            Waitlist &rarr;
          </a>
        </div>

        <div class="nav-overlay-social">
          <a href="https://instagram.com/glydeghana" target="_blank" rel="noopener noreferrer">IG</a>
          <a href="https://twitter.com/glydeghana"   target="_blank" rel="noopener noreferrer">X</a>
          <a href="https://linkedin.com/company/glyde-ghana" target="_blank" rel="noopener noreferrer">LI</a>
        </div>

      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHtml);
  }

  /* ───────────────────────────────────────────────────────────
     SCROLL BEHAVIOUR — shrink navbar at 60px
  ─────────────────────────────────────────────────────────── */
  function initScrollBehaviour() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Use passive listener for performance
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load in case page is already scrolled
  }

  /* ───────────────────────────────────────────────────────────
     ACTIVE LINK DETECTION — match current page filename
  ─────────────────────────────────────────────────────────── */
  function setActiveLink() {
    const linksMap = {
      'home'         : 'nav-home',
      'about'        : 'nav-about',
      'how-it-works' : 'nav-hiw',
      'routes'       : 'nav-routes',
      'safety'       : 'nav-safety',
      'contact'      : 'nav-contact',
    };

    const activeId = linksMap[CURRENT_PAGE];
    if (!activeId) return;

    const activeLink = document.getElementById(activeId);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }

    // Also mark in overlay (same hrefs)
    document.querySelectorAll('.nav-overlay-links a').forEach(link => {
      let href = link.getAttribute('href');
      if (href) {
        let cleanHref = href.replace('#', '').split('/').pop().replace('.html', '');
        if (cleanHref === 'index' || cleanHref === '') cleanHref = 'home';
        if (cleanHref === CURRENT_PAGE) {
          link.classList.add('active');
        }
      }
    });
  }

  /* ───────────────────────────────────────────────────────────
     MOBILE OVERLAY — open / close / keyboard
  ─────────────────────────────────────────────────────────── */
  function initMobileOverlay() {
    const hamburger = document.getElementById('nav-hamburger');
    const overlay   = document.getElementById('nav-overlay');
    const closeBtn  = document.getElementById('nav-overlay-close');

    if (!hamburger || !overlay) return;

    function openMenu() {
      overlay.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');

      // Focus first overlay link for accessibility
      const firstLink = overlay.querySelector('a');
      if (firstLink) setTimeout(() => firstLink.focus(), 350);
    }

    function closeMenu() {
      overlay.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
      hamburger.focus();
    }

    hamburger.addEventListener('click', () => {
      const isOpen = overlay.classList.contains('open');
      isOpen ? closeMenu() : openMenu();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close when an overlay link is clicked (navigateTo handles transition)
    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });
  }

  /* ───────────────────────────────────────────────────────────
     INIT
  ─────────────────────────────────────────────────────────── */
  function init() {
    buildNavbar();
    initScrollBehaviour();
    setActiveLink();
    initMobileOverlay();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
