(function () {
  'use strict';

  var STATIC_CATALOG = [
    {
      slug: 'correo-corporativo-startups',
      title: 'Infraestructura de Correo Corporativo para Startups a Coste 0 €',
      href: '/g.html?id=correo-corporativo-startups',
      handle: 'atrumin16',
      authorName: 'Alberto Trujillo Mingorance',
      authorPicture: 'https://lh3.googleusercontent.com/a/ACg8ocLdgZZbUW1KzSg11REPuHungATAR_SeG52Na5yDYfOOXhpkXzs=s96-c',
      category: 'Guía',
      kind: 'guide',
      readTime: '18 min',
      likes: 3,
      up: 3,
      pinned: true,
      fixada: true,
      summary: 'Arquitectura de correo corporativo e identidad para startups sin Google Workspace: enrutamiento en Edge, DKIM 2048-bit y avatares verificados.',
      date: '11 sep 2026',
      updatedAt: 1789222141213,
      static: true,
      translations: {
        es: {
          title: 'Infraestructura de Correo Corporativo para Startups a Coste 0 €',
          summary: 'Arquitectura de correo corporativo e identidad para startups sin Google Workspace: enrutamiento en Edge, DKIM 2048-bit y avatares verificados.'
        },
        ca: {
          title: 'Infraestructura de Correu Corporatiu per a Startups a Cost 0 €',
          summary: 'Arquitectura de correu corporatiu i identitat per a startups sense Google Workspace: enrutament a l\'Edge, DKIM 2048-bit i avatars verificats.'
        },
        en: {
          title: 'Zero-Cost Corporate Email Infrastructure for Startups',
          summary: 'Corporate email and identity architecture for startups without Google Workspace: Edge routing, 2048-bit DKIM, and verified avatars.'
        },
        fr: {
          title: 'Infrastructure de Messagerie d\'Entreprise à Coût 0 € pour Startups',
          summary: 'Architecture de messagerie d\'entreprise et identité pour startups sans Google Workspace : routage en périphérie (Edge), DKIM 2048 bits et avatars vérifiés.'
        }
      }
    },
    {
      slug: 'informe-msft',
      title: 'Informe de análisis técnico, estratégico y financiero ($MSFT)',
      href: '/g.html?id=informe-msft',
      handle: 'atrumin16',
      authorName: 'Alberto Trujillo Mingorance',
      authorPicture: 'https://lh3.googleusercontent.com/a/ACg8ocLdgZZbUW1KzSg11REPuHungATAR_SeG52Na5yDYfOOXhpkXzs=s96-c',
      category: 'Análisis',
      kind: 'analysis',
      readTime: '14 min',
      likes: 2,
      up: 2,
      pinned: false,
      fixada: false,
      summary: 'Análisis exhaustivo de Microsoft: Azure, Office 365, integración Copilot/OpenAI, valoración DCF y escenarios de crecimiento.',
      date: '10 sep 2026',
      updatedAt: 1789173489276,
      static: false,
      translations: {
        es: {
          title: 'Informe de análisis técnico, estratégico y financiero ($MSFT)',
          summary: 'Análisis exhaustivo de Microsoft: Azure, Office 365, integración Copilot/OpenAI, valoración DCF y escenarios de crecimiento.'
        },
        ca: {
          title: 'Informe d\'anàlisi tècnica, estratègica i financera ($MSFT)',
          summary: 'Anàlisi exhaustiva de Microsoft: Azure, Office 365, integració Copilot/OpenAI, valoració DCF i escenaris de creixement.'
        },
        en: {
          title: 'Technical, Strategic and Financial Analysis Report ($MSFT)',
          summary: 'Comprehensive analysis of Microsoft: Azure, Office 365, Copilot/OpenAI integration, DCF valuation, and growth scenarios.'
        },
        fr: {
          title: 'Rapport d\'analyse technique, stratégique et financière ($MSFT)',
          summary: 'Analyse approfondie de Microsoft : Azure, Office 365, intégration Copilot/OpenAI, valorisation DCF et scénarios de croissance.'
        }
      }
    },
    {
      slug: 'desglose-cartera-berkshire-brk',
      title: 'Desglose de Cartera y Simulador de Berkshire Hathaway ($BRK.B)',
      href: '/g.html?id=desglose-cartera-berkshire-brk',
      handle: 'atrumin16',
      authorName: 'Alberto Trujillo Mingorance',
      authorPicture: 'https://lh3.googleusercontent.com/a/ACg8ocLdgZZbUW1KzSg11REPuHungATAR_SeG52Na5yDYfOOXhpkXzs=s96-c',
      category: 'Guía',
      kind: 'guide',
      readTime: '12 min',
      likes: 1,
      up: 1,
      pinned: false,
      fixada: false,
      summary: 'Calculadora interactiva del balance: negocios privados, T-Bills y cartera cotizada según capital o acciones.',
      date: '11 sep 2026',
      updatedAt: 1789241840820,
      static: false,
      translations: {
        es: {
          title: 'Desglose de Cartera y Simulador de Berkshire Hathaway ($BRK.B)',
          summary: 'Calculadora interactiva del balance: negocios privados, T-Bills y cartera cotizada según capital o acciones.'
        },
        ca: {
          title: 'Desglossament de Cartera i Simulador de Berkshire Hathaway ($BRK.B)',
          summary: 'Calculadora interactiva del balanç: negocis privats, T-Bills i cartera cotitzada segons capital o accions.'
        },
        en: {
          title: 'Portfolio Breakdown and Berkshire Hathaway Simulator ($BRK.B)',
          summary: 'Interactive balance sheet calculator: private operating businesses, Treasury Bills, and public equities portfolio.'
        },
        fr: {
          title: 'Ventilation du portefeuille et simulateur de Berkshire Hathaway ($BRK.B)',
          summary: 'Calculateur interactif de bilan : entreprises privées, bons du Trésor et portefeuille coté.'
        }
      }
    },
    {
      slug: 'it-glossary',
      title: 'Glosario Interactivo de Sistemas e Informática',
      href: '/g.html?id=it-glossary',
      handle: 'atrumin16',
      authorName: 'Alberto Trujillo Mingorance',
      authorPicture: 'https://lh3.googleusercontent.com/a/ACg8ocLdgZZbUW1KzSg11REPuHungATAR_SeG52Na5yDYfOOXhpkXzs=s96-c',
      category: 'Guía',
      kind: 'guide',
      readTime: '10 min',
      likes: 0,
      up: 0,
      pinned: false,
      fixada: false,
      summary: 'Terminología clave de redes, Cloud, DevOps, protocolos de seguridad y arquitectura de sistemas distribuidos.',
      date: '09 sep 2026',
      updatedAt: 1788800000000,
      static: true,
      translations: {
        es: {
          title: 'Glosario Interactivo de Sistemas e Informática',
          summary: 'Terminología clave de redes, Cloud, DevOps, protocolos de seguridad y arquitectura de sistemas distribuidos.'
        },
        ca: {
          title: 'Glossari Interactiu de Sistemes i Informàtica',
          summary: 'Terminologia clau de xarxes, Cloud, DevOps, protocols de seguretat i arquitectura de sistemes distribuïts.'
        },
        en: {
          title: 'Interactive Systems and IT Glossary',
          summary: 'Key terminology for networks, Cloud, DevOps, security protocols, and distributed systems architecture.'
        },
        fr: {
          title: 'Glossaire interactif des systèmes et de l\'informatique',
          "summary": 'Terminologie essentielle des réseaux, du Cloud, du DevOps, des protocoles de sécurité et de l\'architecture distribuée.'
        }
      }
    }
  ];

  var allGuides = STATIC_CATALOG.slice();
  var featuredGuides = STATIC_CATALOG.filter(function (g) { return g.pinned || g.fixada; });

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Universal Ticker Parser regex: catches ($TICKER), $TICKER, ($BRK.B), $8058, $8001, $8031, $8053, etc.
  function formatTitleTickers(text) {
    if (!text) return '';
    const tickerRegex = /\(?\$([A-Z0-9]+(?:\.[A-Z0-9]+)?)\)?/g;
    return text.replace(tickerRegex, (match, ticker) => {
      return `<span class="ticker-badge">$${ticker}</span>`;
    });
  }
  window.formatTitleTickers = formatTitleTickers;
  window.formatTickerTitle = formatTitleTickers;

  function hrefOf(g) {
    var slug = g.slug || g.id || '';
    return '/g.html?id=' + encodeURIComponent(slug);
  }

  function t(key) {
    return typeof window.atmT === 'function' ? window.atmT(key) : key;
  }

  function isPinnedGuide(g) {
    return !!(g && (g.pinned || g.fixada || (g.extras && (g.extras.pinned || g.extras.fixada))));
  }

  function getKindLabel(g) {
    var raw = String(g.kind || g.category || 'guide').toLowerCase();
    if (raw === 'runbook') return 'Runbook';
    if (raw === 'analysis' || raw === 'análisis') return 'Análisis';
    if (raw === 'post') return 'Post';
    if (raw === 'opinion' || raw === 'opinión') return 'Opinión';
    if (raw === 'brief') return 'Brief';
    if (raw === 'note' || raw === 'nota') return 'Nota';
    if (raw === 'research') return 'Research';
    if (raw === 'changelog') return 'Changelog';
    return 'Guía';
  }

  function getReadTime(g) {
    if (g.readTime) return g.readTime;
    if (g.readingTime) return g.readingTime;
    var raw = String(g.slug || '').toLowerCase();
    if (raw.indexOf('email') !== -1) return '18 min';
    if (raw.indexOf('glossary') !== -1) return '12 min';
    if (raw.indexOf('sentinel') !== -1) return '15 min';
    if (raw.indexOf('edge') !== -1 || raw.indexOf('ai') !== -1) return '14 min';
    if (raw.indexOf('dns') !== -1) return '11 min';
    if (raw.indexOf('crypto') !== -1) return '10 min';
    return '5 min';
  }

  function syncScopeFromUrl() {
    var sel = document.getElementById('filter-scope');
    if (!sel) return 'totes';
    var urlParams = new URLSearchParams(window.location.search);
    var viewParam = (urlParams.get('filtre') || urlParams.get('view') || urlParams.get('scope') || 'totes').toLowerCase();
    if (viewParam === 'destacades' || viewParam === 'featured') {
      sel.value = 'destacades';
      return 'destacades';
    }
    // Default to 'totes' (show all guides immediately)
    sel.value = 'totes';
    return 'totes';
  }

  function updateUrlViewParam(scopeValue) {
    try {
      var params = new URLSearchParams(window.location.search);
      if (scopeValue === 'destacades') {
        params.set('view', 'destacades');
      } else {
        // 'totes' is default, keep url clean or preserve view=totes
        params.set('view', 'totes');
      }
      var qs = params.toString();
      var newUrl = window.location.pathname + (qs ? '?' + qs : '');
      window.history.replaceState({}, '', newUrl);
    } catch (e) {}
  }

  function filters() {
    var scopeEl = document.getElementById('filter-scope');
    var currentScope = scopeEl ? scopeEl.value.toLowerCase() : 'totes';
    if (currentScope === 'all') currentScope = 'totes';
    if (currentScope === 'featured') currentScope = 'destacades';

    return {
      q: ((document.getElementById('guide-search') || {}).value || '').trim().toLowerCase(),
      kind: ((document.getElementById('filter-kind') || {}).value || '').toLowerCase(),
      author: ((document.getElementById('filter-author') || {}).value || '').toLowerCase(),
      sort: ((document.getElementById('filter-sort') || {}).value || 'likes'),
      pinned: !!(document.getElementById('filter-pinned') && document.getElementById('filter-pinned').checked),
      saved: !!(document.getElementById('filter-saved') && document.getElementById('filter-saved').checked),
      following: !!(document.getElementById('filter-following') && document.getElementById('filter-following').checked),
      scope: currentScope
    };
  }

  function card(g) {
    var a = document.createElement('a');
    var pinned = isPinnedGuide(g);
    a.className = 'guide-card' + (pinned ? ' is-pinned' : '');
    a.href = hrefOf(g);

    var avatarEl;
    var pic = g.authorPicture || '';
    if (pic && pic !== '/avatar.png' && !pic.endsWith('avatar.png') && /^https?:\/\//i.test(pic)) {
      avatarEl = document.createElement('img');
      avatarEl.className = 'guide-card-avatar';
      avatarEl.src = pic;
      avatarEl.alt = g.authorName || 'AT';
      avatarEl.width = 40;
      avatarEl.height = 40;
      avatarEl.onerror = function () {
        var span = document.createElement('span');
        span.className = 'guide-card-avatar guide-card-avatar-initials';
        span.textContent = 'AT';
        if (avatarEl.parentNode) avatarEl.parentNode.replaceChild(span, avatarEl);
      };
    } else {
      avatarEl = document.createElement('span');
      avatarEl.className = 'guide-card-avatar guide-card-avatar-initials';
      avatarEl.textContent = 'AT';
    }

    var body = document.createElement('div');
    body.className = 'guide-card-body';

    // Title with universal ticker parser and multilingual support
    var lang = (typeof window.atmLang === 'function' ? window.atmLang() : 'es');
    var itemTitle = (g.translations && g.translations[lang] && g.translations[lang].title) || g.title || g.slug;
    var h3 = document.createElement('h3');
    h3.className = 'guide-card-title';
    h3.innerHTML = formatTitleTickers(itemTitle);
    body.appendChild(h3);

    // Standardized bottom metadata row:
    // [Badge Tipo: Guia/Runbook] · [Autor: @atrumin16] · [Tiempo de lectura] · [↑ Votos]
    var meta = document.createElement('div');
    meta.className = 'guide-card-meta';
    meta.setAttribute('data-notranslate', '');

    var kindLabel = getKindLabel(g);
    var handle = g.handle ? '@' + String(g.handle).replace(/^@/, '') : '@atrumin16';
    var readTime = getReadTime(g);
    var votes = g.up || g.likes || 0;

    var metaHtml = '<span class="meta-badge-kind">' + esc(kindLabel) + '</span>';
    if (pinned) {
      metaHtml += '<span class="meta-badge-pinned">📌 Fixada</span>';
    }
    metaHtml += '<span class="meta-author">Autor: ' + esc(handle) + '</span>' +
      '<span class="meta-sep">·</span>' +
      '<span class="meta-read-time">' + esc(readTime) + '</span>' +
      '<span class="meta-sep">·</span>' +
      '<span class="meta-votes">↑ ' + esc(votes) + '</span>';

    meta.innerHTML = metaHtml;
    body.appendChild(meta);

    a.appendChild(avatarEl);
    a.appendChild(body);
    return a;
  }

  function listFrom(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.guides || data.items || data.featured || [];
  }

  function applyFilters() {
    var f = filters();
    var isDestacades = f.scope === 'destacades';

    // If 'destacades', filter only pinned/featured guides.
    // If 'totes' (default), show all guides!
    var pool = isDestacades ? (featuredGuides.length ? featuredGuides : allGuides.filter(isPinnedGuide)) : allGuides;
    if (!pool.length) pool = allGuides;

    var shown = pool.filter(function (g) {
      if (!g || !(g.slug || g.title)) return false;
      if (f.pinned && !isPinnedGuide(g)) return false;
      if (f.saved) {
        var saved = [];
        try { saved = JSON.parse(localStorage.getItem('atm_saved') || '[]'); } catch (e) {}
        if (saved.indexOf(g.slug) === -1) return false;
      }
      if (f.following) {
        var fol = window.__taFollowing || [];
        if (fol.indexOf(String(g.handle || '').toLowerCase()) === -1) return false;
      }
      if (f.kind) {
        var cat = String(g.kind || g.category || 'guide').toLowerCase();
        if (f.kind === 'guide') {
          if (cat !== 'guide' && cat !== 'guides' && cat !== 'guía') return false;
        } else if (cat !== f.kind) return false;
      }
      if (f.author && String(g.handle || '').toLowerCase() !== f.author) return false;
      if (!f.q) return true;
      return String(g.title || '').toLowerCase().indexOf(f.q) !== -1 ||
        String(g.handle || '').toLowerCase().indexOf(f.q) !== -1 ||
        String(g.authorName || '').toLowerCase().indexOf(f.q) !== -1;
    });

    // In 'totes' view, pinned guides (fixada: true) always float to the top
    shown.sort(function (a, b) {
      if (!isDestacades) {
        var aPin = isPinnedGuide(a) ? 1 : 0;
        var bPin = isPinnedGuide(b) ? 1 : 0;
        if (aPin !== bPin) return bPin - aPin;
      }

      if (f.sort === 'title') {
        return String(a.title || '').localeCompare(String(b.title || ''));
      }
      if (f.sort === 'recent') {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      }
      // Default: 'likes'
      var aVotes = a.up || a.likes || 0;
      var bVotes = b.up || b.likes || 0;
      if (bVotes !== aVotes) return bVotes - aVotes;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    return shown;
  }

  function fillAuthors() {
    var sel = document.getElementById('filter-author');
    if (!sel) return;
    var current = sel.value;
    var seen = Object.create(null);
    sel.innerHTML = '<option value="">' + t('filterAuthor') + '</option>';
    allGuides.forEach(function (g) {
      var h = String(g.handle || '').replace(/^@/, '');
      if (!h || seen[h]) return;
      seen[h] = 1;
      var opt = document.createElement('option');
      opt.value = h.toLowerCase();
      opt.textContent = '@' + h;
      sel.appendChild(opt);
    });
    if (current) sel.value = current;
  }

  function render() {
    var mount = document.getElementById('guides-feed') || document.getElementById('community-feed');
    var label = document.getElementById('home-label');
    if (!mount) return;
    mount.innerHTML = '';
    var f = filters();
    var shown = applyFilters();

    if (label) {
      var key = f.q ? 'results' : (f.scope === 'destacades' ? 'featured' : 'all');
      label.setAttribute('data-i18n', key);
      label.textContent = f.scope === 'destacades' ? t('featured') : (f.q ? t('results') : 'Todas las guías');
    }

    if (!shown.length) {
      var empty = document.createElement('p');
      empty.className = 'lede';
      empty.setAttribute('data-i18n', f.q ? 'empty' : 'emptyHome');
      empty.textContent = t(f.q ? 'empty' : 'emptyHome');
      mount.appendChild(empty);
      return;
    }

    shown.forEach(function (g) {
      mount.appendChild(card(g));
    });
    document.dispatchEvent(new CustomEvent('atm:content'));
  }

  function paintComposer() {
    var bar = document.querySelector('.home-filters');
    if (!bar || document.getElementById('new-guide-btn')) return;
    var btn = document.createElement('a');
    btn.id = 'new-guide-btn';
    btn.className = 'new-guide-btn';
    btn.href = '/write';
    btn.setAttribute('data-i18n', 'newGuide');
    btn.textContent = t('newGuide');
    bar.appendChild(btn);
  }

  function bindFilters() {
    ['guide-search', 'filter-author', 'filter-kind', 'filter-sort', 'filter-pinned', 'filter-saved', 'filter-following', 'filter-scope'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.getAttribute('data-bound')) return;
      el.setAttribute('data-bound', '1');
      el.addEventListener(el.type === 'search' || (el.tagName === 'INPUT' && el.type !== 'checkbox') ? 'input' : 'change', function () {
        if (id === 'filter-scope') {
          updateUrlViewParam(el.value);
        }
        render();
      });
    });
  }

  function mergeLocalGuides(baseList) {
    try {
      var localList = JSON.parse(localStorage.getItem('atm_guides_data') || localStorage.getItem('atm_custom_guides') || '[]');
      if (Array.isArray(localList) && localList.length) {
        var merged = baseList.slice();
        var CANONICAL = ['correo-corporativo-startups', 'informe-msft', 'desglose-cartera-berkshire-brk', 'it-glossary'];
        localList.forEach(function (lg) {
          var targetSlug = String(lg.slug || lg.id || '').toLowerCase().trim();
          if (CANONICAL.indexOf(targetSlug) !== -1) return;
          var existingIdx = merged.findIndex(function (g) { return String(g.slug || '').toLowerCase() === targetSlug; });
          if (existingIdx >= 0) {
            merged[existingIdx] = Object.assign({}, merged[existingIdx], lg);
          } else {
            merged.unshift(lg);
          }
        });
        return merged;
      }
    } catch (e) {}
    return baseList;
  }

  function load() {
    var mount = document.getElementById('guides-feed') || document.getElementById('community-feed');
    if (!mount) return;

    // 1. Initialize view filter from URL (defaults to 'totes')
    syncScopeFromUrl();
    bindFilters();
    paintComposer();
    fillAuthors();

    // 2. Render immediately from in-memory catalog + local storage
    allGuides = mergeLocalGuides(STATIC_CATALOG);
    featuredGuides = allGuides.filter(isPinnedGuide);
    render();

    // 3. Static CDN refresh from /data/guides.json (0 worker requests)
    fetch('/data/guides.json', { cache: 'default' })
      .then(function (r) {
        if (!r.ok) return fetch('/community-index.json').then(function (res) { return res.json(); });
        return r.json();
      })
      .then(function (data) {
        var items = listFrom(data);
        if (items && items.length) {
          allGuides = mergeLocalGuides(items);
          featuredGuides = allGuides.filter(isPinnedGuide);
          fillAuthors();
          render();
          document.dispatchEvent(new CustomEvent('atm:feedLoaded', { detail: data }));
        }
      })
      .catch(function () {
        // In-memory catalog is already rendered; zero degradation
      });
  }

  document.addEventListener('atm:lang', function () {
    if (!document.getElementById('guides-feed')) return;
    fillAuthors();
    render();
  });

  document.addEventListener('atm:me', function () {
    paintComposer();
    render();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
