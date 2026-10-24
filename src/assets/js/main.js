/**
* Template Name: iPortfolio
* Updated: Jan 29 2024 with Bootstrap v5.3.2
* Enhanced for Angular SPA & Modern Web Standards
*/
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    if (!el || typeof document === 'undefined') return all ? [] : null;
    el = el.trim();
    try {
      if (all) {
        return [...document.querySelectorAll(el)];
      } else {
        return document.querySelector(el);
      }
    } catch {
      return all ? [] : null;
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    if (el) {
      el.addEventListener('scroll', listener, { passive: true });
    }
  };

  /**
   * Navbar links active state on scroll (Scrollspy)
   */
  const navbarlinksActive = () => {
    let navbarlinks = select('#navbar .scrollto', true);
    if (!navbarlinks.length) return;

    let position = window.scrollY + 200;
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    });
  };

  window.addEventListener('load', navbarlinksActive);
  onscroll(window, navbarlinksActive);

  /**
   * Animation on scroll (AOS)
   */
  const initAOS = () => {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
      AOS.refresh();
    }
  };

  window.addEventListener('load', initAOS);
  document.addEventListener('DOMContentLoaded', initAOS);
  setTimeout(initAOS, 500);

})();
