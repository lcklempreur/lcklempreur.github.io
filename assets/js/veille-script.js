'use strict';

document.addEventListener('DOMContentLoaded', () => {
  /* ---------------------------------------------------
    CONFIG
  --------------------------------------------------- */

  // Flux RSS
  const rssFeeds = [
    'https://www.cert.ssi.gouv.fr/feed/',
    'https://www.bleepingcomputer.com/feed/',
    'https://www.theverge.com/rss/index.xml'
  ];

  // Éléments DOM (Document Object Model : représentation HTML manipulable en JS)
  const feedContainer = document.getElementById('rss-content');
  const searchInput = document.getElementById('search-bar');

  // Stock en mémoire pour filtrage
  let allFetchedItems = [];

  if (!feedContainer) return;

  /* ---------------------------------------------------
    Helpers
  --------------------------------------------------- */

  const escapeHTML = (str) => {
    return (str ?? '').toString()
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const toTextFromHTML = (html) => {
    try {
      const doc = new DOMParser().parseFromString(html || '', 'text/html');
      return (doc.documentElement.textContent || '').trim();
    } catch {
      return (html || '').toString().trim();
    }
  };

  const safeDateValue = (d) => {
    const t = Date.parse(d);
    return Number.isFinite(t) ? t : 0;
  };

  const formatDateFR = (d) => {
    const t = safeDateValue(d);
    if (!t) return 'Date inconnue';
    return new Date(t).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const escapeRegex = (s) => (s ?? '').toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlight = (text, term) => {
    const clean = (term || '').trim();
    if (!clean) return escapeHTML(text);

    const regex = new RegExp(escapeRegex(clean), 'gi');
    const safe = escapeHTML(text);

    // On relance la regex sur le texte non-échappé, puis on reconstruit en échappant
    // => Ici, on fait simple : on highlight sur la version échappée, ce qui marche
    // tant que "term" n'inclut pas de séquences HTML (il est échappé de toute façon).
    return safe.replace(regex, (m) => `<mark>${m}</mark>`);
  };

  // Catégorisation simple (optionnelle) basée sur le titre + source
  const getCategoryFromTitle = (title, feedTitle) => {
    const t = (title || '').toLowerCase();
    const f = (feedTitle || '').toLowerCase();

    if (f.includes('cert') || t.includes('ssi') || t.includes('vuln') || t.includes('cve')) return 'Sécurité';
    if (t.includes('microsoft') || t.includes('windows') || t.includes('patch')) return 'Microsoft';
    if (t.includes('linux') || t.includes('ubuntu') || t.includes('debian')) return 'Linux';
    if (t.includes('ransom') || t.includes('malware') || t.includes('phishing')) return 'Menaces';
    if (t.includes('cloud') || t.includes('aws') || t.includes('azure') || t.includes('gcp')) return 'Cloud';
    if (t.includes('ia') || t.includes('ai') || t.includes('llm')) return 'IA';

    return 'Général';
  };

  const displayLoading = () => {
    feedContainer.innerHTML = `
      <li class="timeline-item">
        <h4 class="h4 timeline-item-title">Chargement de la veille...</h4>
        <p class="timeline-text">Récupération des derniers articles.</p>
      </li>
    `;
  };

  const displayError = (msg) => {
    feedContainer.innerHTML = `
      <li class="timeline-item">
        <h4 class="h4 timeline-item-title">Erreur</h4>
        <p class="timeline-text">${escapeHTML(msg)}</p>
      </li>
    `;
  };

  /* ---------------------------------------------------
    Fetch RSS via rss2json (dépendance externe)
    - Timeout (AbortController : annulation d’une requête)
    - allSettled (ne casse pas si 1 flux échoue)
  --------------------------------------------------- */

  const fetchFeed = async (feedUrl, timeoutMs = 12000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

    try {
      const res = await fetch(apiUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };

  const normalizeItems = (result) => {
    const feedTitle = result?.feed?.title || '';
    const items = Array.isArray(result?.items) ? result.items : [];

    return items.map(it => {
      const title = it?.title || 'Sans titre';
      const link = it?.link || '#';
      const pubDate = it?.pubDate || it?.published || '';
      const descriptionText = toTextFromHTML(it?.description || it?.content || '');

      return {
        title,
        link,
        pubDate,
        description: descriptionText,
        feedTitle,
        category: getCategoryFromTitle(title, feedTitle),
        _dateValue: safeDateValue(pubDate)
      };
    });
  };

  /* ---------------------------------------------------
    Render
  --------------------------------------------------- */

  const renderItems = (items, term = '') => {
    if (!items.length) {
      feedContainer.innerHTML = `
        <li class="timeline-item">
          <h4 class="h4 timeline-item-title">Aucun article</h4>
          <p class="timeline-text">Aucun résultat pour votre recherche.</p>
        </li>
      `;
      return;
    }

    // Limite d’affichage (facultatif)
    const LIMIT = 30;
    const sliced = items.slice(0, LIMIT);

    let html = '';
    sliced.forEach(item => {
      const title = highlight(item.title, term);
      const desc = highlight(item.description, term);
      const source = highlight(item.feedTitle, term);
      const badge = highlight(item.category, term);
      const dateStr = escapeHTML(formatDateFR(item.pubDate));
      const link = escapeHTML(item.link);

      html += `
        <li class="timeline-item">
          <h4 class="h4 timeline-item-title">
            <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
          </h4>

          <span>${dateStr} — <em>${source}</em> — <strong>${badge}</strong></span>

          <p class="timeline-text">${desc || '—'}</p>
        </li>
      `;
    });

    feedContainer.innerHTML = html;
  };

  /* ---------------------------------------------------
    Search (filtrage + highlight)
  --------------------------------------------------- */

  const applySearch = (termRaw) => {
    const term = (termRaw || '').trim().toLowerCase();

    if (!term) {
      renderItems(allFetchedItems, '');
      return;
    }

    const filtered = allFetchedItems.filter(item => {
      const hay = [
        item.title,
        item.description,
        item.feedTitle,
        item.category
      ].join(' ').toLowerCase();

      return hay.includes(term);
    });

    renderItems(filtered, termRaw);
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      applySearch(e.target.value);
    });
  }

  /* ---------------------------------------------------
    Init
  --------------------------------------------------- */

  const init = async () => {
    displayLoading();

    const results = await Promise.allSettled(
      rssFeeds.map(url => fetchFeed(url))
    );

    let items = [];

    results.forEach(r => {
      if (r.status !== 'fulfilled') return;

      const data = r.value;
      if (data?.status !== 'ok') return;

      items = items.concat(normalizeItems(data));
    });

    // Tri décroissant par date
    items.sort((a, b) => (b._dateValue - a._dateValue));

    allFetchedItems = items;

    if (!allFetchedItems.length) {
      displayError("Aucun article n’a pu être récupéré (flux indisponibles ou service de conversion).");
      return;
    }

    renderItems(allFetchedItems, '');
  };

  init().catch((err) => {
    console.error(err);
    displayError("Impossible de récupérer la veille pour le moment.");
  });
});
