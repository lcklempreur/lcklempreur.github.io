// Contenu mis à jour pour : assets/js/veille-script.js
// Fonction pour assigner une catégorie en fonction des mots-clés dans le titre
function getCategoryFromTitle(title) {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('sécurité') || lowerCaseTitle.includes('cyber') || lowerCaseTitle.includes('faille')) {
        return 'sécurité';
    }
    if (lowerCaseTitle.includes('ia') || lowerCaseTitle.includes('intelligence artificielle') || lowerCaseTitle.includes('gpt')) {
        return 'ia';
    }
    if (lowerCaseTitle.includes('html') || lowerCaseTitle.includes('css') || lowerCaseTitle.includes('javascript') || lowerCaseTitle.includes('react')) {
        return 'web';
    }
    if (lowerCaseTitle.includes('nvidia') || lowerCaseTitle.includes('intel') || lowerCaseTitle.includes('amd') || lowerCaseTitle.includes('processeur')) {
        return 'matériel';
    }
    return 'autre'; // Catégorie par défaut
}
document.addEventListener('DOMContentLoaded', () => {

    // --- ÉLÉMENTS DU DOM ---
    const rssContainer = document.getElementById('rss-content');
    const searchInput = document.getElementById('search-bar'); // On récupère la barre de recherche

    if (!rssContainer || !searchInput) {
        console.error("Un élément nécessaire (rss-content ou search-bar) est introuvable.");
        return;
    }

    // --- VARIABLES GLOBALES ---
    let allFetchedItems = []; // Variable pour stocker TOUS les articles une fois chargés

    // --- CONFIGURATION ---
    const rssFeeds = [
        'https://cyberveille.curated.co/issues.rss',
        'https://www.cert.ssi.gouv.fr/feed/',
        'https://flux.saynete.com/encart_rss_informatique_deuxzero_fr.xml',
        'https://www.bleepingcomputer.com/feed/',
        'https://www.wired.com/feed/category/security/latest/rss',
    ];

    // --- FONCTIONS ---

    // Fonction pour afficher les articles dans la page
    const renderItems = (itemsToRender) => {
        let html = '';
        if (itemsToRender.length === 0) {
            html = `
                <li class="timeline-item">
                    <h4 class="h4 timeline-item-title">Aucun article ne correspond à votre recherche</h4>
                    <p class="timeline-text">Essayez avec d'autres mots-clés ou videz la barre de recherche pour tout afficher.</p>
                </li>
            `;
        } else {
            // On affiche seulement les 15 premiers résultats pour la performance
            const recentItems = itemsToRender.slice(0, 100);

            recentItems.forEach(item => {
                let description = new DOMParser().parseFromString(item.description, "text/html").documentElement.textContent;
                const excerpt = description.trim().substring(0, 150) + '...';
                const sourceName = item.feedTitle || new URL(item.link).hostname.replace('www.', '');

                html += `
                    <li class="timeline-item">
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
                            <h4 class="h4 timeline-item-title">${item.title}</h4>
                        </a>
                        <span>${new Date(item.pubDate).toLocaleDateString('fr-FR')} | Source : ${sourceName}</span>
                        <p class="timeline-text">${excerpt}</p>
                    </li>
                `;
            });
        }
        rssContainer.innerHTML = html;
    };

    // Fonction pour filtrer les articles basés sur la recherche
    const filterArticles = () => {
        const searchTerm = searchInput.value.toLowerCase(); // On prend le texte de la recherche en minuscules

        if (searchTerm === '') {
            renderItems(allFetchedItems); // Si la recherche est vide, on affiche tout
            return;
        }

        const filteredItems = allFetchedItems.filter(item => {
            const title = item.title.toLowerCase();
            const description = item.description.toLowerCase();
            return title.includes(searchTerm) || description.includes(searchTerm);
        });

        renderItems(filteredItems); // On affiche les résultats filtrés
    };

    // Fonction pour récupérer un flux RSS
    const fetchFeed = (feedUrl) => {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
        return fetch(apiUrl).then(response => {
            if (!response.ok) throw new Error(`Erreur réseau pour le flux : ${feedUrl}`);
            return response.json();
        });
    };

    // Fonction pour afficher les messages d'erreur
    const displayError = (message) => {
        rssContainer.innerHTML = `<li class="timeline-item"><h4 class="h4 timeline-item-title">Erreur</h4><p class="timeline-text">${message}</p></li>`;
    };

    // --- EXÉCUTION AU CHARGEMENT ---

    // 1. Afficher le message de chargement
    rssContainer.innerHTML = `<li class="timeline-item"><h4 class="h4 timeline-item-title">Chargement de la veille...</h4></li>`;

    // 2. Lancer la récupération de tous les flux
    Promise.all(rssFeeds.map(feed => fetchFeed(feed)))
        .then(results => {
            let allItems = [];
            results.forEach(result => {
                if (result.status === 'ok' && result.items) {
                    result.items.forEach(item => {
                        item.feedTitle = result.feed.title;
                    });
                    allItems = allItems.concat(result.items);
                }
            });

            // Trier tous les articles par date, du plus récent au plus ancien
            const sortedItems = allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

            // On sauvegarde la liste complète dans notre variable globale
            allFetchedItems = sortedItems;

            // On affiche tous les articles une première fois
            renderItems(allFetchedItems);
        })
        .catch(error => {
            console.error('Erreur globale lors de la récupération des flux RSS:', error);
            displayError("Impossible de récupérer les articles.");
        });

    // 3. Ajouter l'écouteur d'événement sur la barre de recherche
    searchInput.addEventListener('input', filterArticles);
});