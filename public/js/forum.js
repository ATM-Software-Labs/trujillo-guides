(function () {
  'use strict';

  function t(key) {
    return typeof window.atmT === 'function' ? window.atmT(key) : key;
  }
  async function confirmModal(msg) {
    return typeof window.confirmModal === 'function' ? await window.confirmModal(msg) : window.confirm(msg);
  }
  function token() {
    try {
      var tok = localStorage.getItem('trujillo_ai_token') ||
        localStorage.getItem('auth_token') ||
        localStorage.getItem('session_token') || '';
      if (!tok) {
        var m = document.cookie.match(/(?:^|;\s*)(?:auth_token|ta_session|session_token|token)=([^;]+)/);
        if (m) tok = decodeURIComponent(m[1]);
      }
      return tok;
    } catch (e) { return ''; }
  }
  function clientId() {
    try {
      var id = localStorage.getItem('ta_client');
      if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
        localStorage.setItem('ta_client', id);
      }
      return id;
    } catch (e) { return ''; }
  }
  function headers(json) {
    var h = { 'X-Client-Id': clientId() };
    if (json) h['Content-Type'] = 'application/json';
    var tok = token();
    if (tok) h.Authorization = 'Bearer ' + tok;
    return h;
  }
  function slugFromPath() {
    var tagged = document.querySelector('#guide-forum[data-slug], .social-bar[data-slug]');
    if (tagged && tagged.getAttribute('data-slug')) return tagged.getAttribute('data-slug');
    var p = (location.pathname || '').replace(/\/+$/, '');
    var m = p.match(/^\/g\/([a-z0-9-]+)$/i) || p.match(/^\/guides\/([a-z0-9-]+)$/i);
    if (m) return m[1].toLowerCase();
    try {
      var sp = new URLSearchParams(location.search);
      var q = sp.get('id') || sp.get('slug') || sp.get('g');
      if (q) return q.toLowerCase();
    } catch (e) {}
    return '';
  }
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function when(ts) {
    try { return new Date(ts).toLocaleString(); } catch (e) { return ''; }
  }

  function getFiles(slug) {
    try {
      return JSON.parse(localStorage.getItem('atm_files_' + slug) || '[]');
    } catch (e) { return []; }
  }
  function saveFiles(slug, files) {
    try {
      localStorage.setItem('atm_files_' + slug, JSON.stringify(files));
    } catch (e) {}
  }
  function getComments(slug) {
    try {
      return JSON.parse(localStorage.getItem('atm_comments_' + slug) || '[]');
    } catch (e) { return []; }
  }
  function saveComments(slug, comments) {
    try {
      localStorage.setItem('atm_comments_' + slug, JSON.stringify(comments));
    } catch (e) {}
  }

  var ICON_REPLY = '<svg class="btn-ic" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>';
  var ICON_WAND = '<svg class="btn-ic" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>';
  var ICON_TRASH = '<svg class="btn-ic" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

  function mountEl(slug) {
    var el = document.getElementById('guide-forum');
    if (el) {
      el.setAttribute('data-slug', slug);
      return el;
    }
    if (document.querySelector('.nf') || document.body.classList.contains('glossary-page')) return null;
    if (!slug) return null;
    var host = document.querySelector('.community-main, .guide-container');
    if (!host) return null;
    el = document.createElement('section');
    el.id = 'guide-forum';
    el.className = 'forum';
    el.setAttribute('data-slug', slug);
    host.appendChild(el);
    return el;
  }

  function fileUrl(slug, id, preview) {
    var files = getFiles(slug);
    var found = files.find(function (f) { return f.id === id; });
    return (found && found.data) ? found.data : '#';
  }

  function previewKind(f) {
    var ext = String(f.ext || (f.name || '').split('.').pop() || '').toLowerCase();
    var type = String(f.type || '').toLowerCase();
    if (/^(png|jpe?g|jpg|webp|gif|avif|svg)$/.test(ext) || type.indexOf('image/') === 0) return 'image';
    if (ext === 'pdf' || type === 'application/pdf') return 'pdf';
    if (/^(txt|md|markdown|csv|tsv|json|js|mjs|ts|py|html|htm|xml|ya?ml|sql|css|mmd|svg)$/.test(ext) || type.indexOf('text/') === 0 || type === 'application/json') return 'text';
    return 'other';
  }

  function renderFiles(box, files, slug, me) {
    var voter = clientId();
    box.innerHTML = (files || []).map(function (f) {
      var canDel = me && (me.owner || (me.handle && f.handle === me.handle));
      if (!canDel && voter && f.voter && String(f.voter).indexOf(voter) !== -1) canDel = true;
      var kind = previewKind(f);
      return '<div class="forum-file" data-file-id="' + esc(f.id) + '">' +
        '<div class="forum-file-meta">' +
        '<strong>' + esc(f.name) + '</strong>' +
        '<span>' + Math.max(1, Math.round((f.size || 0) / 1024)) + ' KB · ' + esc(f.nameBy || f.handle || '') + '</span>' +
        '</div>' +
        '<div class="forum-file-actions">' +
        '<button type="button" class="text-btn" data-preview-file="' + esc(f.id) + '" data-kind="' + kind + '" data-name="' + esc(f.name) + '" data-i18n="preview">' + t('preview') + '</button>' +
        '<a class="text-btn" href="' + fileUrl(slug, f.id, false) + '" download="' + esc(f.name) + '" data-i18n="download">' + t('download') + '</a>' +
        (canDel ? '<button type="button" data-del-file="' + esc(f.id) + '">✕</button>' : '') +
        '</div></div>';
    }).join('') || '<p class="lede" data-i18n="noFiles">' + t('noFiles') + '</p>';
  }

  function ensurePreview() {
    var el = document.getElementById('file-preview');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'file-preview';
    el.className = 'file-preview';
    el.hidden = true;
    el.innerHTML = '<div class="file-preview-card">' +
      '<header><strong data-preview-title></strong>' +
      '<button type="button" class="auth-close" data-close-preview aria-label="Cerrar">✕</button></header>' +
      '<div class="file-preview-body" data-preview-body></div>' +
      '<footer><a class="text-btn" data-preview-dl data-i18n="download">' + t('download') + '</a></footer>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function closePreview() {
    var el = document.getElementById('file-preview');
    if (el) {
      el.hidden = true;
      var body = el.querySelector('[data-preview-body]');
      if (body) body.innerHTML = '';
    }
  }

  function openPreview(slug, btn) {
    var id = btn.getAttribute('data-preview-file');
    var kind = btn.getAttribute('data-kind') || 'other';
    var name = btn.getAttribute('data-name') || '';
    var modal = ensurePreview();
    modal.querySelector('[data-preview-title]').textContent = name;
    var dl = modal.querySelector('[data-preview-dl]');
    var src = fileUrl(slug, id, false);
    dl.href = src;
    dl.setAttribute('download', name);
    var body = modal.querySelector('[data-preview-body]');
    if (kind === 'image') {
      body.innerHTML = '<img src="' + src + '" alt="' + esc(name) + '">';
    } else if (kind === 'pdf') {
      body.innerHTML = '<iframe src="' + src + '" title="' + esc(name) + '"></iframe>';
    } else if (kind === 'text') {
      var txt = '';
      try {
        if (src.indexOf(';base64,') !== -1) {
          txt = decodeURIComponent(escape(atob(src.split(',')[1])));
        } else if (src.indexOf(',') !== -1) {
          txt = decodeURIComponent(src.split(',')[1]);
        } else {
          txt = src;
        }
      } catch (err) {
        txt = 'Error al descodificar archivo de texto.';
      }
      body.innerHTML = '<pre>' + esc(txt.slice(0, 20000)) + '</pre>';
    } else {
      body.innerHTML = '<p class="lede" data-i18n="previewFail">' + t('previewFail') + '</p>';
    }
    modal.hidden = false;
  }

  function mineComment(c, me) {
    if (!c) return false;
    if (me && me.owner) return true;
    if (me && me.handle && c.handle && String(me.handle).toLowerCase() === String(c.handle).toLowerCase()) return true;
    var vid = clientId();
    if (c.voter && vid && (c.voter === 'c:' + vid || String(c.voter).indexOf(vid) !== -1)) return true;
    return false;
  }

  function tree(comments, me) {
    var byParent = Object.create(null);
    (comments || []).forEach(function (c) {
      var p = c.parentId || '';
      if (!byParent[p]) byParent[p] = [];
      byParent[p].push(c);
    });
    function walk(pid) {
      return (byParent[pid] || []).map(function (c) {
        var own = mineComment(c, me);
        return '<article class="forum-comment" data-id="' + esc(c.id) + '">' +
          '<header><img src="' + esc(c.picture || '/avatar.png') + '" alt="" width="28" height="28">' +
          '<strong>' + esc(c.name) + '</strong>' +
          (c.handle ? ' <a href="/u/@' + esc(c.handle) + '">@' + esc(c.handle) + '</a>' : '') +
          '<time>' + esc(when(c.createdAt || c.created)) + (c.editedAt || c.edited ? ' · ' + t('edited') : '') + '</time></header>' +
          '<p data-c-text>' + esc(c.text) + '</p>' +
          '<div class="comment-actions">' +
          '<button type="button" class="text-btn vote-mini" data-c-up="' + esc(c.id) + '" title="' + t('like') + '"><svg class="vote-ic" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h2z"/><path d="M7 11V8a3 3 0 0 1 3-3h1v6h6.2a1.8 1.8 0 0 1 1.76 2.17l-1.05 5.1A1.8 1.8 0 0 1 16.15 20H9a2 2 0 0 1-2-2v-7z"/></svg> ' + (c.score || c.votes || 0) + '</button>' +
          '<button type="button" class="text-btn" data-reply="' + esc(c.id) + '" data-i18n-title="reply" title="' + t('reply') + '" aria-label="' + t('reply') + '">' + ICON_REPLY + '</button>' +
          (own ? '<button type="button" class="text-btn" data-edit-c="' + esc(c.id) + '" data-i18n-title="edit" title="' + t('edit') + '" aria-label="' + t('edit') + '">' + ICON_WAND + '</button>' : '') +
          (own ? '<button type="button" class="text-btn" data-del-c="' + esc(c.id) + '" data-i18n-title="delete" title="' + t('delete') + '" aria-label="' + t('delete') + '">' + ICON_TRASH + '</button>' : '') +
          '</div>' +
          '<div class="forum-replies">' + walk(c.id) + '</div></article>';
      }).join('');
    }
    return walk('');
  }

  function load(slug, root) {
    var me = window.__taMe || null;
    var filesBox = root.querySelector('[data-files]');
    var thread = root.querySelector('[data-thread]');
    var files = getFiles(slug);
    renderFiles(filesBox, files, slug, me);
    var comments = getComments(slug);
    thread.innerHTML = tree(comments, me) || '<p class="lede" data-i18n="noComments">' + t('noComments') + '</p>';
    document.dispatchEvent(new CustomEvent('atm:content'));
  }

  function paint(slug) {
    var root = mountEl(slug);
    if (!root) return;
    root.innerHTML =
      '<h2 data-i18n="files">' + t('files') + '</h2>' +
      '<div class="forum-files" data-files></div>' +
      '<form class="forum-upload" data-upload>' +
        '<label class="forum-upload-btn">' + t('addFile') +
        '<input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.avif,.svg,.doc,.docx,.xls,.xlsx,.csv,.tsv,.zip,.txt,.md,.html,.json,.js,.py,.sql,.css" hidden></label>' +
        '<span class="lede" data-hint></span>' +
      '</form>' +
      '<h2 data-i18n="comments">' + t('comments') + '</h2>' +
      '<form class="forum-compose" data-compose>' +
        '<input type="text" name="name" maxlength="40" placeholder="' + t('yourName') + '" data-i18n-placeholder="yourName">' +
        '<textarea name="text" rows="3" maxlength="2000" required placeholder="' + t('writeComment') + '" data-i18n-placeholder="writeComment"></textarea>' +
        '<input type="hidden" name="parentId">' +
        '<button type="submit" data-i18n="publishComment">' + t('publishComment') + '</button>' +
      '</form>' +
      '<div class="forum-thread" data-thread></div>';
    var nameInput = root.querySelector('[name="name"]');
    try {
      var saved = (typeof window.atmGuestName === 'function' ? window.atmGuestName() : '') ||
        localStorage.getItem('atm_guest_name') || '';
      if (saved) nameInput.value = saved;
      if (window.__taMe && (window.__taMe.name || window.__taMe.handle)) {
        nameInput.value = window.__taMe.name || window.__taMe.handle;
        nameInput.hidden = true;
      }
    } catch (e) {}
    load(slug, root);
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-compose]');
    if (!form) return;
    e.preventDefault();
    var root = form.closest('#guide-forum');
    var slug = root && root.getAttribute('data-slug');
    var text = form.text.value.trim();
    var name = form.name.value.trim();
    var parentId = form.parentId.value;
    if (!slug || !text) return;
    var authorName = name || (window.__taMe && (window.__taMe.name || window.__taMe.handle)) ||
      (typeof window.atmGuestName === 'function' ? window.atmGuestName() : '') ||
      (function () { try { return localStorage.getItem('atm_guest_name') || ''; } catch (e) { return ''; } })();
    if (!authorName) {
      if (typeof window.atmOpenAuth === 'function') window.atmOpenAuth();
      else alert(t('yourName'));
      return;
    }
    try { if (authorName) localStorage.setItem('atm_guest_name', authorName); } catch (err) {}
    var comments = getComments(slug);
    var c = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      slug: slug,
      text: text,
      name: authorName,
      handle: (window.__taMe && window.__taMe.handle) || '',
      picture: (window.__taMe && window.__taMe.picture) || '/avatar.png',
      createdAt: Date.now(),
      created: Date.now(),
      score: 0,
      votes: 0,
      parentId: parentId || '',
      voter: clientId()
    };
    comments.push(c);
    saveComments(slug, comments);
    document.dispatchEvent(new CustomEvent('atm:comment-published', { detail: { slug: slug, comment: c } }));
    if (window.atmToast) window.atmToast('Comentario publicado');
    form.text.value = '';
    form.parentId.value = '';
    load(slug, root);
  });

  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-upload] input[type="file"]');
    if (!input || !input.files || !input.files[0]) return;
    var root = input.closest('#guide-forum');
    var slug = root && root.getAttribute('data-slug');
    var file = input.files[0];
    var hint = root.querySelector('[data-hint]');
    if (file.size > 2500000) {
      if (hint) hint.textContent = t('fileTooBig');
      return;
    }
    var author = (window.__taMe && (window.__taMe.name || window.__taMe.handle)) ||
      (typeof window.atmGuestName === 'function' ? window.atmGuestName() : '') ||
      (function () { try { return localStorage.getItem('atm_guest_name') || ''; } catch (e) { return ''; } })();
    if (!author) {
      if (typeof window.atmOpenAuth === 'function') window.atmOpenAuth();
      input.value = '';
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var data = String(reader.result || '');
      var files = getFiles(slug);
      var f = {
        id: 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        slug: slug,
        name: file.name,
        type: file.type,
        ext: (file.name.split('.').pop() || '').toLowerCase(),
        size: file.size,
        data: data,
        handle: (window.__taMe && window.__taMe.handle) || '',
        nameBy: author,
        createdAt: Date.now(),
        voter: clientId()
      };
      files.push(f);
      saveFiles(slug, files);
      input.value = '';
      load(slug, root);
    };
    reader.readAsDataURL(file);
  });

  document.addEventListener('click', async function (e) {
    var cup = e.target.closest('[data-c-up]');
    if (cup) {
      var box = cup.closest('#guide-forum');
      var slug = box && box.getAttribute('data-slug');
      var cId = cup.getAttribute('data-c-up');
      var comments = getComments(slug);
      var target = comments.find(function (c) { return c.id === cId; });
      if (target) {
        target.score = (target.score || target.votes || 0) + 1;
        target.votes = target.score;
        saveComments(slug, comments);
        load(slug, box);
      }
      return;
    }
    var delC = e.target.closest('[data-del-c]');
    if (delC) {
      var box = delC.closest('#guide-forum');
      var slug = box && box.getAttribute('data-slug');
      if (!await confirmModal(t('confirmDeleteComment'))) return;
      var cId = delC.getAttribute('data-del-c');
      var comments = getComments(slug);
      comments = comments.filter(function (c) { return c.id !== cId; });
      saveComments(slug, comments);
      load(slug, box);
      return;
    }
    var editC = e.target.closest('[data-edit-c]');
    if (editC) {
      var art = editC.closest('.forum-comment');
      var p = art && art.querySelector('[data-c-text]');
      if (!p || art.querySelector('[data-save-c]')) return;
      var prev = p.textContent || '';
      p.hidden = true;
      var area = document.createElement('textarea');
      area.className = 'forum-edit';
      area.value = prev;
      p.insertAdjacentElement('afterend', area);
      var save = document.createElement('button');
      save.type = 'button';
      save.className = 'text-btn';
      save.setAttribute('data-save-c', editC.getAttribute('data-edit-c'));
      save.textContent = t('publishComment');
      area.insertAdjacentElement('afterend', save);
      return;
    }
    var saveC = e.target.closest('[data-save-c]');
    if (saveC) {
      var boxS = saveC.closest('#guide-forum');
      var slugS = boxS && boxS.getAttribute('data-slug');
      var artS = saveC.closest('.forum-comment');
      var areaS = artS && artS.querySelector('textarea.forum-edit');
      var text = areaS ? areaS.value.trim() : '';
      if (!text) return;
      var cId = saveC.getAttribute('data-save-c');
      var comments = getComments(slugS);
      var target = comments.find(function (c) { return c.id === cId; });
      if (target) {
        target.text = text;
        target.editedAt = Date.now();
        target.edited = Date.now();
        saveComments(slugS, comments);
        load(slugS, boxS);
      }
      return;
    }
    var reply = e.target.closest('[data-reply]');
    if (reply) {
      var root = reply.closest('#guide-forum');
      var form = root && root.querySelector('[data-compose]');
      if (form) {
        form.parentId.value = reply.getAttribute('data-reply');
        form.text.focus();
      }
      return;
    }
    if (e.target.closest('[data-close-preview]') || e.target.id === 'file-preview') {
      closePreview();
      return;
    }
    var prev = e.target.closest('[data-preview-file]');
    if (prev) {
      var boxP = prev.closest('#guide-forum');
      var slugP = boxP && boxP.getAttribute('data-slug');
      if (slugP) openPreview(slugP, prev);
      return;
    }
    var del = e.target.closest('[data-del-file]');
    if (!del) return;
    var box = del.closest('#guide-forum');
    var slug = box && box.getAttribute('data-slug');
    var fId = del.getAttribute('data-del-file');
    var files = getFiles(slug);
    files = files.filter(function (f) { return f.id !== fId; });
    saveFiles(slug, files);
    load(slug, box);
  });

  document.addEventListener('atm:me', function () {
    var root = document.getElementById('guide-forum');
    var slug = root && root.getAttribute('data-slug');
    if (slug && root.querySelector('[data-files]')) load(slug, root);
  });
  document.addEventListener('atm:guest', function (ev) {
    var root = document.getElementById('guide-forum');
    var input = root && root.querySelector('[name="name"]');
    if (input && ev.detail && ev.detail.name) input.value = ev.detail.name;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePreview();
  });

  function boot() {
    var slug = slugFromPath();
    if (!slug) return;
    paint(slug);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
