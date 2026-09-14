(function () {
  'use strict';

  var STATIC_CATALOG = [
    {
      slug: 'correo-corporativo-startups',
      title: 'Infraestructura de Correo Corporativo para Startups a Coste 0 €',
      href: '/g/correo-corporativo-startups',
      handle: 'atrumin16',
      authorName: 'Alberto Trujillo Mingorance',
      authorPicture: '/avatar.png',
      category: 'Guía',
      kind: 'guide',
      readTime: '18 min',
      wordCount: 2450,
      likes: 3,
      up: 3,
      pinned: true,
      summary: 'Arquitectura de correo corporativo e identidad para startups sin Google Workspace: enrutamiento en Edge, DKIM 2048-bit y avatares verificados.',
      tags: ['Cloudflare Edge', 'DKIM', 'DNS', 'Zero-Trust'],
      date: '11 sep 2026'
    },
    {
      slug: 'informe-msft',
      title: 'Informe de análisis técnico, estratégico y financiero ($MSFT)',
      href: '/g/informe-msft',
      handle: 'atrumin16',
      authorName: 'Alberto Trujillo Mingorance',
      authorPicture: '/avatar.png',
      category: 'Análisis',
      kind: 'analysis',
      readTime: '14 min',
      wordCount: 1980,
      likes: 2,
      up: 2,
      pinned: false,
      summary: 'Análisis exhaustivo de Microsoft: Azure, Office 365, integración Copilot/OpenAI, valoración DCF y escenarios de crecimiento.',
      tags: ['Financial DCF', 'Azure', 'Copilot', 'Valuation'],
      date: '10 sep 2026'
    },
    {
      slug: 'desglose-cartera-berkshire-brk',
      title: 'Desglose de Cartera y Simulador de Berkshire Hathaway ($BRK.B)',
      href: '/g/desglose-cartera-berkshire-brk',
      handle: 'atrumin16',
      authorName: 'Alberto Trujillo Mingorance',
      authorPicture: '/avatar.png',
      category: 'Simulador',
      kind: 'interactive',
      readTime: '12 min',
      wordCount: 1650,
      likes: 1,
      up: 1,
      pinned: false,
      summary: 'Calculadora interactiva del balance: negocios privados, T-Bills y cartera cotizada según capital o acciones.',
      tags: ['Interactive Engine', 'Berkshire', 'Quant Model'],
      date: '11 sep 2026'
    },
    {
      slug: 'it-glossary',
      title: 'Glosario Interactivo de Sistemas e Informática',
      href: '/g/it-glossary',
      handle: 'atrumin16',
      authorName: 'Alberto Trujillo Mingorance',
      authorPicture: '/avatar.png',
      category: 'Referencia',
      kind: 'reference',
      readTime: '10 min',
      wordCount: 1420,
      likes: 0,
      up: 0,
      pinned: false,
      summary: 'Terminología clave de redes, Cloud, DevOps, protocolos de seguridad y arquitectura de sistemas distribuidos.',
      tags: ['Networking', 'Linux RFC', 'DevOps Terms'],
      date: '09 sep 2026'
    }
  ];

  var authorPublications = [];
  var activeExperienceMode = 'simple';
  var activeKindFilter = 'all';
  var activeSearchQuery = '';
  var activeSortBy = 'date-desc';
  var activeAchTab = 'all';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatTitleTickers(text) {
    if (!text) return '';
    var tickerRegex = /\(?\$([A-Z0-9]+(?:\.[A-Z0-9]+)?)\)?/g;
    return String(text).replace(tickerRegex, function (match, ticker) {
      return '<span class="ticker-badge">$' + ticker + '</span>';
    });
  }

  function isInvalidHandle(h) {
    if (!h) return true;
    var clean = String(h).trim().toLowerCase().replace(/^@+/, '');
    return (
      !clean ||
      clean === ':splat' ||
      clean === 'splat' ||
      clean === '%3asplat' ||
      clean === 'null' ||
      clean === 'undefined' ||
      clean === 'index' ||
      clean === 'index.html' ||
      clean === '[username]' ||
      clean === ':username' ||
      clean.indexOf(':') !== -1 ||
      clean.indexOf('*') !== -1
    );
  }

  function sanitizeUsername(raw) {
    if (!raw) return '';
    try {
      raw = decodeURIComponent(raw);
    } catch (e) {}
    var s = String(raw)
      .replace(/^@+/, '')
      .replace(/\/+$/, '')
      .trim()
      .toLowerCase();
    if (isInvalidHandle(s)) return '';
    return s;
  }

  function getTargetHandle() {
    var p = window.location.pathname || '';
    try { p = decodeURIComponent(p); } catch (e) {}
    var m = p.match(/\/u\/(?:@)?([a-z0-9_.:*-]+)/i);
    var candidate = '';
    if (m && m[1]) {
      var parsed = sanitizeUsername(m[1]);
      if (!isInvalidHandle(parsed)) {
        candidate = parsed;
      }
    }
    if (!candidate || isInvalidHandle(candidate)) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('u') || params.get('user') || params.get('author') || params.get('handle');
      if (q) {
        var parsedQ = sanitizeUsername(q);
        if (!isInvalidHandle(parsedQ)) {
          candidate = parsedQ;
        }
      }
    }
    if (!candidate || isInvalidHandle(candidate)) {
      var me = window.__taMe;
      if (me && (me.handle || me.username)) {
        var parsedMe = sanitizeUsername(me.handle || me.username);
        if (!isInvalidHandle(parsedMe)) {
          candidate = parsedMe;
        }
      }
    }
    // Fallback: Read initial values already present in the static DOM
    if (!candidate || isInvalidHandle(candidate)) {
      var domHandle = document.getElementById('author-handle');
      if (domHandle && domHandle.textContent) {
        var parsedDom = sanitizeUsername(domHandle.textContent);
        if (!isInvalidHandle(parsedDom)) {
          candidate = parsedDom;
        }
      }
    }
    // Strict default fallback to @atrumin16
    if (!candidate || isInvalidHandle(candidate)) {
      candidate = 'atrumin16';
    }

    // Check alias redirection map (301-equivalent client router)
    try {
      var aliases = JSON.parse(localStorage.getItem('atm_handle_aliases') || '{}');
      if (aliases[candidate] && aliases[candidate] !== candidate) {
        var activeH = sanitizeUsername(aliases[candidate]);
        if (activeH && !isInvalidHandle(activeH)) {
          window.__atmRedirectedFrom = candidate;
          try {
            history.replaceState(null, '', '/u/@' + encodeURIComponent(activeH));
          } catch (e) {}
          return activeH;
        }
      }
    } catch (e) {}

    // Check previous handles in saved settings
    try {
      var saved = JSON.parse(localStorage.getItem('atm_settings') || '{}');
      if (saved && saved.author && Array.isArray(saved.author.previous_handles)) {
        if (saved.author.previous_handles.indexOf(candidate) !== -1 && saved.author.handle) {
          var canonH = sanitizeUsername(saved.author.handle);
          if (canonH && canonH !== candidate && !isInvalidHandle(canonH)) {
            window.__atmRedirectedFrom = candidate;
            try {
              history.replaceState(null, '', '/u/@' + encodeURIComponent(canonH));
            } catch (e) {}
            return canonH;
          }
        }
      }
    } catch (e) {}

    // Ensure URL bar shows valid clean canonical handle (and never /u/@:splat)
    try {
      if (candidate && !isInvalidHandle(candidate)) {
        var currentPath = window.location.pathname || '';
        if (currentPath.indexOf('/u/@' + candidate) === -1) {
          history.replaceState(null, '', '/u/@' + encodeURIComponent(candidate));
        }
      }
    } catch (e) {}

    return candidate;
  }

  function loadAllGuides() {
    var base = STATIC_CATALOG.slice();
    try {
      var localGuides = JSON.parse(localStorage.getItem('atm_guides_data') || localStorage.getItem('atm_custom_guides') || '[]');
      if (Array.isArray(localGuides) && localGuides.length) {
        var CANONICAL = ['correo-corporativo-startups', 'informe-msft', 'desglose-cartera-berkshire-brk', 'it-glossary'];
        localGuides.forEach(function (lg) {
          var targetSlug = String(lg.slug || lg.id || '').toLowerCase().trim();
          if (CANONICAL.indexOf(targetSlug) !== -1) return;
          var existingIdx = base.findIndex(function (g) { return String(g.slug || '').toLowerCase() === targetSlug; });
          if (existingIdx >= 0) {
            base[existingIdx] = Object.assign({}, base[existingIdx], lg);
          } else {
            base.unshift(lg);
          }
        });
      }
    } catch (e) {}
    return base;
  }

  function getAuthorMeta(handle, guides) {
    var cleanHandle = sanitizeUsername(handle);
    if (!cleanHandle || isInvalidHandle(cleanHandle)) {
      cleanHandle = 'atrumin16';
    }

    // 1. Check custom settings saved by user
    try {
      var savedSettings = JSON.parse(localStorage.getItem('atm_settings') || '{}');
      if (savedSettings && savedSettings.author) {
        var sHandle = sanitizeUsername(savedSettings.author.handle || '');
        if (sHandle === cleanHandle || (!sHandle && cleanHandle === 'atrumin16')) {
          return {
            name: savedSettings.author.name || 'Alberto Trujillo Mingorance',
            handle: '@' + (savedSettings.author.handle || cleanHandle),
            role: savedSettings.author.role || 'Lead Systems Architect',
            bio: savedSettings.author.bio || 'Arquitectura de sistemas distribuidos, infraestructura de correo corporativo a coste cero, análisis cuantitativo y optimización en Cloudflare Edge & Linux Kernel.',
            picture: savedSettings.author.avatar || '/avatar.png',
            avatarPreset: savedSettings.author.avatarPreset || 'cyber-core',
            avatarType: savedSettings.author.avatarType || 'vector',
            previous_handles: savedSettings.author.previous_handles || [],
            tags: ['Cloudflare Edge', 'Zero-Trust Mail', 'Financial DCF & SOTP', 'Linux Systems', 'TypeScript']
          };
        }
      }
    } catch (e) {}

    // 2. Check logged-in user in window.__taMe
    var me = window.__taMe;
    if (me) {
      var meHandle = sanitizeUsername(me.handle || me.username || '');
      if (meHandle === cleanHandle) {
        return {
          name: me.name || me.username || 'Alberto Trujillo Mingorance',
          handle: '@' + (me.handle ? sanitizeUsername(me.handle) : cleanHandle),
          role: me.role === 'admin' ? 'Lead Systems Architect' : 'Staff Engineer',
          bio: me.bio || 'Arquitectura de sistemas distribuidos, infraestructura de correo corporativo a coste cero, análisis cuantitativo y optimización en Cloudflare Edge & Linux Kernel.',
          picture: me.picture || '/avatar.png',
          avatarPreset: 'cyber-core',
          avatarType: 'vector',
          previous_handles: [],
          tags: ['Cloudflare Edge', 'Zero-Trust Mail', 'Distributed Systems', 'Linux Systems']
        };
      }
    }

    // 3. Default preset for primary platform author (@atrumin16)
    if (cleanHandle === 'atrumin16' || cleanHandle === 'alberto') {
      return {
        name: 'Alberto Trujillo Mingorance',
        handle: '@atrumin16',
        role: 'Lead Systems Architect',
        bio: 'Especialista en arquitectura cloud sin servidor, enrutamiento en Edge, seguridad criptográfica y modelos financieros cuantitativos. Creador de Trujillo AI y ATM Docs.',
        picture: '/avatar.png',
        avatarPreset: 'cyber-core',
        avatarType: 'vector',
        previous_handles: [],
        tags: ['Cloudflare Edge', 'Zero-Trust Mail', 'Financial DCF & SOTP', 'Linux Systems', 'TypeScript / Vanilla JS']
      };
    }

    // 4. Fallback from published guides
    var first = guides && guides[0];
    var displayN = (first && first.authorName) || cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);
    var pic = (first && first.authorPicture) || '/avatar.png';
    return {
      name: displayN,
      handle: '@' + cleanHandle,
      role: 'Community Engineer & Author',
      bio: 'Autor y colaborador en la plataforma técnica ATM Guides.',
      picture: pic,
      avatarPreset: 'initials',
      avatarType: 'vector',
      previous_handles: [],
      tags: ['Engineering', 'Architecture', 'Open Source']
    };
  }

  function renderProfileHeader(meta, totalCount, totalUpvotes, totalMinutes) {
    var nameEl = document.getElementById('author-name');
    var handleEl = document.getElementById('author-handle');
    var roleEl = document.getElementById('author-role');
    var bioEl = document.getElementById('author-bio');
    var avatarWrap = document.getElementById('avatar-wrap');
    var tagsEl = document.getElementById('author-tags');
    var statCount = document.getElementById('stat-count');
    var statUpvotes = document.getElementById('stat-upvotes');
    var statReadtime = document.getElementById('stat-readtime');
    var redirectBox = document.getElementById('profile-redirect-notice');
    var prevHandlesBox = document.getElementById('author-previous-handles');

    if (nameEl) nameEl.textContent = meta.name;
    if (handleEl) handleEl.textContent = meta.handle;
    if (roleEl) roleEl.textContent = meta.role;
    if (bioEl) bioEl.textContent = meta.bio;
    document.title = meta.name + ' (' + meta.handle + ') · Perfil | ATM Docs';

    // 301 Redirection Notice Banner
    if (redirectBox) {
      if (window.__atmRedirectedFrom) {
        redirectBox.style.display = 'flex';
        redirectBox.innerHTML = '<div class="redirect-notice-inner">' +
          '<span class="redirect-icon">ℹ️</span>' +
          '<span>Redirigido automáticamente desde el alias anterior <strong>@' + esc(window.__atmRedirectedFrom) + '</strong>. El identificador permanente activo es <strong>' + esc(meta.handle) + '</strong>.</span>' +
          '</div>';
      } else {
        redirectBox.style.display = 'none';
      }
    }

    // Historical Aliases Chip
    if (prevHandlesBox) {
      if (meta.previous_handles && meta.previous_handles.length > 0) {
        prevHandlesBox.style.display = 'inline-flex';
        prevHandlesBox.innerHTML = '<span class="prev-handles-badge" title="Identificadores anteriores de este autor">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>' +
          '<span>Anteriormente: ' + meta.previous_handles.map(function (h) { return '@' + esc(h); }).join(', ') + '</span>' +
          '</span>';
      } else {
        prevHandlesBox.style.display = 'none';
      }
    }

    // Vector SVG Avatar (0 € compute / CDN cost)
    if (avatarWrap) {
      if (window.ATM_AVATARS) {
        window.ATM_AVATARS.renderAvatar(avatarWrap, {
          preset: meta.avatarPreset || 'cyber-core',
          customUrl: meta.picture,
          name: meta.name,
          handle: meta.handle,
          size: 88
        });
        avatarWrap.insertAdjacentHTML('beforeend', '<span class="profile-status-dot" title="Autor verificado y activo"></span>');
      } else {
        avatarWrap.innerHTML = '<span class="profile-large-initials">' + esc(meta.name.slice(0, 2).toUpperCase()) + '</span><span class="profile-status-dot"></span>';
      }
    }

    if (tagsEl && meta.tags && meta.tags.length) {
      tagsEl.innerHTML = meta.tags.map(function (tag) {
        return '<span class="profile-tech-tag">' + esc(tag) + '</span>';
      }).join('');
    }

    if (statCount) statCount.textContent = totalCount;
    if (statUpvotes) statUpvotes.textContent = totalUpvotes;
    if (statReadtime) statReadtime.textContent = '~' + totalMinutes + ' min';

    // Show settings link if the viewer is this author
    var me = window.__taMe;
    var settingsLink = document.getElementById('btn-settings-link');
    if (settingsLink) {
      var isOwnProfile = me && sanitizeUsername(me.handle || me.username || '') === sanitizeUsername(meta.handle);
      if (isOwnProfile || sanitizeUsername(meta.handle) === 'atrumin16') {
        settingsLink.style.display = 'inline-flex';
      } else {
        settingsLink.style.display = 'none';
      }
    }
  }

  // --- FILTER & SORT ENGINE ---
  function getFilteredAndSortedGuides() {
    var list = authorPublications.slice();

    // 1. Text Search Filter
    if (activeSearchQuery) {
      var q = activeSearchQuery.toLowerCase();
      list = list.filter(function (g) {
        var textMatch = (g.title && g.title.toLowerCase().indexOf(q) !== -1) ||
                        (g.slug && g.slug.toLowerCase().indexOf(q) !== -1) ||
                        (g.summary && g.summary.toLowerCase().indexOf(q) !== -1);
        var tagMatch = Array.isArray(g.tags) && g.tags.some(function (t) { return String(t).toLowerCase().indexOf(q) !== -1; });
        return textMatch || tagMatch;
      });
    }

    // 2. Kind / Type Filter
    if (activeKindFilter && activeKindFilter !== 'all') {
      if (activeKindFilter === 'guide') {
        list = list.filter(function (g) {
          var k = String(g.kind || g.category || '').toLowerCase();
          return k === 'guide' || k === 'guía' || k === 'runbook';
        });
      } else if (activeKindFilter === 'analysis') {
        list = list.filter(function (g) {
          var k = String(g.kind || g.category || '').toLowerCase();
          return k === 'analysis' || k === 'análisis';
        });
      } else if (activeKindFilter === 'reference') {
        list = list.filter(function (g) {
          var k = String(g.kind || g.category || '').toLowerCase();
          return k === 'reference' || k === 'referencia' || k === 'glossary';
        });
      } else if (activeKindFilter === 'interactive') {
        list = list.filter(function (g) {
          var k = String(g.kind || g.category || '').toLowerCase();
          var s = String(g.slug || '').toLowerCase();
          return k === 'interactive' || k === 'simulador' || s.indexOf('berkshire') !== -1 || s.indexOf('simulador') !== -1;
        });
      }
    }

    // 3. Sorting
    if (activeSortBy === 'votes-desc') {
      list.sort(function (a, b) { return (Number(b.up || b.likes) || 0) - (Number(a.up || a.likes) || 0); });
    } else if (activeSortBy === 'read-desc') {
      list.sort(function (a, b) {
        var mA = parseInt(a.readTime || a.readingTime || '10', 10) || 10;
        var mB = parseInt(b.readTime || b.readingTime || '10', 10) || 10;
        return mB - mA;
      });
    } else if (activeSortBy === 'read-asc') {
      list.sort(function (a, b) {
        var mA = parseInt(a.readTime || a.readingTime || '10', 10) || 10;
        var mB = parseInt(b.readTime || b.readingTime || '10', 10) || 10;
        return mA - mB;
      });
    }

    return list;
  }

  // --- RENDER VIEWS: SIMPLE CARDS vs ADVANCED MATRIX ---
  function renderPublications() {
    var container = document.getElementById('profile-feed');
    if (!container) return;

    var guides = getFilteredAndSortedGuides();

    if (!guides || !guides.length) {
      container.className = 'profile-cards-grid';
      container.innerHTML = '<div class="profile-empty-state">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#64748b;margin:0 auto 8px auto;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' +
        '<h3>No se encontraron publicaciones</h3>' +
        '<p>Ajusta el filtro de búsqueda o cambia la categoría para ver más piezas.</p>' +
        '</div>';
      return;
    }

    if (activeExperienceMode === 'advanced') {
      // --- MODO AVANZADO: DENSIDAD TÉCNICA & TELEMETRÍA MATRIX ---
      container.className = 'profile-matrix-wrap';
      var rowsHtml = guides.map(function (g) {
        var slug = g.slug || g.id || '';
        var href = '/g/' + encodeURIComponent(slug);
        var category = g.category || (g.kind === 'analysis' ? 'Análisis' : g.kind === 'interactive' ? 'Simulador' : g.kind === 'reference' ? 'Referencia' : 'Guía');
        var catClass = 'cat-pill-' + (g.kind || 'guide');
        var titleHtml = formatTitleTickers(esc(g.title || g.slug));
        var readTime = g.readTime || g.readingTime || '10 min';
        var words = g.wordCount || 1800;
        var upvotes = g.up || g.likes || 0;
        var pinnedBadge = (g.pinned || g.fixada) ? '<span class="matrix-pinned-flag">📌 FIJADA</span>' : '';

        return '<tr class="matrix-row">' +
          '  <td class="matrix-col-kind">' +
          '    <span class="matrix-cat-pill ' + catClass + '">' + esc(category) + '</span>' +
          '  </td>' +
          '  <td class="matrix-col-title">' +
          '    <div class="matrix-title-main">' +
          '      <a href="' + href + '" class="matrix-link">' + titleHtml + '</a>' +
          '      ' + pinnedBadge +
          '    </div>' +
          '    <div class="matrix-slug-meta">/g/' + esc(slug) + '</div>' +
          '  </td>' +
          '  <td class="matrix-col-telemetry">' +
          '    <div class="matrix-telemetry-tags">' +
          '      <span class="telem-tag telem-time" title="Tiempo de lectura estimado">⏱ ' + esc(readTime) + '</span>' +
          '      <span class="telem-tag telem-up" title="Votos técnicos">↑ ' + esc(upvotes) + '</span>' +
          '      <span class="telem-tag telem-words" title="Palabras estimadas">~' + words + ' w</span>' +
          '      <span class="telem-tag telem-cache" title="Estado de la caché en Edge de Cloudflare">L1 HIT (0ms)</span>' +
          '    </div>' +
          '  </td>' +
          '  <td class="matrix-col-action">' +
          '    <a href="' + href + '" class="matrix-action-btn">Inspeccionar →</a>' +
          '  </td>' +
          '</tr>';
      }).join('');

      container.innerHTML =
        '<div class="matrix-strip-header">' +
        '  <span class="matrix-strip-dot"></span>' +
        '  <span>TELEMETRÍA DE PRODUCCIÓN: Edge Cache L1 Activo · Protocolo HTTP/3 · Latencia estimada: &lt;35ms · ' + guides.length + ' Runbooks</span>' +
        '</div>' +
        '<div class="matrix-table-scroll">' +
        '  <table class="matrix-table">' +
        '    <thead>' +
        '      <tr>' +
        '        <th>TIPO</th>' +
        '        <th>TÍTULO &amp; SLUG CANÓNICO</th>' +
        '        <th>TELEMETRÍA &amp; EDGE CACHE</th>' +
        '        <th>ACCIONES</th>' +
        '      </tr>' +
        '    </thead>' +
        '    <tbody>' + rowsHtml + '</tbody>' +
        '  </table>' +
        '</div>';
    } else {
      // --- MODO SIMPLE: TARJETAS EDITORIALES LIMPIAS ---
      container.className = 'profile-cards-grid';
      var cardsHtml = guides.map(function (g) {
        var slug = g.slug || g.id || '';
        var href = '/g/' + encodeURIComponent(slug);
        var category = g.category || (g.kind === 'analysis' ? 'Análisis' : g.kind === 'interactive' ? 'Simulador' : g.kind === 'reference' ? 'Referencia' : 'Guía');
        var catClass = 'category-' + (g.kind || 'guide');
        var titleHtml = formatTitleTickers(esc(g.title || g.slug));
        var summaryText = esc(g.summary || g.description || '');
        var readTime = g.readTime || g.readingTime || '10 min';
        var upvotes = g.up || g.likes || 0;
        var date = g.date || 'Reciente';
        var pinnedFlag = (g.pinned || g.fixada) ? '<span class="card-pinned-flag">📌 Fijada</span>' : '';

        return '<a href="' + href + '" class="profile-card">' +
          '<div class="profile-card-top">' +
          '<span class="card-category-badge ' + catClass + '">' + esc(category) + '</span>' +
          pinnedFlag +
          '</div>' +
          '<h3 class="profile-card-title">' + titleHtml + '</h3>' +
          '<p class="profile-card-desc">' + summaryText + '</p>' +
          '<div class="profile-card-meta">' +
          '<span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ' + esc(readTime) + '</span>' +
          '<span class="meta-upvotes">↑ ' + esc(upvotes) + '</span>' +
          '<span>' + esc(date) + '</span>' +
          '</div>' +
          '</a>';
      }).join('');

      container.innerHTML = cardsHtml;
    }
  }

  function updateExperienceModeUi() {
    var btn = document.getElementById('btn-toggle-exp-mode');
    var label = document.getElementById('mode-label-text');
    var iconWrap = document.getElementById('mode-icon-indicator');
    if (!btn || !label) return;

    if (activeExperienceMode === 'advanced') {
      label.textContent = 'Modo: Avanzado';
      btn.classList.add('is-advanced');
      if (iconWrap) {
        iconWrap.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>';
      }
    } else {
      label.textContent = 'Modo: Simple';
      btn.classList.remove('is-advanced');
      if (iconWrap) {
        iconWrap.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';
      }
    }
  }

  function toggleExperienceMode() {
    activeExperienceMode = (activeExperienceMode === 'simple') ? 'advanced' : 'simple';
    try {
      localStorage.setItem('atm_experience_mode', activeExperienceMode);
    } catch (e) {}

    updateExperienceModeUi();
    renderPublications();

    if (activeExperienceMode === 'advanced' && window.ATM_ACHIEVEMENTS) {
      window.ATM_ACHIEVEMENTS.unlock('matrix-view');
    }
  }

  function bindFilterControls() {
    // 1. Instant Text Search input
    var searchInput = document.getElementById('filter-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        activeSearchQuery = searchInput.value.trim();
        renderPublications();
      });
    }

    // 2. Kind Filter Chips
    var kindChips = document.querySelectorAll('.filter-kind-chips .kind-chip');
    kindChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        kindChips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        activeKindFilter = chip.getAttribute('data-kind') || 'all';
        renderPublications();
      });
    });

    // 3. Sort Dropdown
    var sortSelect = document.getElementById('filter-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        activeSortBy = sortSelect.value;
        renderPublications();
      });
    }

    // 4. Experience Mode Toggle
    var expBtn = document.getElementById('btn-toggle-exp-mode');
    if (expBtn) {
      expBtn.addEventListener('click', toggleExperienceMode);
    }

    // 5. Keyboard shortcut: Alt + V for Experience Mode
    document.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        toggleExperienceMode();
      }
    });
  }

  function bindCopyProfile() {
    var btn = document.getElementById('btn-copy-profile');
    if (!btn || btn.getAttribute('data-bound')) return;
    btn.setAttribute('data-bound', '1');
    btn.addEventListener('click', function () {
      var targetUrl = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(targetUrl).then(function () {
          var txt = document.getElementById('copy-btn-text');
          if (txt) {
            var prev = txt.textContent;
            txt.textContent = '✓ Copiado';
            setTimeout(function () { txt.textContent = prev; }, 1800);
          }
        });
      }
    });
  }

  // --- GAMIFICATION & ACHIEVEMENTS BINDING ---
  function initAchievementsSection() {
    if (!window.ATM_ACHIEVEMENTS) return;

    var progressWrap = document.getElementById('achievement-progress-wrap');
    var gridWrap = document.getElementById('achievements-grid');

    window.ATM_ACHIEVEMENTS.renderProgressWidget(progressWrap);
    window.ATM_ACHIEVEMENTS.renderBadgeGrid(gridWrap, activeAchTab);

    var tabs = document.querySelectorAll('.ach-tab-btn');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        btn.classList.add('is-active');
        activeAchTab = btn.getAttribute('data-ach-tab') || 'all';
        window.ATM_ACHIEVEMENTS.renderBadgeGrid(gridWrap, activeAchTab);
      });
    });

    document.addEventListener('atm:achievement-unlocked', function () {
      window.ATM_ACHIEVEMENTS.renderProgressWidget(progressWrap);
      window.ATM_ACHIEVEMENTS.renderBadgeGrid(gridWrap, activeAchTab);
    });
  }

  function fetchAuthorPublications(handle, guidesList) {
    var cleanH = sanitizeUsername(handle);
    if (!cleanH || isInvalidHandle(cleanH)) {
      cleanH = 'atrumin16';
    }
    var list = Array.isArray(guidesList) && guidesList.length ? guidesList : STATIC_CATALOG.slice();
    if (cleanH === 'atrumin16' || cleanH === 'alberto') {
      var filtered = list.filter(function (g) {
        var gh = sanitizeUsername(g.handle || 'atrumin16');
        return gh === 'atrumin16' || gh === 'alberto' || !g.handle || isInvalidHandle(gh);
      });
      return (filtered && filtered.length) ? filtered : STATIC_CATALOG.slice();
    }
    return list.filter(function (g) {
      return sanitizeUsername(g.handle || '') === cleanH;
    });
  }

  function initProfile() {
    activeExperienceMode = localStorage.getItem('atm_experience_mode') || 'simple';
    var targetHandle = getTargetHandle();
    if (!targetHandle || isInvalidHandle(targetHandle)) {
      targetHandle = 'atrumin16';
    }
    var allGuides = loadAllGuides();

    // Filter guides matching this author:
    authorPublications = fetchAuthorPublications(targetHandle, allGuides);
    if ((targetHandle === 'atrumin16' || targetHandle === 'alberto') && (!authorPublications || authorPublications.length === 0)) {
      authorPublications = STATIC_CATALOG.slice();
    }

    var totalUpvotes = authorPublications.reduce(function (sum, g) { return sum + (Number(g.up || g.likes) || 0); }, 0);
    var totalMinutes = authorPublications.reduce(function (sum, g) {
      var m = parseInt(g.readTime || g.readingTime || '10', 10) || 10;
      return sum + m;
    }, 0);

    var meta = getAuthorMeta(targetHandle, authorPublications);
    renderProfileHeader(meta, authorPublications.length, totalUpvotes, totalMinutes);
    updateExperienceModeUi();
    bindFilterControls();
    bindCopyProfile();
    renderPublications();
    initAchievementsSection();

    // Background stale-while-revalidate fetch from CDN
    fetch('/data/guides.json')
      .then(function (res) { if (res.ok) return res.json(); return null; })
      .then(function (cdnData) {
        if (!cdnData) return;
        var items = cdnData.guides || cdnData.items || (Array.isArray(cdnData) ? cdnData : []);
        if (items && items.length) {
          var updated = fetchAuthorPublications(targetHandle, items);
          if (updated && updated.length) {
            authorPublications = updated;
            renderPublications();
          }
        }
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
  } else {
    initProfile();
  }
})();
