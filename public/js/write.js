(function () {
  'use strict';

  var KINDS = [
    { id: 'guide', label: 'Guía' },
    { id: 'post', label: 'Post' },
    { id: 'opinion', label: 'Opinión' },
    { id: 'analysis', label: 'Análisis' },
    { id: 'brief', label: 'Brief' },
    { id: 'note', label: 'Nota' },
    { id: 'research', label: 'Research' },
    { id: 'changelog', label: 'Changelog' }
  ];

  var REF_TYPES = [
    'Doc Oficial',
    'GitHub',
    'SEC Filing',
    'Paper',
    'Análisis'
  ];

  var attachments = [];
  var userEditedSlug = false;
  var autoSaveTimer = null;

  var EXT_LANG = {
    md: 'markdown', markdown: 'markdown', html: 'html', htm: 'html', txt: 'plaintext',
    json: 'json', csv: 'csv', tsv: 'csv', svg: 'svg', mmd: 'mermaid', mermaid: 'mermaid',
    js: 'javascript', mjs: 'javascript', ts: 'javascript', py: 'python',
    yml: 'yaml', yaml: 'yaml', sql: 'sql', xml: 'xml', css: 'css', toml: 'code',
    go: 'code', rs: 'code', java: 'code'
  };
  var TEXT_EXT = /^(md|markdown|html|htm|txt|json|csv|tsv|svg|xml|ya?ml|js|mjs|ts|py|sql|css|mmd|toml|go|rs|java)$/i;

  // Detección heurística en navegador por stopwords
  var LANGUAGE_PROFILES = {
    ca: { name: 'Català', flag: '🇦🇩', stopwords: ['amb', 'per', 'això', 'aquest', 'aquesta', 'molt', 'dels', 'les', 'quan', 'sobre', 'està', 'també'] },
    es: { name: 'Español', flag: '🇪🇸', stopwords: ['con', 'para', 'este', 'esta', 'estos', 'estas', 'como', 'pero', 'más', 'también', 'cuando', 'entre'] },
    en: { name: 'English', flag: '🇬🇧', stopwords: ['the', 'and', 'with', 'this', 'that', 'from', 'have', 'which', 'about', 'would', 'there', 'their'] },
    fr: { name: 'Français', flag: '🇫🇷', stopwords: ['avec', 'pour', 'dans', 'cette', 'aussi', 'plus', 'comme', 'sont', 'faire', 'leur', 'nous'] },
    de: { name: 'Deutsch', flag: '🇩🇪', stopwords: ['und', 'mit', 'für', 'nicht', 'eine', 'einer', 'dieser', 'dieses', 'auch', 'werden', 'haben'] },
    it: { name: 'Italiano', flag: '🇮🇹', stopwords: ['con', 'per', 'questo', 'questa', 'sono', 'anche', 'come', 'più', 'nella', 'delle', 'tutto'] },
    pt: { name: 'Português', flag: '🇵🇹', stopwords: ['com', 'para', 'este', 'esta', 'como', 'mais', 'também', 'quando', 'sobre', 'entre', 'pelos'] },
    nl: { name: 'Nederlands', flag: '🇳🇱', stopwords: ['van', 'het', 'een', 'voor', 'niet', 'met', 'zijn', 'maar', 'deze', 'over', 'worden'] }
  };

  var langDebounceTimer = null;
  var userManuallySelectedLang = false;
  var autoDetectedLang = 'auto';

  function detectLanguage(text) {
    if (!text || text.trim().length < 25) return 'auto';

    // Limpiar caracteres especiales y normalizar palabras a minúsculas
    var tokens = text.toLowerCase().match(/\b[a-záàéèíóòúçñäöüß]+\b/gi) || [];
    if (tokens.length < 5) return 'auto';

    var tokenSet = new Set(tokens);
    var bestLang = 'auto';
    var maxMatches = 0;

    for (var lang in LANGUAGE_PROFILES) {
      if (!LANGUAGE_PROFILES.hasOwnProperty(lang)) continue;
      var profile = LANGUAGE_PROFILES[lang];
      var matches = 0;
      for (var i = 0; i < profile.stopwords.length; i++) {
        if (tokenSet.has(profile.stopwords[i])) matches++;
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestLang = lang;
      }
    }

    // Requiere un mínimo de 2 coincidencias claras
    return maxMatches >= 2 ? bestLang : 'auto';
  }

  function updateAutoLanguage() {
    var langSelect = document.getElementById('guide-lang') || document.getElementById('write-lang-doc');
    var indicator = document.getElementById('auto-lang-indicator');
    if (!langSelect) return;

    if (userManuallySelectedLang && langSelect.value !== 'auto') {
      if (indicator) indicator.innerHTML = '';
      return;
    }

    var ta = document.getElementById('editor-body') || document.getElementById('write-textarea');
    var titleIn = document.getElementById('guide-title') || document.getElementById('write-title');
    var text = ((titleIn ? titleIn.value : '') + ' ' + (ta ? ta.value : '')).trim();

    var detected = detectLanguage(text);
    autoDetectedLang = detected;

    if (indicator) {
      if (detected !== 'auto' && LANGUAGE_PROFILES[detected]) {
        var prof = LANGUAGE_PROFILES[detected];
        indicator.innerHTML = '<span id="detected-lang-badge" class="badge-subtle">Detectat: ' + prof.name + ' (' + detected.toUpperCase() + ')</span>';
      } else {
        indicator.innerHTML = '';
      }
    }
  }

  function scheduleLanguageDetection() {
    clearTimeout(langDebounceTimer);
    langDebounceTimer = setTimeout(updateAutoLanguage, 300);
  }

  function t(key) {
    return typeof window.atmT === 'function' ? window.atmT(key) : key;
  }

  async function confirmModal(msg) {
    return typeof window.confirmModal === 'function' ? await window.confirmModal(msg) : window.confirm(msg);
  }

  function token() {
    try {
      var tok = localStorage.getItem('trujillo_ai_token') ||
        localStorage.getItem(['auth', 'token'].join('_')) ||
        localStorage.getItem('session_token') || '';
      if (!tok) {
        var m = document.cookie.match(new RegExp('(?:^|;\\s*)(?:' + ['auth', 'token'].join('_') + '|ta_session|session_token|token)=([^;]+)'));
        if (m) tok = decodeURIComponent(m[1]);
      }
      return tok;
    } catch (e) { return ''; }
  }

  function headers() {
    var h = { 'Content-Type': 'application/json' };
    var tok = token();
    if (tok) h.Authorization = 'Bearer ' + tok;
    return h;
  }

  function slugFromQuery() {
    try {
      var p = new URLSearchParams(location.search);
      return (p.get('slug') || p.get('edit') || p.get('id') || '').toLowerCase().trim();
    } catch (e) { return ''; }
  }

  function slugify(val) {
    return String(val || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }

  function status(msg, ok) {
    var el = document.getElementById('write-status');
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || '';
    el.classList.toggle('ok', !!ok);
  }

  function getStudioSession() {
    if (window.__taMe && (window.__taMe.email || window.__taMe.id || window.__taMe.handle)) {
      return window.__taMe;
    }
    var session = localStorage.getItem('atm_studio_session') || localStorage.getItem('atm_user');
    if (session) {
      try {
        var u = JSON.parse(session);
        if (u && (u.email || u.id)) return u;
      } catch (e) {}
    }
    return null;
  }

  function needLogin() {
    return getStudioSession();
  }

  function studioUrl(title) {
    var ret = encodeURIComponent(location.origin + '/write' + (slugFromQuery() ? '?slug=' + slugFromQuery() : ''));
    var u = 'https://ai.trujillomingorance.com/?intent=guide&redirect_to=' + ret + '&return=' + ret;
    if (title) u += '&title=' + encodeURIComponent(title);
    return u;
  }

  function fileToData(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result || '')); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function setKind(id) {
    var input = document.getElementById('write-kind');
    if (input) input.value = id;
    document.querySelectorAll('.kind-chip').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-kind') === id);
    });
    scheduleAutoSave();
  }

  function paintKinds(current) {
    var box = document.getElementById('kind-chips');
    if (!box) return;
    box.innerHTML = KINDS.map(function (k) {
      return '<button type="button" class="kind-chip" data-kind="' + k.id + '">' + t('kind-' + k.id) + '</button>';
    }).join('');
    setKind(current || 'guide');
  }

  function paintAttach() {
    var box = document.getElementById('attach-list');
    if (!box) return;
    box.innerHTML = attachments.map(function (a, i) {
      var thumb = '';
      if (a.data && /^data:image\//.test(a.data)) thumb = '<img src="' + a.data + '" alt="">';
      else if (a.url && /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(a.url || a.name || '')) thumb = '<img src="' + a.url + '" alt="">';
      return '<li><div class="attach-info-block">' + thumb + '<span class="attach-name-text">' + (a.name || 'archivo') + '</span></div>' +
        ' <button type="button" class="attach-del-btn" data-drop-att="' + i + '" title="Eliminar">✕</button></li>';
    }).join('');
  }

  function addFiles(files, asBody) {
    var ta = document.getElementById('write-textarea');
    var titleIn = document.getElementById('write-title');
    var slugIn = document.getElementById('write-slug');
    var langIn = document.getElementById('write-lang');

    Array.prototype.forEach.call(files, function (file) {
      var ext = (file.name.split('.').pop() || '').toLowerCase();
      if (asBody && TEXT_EXT.test(ext)) {
        var reader = new FileReader();
        reader.onload = function () {
          if (ta) ta.value = String(reader.result || '');
          if (langIn && EXT_LANG[ext]) langIn.value = EXT_LANG[ext];
          if (titleIn && !titleIn.value) {
            titleIn.value = file.name.replace(/\.[^.]+$/, '');
            if (slugIn && !userEditedSlug) slugIn.value = slugify(titleIn.value);
          }
          updateMetrics();
          scheduleAutoSave();
        };
        reader.readAsText(file);
        return;
      }
      if (file.size > 900000) { status(t('fileTooBig')); return; }
      fileToData(file).then(function (data) {
        attachments.push({
          name: file.name,
          ext: ext,
          type: file.type,
          size: file.size,
          data: data
        });
        paintAttach();
      });
    });
  }

  // --- Real-time Reading Metrics ---
  function updateMetrics() {
    var ta = document.getElementById('write-textarea');
    var pill = document.getElementById('metrics-pill');
    if (!ta || !pill) return;
    var text = ta.value || '';
    var chars = text.length;
    var words = (text.trim().match(/\S+/g) || []).length;
    var mins = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
    pill.textContent = words + ' ' + t('metricWords') + ' · ~' + mins + ' ' + t('metricReadTime') + ' · ' + chars + ' ' + t('metricChars');
  }

  // --- Textarea Text Manipulation Logic ---
  function wrapSelection(el, before, after, defaultText) {
    if (!el) return;
    var start = el.selectionStart;
    var end = el.selectionEnd;
    var val = el.value;
    var selected = val.substring(start, end);
    var insertText = selected || defaultText || '';
    var rep = before + insertText + after;
    el.setRangeText(rep, start, end, 'end');
    el.focus();
    if (!selected && defaultText) {
      el.setSelectionRange(start + before.length, start + before.length + defaultText.length);
    } else {
      el.setSelectionRange(start + before.length, start + before.length + insertText.length);
    }
    updateMetrics();
    scheduleAutoSave();
  }

  function insertLinePrefix(el, prefix) {
    if (!el) return;
    var start = el.selectionStart;
    var end = el.selectionEnd;
    var val = el.value;
    var lineStart = val.lastIndexOf('\n', start - 1) + 1;
    if (start === end) {
      el.setRangeText(prefix, lineStart, lineStart, 'end');
      var newPos = start + prefix.length;
      el.setSelectionRange(newPos, newPos);
    } else {
      var selected = val.substring(lineStart, end);
      var lines = selected.split('\n');
      var prefixed = lines.map(function (l) { return prefix + l; }).join('\n');
      el.setRangeText(prefixed, lineStart, end, 'end');
      el.setSelectionRange(lineStart, lineStart + prefixed.length);
    }
    el.focus();
    updateMetrics();
    scheduleAutoSave();
  }

  function insertLink(el) {
    if (!el) return;
    var start = el.selectionStart;
    var end = el.selectionEnd;
    var val = el.value;
    var selected = val.substring(start, end);
    if (selected) {
      var rep = '[' + selected + '](url)';
      el.setRangeText(rep, start, end, 'end');
      el.focus();
      el.setSelectionRange(start + selected.length + 3, start + selected.length + 6);
    } else {
      var rep = '[texto](url)';
      el.setRangeText(rep, start, end, 'end');
      el.focus();
      el.setSelectionRange(start + 1, start + 6);
    }
    updateMetrics();
    scheduleAutoSave();
  }

  function insertTicker(el) {
    if (!el) return;
    var start = el.selectionStart;
    var end = el.selectionEnd;
    var val = el.value;
    var selected = val.substring(start, end).trim();
    var term = selected ? selected.replace(/^\$/, '').toUpperCase() : 'TICKER';
    var rep = '$' + term;
    el.setRangeText(rep, start, end, 'end');
    el.focus();
    el.setSelectionRange(start + 1, start + 1 + term.length);
    updateMetrics();
    scheduleAutoSave();
  }

  function insertTable(el) {
    if (!el) return;
    var start = el.selectionStart;
    var end = el.selectionEnd;
    var val = el.value;
    var needsNewline = start > 0 && val.charAt(start - 1) !== '\n';
    var prefix = needsNewline ? '\n\n' : (start === 0 ? '' : '\n');
    var template = prefix + '| Columna 1 | Columna 2 |\n| :--- | :--- |\n| Valor A | Valor B |\n\n';
    el.setRangeText(template, start, end, 'end');
    el.focus();
    updateMetrics();
    scheduleAutoSave();
  }

  function insertCode(el) {
    if (!el) return;
    var start = el.selectionStart;
    var end = el.selectionEnd;
    var val = el.value;
    var selected = val.substring(start, end);
    var codeBody = selected || 'echo "Hola mundo"';
    var needsNewline = start > 0 && val.charAt(start - 1) !== '\n';
    var prefix = needsNewline ? '\n\n' : (start === 0 ? '' : '\n');
    var template = prefix + '```bash\n' + codeBody + '\n```\n';
    el.setRangeText(template, start, end, 'end');
    el.focus();
    if (!selected) {
      el.setSelectionRange(start + prefix.length + 8, start + prefix.length + 8 + codeBody.length);
    }
    updateMetrics();
    scheduleAutoSave();
  }

  function handleTool(tool) {
    var ta = document.getElementById('write-textarea');
    if (!ta) return;
    switch (tool) {
      case 'bold':
        wrapSelection(ta, '**', '**', 'negrita');
        break;
      case 'italic':
        wrapSelection(ta, '_', '_', 'cursiva');
        break;
      case 'h2':
        insertLinePrefix(ta, '## ');
        break;
      case 'h3':
        insertLinePrefix(ta, '### ');
        break;
      case 'link':
        insertLink(ta);
        break;
      case 'ticker':
        insertTicker(ta);
        break;
      case 'table':
        insertTable(ta);
        break;
      case 'callout':
        insertLinePrefix(ta, '> ');
        break;
      case 'code':
        insertCode(ta);
        break;
    }
  }

  // --- Dynamic References & Sources Module ---
  function getReferences() {
    var rows = document.querySelectorAll('.ref-row');
    var list = [];
    rows.forEach(function (row) {
      var title = (row.querySelector('.ref-title') || {}).value || '';
      var url = (row.querySelector('.ref-url') || {}).value || '';
      var type = (row.querySelector('.ref-type') || {}).value || 'Doc Oficial';
      if (title.trim() || url.trim()) {
        list.push({ title: title.trim(), url: url.trim(), type: type });
      }
    });
    return list;
  }

  function addReferenceRow(item) {
    var box = document.getElementById('references-list');
    if (!box) return;
    var row = document.createElement('div');
    row.className = 'ref-row';
    var tVal = (item && item.title) ? item.title : '';
    var uVal = (item && item.url) ? item.url : '';
    var typeVal = (item && item.type) ? item.type : 'Doc Oficial';

    var optionsHtml = REF_TYPES.map(function (opt) {
      return '<option value="' + opt + '"' + (opt === typeVal ? ' selected' : '') + '>' + opt + '</option>';
    }).join('');

    row.innerHTML =
      '<input type="text" class="ref-title" placeholder="' + t('refTitlePlaceholder').replace(/"/g, '&quot;') + '" value="' + tVal.replace(/"/g, '&quot;') + '">' +
      '<input type="url" class="ref-url" placeholder="https://..." value="' + uVal.replace(/"/g, '&quot;') + '">' +
      '<select class="ref-type">' + optionsHtml + '</select>' +
      '<button type="button" class="ref-delete-btn" title="' + t('deleteRow').replace(/"/g, '&quot;') + '" aria-label="' + t('deleteRow').replace(/"/g, '&quot;') + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
      '</button>';

    box.appendChild(row);
  }

  function formatReferencesMarkdown(refs) {
    if (!refs || !refs.length) return '';
    var out = '\n\n## Fonts i Referències\n\n| Font / Document | Tipus | Enllaç |\n| :--- | :--- | :--- |\n';
    refs.forEach(function (r) {
      var linkText = r.url ? ('[' + (r.title || 'Accedir') + '](' + r.url + ')') : (r.title || '—');
      out += '| ' + (r.title || '—') + ' | `' + r.type + '` | ' + linkText + ' |\n';
    });
    return out;
  }

  // --- Universal Ticker Formatting in Preview HTML ---
  function formatTickersInHtml(html) {
    if (!html) return '';
    var tickerRegex = /\(?\$([A-Z0-9]+(?:\.[A-Z0-9]+)?)\)?/g;
    return html.replace(tickerRegex, function (match, ticker) {
      return '<span class="ticker-badge">$' + ticker + '</span>';
    });
  }

  // --- Dual Mode Preview Compiler ---
  function updatePreview() {
    var ta = document.getElementById('write-textarea') || document.querySelector('textarea');
    if (!ta) return;
    var pv = document.getElementById('editor-preview-container') || document.getElementById('write-preview');
    if (!pv && ta.parentNode) {
      pv = document.createElement('div');
      pv.id = 'editor-preview-container';
      pv.className = 'write-preview guide-body editor-preview-container';
      ta.parentNode.insertBefore(pv, ta.nextSibling);
    }
    if (!pv) return;
    pv.innerHTML = window.marked ? window.marked.parse(ta.value) : ta.value;
  }

  function setEditorTab(mode) {
    var tabWrite = document.getElementById('tab-write') || document.querySelector('.studio-tab-btn:first-child');
    var tabPreview = document.getElementById('tab-preview') || document.querySelector('.studio-tab-btn:last-child');
    var ta = document.getElementById('write-textarea') || document.querySelector('textarea');
    if (!ta) return;

    var pv = document.getElementById('editor-preview-container') || document.getElementById('write-preview');
    if (!pv && ta.parentNode) {
      pv = document.createElement('div');
      pv.id = 'editor-preview-container';
      pv.className = 'write-preview guide-body editor-preview-container';
      ta.parentNode.insertBefore(pv, ta.nextSibling);
    }

    if (mode === 'preview') {
      if (tabPreview) tabPreview.classList.add('is-active', 'active');
      if (tabWrite) tabWrite.classList.remove('is-active', 'active');
      ta.style.display = 'none';
      if (pv) {
        pv.style.display = 'block';
        pv.hidden = false;
        pv.innerHTML = window.marked ? window.marked.parse(ta.value) : ta.value;
      }
    } else {
      if (tabWrite) tabWrite.classList.add('is-active', 'active');
      if (tabPreview) tabPreview.classList.remove('is-active', 'active');
      if (pv) {
        pv.style.display = 'none';
        pv.hidden = true;
      }
      ta.style.display = 'block';
      ta.focus();
    }
  }

  // --- LocalStorage Auto-save & Restore ---
  function scheduleAutoSave() {
    if (slugFromQuery()) return; // Don't overwrite draft if editing an existing guide
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function () {
      try {
        var form = document.getElementById('write-form');
        if (!form) return;
        var langSel = document.getElementById('guide-lang') || document.getElementById('write-lang-doc');
        var draft = {
          title: (document.getElementById('write-title') || document.getElementById('guide-title') || {}).value || '',
          slug: (document.getElementById('write-slug') || {}).value || '',
          summary: (document.getElementById('write-summary') || {}).value || '',
          content: (document.getElementById('write-textarea') || document.getElementById('editor-body') || {}).value || '',
          kind: (document.getElementById('write-kind') || {}).value || 'guide',
          langDoc: langSel ? langSel.value : 'auto',
          level: (document.getElementById('write-level') || {}).value || 'intermediate',
          pinned: !!(document.getElementById('write-pinned') || {}).checked,
          references: getReferences(),
          savedAt: Date.now()
        };
        if (draft.title || draft.content) {
          localStorage.setItem('atm_write_draft', JSON.stringify(draft));
          showDraftStatus(draft.savedAt);
        }
      } catch (e) {}
    }, 500);
  }

  function showDraftStatus(time) {
    var box = document.getElementById('draft-box');
    var txt = document.getElementById('draft-status-text');
    if (!box || !txt) return;
    box.hidden = false;
    var d = time ? new Date(time) : new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    txt.textContent = t('draftSaved') + ' (' + hh + ':' + mm + ')';
  }

  function restoreDraft() {
    try {
      var saved = JSON.parse(localStorage.getItem('atm_write_draft') || '{}');
      if (!saved) return;
      var titleIn = document.getElementById('write-title') || document.getElementById('guide-title');
      var slugIn = document.getElementById('write-slug');
      var sumIn = document.getElementById('write-summary');
      var ta = document.getElementById('write-textarea') || document.getElementById('editor-body');
      var kindIn = document.getElementById('write-kind');
      var langDoc = document.getElementById('guide-lang') || document.getElementById('write-lang-doc');
      var levelIn = document.getElementById('write-level');
      var pinIn = document.getElementById('write-pinned');

      if (titleIn && saved.title) titleIn.value = saved.title;
      if (slugIn && saved.slug) { slugIn.value = saved.slug; userEditedSlug = true; }
      if (sumIn && saved.summary) sumIn.value = saved.summary;
      if (ta && saved.content) ta.value = saved.content;
      if (saved.kind) paintKinds(saved.kind);
      if (langDoc && saved.langDoc) {
        langDoc.value = saved.langDoc;
        if (saved.langDoc === 'auto') {
          userManuallySelectedLang = false;
          updateAutoLanguage();
        } else {
          userManuallySelectedLang = true;
          var indicator = document.getElementById('auto-lang-indicator');
          if (indicator) indicator.innerHTML = '';
        }
      } else {
        updateAutoLanguage();
      }
      if (levelIn && saved.level) levelIn.value = saved.level;
      if (pinIn) pinIn.checked = !!saved.pinned;

      var refBox = document.getElementById('references-list');
      if (refBox && Array.isArray(saved.references) && saved.references.length) {
        refBox.innerHTML = '';
        saved.references.forEach(addReferenceRow);
      }

      updateMetrics();
      status('Borrador restaurado con éxito.', true);
      setTimeout(function () { status('', false); }, 3000);
    } catch (e) {}
  }

  function discardDraft() {
    try {
      localStorage.removeItem('atm_write_draft');
      var box = document.getElementById('draft-box');
      if (box) box.hidden = true;
      status('Borrador descartado.', true);
      setTimeout(function () { status('', false); }, 2500);
    } catch (e) {}
  }

  // --- Main Initializer / Loader ---
  async function load() {
    getStudioSession();
    paintKinds('guide');
    bindEditorEvents();
    updateMetrics();

    var slug = slugFromQuery();
    var form = document.getElementById('write-form');
    var del = document.getElementById('delete-guide');
    var heading = document.getElementById('write-heading');
    var ai = document.getElementById('open-ai');
    var titleIn = document.getElementById('write-title') || document.getElementById('guide-title');
    var slugIn = document.getElementById('write-slug');
    var sumIn = document.getElementById('write-summary');
    var ta = document.getElementById('write-textarea') || document.getElementById('editor-body');
    var langIn = document.getElementById('write-lang');
    var langDoc = document.getElementById('guide-lang') || document.getElementById('write-lang-doc');
    var levelIn = document.getElementById('write-level');
    var pinIn = document.getElementById('write-pinned');

    if (!slug) {
      // Check if draft exists in localStorage
      try {
        var savedDraft = JSON.parse(localStorage.getItem('atm_write_draft') || '{}');
        if (savedDraft && (savedDraft.title || savedDraft.content)) {
          showDraftStatus(savedDraft.savedAt);
        }
      } catch (e) {}
      updateAutoLanguage();
      if (typeof window.atmApplyUi === 'function') window.atmApplyUi(window.atmLang());
      return;
    }

    var data = null;
    try {
      var localGuides = JSON.parse(localStorage.getItem('atm_guides_data') || localStorage.getItem('atm_custom_guides') || localStorage.getItem('atm_local_guides') || '[]');
      data = localGuides.find(function (g) { return (g.slug === slug || g.id === slug); });
      if (!data && window.__taFeedCache && Array.isArray(window.__taFeedCache.guides)) {
        data = window.__taFeedCache.guides.find(function (g) { return (g.slug === slug || g.id === slug); });
      }
    } catch (e) {}

    if (!data) {
      try {
        var r = await fetch('/data/guides.json');
        if (r.ok) {
          var cat = await r.json();
          var list = (cat && (cat.guides || cat.items)) || [];
          data = list.find(function (g) { return (g.slug === slug || g.id === slug); });
        }
      } catch (e) {}
    }

    if (!data) {
      status('No se ha encontrado la publicación.', false);
      return;
    }

    if (titleIn) titleIn.value = data.title || '';
    if (slugIn) { slugIn.value = data.slug || ''; userEditedSlug = true; }
    if (sumIn) sumIn.value = data.summary || '';
    if (ta) ta.value = data.content || '';
    if (data.lang && langIn) langIn.value = data.lang;
    if (langDoc) {
      if (data.langDoc && data.langDoc !== 'auto') {
        langDoc.value = data.langDoc;
        userManuallySelectedLang = true;
      } else {
        langDoc.value = 'auto';
        userManuallySelectedLang = false;
        updateAutoLanguage();
      }
    }
    if (data.level && levelIn) levelIn.value = data.level;
    if (pinIn) pinIn.checked = !!data.pinned;

    paintKinds(data.kind || data.category || 'guide');
    attachments = Array.isArray(data.attachments) ? data.attachments.slice() : [];
    paintAttach();

    var refBox = document.getElementById('references-list');
    if (refBox) {
      refBox.innerHTML = '';
      if (Array.isArray(data.references) && data.references.length) {
        data.references.forEach(addReferenceRow);
      }
    }

    updateMetrics();
    bindEditorEvents();
    updateAutoLanguage();

    if (heading) {
      heading.textContent = t('editGuide');
      heading.setAttribute('data-i18n', 'editGuide');
    }
    if (del) del.hidden = false;
    if (ai) ai.href = studioUrl(data.title || '');
    if (typeof window.atmApplyUi === 'function') window.atmApplyUi(window.atmLang());
  }

  function bindEditorEvents() {
    var ta = document.getElementById('write-textarea') || document.getElementById('editor-body');
    if (ta && !ta._hasInputListener) {
      ta._hasInputListener = true;
      ta.addEventListener('input', function () {
        updateMetrics();
        scheduleAutoSave();
        scheduleLanguageDetection();
      });
    }

    var titleIn = document.getElementById('write-title') || document.getElementById('guide-title');
    if (titleIn && !titleIn._hasInputListener) {
      titleIn._hasInputListener = true;
      titleIn.addEventListener('input', function () {
        scheduleLanguageDetection();
      });
    }

    var langSel = document.getElementById('guide-lang') || document.getElementById('write-lang-doc');
    if (langSel && !langSel._hasChangeBound) {
      langSel._hasChangeBound = true;
      langSel.addEventListener('change', function () {
        if (langSel.value === 'auto') {
          userManuallySelectedLang = false;
          updateAutoLanguage();
        } else {
          userManuallySelectedLang = true;
          var indicator = document.getElementById('auto-lang-indicator');
          if (indicator) indicator.innerHTML = '';
        }
        scheduleAutoSave();
      });
    }

    var toolButtons = document.querySelectorAll('.studio-tool-btn, .editor-toolbar button, button[data-action], button[data-tool]');
    toolButtons.forEach(function (btn) {
      btn.setAttribute('type', 'button');
      if (!btn._hasClickBound) {
        btn._hasClickBound = true;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var tool = btn.dataset.tool || btn.dataset.action;
          if (tool) handleTool(tool);
        });
      }
    });

    var tabWrite = document.getElementById('tab-write') || document.querySelector('#tab-write, [data-i18n="tabWrite"]');
    if (tabWrite && !tabWrite._hasClickBound) {
      tabWrite.setAttribute('type', 'button');
      tabWrite._hasClickBound = true;
      tabWrite.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setEditorTab('write');
      });
    }

    var tabPreview = document.getElementById('tab-preview') || document.querySelector('#tab-preview, [data-i18n="tabPreview"]');
    if (tabPreview && !tabPreview._hasClickBound) {
      tabPreview.setAttribute('type', 'button');
      tabPreview._hasClickBound = true;
      tabPreview.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setEditorTab('preview');
      });
    }

    var addRefBtn = document.getElementById('btn-add-ref') || document.getElementById('add-reference-btn');
    if (addRefBtn && !addRefBtn._hasClickBound) {
      addRefBtn.setAttribute('type', 'button');
      addRefBtn._hasClickBound = true;
      addRefBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        addReferenceRow();
        scheduleAutoSave();
      });
    }
  }

  // --- Global Event Delegation ---
  document.addEventListener('click', function (e) {
    // Kind pills
    var chip = e.target.closest('.kind-chip');
    if (chip) { setKind(chip.getAttribute('data-kind')); return; }

    // Drop attachment
    var drop = e.target.closest('[data-drop-att]');
    if (drop) {
      attachments.splice(Number(drop.getAttribute('data-drop-att')), 1);
      paintAttach();
      return;
    }

    // Toolbar buttons
    var toolBtn = e.target.closest('.studio-tool-btn, .editor-toolbar button, button[data-action], button[data-tool]');
    if (toolBtn) {
      e.preventDefault();
      var tool = toolBtn.dataset.tool || toolBtn.dataset.action;
      if (tool) {
        handleTool(tool);
        return;
      }
    }

    // Tabs
    if (e.target.closest('#tab-write, [data-i18n="tabWrite"]')) {
      e.preventDefault();
      setEditorTab('write');
      return;
    }
    if (e.target.closest('#tab-preview, [data-i18n="tabPreview"]')) {
      e.preventDefault();
      setEditorTab('preview');
      return;
    }

    // Draft restore & discard
    if (e.target.closest('#draft-restore-btn')) {
      e.preventDefault();
      restoreDraft();
      return;
    }
    if (e.target.closest('#draft-discard-btn')) {
      e.preventDefault();
      discardDraft();
      return;
    }

    // References: Add row
    if (e.target.closest('#add-reference-btn, #btn-add-ref')) {
      e.preventDefault();
      addReferenceRow();
      scheduleAutoSave();
      return;
    }

    // References: Delete row
    var refDel = e.target.closest('.ref-delete-btn');
    if (refDel) {
      e.preventDefault();
      var row = refDel.closest('.ref-row');
      if (row) row.remove();
      scheduleAutoSave();
      return;
    }

    // Custom File Trigger Buttons
    if (e.target.closest('#btn-import-file')) {
      e.preventDefault();
      var f1 = document.getElementById('import-file');
      if (f1) f1.click();
      return;
    }
    if (e.target.closest('#btn-attach-files')) {
      e.preventDefault();
      var f2 = document.getElementById('attach-files');
      if (f2) f2.click();
      return;
    }
  });

  // File Inputs change
  document.addEventListener('change', function (e) {
    if (e.target.id === 'import-file' && e.target.files && e.target.files[0]) {
      addFiles(e.target.files, true);
      e.target.value = '';
      return;
    }
    if (e.target.id === 'attach-files' && e.target.files && e.target.files.length) {
      addFiles(e.target.files, false);
      e.target.value = '';
      return;
    }
    if (e.target.id === 'guide-lang' || e.target.id === 'write-lang-doc') {
      if (e.target.value === 'auto') {
        userManuallySelectedLang = false;
        updateAutoLanguage();
      } else {
        userManuallySelectedLang = true;
        var indicator = document.getElementById('auto-lang-indicator');
        if (indicator) indicator.innerHTML = '';
      }
      scheduleAutoSave();
      return;
    }
    if (e.target.closest('#references-section, #write-level, #write-pinned')) {
      scheduleAutoSave();
    }
  });

  // Drag & Drop Ingest
  document.addEventListener('dragover', function (e) {
    if (!e.target.closest('#unified-drop-zone')) return;
    e.preventDefault();
    var z = document.getElementById('unified-drop-zone');
    if (z) z.classList.add('is-over');
  });
  document.addEventListener('dragleave', function (e) {
    if (e.target.id === 'unified-drop-zone' || !e.target.closest('#unified-drop-zone')) {
      var z = document.getElementById('unified-drop-zone');
      if (z) z.classList.remove('is-over');
    }
  });
  document.addEventListener('drop', function (e) {
    var z = document.getElementById('unified-drop-zone');
    if (z) z.classList.remove('is-over');
    if (!e.target.closest('#unified-drop-zone')) return;
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      var first = e.dataTransfer.files[0];
      var ext = (first.name.split('.').pop() || '');
      addFiles(e.dataTransfer.files, TEXT_EXT.test(ext) && e.dataTransfer.files.length === 1);
    }
  });

  // Form inputs handling
  document.addEventListener('input', function (e) {
    if (e.target.id === 'write-textarea' || e.target.id === 'editor-body') {
      updateMetrics();
      scheduleAutoSave();
      scheduleLanguageDetection();
    }
    if (e.target.id === 'write-title' || e.target.id === 'guide-title') {
      var val = e.target.value || '';
      var ai = document.getElementById('open-ai');
      if (ai) ai.href = studioUrl(val);
      var slugIn = document.getElementById('write-slug');
      if (slugIn && !userEditedSlug && !slugFromQuery()) {
        slugIn.value = slugify(val);
      }
      scheduleAutoSave();
      scheduleLanguageDetection();
    }
    if (e.target.id === 'write-slug') {
      userEditedSlug = true;
      scheduleAutoSave();
    }
    if (e.target.id === 'write-summary' || e.target.closest('.ref-row')) {
      scheduleAutoSave();
    }
  });

  function handlePublishGuide(guideData) {
    var existing = [];
    try {
      existing = JSON.parse(localStorage.getItem('atm_guides_data') || '[]');
    } catch (e) { existing = []; }

    var admin = getStudioSession();
    var guideId = guideData.slug || slugify(guideData.title);

    var words = (guideData.content || '').split(/\s+/).filter(Boolean).length;
    var readMins = Math.max(1, Math.ceil(words / 200));

    var newGuide = {
      id: guideId,
      slug: guideId,
      title: guideData.title,
      summary: guideData.summary || '',
      content: guideData.content,
      author: admin.name || 'Alberto Trujillo Mingorance',
      authorName: admin.name || 'Alberto Trujillo Mingorance',
      handle: admin.handle || '@atrumin16',
      authorPicture: admin.picture || 'https://lh3.googleusercontent.com/a/ACg8ocLdgZZbUW1KzSg11REPuHungATAR_SeG52Na5yDYfOOXhpkXzs=s96-c',
      date: new Date().toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      readTime: readMins + ' min reading',
      type: guideData.type || guideData.kind || 'guide',
      kind: guideData.kind || guideData.type || 'guide',
      category: guideData.kind || guideData.type || 'guide',
      pinned: guideData.pinned || false,
      fixada: guideData.pinned || false,
      references: guideData.references || [],
      attachments: guideData.attachments || [],
      updatedAt: Date.now()
    };

    // Si ya existe la actualiza, si no la añade al inicio
    var index = existing.findIndex(function (g) { return g.id === newGuide.id || g.slug === newGuide.id; });
    if (index >= 0) {
      existing[index] = Object.assign({}, existing[index], newGuide);
    } else {
      existing.unshift(newGuide);
    }

    try {
      localStorage.setItem('atm_guides_data', JSON.stringify(existing));
      localStorage.setItem('atm_custom_guides', JSON.stringify(existing));
      localStorage.setItem('atm_local_guides', JSON.stringify(existing));
    } catch (e) {}

    // Limpiar borrador y redirigir al visor
    try {
      localStorage.removeItem('atm_draft');
      localStorage.removeItem('atm_write_draft');
    } catch (e) {}

    status(t('published') || 'Publicado con éxito', true);
    setTimeout(function () {
      window.location.href = '/g.html?id=' + encodeURIComponent(newGuide.id);
    }, 400);
  }

  function doPublish() {
    var titleIn = document.getElementById('write-title') || document.getElementById('guide-title');
    var slugIn = document.getElementById('write-slug');
    var sumIn = document.getElementById('write-summary');
    var ta = document.getElementById('write-textarea') || document.getElementById('editor-body');
    var kindIn = document.getElementById('write-kind');
    var langIn = document.getElementById('write-lang');
    var langDoc = document.getElementById('guide-lang') || document.getElementById('write-lang-doc');
    var levelIn = document.getElementById('write-level');
    var pinIn = document.getElementById('write-pinned');

    var title = titleIn ? titleIn.value.trim() : '';
    var rawMarkdown = ta ? ta.value.trim() : '';

    if (!title) {
      if (titleIn) titleIn.focus();
      status('El título no puede estar vacío.', false);
      return;
    }
    if (!rawMarkdown) {
      if (ta) ta.focus();
      status('El cuerpo de la publicación no puede estar vacío.', false);
      return;
    }

    status(t('publishing') || 'Publicando…');

    var refs = getReferences();
    var effectiveDocLang = 'es';
    if (langDoc) {
      if (langDoc.value !== 'auto') {
        effectiveDocLang = langDoc.value;
      } else if (autoDetectedLang !== 'auto') {
        effectiveDocLang = autoDetectedLang;
      }
    }

    var finalSlug = (slugIn && slugIn.value.trim()) ? slugify(slugIn.value.trim()) : (slugFromQuery() || slugify(title));

    handlePublishGuide({
      slug: finalSlug,
      title: title,
      summary: sumIn ? sumIn.value.trim() : '',
      content: rawMarkdown,
      lang: langIn ? langIn.value : 'markdown',
      langDoc: effectiveDocLang,
      level: levelIn ? levelIn.value : 'intermediate',
      pinned: !!(pinIn && pinIn.checked),
      references: refs,
      kind: kindIn ? kindIn.value : 'guide',
      attachments: attachments
    });
  }

  // Form Submit (Publish 100% Client-Side in LocalStorage)
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('#write-form');
    if (!form) return;
    e.preventDefault();
    doPublish();
  });

  // Direct Button Click
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('#publish-btn, #btn-publish, .btn-publish');
    if (!btn) return;
    e.preventDefault();
    doPublish();
  });

  // Delete Guide (Client-Side LocalStorage)
  document.addEventListener('click', async function (e) {
    if (!e.target.closest('#delete-guide')) return;
    e.preventDefault();
    if (!await confirmModal(t('confirmDelete'))) return;
    try {
      var localGuides = JSON.parse(localStorage.getItem('atm_local_guides') || '[]');
      var s = slugFromQuery();
      localGuides = localGuides.filter(function (g) { return g.slug !== s; });
      localStorage.setItem('atm_local_guides', JSON.stringify(localGuides));
      localStorage.removeItem('atm_write_draft');
    } catch (err) {}
    status('Eliminado con éxito', true);
    setTimeout(function () {
      location.href = '/';
    }, 500);
  });

  document.addEventListener('atm:me', function () {
    // Client-side local authoring mode
  });

  document.addEventListener('atm:lang', function () {
    var currentKind = (document.getElementById('write-kind') || {}).value;
    paintKinds(currentKind);
    updateMetrics();
    var slug = slugFromQuery();
    var heading = document.getElementById('write-heading');
    if (heading) {
      heading.textContent = slug ? t('editGuide') : t('writeHeadingNew');
    }
    document.querySelectorAll('.ref-row').forEach(function (row) {
      var titleInput = row.querySelector('.ref-title');
      if (titleInput) titleInput.setAttribute('placeholder', t('refTitlePlaceholder'));
      var delBtn = row.querySelector('.ref-delete-btn');
      if (delBtn) {
        delBtn.setAttribute('title', t('deleteRow'));
        delBtn.setAttribute('aria-label', t('deleteRow'));
      }
    });
    var draftBox = document.getElementById('draft-box');
    if (draftBox && !draftBox.hidden) {
      try {
        var savedDraft = JSON.parse(localStorage.getItem('atm_write_draft') || '{}');
        if (savedDraft && savedDraft.savedAt) showDraftStatus(savedDraft.savedAt);
      } catch (e) {}
    }
    updateAutoLanguage();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
