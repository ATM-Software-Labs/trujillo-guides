(function () {
  'use strict';
  window.__atmGuidesLoaded = true;

  var isMutating = false;
  var TABLE_WRAP = 'overflow-x-auto my-6 border border-neutral-800 rounded-lg bg-neutral-950/40 table-wrap';
  var ATTACH_EXT = /^(pdf|docx|doc|xlsx|xls|csv|zip)$/i;
  var SKIP_TICKER = { PRE: 1, CODE: 1, A: 1, SCRIPT: 1, TEXTAREA: 1, SVG: 1 };

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  var SLUG_ALIASES = {
    'enterprise-email': 'correo-corporativo-startups',
    'infraestructura-de-correo-corporativo-para-start': 'correo-corporativo-startups',
    'infraestructura-de-correo-corporativo-para-startups-a-coste-0': 'correo-corporativo-startups',
    'desglose-de-cartera-y-simulador-de-berkshire-hat': 'desglose-cartera-berkshire-brk',
    'desglose-de-cartera-y-simulador-de-berkshire-hathaway': 'desglose-cartera-berkshire-brk',
    'desglose-cartera-berkshire': 'desglose-cartera-berkshire-brk',
    'berkshire': 'desglose-cartera-berkshire-brk',
    'msft': 'informe-msft',
    'microsoft': 'informe-msft',
    'glosario': 'it-glossary',
    'glossary': 'it-glossary',
    'glossari': 'it-glossary'
  };

  function slugFromPath() {
    try {
      var params = new URLSearchParams(window.location.search);
      var qId = params.get('id') || params.get('slug') || params.get('g');
      if (qId) {
        var cleanQ = qId.toLowerCase().trim();
        return SLUG_ALIASES[cleanQ] || cleanQ;
      }
    } catch (e) {}
    var p = window.location.pathname || '';
    var m = p.match(/\/(?:guides|g|s)\/([a-z0-9-]+)/i);
    if (m && m[1]) {
      var cleanP = m[1].toLowerCase().trim();
      return SLUG_ALIASES[cleanP] || cleanP;
    }
    return '';
  }

  function absGuideShort(data) {
    var origin = 'https://guides.trujillomingorance.com';
    var url = (data && (data.short || data.url || data.own || data.compact || data.cloak)) || '';
    var code = data && data.code;
    if (!url && code) url = '/s/' + code;
    if (/^https?:\/\//i.test(url)) {
      try {
        var u = new URL(url);
        if (/bit\.ly|tinyurl\.com|da\.gd/i.test(u.hostname)) return origin + '/s/' + (code || '');
        if (/\.pages\.dev$/i.test(u.hostname)) return origin + u.pathname + u.search;
      } catch (e) {}
      return url;
    }
    if (url.charAt(0) === '/') return origin + url;
    return origin + '/s/' + (code || url);
  }

  function readMarkdown() {
    var block = document.getElementById('guide-markdown');
    if (block && block.textContent.trim()) return block.textContent;
    var el = $('[data-markdown]');
    if (el) return el.getAttribute('data-markdown') || el.textContent || '';
    return '';
  }

  function readPayload() {
    var el = document.getElementById('guide-payload');
    if (!el) return {};
    try { return JSON.parse(el.textContent || '{}') || {}; } catch (e) { return {}; }
  }

  function preprocess(md) {
    var text = String(md || '').replace(/\r\n/g, '\n');

    // 1. Unwrap any #brk-calculator widget wrapped in ```html ... ``` or ```xml ... ``` or ``` ... ```
    text = text.replace(/```(?:html|xml)?\s*(<div[\s\S]*?id=["']brk-calculator["'][\s\S]*?<\/div>)\s*```/gi, function (_, widgetHtml) {
      return '\n\n' + widgetHtml.trim() + '\n\n';
    });

    // 2. Remove leading 4-space markdown code indentation from #brk-calculator block
    text = text.replace(/(^[ \t]{4,}<div[\s\S]*?id=["']brk-calculator["'][\s\S]*?<\/div>)/gim, function (match) {
      return match.split('\n').map(function (line) {
        return line.replace(/^[ \t]{4}/, '');
      }).join('\n');
    });

    // 3. TradingView widgets
    return text
      .replace(/^<(?:TradingViewWidget|tradingview)\s+symbol=["']([^"']+)["'](?:\s+interval=["']([^"']+)["'])?[^>]*\/?\s*>$/gim,
        function (_, sym, iv) {
          return '<div data-widget="tradingview" data-symbol="' + sym + '" data-interval="' + (iv || 'D') + '"></div>\n';
        })
      .replace(/^:::tradingview\s+(\S+)(?:\s+(\S+))?.*$/gm, function (_, sym, iv) {
        return '<div data-widget="tradingview" data-symbol="' + sym + '" data-interval="' + (iv || 'D') + '"></div>\n';
      });
  }

  function configureMarked() {
    if (!window.marked) return false;
    if (typeof marked.setOptions === 'function') {
      marked.setOptions({ gfm: true, breaks: true, html: true, pedantic: false });
    }
    if (typeof marked.use === 'function') {
      marked.use({
        gfm: true,
        breaks: true,
        renderer: {
          table: function (header, body) {
            if (header && typeof header === 'object') return false;
            return '<div class="' + TABLE_WRAP + '"><table class="w-full text-left text-sm border-collapse"><thead>' +
              header + '</thead><tbody>' + body + '</tbody></table></div>\n';
          }
        }
      });
    }
    return true;
  }

  /* 1. Pipe-Tables in Paragraphs Converter */
  function parsePipesToTable(rawHtml) {
    if (!rawHtml || !rawHtml.includes('|')) return null;
    var normalized = rawHtml.replace(/<br\s*\/?>/gi, '\n').replace(/\r\n/g, '\n').trim();
    var lines = normalized.split('\n');

    // Compressed single line pipe table support
    if (lines.length === 1 && /\|\s*[-:]{2,}\s*\|/.test(normalized)) {
      lines = normalized.split(/(?<=\|)\s*(?=\|)/);
    }

    var rows = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || !line.includes('|')) continue;
      // Skip delimiter lines like |---|---|
      if (/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(line)) {
        continue;
      }
      var parts = line.split('|');
      if (parts.length > 1) {
        if (parts[0].trim() === '') parts.shift();
        if (parts.length && parts[parts.length - 1].trim() === '') parts.pop();
        var cells = parts.map(function (c) { return c.trim(); });
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
    }

    if (rows.length < 2) return null;

    var header = rows[0];
    var body = rows.slice(1);
    var html = '<div class="' + TABLE_WRAP + '"><table class="w-full text-left text-sm border-collapse"><thead><tr>';
    for (var h = 0; h < header.length; h++) {
      html += '<th>' + header[h] + '</th>';
    }
    html += '</tr></thead><tbody>';
    for (var r = 0; r < body.length; r++) {
      html += '<tr>';
      for (var c = 0; c < header.length; c++) {
        html += '<td>' + (body[r][c] || '') + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    return html;
  }

  function processParagraphTables(root) {
    var scope = root || document;
    var paras = scope.querySelectorAll('p');
    paras.forEach(function (p) {
      if (!p.textContent || !p.textContent.includes('|')) return;
      if (p.closest('pre, code, table, .table-wrap')) return;
      var tableHtml = parsePipesToTable(p.innerHTML);
      if (tableHtml) {
        var div = document.createElement('div');
        div.innerHTML = tableHtml;
        var replacement = div.firstElementChild;
        p.parentNode.replaceChild(replacement, p);
      }
    });
  }

  function wrapTables(root) {
    var scope = root || document;
    scope.querySelectorAll('table').forEach(function (table) {
      var parent = table.parentElement;
      if (parent && (parent.classList.contains('overflow-x-auto') || parent.classList.contains('table-wrap'))) {
        parent.className = TABLE_WRAP;
        table.classList.add('w-full', 'text-left', 'text-sm');
        return;
      }
      var wrap = document.createElement('div');
      wrap.className = TABLE_WRAP;
      table.classList.add('w-full', 'text-left', 'text-sm');
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  /* 2. Seamless HTML Iframes & OLED Injection */
  function sanitizeAndThemeIframes(root) {
    var scope = root || document;
    var iframes = scope.querySelectorAll('iframe.frame, iframe[srcdoc], .stage iframe');
    iframes.forEach(function (iframe) {
      iframe.style.width = '100%';
      iframe.style.border = '0';
      iframe.style.background = 'transparent';
      iframe.setAttribute('allowtransparency', 'true');

      function injectThemeAndResize() {
        try {
          var doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
          if (!doc) return;

          if (!doc.getElementById('oled-injected-style')) {
            var style = doc.createElement('style');
            style.id = 'oled-injected-style';
            style.textContent = [
              ':root, html, body {',
              '  background-color: #030712 !important;',
              '  color: #f8fafc !important;',
              '  color-scheme: dark !important;',
              '  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif !important;',
              '  overflow: hidden !important;',
              '  margin: 0 !important;',
              '  padding: 16px !important;',
              '}',
              'table {',
              '  background: #080c14 !important;',
              '  border: 1px solid #1e293b !important;',
              '  border-collapse: collapse !important;',
              '  width: 100% !important;',
              '  margin: 16px 0 !important;',
              '}',
              'th {',
              '  background: #0f172a !important;',
              '  color: #94a3b8 !important;',
              '  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;',
              '  text-transform: uppercase !important;',
              '  font-size: 11px !important;',
              '  letter-spacing: 0.06em !important;',
              '  border-bottom: 1px solid #1e293b !important;',
              '  padding: 10px 14px !important;',
              '  text-align: left !important;',
              '}',
              'td {',
              '  padding: 10px 14px !important;',
              '  border-bottom: 1px solid #1e293b !important;',
              '  color: #cbd5e1 !important;',
              '  font-size: 13px !important;',
              '}',
              'tr:hover td { background: rgba(255, 255, 255, 0.02) !important; }',
              'a { color: #38bdf8 !important; }',
              '::-webkit-scrollbar { width: 6px; height: 6px; }',
              '::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }'
            ].join('\n');
            (doc.head || doc.body).appendChild(style);
          }

          var h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
          if (h > 50) {
            iframe.style.height = h + 'px';
          }
        } catch (e) {
          // Cross-origin sandboxed - postMessage handler covers it
        }
      }

      if (!iframe.getAttribute('data-oled-bound')) {
        iframe.setAttribute('data-oled-bound', '1');
        iframe.addEventListener('load', injectThemeAndResize);
        injectThemeAndResize();
      }
    });
  }

  // Window message listener for cross-origin iframe auto-resizing
  window.addEventListener('message', function (ev) {
    if (ev.data && ev.data.type === 'FRAME_RESIZE' && typeof ev.data.height === 'number') {
      var iframes = document.querySelectorAll('iframe.frame, iframe[srcdoc], .stage iframe');
      iframes.forEach(function (iframe) {
        if (iframe.contentWindow === ev.source) {
          iframe.style.height = Math.max(ev.data.height, 200) + 'px';
        }
      });
    }
  });

  /* 3. Discreet Short Link Copy Logic */
  function copyTextToClipboard(text, onSuccess, onFallback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(function () {
        if (onFallback) onFallback();
        else window.prompt('Copiar enlace:', text);
      });
    } else {
      if (onFallback) onFallback();
      else window.prompt('Copiar enlace:', text);
    }
  }

  function bindCopy(btn) {
    if (!btn || btn.getAttribute('data-copy-bound')) return;
    btn.setAttribute('data-copy-bound', '1');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var label = btn.querySelector('span') || btn;
      var prev = label.textContent;
      label.textContent = '…';

      var slug = btn.getAttribute('data-slug') ||
        (btn.closest('[data-slug]') && btn.closest('[data-slug]').getAttribute('data-slug')) ||
        slugFromPath();

      function done() {
        label.textContent = '¡Copiado!';
        setTimeout(function () { label.textContent = prev || 'Copiar enlace'; }, 1600);
      }

      var shareUrl = location.href;
      copyTextToClipboard(shareUrl, done, function () {
        window.prompt('Copiar enlace:', shareUrl);
        done();
      });
    });
  }

  /* 4. Minimalist Forum-Style Author Header & Reordering */
  function createPosterElement(when, slug) {
    var div = document.createElement('div');
    div.className = 'poster meta-bar poster-bar';
    if (slug) div.setAttribute('data-slug', slug);
    div.innerHTML = '<div class="poster-author" data-notranslate>' +
      '<span class="poster-avatar">AT</span>' +
      '<span class="poster-name">Alberto Trujillo</span>' +
      '<a class="poster-handle" href="/u/@atrumin16">@atrumin16</a>' +
      '</div>' +
      '<div class="poster-right">' +
      '<time class="poster-date meta-chip">' + esc(when || '11 sep 2026') + '</time>' +
      '<button type="button" class="copy-link poster-copy meta-chip" data-slug="' + esc(slug) + '">' +
      '<svg class="tool-ic" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
      '<span>Copiar enlace</span></button>' +
      '</div>';
    return div;
  }

  function reorderPoster() {
    if (document.body.classList.contains('is-not-found') || document.querySelector('.is-not-found')) return;
    if (document.querySelector('.nf, .home-main') && !document.querySelector('.guide-container, article.doc, #guide-body')) return;
    if (!document.querySelector('.guide-container, .community-main, article.doc, #guide-body, .guide-content, .main-wrapper')) return;

    var articleH1 = $('article.doc h1, #guide-body h1, .guide-content h1, .stage h1');
    var outerH1 = $('.article-head > h1.page-title, .guide-container > h1.page-title, .guide-content h1.guide-title, h1.guide-title');

    // Hide redundant outer H1 if inner editorial H1 exists
    if (articleH1 && outerH1 && articleH1 !== outerH1) {
      outerH1.setAttribute('hidden', '');
      outerH1.style.display = 'none';
      document.body.classList.add('has-editorial-h1');
    }

    var targetH1 = articleH1 || outerH1 || $('h1');
    if (!targetH1) return;
    var titleEl = targetH1;
    if (titleEl && !titleEl.getAttribute('data-ticker-parsed')) {
      titleEl.setAttribute('data-ticker-parsed', '1');
      titleEl.innerHTML = formatTitleTickers(titleEl.textContent || '');
    }

    var slug = slugFromPath();
    var dateEl = document.querySelector('time, .poster-date, [data-date]');
    var payload = readPayload();
    var when = (dateEl && dateEl.textContent.trim()) || payload.date || '11 sep 2026';

    var existingPoster = $('.poster, .meta-bar, #guide-meta-bar');
    if (existingPoster) {
      // Ensure clean forum structure inside existing poster
      if (!existingPoster.querySelector('.poster-avatar')) {
        existingPoster.innerHTML = '<div class="poster-author" data-notranslate>' +
          '<span class="poster-avatar">AT</span>' +
          '<span class="poster-name">Alberto Trujillo</span>' +
          '<a class="poster-handle" href="/u/@atrumin16">@atrumin16</a>' +
          '</div>' +
          '<div class="poster-right">' +
          '<time class="poster-date meta-chip">' + esc(when) + '</time>' +
          '<button type="button" class="copy-link poster-copy meta-chip" data-slug="' + esc(slug) + '">' +
          '<svg class="tool-ic" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
          '<span>Copiar enlace</span></button>' +
          '</div>';
      }
      existingPoster.className = 'poster meta-bar poster-bar';

      if (targetH1.nextElementSibling !== existingPoster) {
        targetH1.insertAdjacentElement('afterend', existingPoster);
      }
    } else {
      var newPoster = createPosterElement(when, slug);
      targetH1.insertAdjacentElement('afterend', newPoster);
    }

    var posterNow = $('.poster, .meta-bar, #guide-meta-bar');
    var social = document.querySelector('.social-bar');
    if (posterNow && social && posterNow.nextElementSibling !== social) {
      posterNow.insertAdjacentElement('afterend', social);
    }

    document.querySelectorAll('.copy-link, .poster-copy, #copy-link, #doc-copy-btn').forEach(bindCopy);
  }

  /* 5. Tickers, TradingView & Attachments */
  function formatTitleTickers(text) {
    if (!text) return '';
    const tickerRegex = /\(?\$([A-Z0-9]+(?:\.[A-Z0-9]+)?)\)?/g;
    return text.replace(tickerRegex, (match, ticker) => {
      return `<a href="https://es.tradingview.com/symbols/${encodeURIComponent(ticker)}/" target="_blank" rel="noopener noreferrer" class="ticker-badge" style="display: inline-flex; align-items: center; padding: 0.12rem 0.5rem; border-radius: 6px; font-size: 0.8em; font-family: ui-monospace, monospace; font-weight: 700; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); text-decoration: none; cursor: pointer; pointer-events: auto; position: relative; z-index: 10; margin-left: 0.35rem; vertical-align: middle;">$${ticker}</a>`;
    });
  }
  window.formatTitleTickers = formatTitleTickers;
  window.formatTickerTitle = formatTitleTickers;

  function applyTickerToElement(el) {
    if (!el || el.getAttribute('data-ticker-parsed')) return;
    el.style.pointerEvents = 'auto';
    if (el.querySelector && el.querySelector('.ticker-badge')) {
      el.setAttribute('data-ticker-parsed', '1');
      return;
    }
    var raw = el.textContent || '';
    if (raw.indexOf('$') === -1) return;
    var re = /\(?\$([A-Z0-9]+(?:\.[A-Z0-9]+)?)\)?/;
    if (!re.test(raw)) return;
    el.setAttribute('data-ticker-parsed', '1');
    el.innerHTML = formatTitleTickers(raw);
  }

  function parseTitleAndCardTickers(root) {
    var scope = root || document;
    // 1. Article H1 headings in headers / titles
    scope.querySelectorAll('h1, .page-title, .guide-title, .doc-header h1, article.doc h1, #guide-body h1').forEach(applyTickerToElement);
    // 2. Feed cards or related guide cards (h2, h3, card titles)
    scope.querySelectorAll('.guide-card-title, .guide-card h2, .guide-card h3, .guide-card a.title').forEach(applyTickerToElement);
  }

  function linkifyTickers(root) {
    var scope = root || document;
    parseTitleAndCardTickers(scope);
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p || SKIP_TICKER[p.tagName] || p.classList.contains('ticker-badge') || (p.closest && (p.closest('.ticker-badge') || p.closest('#brk-calculator') || p.closest('.brk-calc-container')))) return NodeFilter.FILTER_REJECT;
        if (!/\$(?:[A-Z0-9]{1,6}(?:\.[A-Z0-9]+)?|\d{4,5})/.test(node.nodeValue || '')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      var re = /(^|[\s()])\\?\$([A-Z0-9]+(?:\.[A-Z0-9]+)?)\b/g;
      var text = node.nodeValue;
      var last = 0;
      var m;
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        frag.appendChild(document.createTextNode(m[1]));
        var a = document.createElement('a');
        a.className = 'ticker ticker-badge';
        a.href = 'https://es.tradingview.com/symbols/' + encodeURIComponent(m[2]) + '/';
        a.rel = 'noopener noreferrer';
        a.target = '_blank';
        a.textContent = '$' + m[2];
        frag.appendChild(a);
        last = m.index + m[0].length;
      }
      if (!last) return;
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }
  window.linkifyTickers = linkifyTickers;

  function executeScripts(root) {
    if (!root) return;
    var scripts = root.querySelectorAll('script');
    scripts.forEach(function (oldScript) {
      if (oldScript.type && oldScript.type !== 'text/javascript' && oldScript.type !== 'module') return;
      var newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(function (attr) {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  function mountTradingView(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-widget="tradingview"]').forEach(function (el) {
      if (el.getAttribute('data-mounted')) return;
      el.setAttribute('data-mounted', '1');
      el.classList.add('tv-wrap');
      var symbol = encodeURIComponent(el.getAttribute('data-symbol') || 'NASDAQ:AAPL');
      var interval = encodeURIComponent(el.getAttribute('data-interval') || 'D');
      var iframe = document.createElement('iframe');
      iframe.loading = 'lazy';
      iframe.title = 'TradingView ' + (el.getAttribute('data-symbol') || '');
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.src = 'https://s.tradingview.com/widgetembed/?symbol=' + symbol +
        '&interval=' + interval + '&hidesidetoolbar=1&theme=dark&style=1&locale=es&hideideas=1';
      el.appendChild(iframe);
    });
  }

  function formatSize(n) {
    n = Number(n) || 0;
    if (n <= 0) return '';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderAttachments(list, host) {
    if (!host) return;
    if (!Array.isArray(list) || !list.length) {
      host.innerHTML = '';
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.innerHTML = list.map(function (a) {
      if (!a || !a.url) return '';
      var ext = (a.name || a.url).split('.').pop().toLowerCase();
      var size = formatSize(a.size);
      return '<a class="attach-card" href="' + esc(a.url) + '" rel="noopener" download>' +
        '<span class="attach-badge">' + esc(ext) + '</span>' +
        '<span class="attach-meta"><strong>' + esc(a.name || 'archivo.' + ext) + '</strong>' +
        (size ? '<span>' + esc(size) + '</span>' : '') + '</span>' +
        '</a>';
    }).join('');
  }

  /* 6. Markdown Parser Execution */
  function unwrapInteractiveWidgets(target) {
    if (!target) return;
    var pres = target.querySelectorAll('pre');
    pres.forEach(function (pre) {
      var code = pre.querySelector('code');
      var txt = code ? (code.textContent || '') : (pre.textContent || '');
      if (txt.indexOf('id="brk-calculator"') !== -1 || txt.indexOf("id='brk-calculator'") !== -1) {
        var wrap = pre.closest('.code-block-wrap') || pre;
        var temp = document.createElement('div');
        temp.innerHTML = txt.trim();
        var calc = temp.querySelector('#brk-calculator') || (temp.firstElementChild && temp.firstElementChild.id === 'brk-calculator' ? temp.firstElementChild : null) || temp.firstElementChild;
        if (calc && wrap.parentNode) {
          wrap.parentNode.replaceChild(calc, wrap);
        }
      }
    });
  }

  function stripDuplicateHeading(md, title) {
    if (!md) return '';
    var text = String(md).trim();
    if (!title) return text;
    function norm(s) {
      return String(s || '').toLowerCase().replace(/[$#*_\(\)\[\]:!¡?¿`'"]/g, '').replace(/\s+/g, ' ').trim();
    }
    var nTitle = norm(title);
    var m = text.match(/^(\s*#{1,3}\s+)([^\n\r]+)([\r\n]+)/);
    if (m) {
      var hText = m[2].trim();
      var nhText = norm(hText);
      if (nhText === nTitle || nTitle.indexOf(nhText) !== -1 || nhText.indexOf(nTitle) !== -1) {
        return text.slice(m[0].length).trim();
      }
    }
    return text;
  }
  window.stripDuplicateHeading = stripDuplicateHeading;

  function renderMarkdown(root) {
    var src = readMarkdown();
    if (!src.trim() || !window.marked) {
      wrapTables(root);
      return;
    }
    configureMarked();
    var vTitleEl = document.getElementById('viewer-title');
    var postTitle = vTitleEl ? (vTitleEl.textContent || '').trim() : '';
    var cleanSrc = stripDuplicateHeading(src, postTitle);
    var html = marked.parse(preprocess(cleanSrc));
    var target = document.getElementById('guide-body') || $('[data-markdown]') || root;
    if (target.getAttribute && target.getAttribute('data-markdown') !== null) {
      target.removeAttribute('data-markdown');
    }
    target.innerHTML = html;
    var firstH = target.querySelector('h1:first-child, h2:first-child');
    if (firstH && postTitle) {
      function norm(s) { return String(s || '').toLowerCase().replace(/[$#*_\(\)\[\]:!¡?¿`'"]/g, '').replace(/\s+/g, ' ').trim(); }
      var nF = norm(firstH.textContent);
      var nT = norm(postTitle);
      if (nF === nT || nT.indexOf(nF) !== -1 || nF.indexOf(nT) !== -1) {
        firstH.remove();
      }
    }
    unwrapInteractiveWidgets(target);
    executeScripts(target);
    wrapTables(target);
    linkifyTickers(target);
    initBrkCalculator(target);
  }

  function initBrkCalculator(root) {
    var scope = root || document;
    var container = scope.querySelector ? scope.querySelector('#brk-calculator') : document.querySelector('#brk-calculator');
    if (!container) return;

    var cashRange = container.querySelector('#brk-cash-range');
    var cashVal = container.querySelector('#brk-cash-val');
    var portRange = container.querySelector('#brk-portfolio-range');
    var portVal = container.querySelector('#brk-portfolio-val');
    var ebitRange = container.querySelector('#brk-ebit-range');
    var ebitVal = container.querySelector('#brk-ebit-val');
    var multRange = container.querySelector('#brk-multiple-range');
    var multVal = container.querySelector('#brk-multiple-val');
    var priceInput = container.querySelector('#brk-price-input');

    var intrinsicEl = container.querySelector('#brk-intrinsic-share');
    var marginVal = container.querySelector('#brk-margin-val');
    var marginBadge = container.querySelector('#brk-margin-badge');
    var totalEnterprise = container.querySelector('#brk-total-enterprise');
    var barCash = container.querySelector('#brk-bar-cash');
    var barPort = container.querySelector('#brk-bar-port');
    var barOps = container.querySelector('#brk-bar-ops');
    var legendCash = container.querySelector('#brk-legend-cash');
    var legendPort = container.querySelector('#brk-legend-port');
    var legendOps = container.querySelector('#brk-legend-ops');
    var psCash = container.querySelector('#brk-ps-cash');
    var psPort = container.querySelector('#brk-ps-port');
    var psOps = container.querySelector('#brk-ps-ops');

    // Equivalent Class B Shares: ~2.160 billion shares
    var SHARES_B = 2.160;

    function recalculate() {
      var cash = parseFloat(cashRange ? cashRange.value : 300) || 0;
      var port = parseFloat(portRange ? portRange.value : 285) || 0;
      var ebit = parseFloat(ebitRange ? ebitRange.value : 42) || 0;
      var mult = parseFloat(multRange ? multRange.value : 13.5) || 0;
      var mktPrice = parseFloat(priceInput ? priceInput.value : 460) || 1;

      if (cashVal) cashVal.textContent = '$' + cash.toFixed(1) + ' B';
      if (portVal) portVal.textContent = '$' + port.toFixed(1) + ' B';
      if (ebitVal) ebitVal.textContent = '$' + ebit.toFixed(1) + ' B';
      if (multVal) multVal.textContent = mult.toFixed(1) + 'x';

      var opsValue = ebit * mult;
      var totalValue = cash + port + opsValue;
      var intrinsicShare = totalValue / SHARES_B;

      if (intrinsicEl) intrinsicEl.textContent = '$' + intrinsicShare.toFixed(2);
      if (totalEnterprise) totalEnterprise.textContent = '$' + totalValue.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' B';

      // Margin of Safety: ((Intrinsic - MarketPrice) / MarketPrice) * 100
      var marginPct = ((intrinsicShare - mktPrice) / mktPrice) * 100;
      if (marginVal) {
        var sign = marginPct >= 0 ? '+' : '';
        marginVal.textContent = sign + marginPct.toFixed(1) + '%';
        marginVal.style.color = marginPct >= 0 ? '#34d399' : '#f87171';
      }
      var lang = (typeof window.atmLang === 'function' ? window.atmLang() : 'es');
      if (marginBadge) {
        if (marginPct > 15) {
          marginBadge.textContent = (lang === 'ca') ? 'Marge Protector Alt' : (lang === 'en') ? 'High Margin of Safety' : (lang === 'fr') ? 'Marge Protectrice Élevée' : 'Margen Protector Alto';
          marginBadge.style.color = '#34d399';
          marginBadge.style.background = 'rgba(52, 211, 153, 0.12)';
          marginBadge.style.borderColor = 'rgba(52, 211, 153, 0.3)';
        } else if (marginPct >= 0) {
          marginBadge.textContent = (lang === 'ca') ? 'Infravalorada' : (lang === 'en') ? 'Undervalued' : (lang === 'fr') ? 'Sous-évaluée' : 'Infravalorada';
          marginBadge.style.color = '#38bdf8';
          marginBadge.style.background = 'rgba(56, 189, 248, 0.12)';
          marginBadge.style.borderColor = 'rgba(56, 189, 248, 0.3)';
        } else {
          marginBadge.textContent = (lang === 'ca') ? 'Sobrevalorada' : (lang === 'en') ? 'Overvalued' : (lang === 'fr') ? 'Surévaluée' : 'Sobrevalorada';
          marginBadge.style.color = '#f87171';
          marginBadge.style.background = 'rgba(248, 113, 113, 0.12)';
          marginBadge.style.borderColor = 'rgba(248, 113, 113, 0.3)';
        }
      }

      // Proportional visual breakdown
      var pctCash = totalValue > 0 ? (cash / totalValue) * 100 : 0;
      var pctPort = totalValue > 0 ? (port / totalValue) * 100 : 0;
      var pctOps = totalValue > 0 ? (opsValue / totalValue) * 100 : 0;

      if (barCash) barCash.style.width = pctCash.toFixed(1) + '%';
      if (barPort) barPort.style.width = pctPort.toFixed(1) + '%';
      if (barOps) barOps.style.width = pctOps.toFixed(1) + '%';

      if (legendCash) legendCash.textContent = '$' + cash.toFixed(1) + 'B (' + pctCash.toFixed(1) + '%)';
      if (legendPort) legendPort.textContent = '$' + port.toFixed(1) + 'B (' + pctPort.toFixed(1) + '%)';
      if (legendOps) legendOps.textContent = '$' + opsValue.toFixed(1) + 'B (' + pctOps.toFixed(1) + '%)';

      // Per share metrics
      if (psCash) psCash.textContent = '$' + (cash / SHARES_B).toFixed(2);
      if (psPort) psPort.textContent = '$' + (port / SHARES_B).toFixed(2);
      if (psOps) psOps.textContent = '$' + (opsValue / SHARES_B).toFixed(2);
    }

    if (!container.getAttribute('data-calc-bound')) {
      container.setAttribute('data-calc-bound', '1');
      [cashRange, portRange, ebitRange, multRange, priceInput].forEach(function (input) {
        if (!input) return;
        input.addEventListener('input', recalculate);
        input.addEventListener('change', recalculate);
      });
    }

    recalculate();
  }
  window.initBrkCalculator = initBrkCalculator;

  function enhance(root) {
    linkifyTickers(root);
    mountTradingView(root);
    initBrkCalculator(root);
    var payload = readPayload();
    if (!document.querySelector('.attach-list .attach-card')) {
      renderAttachments(payload.attachments, document.getElementById('guide-attachments'));
    }
    (payload.widgets || []).forEach(function (w) {
      if (!w || (w.type !== 'chart' && w.type !== 'tradingview') || !w.symbol) return;
      if (root.querySelector('[data-symbol="' + w.symbol + '"]')) return;
      var el = document.createElement('div');
      el.setAttribute('data-widget', 'tradingview');
      el.setAttribute('data-symbol', w.symbol);
      el.setAttribute('data-interval', w.interval || 'D');
      (document.getElementById('guide-body') || root).appendChild(el);
    });
    mountTradingView(root);
  }

  /* 7. Master Pass with Infinite Loop Protection */
  function applyDomPass() {
    if (isMutating) return;
    isMutating = true;
    try {
      reorderPoster();
      processParagraphTables();
      sanitizeAndThemeIframes();
      wrapTables();
    } catch (err) {
      console.warn('ATM Guides DOM Pass Error:', err);
    } finally {
      setTimeout(function () {
        isMutating = false;
      }, 60);
    }
  }

  function isGuidePage() {
    if (document.getElementById('community-feed') || document.getElementById('guides-feed')) return false;
    return !!(
      document.querySelector('.guide-container') ||
      document.querySelector('article.doc') ||
      document.querySelector('article.guide-content') ||
      document.querySelector('.article-head') ||
      document.getElementById('guide-body')
    );
  }

  function initMutationObserver() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function (mutations) {
      if (isMutating) return;
      var relevant = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.addedNodes && m.addedNodes.length > 0) {
          for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (n.nodeType === 1) {
              if (n.matches && (n.matches('p, table, iframe, h1, .poster, .meta-bar, article, .doc') ||
                n.querySelector('p, table, iframe, h1, .poster, .meta-bar'))) {
                relevant = true;
                break;
              }
            }
          }
        }
        if (relevant) break;
      }
      if (relevant) {
        applyDomPass();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function initEditOption() {
    function check() {
      var bar = document.querySelector('.social-bar, .poster-bar, #guide-meta-bar');
      var editBtn = document.querySelector('[data-edit]');
      if (!bar || !editBtn) return;
      var barHandle = (bar.getAttribute('data-handle') || '').replace(/^@/, '').toLowerCase();
      if (!barHandle) {
        var posterHandle = document.querySelector('.poster-handle, a[href*="/u/@"]');
        if (posterHandle) {
          var m = (posterHandle.getAttribute('href') || posterHandle.textContent || '').match(/@([a-z0-9_]+)/i);
          if (m) barHandle = m[1].toLowerCase();
        }
      }
      var me = window.__taMe;
      var loggedHandle = (me && me.handle) ? String(me.handle).replace(/^@/, '').toLowerCase() : '';
      var isAuthor = !!(loggedHandle && barHandle && loggedHandle === barHandle);

      if (isAuthor) {
        editBtn.hidden = false;
        editBtn.removeAttribute('hidden');
      } else {
        editBtn.hidden = true;
        editBtn.setAttribute('hidden', '');
      }

      if (!editBtn.getAttribute('data-edit-bound')) {
        editBtn.setAttribute('data-edit-bound', '1');
        editBtn.addEventListener('click', function (e) {
          e.preventDefault();
          var slug = (bar && bar.getAttribute('data-slug')) || '';
          if (!slug) {
            var p = window.location.pathname || '';
            var sm = p.match(/\/(?:guides|g|s)\/([a-z0-9-]+)/i);
            slug = sm ? sm[1].toLowerCase() : '';
          }
          if (slug) window.location.href = '/write?slug=' + encodeURIComponent(slug);
        });
      }
    }

    check();
    document.addEventListener('atm:me', check);
  }

  function copyFallback(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    } catch (e) {}
  }

  /* 8. Stripe & Cloudflare Docs Polish Enhancements */
  function detectCodeLanguage(pre, codeEl) {
    var className = (codeEl && codeEl.className) || (pre && pre.className) || '';
    var m = className.match(/(?:lang|language)-([a-z0-9_-]+)/i);
    if (m) {
      var raw = m[1].toLowerCase();
      var map = {
        'js': 'JAVASCRIPT',
        'javascript': 'JAVASCRIPT',
        'ts': 'TYPESCRIPT',
        'typescript': 'TYPESCRIPT',
        'py': 'PYTHON',
        'python': 'PYTHON',
        'bash': 'BASH',
        'sh': 'SHELL',
        'shell': 'SHELL',
        'zsh': 'SHELL',
        'terminal': 'TERMINAL',
        'dns': 'DNS CONFIG',
        'zone': 'DNS CONFIG',
        'bind': 'DNS CONFIG',
        'json': 'JSON',
        'html': 'HTML',
        'css': 'CSS',
        'sql': 'SQL',
        'yaml': 'YAML',
        'yml': 'YAML',
        'xml': 'XML',
        'md': 'MARKDOWN',
        'markdown': 'MARKDOWN',
        'txt': 'TXT',
        'text': 'TXT',
        'nginx': 'NGINX',
        'docker': 'DOCKERFILE',
        'dockerfile': 'DOCKERFILE'
      };
      if (map[raw]) return map[raw];
      return raw.toUpperCase();
    }

    var text = (codeEl ? (codeEl.textContent || '') : (pre.textContent || '')).trim();
    if (/^(?:;|\/\/|\#)\s*(?:DKIM|DNS|SPF|DMARC|Record|Zona|Zone)/i.test(text) ||
        /\b(?:IN\s+TXT|IN\s+MX|IN\s+CNAME|IN\s+A|v=spf1|v=DKIM1|v=DMARC1)\b/i.test(text) ||
        /\b(?:DoH|RFC\s*8484|AdShield|cloudflare-dns)\b/i.test(text)) {
      return 'DNS CONFIG';
    }
    if (/^(?:curl|npm|npx|pnpm|yarn|git|docker|sudo|systemctl|export)\b/m.test(text) || /^\$\s+\w+/m.test(text)) {
      return 'TERMINAL';
    }
    if (/^[\{\[]\s*["\w]/m.test(text) && /[\}\]]\s*$/m.test(text)) {
      return 'JSON';
    }
    if (/\b(?:function|const|let|var|import|export|class|console\.log)\b/.test(text)) {
      return 'JAVASCRIPT';
    }
    if (/<(?:div|span|p|a|html|body|script|style)[\s>]/i.test(text)) {
      return 'HTML';
    }
    return 'TXT';
  }

  function enhanceCodeBlocks(root) {
    var scope = root || document;
    var pres = scope.querySelectorAll('pre');
    var ICON_CLIPBOARD = '<svg class="tool-ic" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var ICON_CHECK = '<svg class="tool-ic" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:#34d399;"><polyline points="20 6 9 17 4 12"/></svg>';

    pres.forEach(function (pre) {
      if (pre.classList.contains('mermaid')) return;
      if (pre.querySelector('#brk-calculator') || (pre.textContent && (pre.textContent.indexOf('id="brk-calculator"') !== -1 || pre.textContent.indexOf("id='brk-calculator'") !== -1))) return;
      if (pre.parentElement && pre.parentElement.classList.contains('code-block-wrap')) return;

      var codeEl = pre.querySelector('code');
      var lang = detectCodeLanguage(pre, codeEl);

      var wrap = document.createElement('div');
      wrap.className = 'code-block-wrap';

      var header = document.createElement('div');
      header.className = 'code-header';

      var langSpan = document.createElement('span');
      langSpan.className = 'code-lang';
      langSpan.textContent = lang;

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'copy-code-btn';
      copyBtn.title = 'Copiar código';
      copyBtn.setAttribute('aria-label', 'Copiar código');
      copyBtn.innerHTML = ICON_CLIPBOARD + '<span>Copiar</span>';

      copyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var textToCopy = codeEl ? (codeEl.textContent || '') : (pre.textContent || '');
        if (!textToCopy) return;

        function markCopied() {
          copyBtn.innerHTML = ICON_CHECK + '<span>¡Copiado!</span>';
          setTimeout(function () {
            copyBtn.innerHTML = ICON_CLIPBOARD + '<span>Copiar</span>';
          }, 1800);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(markCopied).catch(function () {
            copyFallback(textToCopy);
            markCopied();
          });
        } else {
          copyFallback(textToCopy);
          markCopied();
        }
      });

      header.appendChild(langSpan);
      header.appendChild(copyBtn);

      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(header);
      wrap.appendChild(pre);
    });
  }

  function enhanceDividers(root) {
    var scope = root || document;
    var paras = scope.querySelectorAll('p');
    paras.forEach(function (p) {
      var txt = (p.textContent || '').trim();
      if (/^(?:-{3,}|—{2,}|–{2,}|\*{3,}|_{3,})$/.test(txt)) {
        var hr = document.createElement('hr');
        hr.className = 'divider';
        p.parentNode.replaceChild(hr, p);
      }
    });

    scope.querySelectorAll('hr').forEach(function (hr) {
      if (!hr.classList.contains('divider')) {
        hr.classList.add('divider');
      }
    });
  }

  function enhancePosterChips(doc) {
    var posterRight = document.querySelector('.poster-right');
    if (!posterRight) return;

    // Ensure date chip has meta-chip class
    var dateEl = posterRight.querySelector('.poster-date');
    if (dateEl && !dateEl.classList.contains('meta-chip')) {
      dateEl.classList.add('meta-chip');
    }

    // Ensure copy button chip has meta-chip class and link SVG
    var copyBtn = posterRight.querySelector('.copy-link, .poster-copy');
    if (copyBtn && !copyBtn.classList.contains('meta-chip')) {
      copyBtn.classList.add('meta-chip');
      if (!copyBtn.querySelector('svg')) {
        copyBtn.insertAdjacentHTML('afterbegin', '<svg class="tool-ic" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>');
      }
    }

    // Reading time chip
    if (!posterRight.querySelector('.read-time-badge')) {
      var text = (doc.textContent || '').trim();
      var words = text.split(/\s+/).filter(Boolean).length;
      var mins = Math.max(1, Math.ceil(words / 200));
      var badge = document.createElement('span');
      badge.className = 'read-time-badge meta-chip';
      badge.innerHTML = '<svg class="tool-ic" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>' + mins + ' min de lectura</span>';
      if (copyBtn) posterRight.insertBefore(badge, copyBtn);
      else posterRight.appendChild(badge);
    }
  }

  function initTocScrollSpy(headings, tocNav) {
    if (!headings.length || !tocNav) return;
    var linkMap = Object.create(null);
    var tocLinks = tocNav.querySelectorAll('.toc-link');
    var tocItems = tocNav.querySelectorAll('.toc-item');
    tocLinks.forEach(function (l) {
      var id = l.getAttribute('data-target') || (l.getAttribute('href') || '').replace(/^#/, '');
      if (id) linkMap[id] = l;
    });

    var ticking = false;
    function update() {
      ticking = false;
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var currentId = '';

      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        var top = h.getBoundingClientRect().top + scrollY;
        if (scrollY >= top - 120) {
          currentId = h.id;
        }
      }
      if (!currentId && headings.length > 0) {
        currentId = headings[0].id;
      }

      tocLinks.forEach(function (l) { l.classList.remove('active'); });
      tocItems.forEach(function (it) { it.classList.remove('active'); });
      if (currentId && linkMap[currentId]) {
        var activeLink = linkMap[currentId];
        activeLink.classList.add('active');
        var activeItem = activeLink.closest('.toc-item');
        if (activeItem) activeItem.classList.add('active');
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  function enhanceTocAndLayout(doc) {
    var headings = Array.from(doc.querySelectorAll('h2, h3')).filter(function (h) {
      return !h.closest('#guide-forum, .forum, .docs-footer, aside, .auth-modal');
    });

    if (headings.length < 2) return;

    var usedIds = Object.create(null);
    headings.forEach(function (h) {
      if (!h.id) {
        var base = h.textContent.trim().toLowerCase()
          .replace(/[^a-z0-9áéíóúüñ]+/gi, '-')
          .replace(/^-+|-+$/g, '') || 'seccion';
        var id = base;
        var c = 1;
        while (usedIds[id] || document.getElementById(id)) {
          id = base + '-' + (++c);
        }
        h.id = id;
      }
      usedIds[h.id] = true;
    });

    var sidebar = document.querySelector('.doc-sidebar');
    if (!sidebar) {
      var container = doc.closest('.guide-container') || doc.closest('.community-main') || doc.parentElement;
      if (container && container.classList.contains('guide-container')) {
        var layout = document.createElement('div');
        layout.className = 'doc-layout';

        var contentCol = document.createElement('div');
        contentCol.className = 'doc-content';

        sidebar = document.createElement('aside');
        sidebar.className = 'doc-sidebar';

        var bodyEls = [];
        var isBody = false;
        Array.from(container.children).forEach(function (child) {
          if (!isBody) {
            if (child.matches && (child.matches('article, #guide-body, .step-card, section, .md-body') || child.id === 'guide-body')) {
              isBody = true;
            }
          }
          if (isBody) {
            bodyEls.push(child);
          }
        });

        if (bodyEls.length > 0) {
          bodyEls.forEach(function (child) { contentCol.appendChild(child); });
        } else {
          contentCol.appendChild(doc);
        }

        layout.appendChild(sidebar);
        layout.appendChild(contentCol);
        container.appendChild(layout);
        container.classList.add('has-toc-sidebar');
      } else if (container) {
        var layout2 = document.createElement('div');
        layout2.className = 'doc-layout';

        var contentCol2 = document.createElement('div');
        contentCol2.className = 'doc-content';

        sidebar = document.createElement('aside');
        sidebar.className = 'doc-sidebar';

        doc.parentNode.insertBefore(layout2, doc);
        layout2.appendChild(sidebar);
        layout2.appendChild(contentCol2);
        contentCol2.appendChild(doc);
        container.classList.add('has-toc-sidebar');
      }
    }

    if (!sidebar) return;

    sidebar.querySelectorAll('.article-toc').forEach(function (el) { el.remove(); });

    var tocNav = document.createElement('nav');
      tocNav.className = 'article-toc';
      tocNav.setAttribute('aria-label', 'Tabla de contenidos');

      var titleHtml = '<div class="toc-title">' +
        '<svg class="tool-ic" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>' +
        '<line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>' +
        '</svg><span>Contenido</span></div>';

      var listHtml = '<ul class="toc-list">' + headings.map(function (h) {
        var isH3 = h.tagName.toLowerCase() === 'h3';
        var itemCls = 'toc-item' + (isH3 ? ' toc-h3' : ' toc-h2');
        var linkCls = 'toc-link' + (isH3 ? ' toc-h3 is-h3' : ' toc-h2');
        return '<li class="' + itemCls + '"><a class="' + linkCls + '" href="#' + esc(h.id) + '" data-target="' + esc(h.id) + '">' + esc(h.textContent.trim()) + '</a></li>';
      }).join('') + '</ul>';

      tocNav.innerHTML = titleHtml + listHtml;

      tocNav.addEventListener('click', function (e) {
        var a = e.target.closest('a.toc-link');
        if (a && a.hash) {
          var target = document.getElementById(a.hash.slice(1));
          if (target) {
            e.preventDefault();
            var targetY = target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 80;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
            history.pushState(null, '', a.hash);
            var allLinks = tocNav.querySelectorAll('.toc-link');
            var allItems = tocNav.querySelectorAll('.toc-item');
            allLinks.forEach(function (l) { l.classList.remove('active'); });
            allItems.forEach(function (it) { it.classList.remove('active'); });
            a.classList.add('active');
            var pItem = a.closest('.toc-item');
            if (pItem) pItem.classList.add('active');
          }
        }
      });

      sidebar.appendChild(tocNav);
      initTocScrollSpy(headings, tocNav);

      function alignToc() {
        if (window.innerWidth < 1024) {
          sidebar.style.paddingTop = '0px';
          return;
        }
        var firstP = (doc ? doc.querySelector('p, h2, h3') : null) || document.querySelector('.doc-content p, article.doc > p, #guide-body > p, .doc-content h2, article.doc > h2');
        var contentCol = document.querySelector('.doc-content');
        if (firstP && contentCol) {
          var pTop = firstP.getBoundingClientRect().top;
          var cTop = contentCol.getBoundingClientRect().top;
          var diff = Math.max(0, Math.round(pTop - cTop));
          sidebar.style.paddingTop = diff + 'px';
        } else {
          sidebar.style.paddingTop = '0px';
        }
      }

      alignToc();
      window.addEventListener('resize', alignToc);
    }

  function autoEnhanceArticle() {
    if (document.body.classList.contains('is-not-found') || document.querySelector('.is-not-found')) return;
    parseTitleAndCardTickers(document);
    var doc = document.querySelector('article.doc, #guide-body, .guide-container, .guide-content, .md-body');
    if (!doc) return;

    enhancePosterChips(doc);
    enhanceDividers(doc);
    enhanceCodeBlocks(doc);
    enhanceTocAndLayout(doc);
  }

  function initFilterScope() {
    var sel = document.getElementById('filter-scope');
    if (!sel) return;
    var params = new URLSearchParams(window.location.search);
    var filterVal = (params.get('filtre') || params.get('view') || params.get('scope') || 'totes').toLowerCase();
    if (filterVal === 'destacades' || filterVal === 'featured') {
      sel.value = 'destacades';
    } else {
      sel.value = 'totes';
    }
  }

  function boot() {
    if (document.body.classList.contains('is-not-found') || document.querySelector('.is-not-found')) return;
    initFilterScope();
    var root = document.getElementById('guide-body') ||
      document.querySelector('article.doc') ||
      document.querySelector('.guide-container') ||
      document.querySelector('article.guide-content') ||
      document.body;

    renderMarkdown(root);
    enhance(root);
    applyDomPass();
    initMutationObserver();
    initEditOption();
    autoEnhanceArticle();
    document.addEventListener('atm:content', function () {
      enhance(root);
      autoEnhanceArticle();
    });
    document.addEventListener('atm:lang', function () {
      enhance(root);
      autoEnhanceArticle();
    });
  }

  window.atmRerenderGuide = boot;

  function loadMarked(cb) {
    if (window.marked) { cb(); return; }
    var s = document.createElement('script');
    s.src = '/js/marked.min.js';
    s.onload = cb;
    s.onerror = function () {
      var cdn = document.createElement('script');
      cdn.src = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js';
      cdn.onload = cb;
      cdn.onerror = cb;
      document.head.appendChild(cdn);
    };
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { loadMarked(boot); });
  } else {
    loadMarked(boot);
  }
})();
