/* =============================================================
   GLYDE — js/pages/contact.js
   §12 — Form validation · Success state · Corporate CTA scroll
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
     2. CONTACT FORM LOGIC (Validation & Success)
  ═══════════════════════════════════════════════════════════ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('cfSubmitBtn');
    const btnText = submitBtn ? submitBtn.querySelector('.cf-submit-text') : null;
    const successMsg = document.getElementById('cfSuccess');

    if (!form || !submitBtn || !successMsg) return;

    // Remove shake class on animation end so it can be re-triggered
    form.addEventListener('animationend', (e) => {
      if (e.target.classList.contains('shake')) {
        e.target.classList.remove('shake');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

      inputs.forEach(input => {
        if (!input.checkValidity()) {
          isValid = false;
          input.classList.remove('shake');
          // Force reflow
          void input.offsetWidth;
          input.classList.add('shake');
          input.style.borderColor = 'red';
        } else {
          input.style.borderColor = ''; // reset
        }
      });

      if (!isValid) return;

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending...';

      // Let the browser submit the form to the action URL
      form.submit();
    });

    // Reset red border on input
    form.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        e.target.style.borderColor = '';
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     3. CORPORATE CTA (Scroll & Select)
  ═══════════════════════════════════════════════════════════ */
  function initCorporateCta() {
    const ctaBtn = document.getElementById('corpCtaBtn');
    const subjectSelect = document.getElementById('cf-subject');
    const formCard = document.getElementById('contactFormCard');

    if (!ctaBtn || !subjectSelect || !formCard) return;

    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Select the "Partnership / Corporate" option
      subjectSelect.value = "Partnership / Corporate";
      
      // Scroll to form (offset by navbar height ~80px)
      const rect = formCard.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const topPos = rect.top + scrollTop - 100; // 100px offset

      window.scrollTo({
        top: topPos,
        behavior: 'smooth'
      });
      
      // Highlight the select briefly to show it changed
      setTimeout(() => {
        subjectSelect.focus();
        subjectSelect.style.borderColor = 'var(--green)';
        setTimeout(() => {
          subjectSelect.style.borderColor = '';
        }, 1000);
      }, 600);
    });
  }


  /* ═══════════════════════════════════════════════════════════
     4. INIT
  ═══════════════════════════════════════════════════════════ */
  function init() {
    initHeroEntrance();
    initContactForm();
    initCorporateCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
