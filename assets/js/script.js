'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

    testimonialsItem[i].addEventListener("click", function () {

        modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
        modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
        modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
        modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

        testimonialsModalFunc();

    });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {

        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        elementToggleFunc(select);
        filterFunc(selectedValue);

    });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

    for (let i = 0; i < filterItems.length; i++) {

        if (selectedValue === "all") {
            filterItems[i].classList.add("active");
        } else if (selectedValue === filterItems[i].dataset.category) {
            filterItems[i].classList.add("active");
        } else {
            filterItems[i].classList.remove("active");
        }

    }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

    filterBtn[i].addEventListener("click", function () {

        let selectedValue = this.innerText.toLowerCase();
        selectValue.innerText = this.innerText;
        filterFunc(selectedValue);

        lastClickedBtn.classList.remove("active");
        this.classList.add("active");
        lastClickedBtn = this;

    });

}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {

        // check form validation
        if (form.checkValidity()) {
            formBtn.removeAttribute("disabled");
        } else {
            formBtn.setAttribute("disabled", "");
        }

    });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {

        for (let i = 0; i < pages.length; i++) {
            if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
                pages[i].classList.add("active");
                navigationLinks[i].classList.add("active");
                window.scrollTo(0, 0);
            } else {
                pages[i].classList.remove("active");
                navigationLinks[i].classList.remove("active");
            }
        }

    });
}


// ===================================================================
// ===================================================================
// NOUVEAU CODE CI-DESSOUS
// ===================================================================
// ===================================================================


// --- SCRIPT POUR LA NAVIGATION RÉTRACTABLE (Desktop) ---
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector("[data-sidebar]");
    const mainContent = document.querySelector(".main-content");

    // On ne lance ce script que sur les écrans larges (desktop)
    if (window.innerWidth >= 1250 && sidebar && mainContent) {

        // Fonction pour rétracter la barre
        const retractSidebar = () => {
            sidebar.classList.add("retracted");
            mainContent.style.marginLeft = "100px"; // Largeur de la barre rétractée
        };

        // Fonction pour déployer la barre
        const expandSidebar = () => {
            sidebar.classList.remove("retracted");
            mainContent.style.marginLeft = "270px"; // Largeur originale de la barre
        };

        // On rétracte la barre au chargement de la page
        retractSidebar();

        // On déploie quand la souris entre dans la zone du sidebar
        sidebar.addEventListener("mouseenter", expandSidebar);

        // On rétracte quand la souris sort de la zone du sidebar
        sidebar.addEventListener("mouseleave", retractSidebar);
    }
});
// ======================================================
// LOGIQUE POUR LE FLUX RSS DE LA VEILLE TECHNOLOGIQUE
// ======================================================

// On s'assure que ce code ne s'exécute que sur la page de veille
document.addEventListener('DOMContentLoaded', () => {

    const feedSelector = document.querySelector('#feed-selector');
    const rssContainer = document.querySelector('#rss-content');

    // Si on ne trouve pas ces éléments, on est pas sur la bonne page, on arrête.
    if (!feedSelector || !rssContainer) {
        return;
    }

    const fetchAndDisplayRss = async (feedUrl) => {
        rssContainer.innerHTML = '<p class="timeline-text" style="text-align: center;">Chargement des articles...</p>';

        try {
            const response = await fetch(feedUrl);
            const data = await response.json();

            if (data.status === 'ok') {
                rssContainer.innerHTML = '';
                const articleList = document.createElement('ul');
                articleList.className = 'blog-posts-list';

                data.items.slice(0, 10).forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.className = 'blog-post-item';

                    const link = document.createElement('a');
                    link.href = item.link;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';

                    const blogContent = document.createElement('div');
                    blogContent.className = 'blog-content';

                    const title = document.createElement('h3');
                    title.className = 'h3 blog-item-title';
                    title.textContent = item.title;

                    const meta = document.createElement('div');
                    meta.className = 'blog-meta';
                    const pubDate = new Date(item.pubDate).toLocaleDateString('fr-FR');
                    meta.innerHTML = `<time datetime="${item.pubDate}">${pubDate}</time>`;

                    const description = document.createElement('p');
                    description.className = 'blog-text';
                    let plainTextDescription = item.description.replace(/<[^>]*>?/gm, '');
                    description.textContent = plainTextDescription.substring(0, 150) + '...';

                    blogContent.appendChild(meta);
                    blogContent.appendChild(title);
                    blogContent.appendChild(description);
                    link.appendChild(blogContent);
                    listItem.appendChild(link);

                    articleList.appendChild(listItem);
                });

                rssContainer.appendChild(articleList);

            } else {
                rssContainer.innerHTML = `<p class="timeline-text" style="text-align: center;">Erreur : ${data.message}</p>`;
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

});

// --- LOGIQUE DE SUR-LIGNAGE POUR LA RECHERCHE DANS LA VEILLE ---

// 1. On sélectionne les éléments nécessaires
const searchInput = document.querySelector("[data-search]");
const feedContainer = document.querySelector("#rss-feed-container");

// Fonction pour enlever TOUT le surlignage existant
const removeHighlights = () => {
    const allItems = feedContainer.querySelectorAll('.timeline-item');
    allItems.forEach(item => {
        const titleElement = item.querySelector('.h4.timeline-item-title');
        const textElement = item.querySelector('.timeline-text');

        if (titleElement) {
            // On remplace le contenu HTML par le texte brut pour enlever les balises <mark>
            titleElement.innerHTML = titleElement.textContent;
        }
        if (textElement) {
            textElement.innerHTML = textElement.textContent;
        }
    });
};

// Fonction pour appliquer le surlignage
const applyHighlights = (searchTerm) => {
    // Si le terme de recherche est vide, on ne fait rien
    if (!searchTerm) return;

    // Expression régulière pour trouver le terme, insensible à la casse ('i') et globale ('g')
    const regex = new RegExp(searchTerm, 'gi');

    // On récupère uniquement les articles VISIBLES
    const visibleItems = feedContainer.querySelectorAll('.timeline-item:not([style*="display: none"])');

    visibleItems.forEach(item => {
        const titleElement = item.querySelector('.h4.timeline-item-title');
        const textElement = item.querySelector('.timeline-text');

        // Surlignage dans le titre
        if (titleElement) {
            const originalTitle = titleElement.textContent;
            titleElement.innerHTML = originalTitle.replace(regex, (match) => `<mark>${match}</mark>`);
        }

        // Surlignage dans le texte/description
        if (textElement) {
            const originalText = textElement.textContent;
            textElement.innerHTML = originalText.replace(regex, (match) => `<mark>${match}</mark>`);
        }
    });
};


// Remplacez votre ancien listener par celui-ci
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    const allItems = feedContainer.querySelectorAll('.timeline-item');

    // 1. On nettoie tout le surlignage
    removeHighlights();

    // 2. On filtre les éléments à afficher/cacher
    allItems.forEach(item => {
        const title = item.querySelector('.h4').textContent.toLowerCase();
        const text = item.querySelector('.timeline-text').textContent.toLowerCase();
        const isVisible = title.includes(searchTerm.toLowerCase()) || text.includes(searchTerm.toLowerCase());
        item.style.display = isVisible ? 'block' : 'none';
    });

    // 3. On applique le surlignage SEULEMENT sur les éléments maintenant visibles
    applyHighlights(searchTerm);
});