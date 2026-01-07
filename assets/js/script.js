'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ===================================================
     HELPERS
  =================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const toggleActive = (el) => { if (el) el.classList.toggle('active'); };
  const norm = (s) => (s || '').toString().toLowerCase().trim();

  const normalizeFilterValue = (value) => {
    const v = norm(value);
    if (v === 'tous' || v === 'tout' || v === 'all') return 'all';
    return v;
  };

  /* ===================================================
     SIDEBAR : toggle mobile (accordion)
     (Pas de sidebar rétractable : ton code était cassé)
  =================================================== */
  const sidebar = $('[data-sidebar]');
  const sidebarBtn = $('[data-sidebar-btn]');

  if (sidebar && sidebarBtn) {
    sidebarBtn.addEventListener('click', () => toggleActive(sidebar));
  }

  /* ===================================================
     TESTIMONIALS MODAL
  =================================================== */
  const testimonialsItems = $$('[data-testimonials-item]');
  const modalContainer = $('[data-modal-container]');
  const modalCloseBtn = $('[data-modal-close-btn]');
  const overlay = $('[data-overlay]');
  const modalImg = $('[data-modal-img]');
  const modalTitle = $('[data-modal-title]');
  const modalText = $('[data-modal-text]');

  const toggleTestimonialsModal = () => {
    modalContainer && modalContainer.classList.toggle('active');
    overlay && overlay.classList.toggle('active');
  };

  if (
    testimonialsItems.length &&
    modalContainer && overlay &&
    modalImg && modalTitle && modalText
  ) {
    testimonialsItems.forEach(item => {
      item.addEventListener('click', () => {
        const avatar = item.querySelector('[data-testimonials-avatar]');
        const title = item.querySelector('[data-testimonials-title]');
        const text = item.querySelector('[data-testimonials-text]');

        if (avatar) { modalImg.src = avatar.src || ''; modalImg.alt = avatar.alt || ''; }
        if (title) modalTitle.innerHTML = title.innerHTML || '';
        if (text) modalText.innerHTML = text.innerHTML || '';

        toggleTestimonialsModal();
      });
    });

    modalCloseBtn && modalCloseBtn.addEventListener('click', toggleTestimonialsModal);
    overlay && overlay.addEventListener('click', toggleTestimonialsModal);
  }

  /* ===================================================
     PORTFOLIO FILTER
  =================================================== */
  const select = $('[data-select]');
  const selectItems = $$('[data-select-item]');
  const selectValue = $('[data-select-value]');
  const filterBtns = $$('[data-filter-btn]');
  const filterItems = $$('[data-filter-item]');

  const applyFilter = (raw) => {
    const value = normalizeFilterValue(raw);

    filterItems.forEach(item => {
      const cat = norm(item.dataset.category);
      item.classList.toggle('active', value === 'all' || value === cat);
    });
  };

  select && select.addEventListener('click', () => toggleActive(select));

  if (selectItems.length && selectValue) {
    selectItems.forEach(item => {
      item.addEventListener('click', () => {
        selectValue.innerText = item.innerText;
        applyFilter(item.innerText);
        select && toggleActive(select);
      });
    });
  }

  if (filterBtns.length && selectValue) {
    let last = filterBtns[0] || null;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectValue.innerText = btn.innerText;
        applyFilter(btn.innerText);

        last && last.classList.remove('active');
        btn.classList.add('active');
        last = btn;
      });
    });
  }

  /* ===================================================
     CONTACT FORM
  =================================================== */
  const form = $('[data-form]');
  const formInputs = $$('[data-form-input]');
  const formBtn = $('[data-form-btn]');

  if (form && formInputs.length && formBtn) {
    const updateBtnState = () => {
      formBtn.disabled = !form.checkValidity(); // checkValidity() (validation HTML5 native)
    };

    formInputs.forEach(input => input.addEventListener('input', updateBtnState));
    updateBtnState();
  }

  /* ===================================================
     NAVBAR : évite le chevauchement (hauteur dynamique)
     -> utilise --navbar-height côté CSS
  =================================================== */
  const navbar = $('.navbar');




  // Au DOM prêt
  updateNavbarHeight();

  // Après chargement complet (fonts/icônes peuvent changer la hauteur)
  window.addEventListener('load', updateNavbarHeight);

  // Au resize
  window.addEventListener('resize', updateNavbarHeight);

  // Double frame pour capturer les recalculs de layout (mise en page)
  requestAnimationFrame(() => requestAnimationFrame(updateNavbarHeight));

  /* ===================================================
     IMPORTANT : la veille est gérée uniquement par veille-script.js
  =================================================== */

});
