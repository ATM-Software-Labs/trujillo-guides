(function () {
  'use strict';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function wrapTables(root) {
    if (!root) return;
    root.querySelectorAll('table').forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains('overflow-x-auto')) return;
      if (table.parentElement && table.parentElement.classList.contains('table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'overflow-x-auto my-6 border border-neutral-800 rounded-lg table-wrap';
      table.classList.add('w-full', 'text-left', 'text-sm');
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

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

  function renderMarkdownBlocks() {
    if (!window.marked) return;
    if (typeof marked.setOptions === 'function') {
      marked.setOptions({ gfm: true, breaks: true, html: true, pedantic: false });
    }
    document.querySelectorAll('[data-markdown], .md-body').forEach(function (el) {
      var src = el.getAttribute('data-markdown') || el.textContent || '';
      if (!src.trim()) return;
      el.innerHTML = marked.parse(src);
      executeScripts(el);
      wrapTables(el);
    });
  }

  function bindCopy() {
    var btn = document.getElementById('copy-link') || document.getElementById('doc-copy-btn');
    if (!btn || btn.getAttribute('data-bound')) return;
    btn.setAttribute('data-bound', '1');
    btn.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(location.href).then(function () {
        var label = btn.querySelector('span') || btn;
        var prev = label.textContent;
        label.textContent = 'Copiado';
        setTimeout(function () { label.textContent = prev || 'Copiar enlace'; }, 1600);
      }).catch(function () {});
    });
  }

  function bootMermaid() {
    if (!document.querySelector('pre.mermaid')) return;
    if (window.mermaid) {
      try { window.mermaid.initialize({ startOnLoad: true, theme: 'dark' }); window.mermaid.run(); } catch (e) {}
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
    s.onload = function () {
      try {
        window.mermaid.initialize({ startOnLoad: false, theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'default' : 'dark' });
        window.mermaid.run({ querySelector: 'pre.mermaid' });
      } catch (e) {}
    };
    document.head.appendChild(s);
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

  /* Stripe & Cloudflare Docs Polish Enhancements */
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
      copyBtn.title = (window.atmTx || String)('Copiar código');
      copyBtn.setAttribute('aria-label', (window.atmTx || String)('Copiar código'));
      copyBtn.innerHTML = ICON_CLIPBOARD + '<span>Copiar</span>';

      copyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var textToCopy = codeEl ? (codeEl.textContent || '') : (pre.textContent || '');
        if (!textToCopy) return;

        function markCopied() {
          copyBtn.innerHTML = ICON_CHECK + '<span>' + (window.atmTx || String)('¡Copiado!') + '</span>';
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

    var dateEl = posterRight.querySelector('.poster-date');
    if (dateEl && !dateEl.classList.contains('meta-chip')) {
      dateEl.classList.add('meta-chip');
    }

    var copyBtn = posterRight.querySelector('.copy-link, .poster-copy');
    if (copyBtn && !copyBtn.classList.contains('meta-chip')) {
      copyBtn.classList.add('meta-chip');
      if (!copyBtn.querySelector('svg')) {
        copyBtn.insertAdjacentHTML('afterbegin', '<svg class="tool-ic" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>');
      }
    }

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

    if (!sidebar.querySelector('.article-toc')) {
      var tocNav = document.createElement('nav');
      tocNav.className = 'article-toc';
      tocNav.setAttribute('aria-label', (window.atmTx || String)('Tabla de contenidos'));

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
  }

  function autoEnhanceArticle() {
    var doc = document.querySelector('article.doc, #guide-body, .guide-container, .guide-content, .md-body');
    if (!doc) return;

    enhancePosterChips(doc);
    enhanceDividers(doc);
    enhanceCodeBlocks(doc);
    enhanceTocAndLayout(doc);
  }

  function boot() {
    renderMarkdownBlocks();
    wrapTables(document.querySelector('article.doc') || document.querySelector('.guide-container') || document.body);
    bindCopy();
    bootMermaid();
    initEditOption();
    autoEnhanceArticle();
    document.addEventListener('atm:content', autoEnhanceArticle);
  }

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
