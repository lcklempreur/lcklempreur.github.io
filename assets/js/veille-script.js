'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const rssFeeds = [
    'https://www.cert.ssi.gouv.fr/feed/',
    'https://www.bleepingcomputer.com/feed/',
    'https://www.theverge.com/rss/index.xml'
  ];

  const feedContainer = document.getElementById('rss-content');
  const searchInput   = document.getElementById('search-bar');
  let allFetchedItems = [];

  if (!feedContainer) return;

  /* ── Helpers ── */
  const escapeHTML = (s) =>
    (s ?? '').toString()
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const toText = (html) => {
    try { return new DOMParser().parseFromString(html||'','text/html').documentElement.textContent.trim(); }
    catch { return (html||'').trim(); }
  };

  const safeDate  = (d) => { const t = Date.parse(d); return isFinite(t) ? t : 0; };
  const formatDate = (d) => {
    const t = safeDate(d);
    if (!t) return 'Date inconnue';
    return new Date(t).toLocaleDateString('fr-FR', {year:'numeric',month:'long',day:'numeric'});
  };

  const getCategory = (title, feedTitle) => {
    const t = (title||'').toLowerCase(), f = (feedTitle||'').toLowerCase();
    if (f.includes('cert')||t.includes('vuln')||t.includes('cve')||t.includes('ssi')) return 'Sécurité';
    if (t.includes('microsoft')||t.includes('windows')||t.includes('patch'))           return 'Microsoft';
    if (t.includes('linux')||t.includes('ubuntu')||t.includes('debian'))               return 'Linux';
    if (t.includes('ransom')||t.includes('malware')||t.includes('phishing'))            return 'Menaces';
    if (t.includes('cloud')||t.includes('aws')||t.includes('azure'))                   return 'Cloud';
    if (t.includes(' ai ')||t.includes('artificial')||t.includes('llm'))               return 'IA';
    return 'Général';
  };

  const esc = (s) => (s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const highlight = (text, term) => {
    const safe = escapeHTML(text);
    if (!term) return safe;
    return safe.replace(new RegExp(esc(term),'gi'), m => `<mark>${m}</mark>`);
  };

  /* ── Fetch RSS via allorigins.win ── */
  const fetchRSS = async (feedUrl, ms = 15000) => {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.contents || '';
    } finally { clearTimeout(timer); }
  };

  const parseRSS = (xmlStr, feedUrl) => {
    const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
    const feedTitle =
      doc.querySelector('channel > title')?.textContent ||
      doc.querySelector('feed > title')?.textContent ||
      new URL(feedUrl).hostname;

    return [...doc.querySelectorAll('item, entry')].map(el => {
      const title   = el.querySelector('title')?.textContent || 'Sans titre';
      const link    = el.querySelector('link')?.textContent ||
                      el.querySelector('link')?.getAttribute('href') || '#';
      const pubDate = el.querySelector('pubDate,published,updated')?.textContent || '';
      const desc    = toText(
        el.querySelector('description,content,summary')?.textContent || ''
      ).slice(0, 220);

      return { title, link, pubDate,
        description: desc, feedTitle,
        category: getCategory(title, feedTitle),
        _dateValue: safeDate(pubDate)
      };
    });
  };

  /* ── Rendu ── */
  const renderItems = (items, term = '') => {
    if (!items.length) {
      feedContainer.innerHTML = `<li class="timeline-item">
        <h4 class="h4 timeline-item-title">Aucun résultat</h4>
        <p class="timeline-text">Aucun article ne correspond à votre recherche.</p></li>`;
      return;
    }
    feedContainer.innerHTML = items.slice(0,30).map(item => `
      <li class="timeline-item">
        <h4 class="h4 timeline-item-title">
          <a href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">${highlight(item.title,term)}</a>
        </h4>
        <span>${escapeHTML(formatDate(item.pubDate))} — <em>${highlight(item.feedTitle,term)}</em> — <strong>${highlight(item.category,term)}</strong></span>
        <p class="timeline-text">${highlight(item.description,term)||'—'}</p>
      </li>`).join('');
  };

  /* ── Recherche ── */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.trim().toLowerCase();
      const filtered = term
        ? allFetchedItems.filter(i => [i.title,i.description,i.feedTitle,i.category].join(' ').toLowerCase().includes(term))
        : allFetchedItems;
      renderItems(filtered, e.target.value.trim());
    });
  }

  /* ── Init ── */
  feedContainer.innerHTML = `<li class="timeline-item">
    <h4 class="h4 timeline-item-title">Chargement en cours…</h4>
    <p class="timeline-text">Récupération des derniers articles.</p></li>`;

  Promise.allSettled(rssFeeds.map(url => fetchRSS(url).then(xml => parseRSS(xml, url))))
    .then(results => {
      let items = [];
      results.forEach(r => { if (r.status==='fulfilled') items = items.concat(r.value); });
      items.sort((a,b) => b._dateValue - a._dateValue);
      allFetchedItems = items;

      if (!items.length) {
        feedContainer.innerHTML = `<li class="timeline-item">
          <h4 class="h4 timeline-item-title">Flux temporairement indisponibles</h4>
          <p class="timeline-text">Réessaie dans quelques instants.</p></li>`;
        return;
      }
      renderItems(allFetchedItems);
    })
    .catch(() => {
      feedContainer.innerHTML = `<li class="timeline-item">
        <h4 class="h4 timeline-item-title">Erreur</h4>
        <p class="timeline-text">Impossible de charger la veille pour le moment.</p></li>`;
    });
});
