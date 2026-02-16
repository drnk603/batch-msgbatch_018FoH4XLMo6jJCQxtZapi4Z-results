(function () {
  'use strict';

  if (window.__app && window.__app.__initialized) {
    return;
  }

  window.__app = window.__app || {};
  window.__app.__initialized = true;

  const _modules = {};

  function debounce(fn, delay) {
    let timer;
    return function () {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(ctx, args), delay);
    };
  }

  function throttle(fn, limit) {
    let wait = false;
    return function () {
      if (!wait) {
        fn.apply(this, arguments);
        wait = true;
        setTimeout(() => (wait = false), limit);
      }
    };
  }

  function initBurgerMenu() {
    if (_modules.burger) return;
    _modules.burger = true;

    const nav = document.querySelector('.c-nav#main-nav, nav.c-nav');
    const toggle = document.querySelector('.c-nav__toggle');
    const collapse = document.querySelector('.collapse');
    const body = document.body;

    if (!nav || !toggle || !collapse) return;

    let focusableEls = null;
    let lastFocusedEl = null;

    function updateFocusableEls() {
      focusableEls = collapse.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    }

    function openMenu() {
      collapse.classList.add('show');
      nav.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      lastFocusedEl = document.activeElement;
      updateFocusableEls();
      if (focusableEls.length > 0) {
        focusableEls[0].focus();
      }
    }

    function closeMenu() {
      collapse.classList.remove('show');
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      if (lastFocusedEl) {
        lastFocusedEl.focus();
        lastFocusedEl = null;
      }
    }

    function trapFocus(e) {
      if (!collapse.classList.contains('show')) return;
      if (!focusableEls || focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (collapse.classList.contains('show')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && collapse.classList.contains('show')) {
        closeMenu();
      }
      trapFocus(e);
    });

    document.addEventListener('click', (e) => {
      if (
        collapse.classList.contains('show') &&
        !nav.contains(e.target) &&
        e.target !== toggle
      ) {
        closeMenu();
      }
    });

    const navLinks = collapse.querySelectorAll('.nav-link, .c-nav__link');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (collapse.classList.contains('show')) {
          closeMenu();
        }
      });
    });

    const resizeHandler = debounce(() => {
      if (window.innerWidth >= 1024 && collapse.classList.contains('show')) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler);
  }

  function initAnchorsAndScroll() {
    if (_modules.anchors) return;
    _modules.anchors = true;

    const isHomePage =
      window.location.pathname === '/' ||
      window.location.pathname === '/index.html' ||
      window.location.pathname.endsWith('/');

    const links = document.querySelectorAll('a[href]');

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.indexOf('#') === 0) {
        if (isHomePage && href.length > 1) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollTo(href);
          });
        }
      } else if (!isHomePage && href.indexOf('#') > 0) {
        const parts = href.split('#');
        if (parts[0] === '' || parts[0] === 'index.html') {
          link.setAttribute('href', '/#' + parts[1]);
        }
      }
    });

    if (isHomePage && window.location.hash) {
      setTimeout(() => smoothScrollTo(window.location.hash), 100);
    }

    function smoothScrollTo(selector) {
      try {
        const target = document.querySelector(selector);
        if (!target) return;

        const header = document.querySelector('.l-header');
        const offset = header ? header.offsetHeight : 80;
        const targetPos =
          target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth',
        });
      } catch (e) {}
    }
  }

  function initScrollSpy() {
    if (_modules.scrollspy) return;
    _modules.scrollspy = true;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            } else {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  }

  function initActiveMenuState() {
    if (_modules.activeMenu) return;
    _modules.activeMenu = true;

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPath = href.split('#')[0];

      if (
        linkPath === currentPath ||
        (currentPath === '/' &&
          (linkPath === 'index.html' || linkPath === '/index.html')) ||
        (currentPath === '/index.html' && linkPath === '/')
      ) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    });
  }

  function initImagesLazyFallback() {
    if (_modules.images) return;
    _modules.images = true;

    const images = document.querySelectorAll('img');

    images.forEach((img) => {
      if (
        !img.hasAttribute('loading') &&
        !img.classList.contains('c-logo__img') &&
        !img.hasAttribute('data-critical')
      ) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      img.addEventListener('error', function () {
        if (this.dataset.fallbackApplied) return;
        this.dataset.fallbackApplied = 'true';

        const placeholder =
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E';
        this.src = placeholder;
      });
    });
  }

  function initForms() {
    if (_modules.forms) return;
    _modules.forms = true;

    const forms = document.querySelectorAll('form.c-form, form[id]');
    if (forms.length === 0) return;

    const toastContainer = document.createElement('div');
    toastContainer.className = 'position-fixed top-0 end-0 p-3';
    toastContainer.style.cssText = 'z-index: 9999; max-width: 400px;';
    document.body.appendChild(toastContainer);

    window.__app.notify = function (message, type) {
      const alertDiv = document.createElement('div');
      alertDiv.className =
        'alert alert-' +
        (type || 'info') +
        ' alert-dismissible fade show';
      alertDiv.setAttribute('role', 'alert');
      alertDiv.innerHTML =
        message +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';

      toastContainer.appendChild(alertDiv);

      const closeBtn = alertDiv.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          alertDiv.classList.remove('show');
          setTimeout(() => alertDiv.remove(), 150);
        });
      }

      setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
      }, 5000);
    };

    forms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const errors = validateForm(form);

        if (errors.length > 0) {
          errors.forEach((error) => {
            const field = form.querySelector('#' + error.field);
            if (field) {
              const parent =
                field.closest('.mb-3') ||
                field.closest('.mb-4') ||
                field.closest('.c-form__group');
              if (parent) {
                parent.classList.add('has-error');
                let errorEl = parent.querySelector('.c-error, .invalid-feedback');
                if (!errorEl) {
                  errorEl = document.createElement('div');
                  errorEl.className = 'c-error invalid-feedback';
                  field.parentNode.insertBefore(errorEl, field.nextSibling);
                }
                errorEl.textContent = error.message;
                errorEl.style.display = 'block';
              }
            }
          });

          window.__app.notify(
            'Bitte überprüfen Sie die markierten Felder.',
            'danger'
          );
          return;
        }

        form.querySelectorAll('.has-error').forEach((el) => {
          el.classList.remove('has-error');
          const errorEl = el.querySelector('.c-error, .invalid-feedback');
          if (errorEl) errorEl.style.display = 'none';
        });

        const submitBtn = form.querySelector('button[type="submit"]');
        let originalBtnText = '';

        if (submitBtn) {
          submitBtn.disabled = true;
          originalBtnText = submitBtn.innerHTML;
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }

          window.__app.notify(
            'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.',
            'success'
          );

          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1000);
        }, 1500);
      });

      form.querySelectorAll('input, textarea, select').forEach((field) => {
        field.addEventListener('blur', () => {
          const parent =
            field.closest('.mb-3') ||
            field.closest('.mb-4') ||
            field.closest('.c-form__group');
          if (parent && parent.classList.contains('has-error')) {
            const errors = validateForm(form);
            const fieldError = errors.find((e) => e.field === field.id);
            if (!fieldError) {
              parent.classList.remove('has-error');
              const errorEl = parent.querySelector('.c-error, .invalid-feedback');
              if (errorEl) errorEl.style.display = 'none';
            }
          }
        });
      });
    });

    function validateForm(form) {
      const errors = [];

      const firstName = form.querySelector('#firstName');
      if (firstName && firstName.hasAttribute('required')) {
        if (!firstName.value.trim()) {
          errors.push({
            field: 'firstName',
            message: 'Vorname ist erforderlich',
          });
        } else if (!/^[a-zA-ZÀ-ÿs\-']{2,50}$/.test(firstName.value)) {
          errors.push({
            field: 'firstName',
            message: 'Ungültiges Format (2-50 Zeichen)',
          });
        }
      }

      const lastName = form.querySelector('#lastName');
      if (lastName && lastName.hasAttribute('required')) {
        if (!lastName.value.trim()) {
          errors.push({
            field: 'lastName',
            message: 'Nachname ist erforderlich',
          });
        } else if (!/^[a-zA-ZÀ-ÿs\-']{2,50}$/.test(lastName.value)) {
          errors.push({
            field: 'lastName',
            message: 'Ungültiges Format (2-50 Zeichen)',
          });
        }
      }

      const contactName = form.querySelector('#contactName');
      if (contactName && contactName.hasAttribute('required')) {
        if (!contactName.value.trim()) {
          errors.push({
            field: 'contactName',
            message: 'Name ist erforderlich',
          });
        } else if (!/^[a-zA-ZÀ-ÿs\-']{2,50}$/.test(contactName.value)) {
          errors.push({
            field: 'contactName',
            message: 'Ungültiges Format (2-50 Zeichen)',
          });
        }
      }

      const email = form.querySelector('#email, #contactEmail');
      if (email && email.hasAttribute('required')) {
        if (!email.value.trim()) {
          errors.push({ field: email.id, message: 'E-Mail ist erforderlich' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
          errors.push({ field: email.id, message: 'Ungültige E-Mail-Adresse' });
        }
      }

      const phone = form.querySelector('#phone, #contactPhone');
      if (phone && phone.value.trim()) {
        if (!/^[\d\s\+\-\(\)]{7,20}$/.test(phone.value)) {
          errors.push({
            field: phone.id,
            message: 'Ungültiges Telefonnummer-Format',
          });
        }
      }

      const subject = form.querySelector('#contactSubject');
      if (subject && subject.hasAttribute('required')) {
        if (!subject.value.trim()) {
          errors.push({
            field: 'contactSubject',
            message: 'Betreff ist erforderlich',
          });
        }
      }

      const message = form.querySelector('#message, #contactMessage, textarea[name="message"]');
      if (message && message.hasAttribute('required')) {
        if (!message.value.trim()) {
          errors.push({
            field: message.id,
            message: 'Nachricht ist erforderlich',
          });
        } else if (message.value.trim().length < 10) {
          errors.push({
            field: message.id,
            message: 'Nachricht muss mindestens 10 Zeichen lang sein',
          });
        }
      }

      const privacy = form.querySelector('#privacy, #contactPrivacy');
      if (privacy && privacy.hasAttribute('required')) {
        if (!privacy.checked) {
          errors.push({
            field: privacy.id,
            message: 'Bitte akzeptieren Sie die Datenschutzerklärung',
          });
        }
      }

      return errors;
    }
  }

  function initAccordion() {
    if (_modules.accordion) return;
    _modules.accordion = true;

    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();

        const targetId = button.getAttribute('data-bs-target');
        if (!targetId) return;

        const target = document.querySelector(targetId);
        if (!target) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          button.classList.add('collapsed');
          button.setAttribute('aria-expanded', 'false');
          target.classList.remove('show');
        } else {
          button.classList.remove('collapsed');
          button.setAttribute('aria-expanded', 'true');
          target.classList.add('show');
        }
      });
    });
  }

  function initScrollToTop() {
    if (_modules.scrollToTop) return;
    _modules.scrollToTop = true;

    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'c-scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
    scrollBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--color-secondary);
      color: var(--color-light);
      border: none;
      font-size: 24px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 300ms ease;
      z-index: 999;
      box-shadow: var(--shadow-lg);
    `;

    document.body.appendChild(scrollBtn);

    const toggleVisibility = throttle(() => {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }, 100);

    window.addEventListener('scroll', toggleVisibility);

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  function initModalOverlay() {
    if (_modules.modal) return;
    _modules.modal = true;

    const privacyLinks = document.querySelectorAll('a[href*="privacy"]');

    privacyLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (
        href.includes('privacy') &&
        !href.startsWith('http') &&
        !link.classList.contains('no-modal')
      ) {
        link.addEventListener('click', (e) => {
          if (window.location.pathname !== href) {
            return;
          }
        });
      }
    });
  }

  window.__app.init = function () {
    initBurgerMenu();
    initAnchorsAndScroll();
    initScrollSpy();
    initActiveMenuState();
    initImagesLazyFallback();
    initForms();
    initAccordion();
    initScrollToTop();
    initModalOverlay();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.__app.init);
  } else {
    window.__app.init();
  }
})();