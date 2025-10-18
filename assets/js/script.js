'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------
    Helper
    ------------------------- */
    const elementToggleFunc = (elem) => { if (elem) elem.classList.toggle('active'); };

    /* -------------------------
       NAVBAR : mise en surbrillance automatique
    ------------------------- 
    const setActiveNavLink = () => {
        const links = document.querySelectorAll('.navbar-link');
        if (!links.length) return;

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';

        links.forEach(link => {
            const href = link.getAttribute('href') || '';
            // Convertir href en pathname robuste même si href est relatif
            let linkPath;
            try {
                linkPath = (new URL(href, window.location.origin)).pathname.split('/').pop() || 'index.html';
            } catch (e) {
                linkPath = href.split('/').pop() || '';
            }

            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }

            // Quand on clique, on met à jour immédiatement l'état (utile si navigation locale)
            link.addEventListener('click', () => {
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    };

    setActiveNavLink();

    /* -------------------------
       SIDEBAR (mobile toggle)
    ------------------------- 
    const sidebar = document.querySelector('[data-sidebar]');
    const sidebarBtn = document.querySelector('[data-sidebar-btn]');
    if (sidebar && sidebarBtn) {
        sidebarBtn.addEventListener('click', () => elementToggleFunc(sidebar));
    }*/

    /* -------------------------
       TESTIMONIALS MODAL
    ------------------------- */
    const testimonialsItem = document.querySelectorAll('[data-testimonials-item]');
    const modalContainer = document.querySelector('[data-modal-container]');
    const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
    const overlay = document.querySelector('[data-overlay]');
    const modalImg = document.querySelector('[data-modal-img]');
    const modalTitle = document.querySelector('[data-modal-title]');
    const modalText = document.querySelector('[data-modal-text]');

    const testimonialsModalFunc = () => {
        if (modalContainer) modalContainer.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    };

    if (testimonialsItem.length && modalContainer && overlay && modalImg && modalTitle && modalText) {
        testimonialsItem.forEach(item => {
            item.addEventListener('click', function () {
                const avatar = this.querySelector('[data-testimonials-avatar]');
                const title = this.querySelector('[data-testimonials-title]');
                const text = this.querySelector('[data-testimonials-text]');

                if (avatar) { modalImg.src = avatar.src || ''; modalImg.alt = avatar.alt || ''; }
                if (title) modalTitle.innerHTML = title.innerHTML || '';
                if (text) modalText.innerHTML = text.innerHTML || '';

                testimonialsModalFunc();
            });
        });

        if (modalCloseBtn) modalCloseBtn.addEventListener('click', testimonialsModalFunc);
        overlay.addEventListener('click', testimonialsModalFunc);
    }

    /* -------------------------
       CUSTOM SELECT & FILTER
    ------------------------- */
    const select = document.querySelector('[data-select]');
    const selectItems = document.querySelectorAll('[data-select-item]');
    const selectValue = document.querySelector('[data-select-value]');
    const filterBtn = document.querySelectorAll('[data-filter-btn]');
    const filterItems = document.querySelectorAll('[data-filter-item]');

    const filterFunc = (selectedValue) => {
        if (!filterItems) return;
        for (let i = 0; i < filterItems.length; i++) {
            if (selectedValue === 'all') {
                filterItems[i].classList.add('active');
            } else if (selectedValue === filterItems[i].dataset.category) {
                filterItems[i].classList.add('active');
            } else {
                filterItems[i].classList.remove('active');
            }
        }
    };

    if (select) {
        select.addEventListener('click', function () { elementToggleFunc(this); });
    }

    if (selectItems.length && selectValue) {
        selectItems.forEach(item => {
            item.addEventListener('click', function () {
                const selectedValue = this.innerText.toLowerCase();
                selectValue.innerText = this.innerText;
                if (select) elementToggleFunc(select);
                filterFunc(selectedValue);
            });
        });
    }

    if (filterBtn.length && selectValue) {
        let lastClickedBtn = filterBtn[0];
        filterBtn.forEach(btn => {
            btn.addEventListener('click', function () {
                const selectedValue = this.innerText.toLowerCase();
                selectValue.innerText = this.innerText;
                filterFunc(selectedValue);

                if (lastClickedBtn) lastClickedBtn.classList.remove('active');
                this.classList.add('active');
                lastClickedBtn = this;
            });
        });
    }

    /* -------------------------
       CONTACT FORM (activation du bouton)
    ------------------------- */
    const form = document.querySelector('[data-form]');
    const formInputs = document.querySelectorAll('[data-form-input]');
    const formBtn = document.querySelector('[data-form-btn]');

    if (form && formInputs.length && formBtn) {
        formInputs.forEach(input => {
            input.addEventListener('input', function () {
                if (form.checkValidity()) {
                    formBtn.removeAttribute('disabled');
                } else {
                    formBtn.setAttribute('disabled', '');
                }
            });
        });
    }

    /* -------------------------
       PAGE NAVIGATION (pour data-nav-link / data-page)
       (si vous utilisez une navigation "pages" interne)
    ------------------------- */
    const navigationLinks = document.querySelectorAll('[data-nav-link]');
    const pages = document.querySelectorAll('[data-page]');

    if (navigationLinks.length && pages.length) {
        navigationLinks.forEach(navLink => {
            navLink.addEventListener('click', function () {
                const text = this.innerHTML.toLowerCase();
                pages.forEach(page => {
                    if (text === page.dataset.page) {
                        page.classList.add('active');
                    } else {
                        page.classList.remove('active');
                    }
                });
                navigationLinks.forEach(n => n.classList.remove('active'));
                this.classList.add('active');
                window.scrollTo(0, 0);
            });
        });
    }

    /* -------------------------
       SIDEBAR RÉTRACTABLE (desktop)
    ------------------------- */
    (function setupRetractableSidebar() {
        const mainContent = document.querySelector('.main-content');
        const minDesktopWidth = 1250;
        if (window.innerWidth >= minDesktopWidth && sidebar && mainContent) {
            const retractSidebar = () => {
                sidebar.classList.add('retracted');
                mainContent.style.marginLeft = '100px';
            };
            const expandSidebar = () => {
                sidebar.classList.remove('retracted');
                mainContent.style.marginLeft = '270px';
            };

            retractSidebar();
            sidebar.addEventListener('mouseenter', expandSidebar);
            sidebar.addEventListener('mouseleave', retractSidebar);
        }
    })();

    /* -------------------------
       RSS FEED (veille technologique)
    ------------------------- */
    (function setupRssFeed() {
        const feedSelector = document.querySelector('#feed-selector');
        const rssContainer = document.querySelector('#rss-content');

        if (!feedSelector || !rssContainer) return;

        const fetchAndDisplayRss = async (feedUrl) => {
            rssContainer.innerHTML = '<p class="timeline-text" style="text-align: center;">Chargement des articles...</p>';
            try {
                const response = await fetch(feedUrl);
                const data = await response.json();

                if (data.status === 'ok' && Array.isArray(data.items)) {
                    rssContainer.innerHTML = '';
                    const articleList = document.createElement('ul');
                    articleList.className = 'blog-posts-list';

                    data.items.slice(0, 10).forEach(item => {
                        const listItem = document.createElement('li');
                        listItem.className = 'blog-post-item';

                        const link = document.createElement('a');
                        link.href = item.link || '#';
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';

                        const blogContent = document.createElement('div');
                        blogContent.className = 'blog-content';

                        const title = document.createElement('h3');
                        title.className = 'h3 blog-item-title';
                        title.textContent = item.title || '';

                        const meta = document.createElement('div');
                        meta.className = 'blog-meta';
                        const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString('fr-FR') : '';
                        meta.innerHTML = `<time datetime="${item.pubDate || ''}">${pubDate}</time>`;

                        const description = document.createElement('p');
                        description.className = 'blog-text';
                        const rawDesc = item.description ? item.description.replace(/<[^>]*>?/gm, '') : '';
                        description.textContent = rawDesc.substring(0, 150) + (rawDesc.length > 150 ? '...' : '');

                        blogContent.appendChild(meta);
                        blogContent.appendChild(title);
                        blogContent.appendChild(description);
                        link.appendChild(blogContent);
                        listItem.appendChild(link);
                        articleList.appendChild(listItem);
                    });

                    rssContainer.appendChild(articleList);
                } else {
                    rssContainer.innerHTML = `<p class="timeline-text" style="text-align: center;">Erreur : ${data.message || 'flux invalide'}</p>`;
                }
            } catch (error) {
                console.error('Erreur de fetch:', error);
                rssContainer.innerHTML = '<p class="timeline-text" style="text-align: center;">Impossible de charger le flux.</p>';
            }
        };

        feedSelector.addEventListener('change', () => {
            const selectedFeedUrl = feedSelector.value;
            if (selectedFeedUrl) {
                fetchAndDisplayRss(selectedFeedUrl);
            } else {
                rssContainer.innerHTML = '<p class="timeline-text" style="text-align: center;">Veuillez sélectionner une catégorie ci-dessus pour afficher les derniers articles.</p>';
            }
        });
    })();

    /* -------------------------
       RECHERCHE & SUR-LIGNAGE DANS LA VEILLE
    ------------------------- */
    (function setupSearchHighlight() {
        const searchInput = document.querySelector('[data-search]');
        const feedContainer = document.querySelector('#rss-feed-container');

        if (!searchInput || !feedContainer) return;

        const removeHighlights = () => {
            const allItems = feedContainer.querySelectorAll('.timeline-item');
            allItems.forEach(item => {
                const titleElement = item.querySelector('.h4.timeline-item-title');
                const textElement = item.querySelector('.timeline-text');
                if (titleElement) titleElement.innerHTML = titleElement.textContent;
                if (textElement) textElement.innerHTML = textElement.textContent;
            });
        };

        const applyHighlights = (searchTerm) => {
            if (!searchTerm) return;
            const regex = new RegExp(searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'); // échappe le terme
            const visibleItems = feedContainer.querySelectorAll('.timeline-item:not([style*="display: none"])');

            visibleItems.forEach(item => {
                const titleElement = item.querySelector('.h4.timeline-item-title');
                const textElement = item.querySelector('.timeline-text');

                if (titleElement) {
                    const originalTitle = titleElement.textContent;
                    titleElement.innerHTML = originalTitle.replace(regex, (match) => `<mark>${match}</mark>`);
                }
                if (textElement) {
                    const originalText = textElement.textContent;
                    textElement.innerHTML = originalText.replace(regex, (match) => `<mark>${match}</mark>`);
                }
            });
        };

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            const allItems = feedContainer.querySelectorAll('.timeline-item');

            removeHighlights();

            allItems.forEach(item => {
                const titleEl = item.querySelector('.h4');
                const textEl = item.querySelector('.timeline-text');
                const title = titleEl ? titleEl.textContent.toLowerCase() : '';
                const text = textEl ? textEl.textContent.toLowerCase() : '';
                const isVisible = (searchTerm === '') || title.includes(searchTerm.toLowerCase()) || text.includes(searchTerm.toLowerCase());
                item.style.display = isVisible ? 'block' : 'none';
            });

            if (searchTerm !== '') applyHighlights(searchTerm);
        });
    })();

});