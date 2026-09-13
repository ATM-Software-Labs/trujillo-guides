(function () {
  'use strict';

  function t(key) {
    return typeof window.atmT === 'function' ? window.atmT(key) : key;
  }
  async function confirmModal(msg) {
    return typeof window.confirmModal === 'function' ? await window.confirmModal(msg) : window.confirm(msg);
  }
  function clientId() {
    try {
      var id = localStorage.getItem('ta_client');
      if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) || ('c' + Date.now().toString(36) + Math.random().toString(36).slice(2));
        localStorage.setItem('ta_client', id);
      }
      return id;
    } catch (e) { return ''; }
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
  function headers() {
    var h = { 'Content-Type': 'application/json', 'X-Client-Id': clientId() };
    var tok = token();
    if (tok) h.Authorization = 'Bearer ' + tok;
    return h;
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

  function pageHandle() {
    var a = document.querySelector('.poster-handle, a[href*="/u/@"]');
    if (a) {
      var m = (a.getAttribute('href') || a.textContent || '').match(/@([a-z0-9_]+)/i);
      if (m) return m[1].toLowerCase();
    }
    var line = document.querySelector('.meta-line');
    if (line) {
      var m2 = (line.textContent || '').match(/@([a-z0-9_]+)/i);
      if (m2) return m2[1].toLowerCase();
    }
    return '';
  }

  var SLUG_ALIASES = {
    'enterprise-email': 'correo-corporativo-startups',
    'infraestructura-de-correo-corporativo-para-start': 'correo-corporativo-startups',
    'infraestructura-de-correo-corporativo-para-startups-a-coste-0': 'correo-corporativo-startups',
    'correo-corporativo': 'correo-corporativo-startups',
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
    var tagged = document.querySelector('.social-bar[data-slug], #guide-meta-bar[data-slug], .meta-bar[data-slug], #guide-forum[data-slug], #copy-link[data-slug], [data-slug]');
    if (tagged && tagged.getAttribute('data-slug')) {
      var rawTag = tagged.getAttribute('data-slug').toLowerCase().trim();
      if (rawTag) return SLUG_ALIASES[rawTag] || rawTag;
    }
    try {
      var params = new URLSearchParams(window.location.search);
      var qId = params.get('id') || params.get('slug') || params.get('g') || params.get('piece');
      if (qId) {
        var cleanQ = qId.toLowerCase().trim();
        return SLUG_ALIASES[cleanQ] || cleanQ;
      }
    } catch (e) {}
    var p = (location.pathname || '').replace(/\/+$/, '');
    var m = p.match(/^\/(?:guides|g|s)\/([a-z0-9-._]+)/i);
    if (m && m[1]) {
      var cleanP = m[1].toLowerCase().trim();
      if (cleanP !== 'g.html' && cleanP !== 'g' && cleanP !== 'guides' && cleanP !== 's') {
        return SLUG_ALIASES[cleanP] || cleanP;
      }
    }
    return '';
  }
  function savedList() {
    try { return JSON.parse(localStorage.getItem('atm_saved') || '[]'); } catch (e) { return []; }
  }
  function setSaved(list) {
    try { localStorage.setItem('atm_saved', JSON.stringify(list.slice(0, 200))); } catch (e) {}
  }
  function isSaved(slug) {
    return savedList().indexOf(slug) !== -1;
  }

  var ICON_UP = '<svg class="vote-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h2z"/><path d="M7 11V8a3 3 0 0 1 3-3h1v6h6.2a1.8 1.8 0 0 1 1.76 2.17l-1.05 5.1A1.8 1.8 0 0 1 16.15 20H9a2 2 0 0 1-2-2v-7z"/></svg>';
  var ICON_DOWN = '<svg class="vote-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 13V5a1 1 0 0 1 1-1h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2z"/><path d="M17 13v3a3 3 0 0 1-3 3h-1v-6H6.8a1.8 1.8 0 0 1-1.76-2.17l1.05-5.1A1.8 1.8 0 0 1 7.85 4H15a2 2 0 0 1 2 2v7z"/></svg>';
  var ICON_SHARE = '<svg class="tool-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
  var ICON_SAVE = '<svg class="tool-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  var ICON_EDIT = '<svg class="tool-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var ICON_FOLLOW = '<svg class="tool-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>';
  var ICON_PIN = '<svg class="tool-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24z"/></svg>';

  function barHtml() {
    return '<button type="button" class="vote-btn" data-vote="up" data-i18n-title="like" title="' + t('like') + '" aria-label="' + t('like') + '">' + ICON_UP + ' <span data-up-count>0</span></button>' +
      '<button type="button" class="vote-btn" data-vote="down" data-i18n-title="dislike" title="' + t('dislike') + '" aria-label="' + t('dislike') + '">' + ICON_DOWN + ' <span data-down-count>0</span></button>' +
      '<button type="button" class="tool-btn" data-share data-i18n-title="share" title="' + t('share') + '" aria-label="' + t('share') + '">' + ICON_SHARE + '</button>' +
      '<button type="button" class="tool-btn" data-save data-i18n-title="save" title="' + t('save') + '" aria-label="' + t('save') + '">' + ICON_SAVE + '</button>' +
      '<button type="button" class="tool-btn" data-edit data-i18n-title="edit" title="' + t('edit') + '" aria-label="' + t('edit') + '" hidden>' + ICON_EDIT + '</button>' +
      '<button type="button" class="tool-btn" data-follow data-i18n-title="follow" title="' + t('follow') + '" aria-label="' + t('follow') + '">' + ICON_FOLLOW + '</button>' +
      '<button type="button" class="pin-btn" data-pin data-i18n-title="pin" title="' + t('pin') + '" aria-label="' + t('pin') + '" hidden>' + ICON_PIN + '</button>' +
      '<button type="button" class="tool-btn" data-delete hidden data-i18n="delete">' + t('delete') + '</button>';
  }

  function setBar(bar, data) {
    if (!bar || !data) return;
    var up = bar.querySelector('[data-up-count]');
    var down = bar.querySelector('[data-down-count]');
    if (up) up.textContent = String(data.up || data.likes || 0);
    if (down) down.textContent = String(data.down || 0);
    var upBtn = bar.querySelector('[data-vote="up"]');
    var downBtn = bar.querySelector('[data-vote="down"]');
    if (upBtn) upBtn.classList.toggle('is-on', !!data.liked);
    if (downBtn) downBtn.classList.toggle('is-on', !!data.disliked);
    var pin = bar.querySelector('[data-pin]');
    if (pin) {
      pin.hidden = data.canPin === false;
      pin.innerHTML = ICON_PIN;
      pin.title = data.pinned ? t('pinned') : t('pin');
      pin.setAttribute('aria-label', pin.title);
      pin.classList.toggle('is-on', !!data.pinned);
    }
    var save = bar.querySelector('[data-save]');
    if (save) {
      var on = isSaved(bar.getAttribute('data-slug'));
      save.innerHTML = ICON_SAVE;
      save.title = on ? t('saved') : t('save');
      save.setAttribute('aria-label', save.title);
      save.classList.toggle('is-on', on);
    }
    var follow = bar.querySelector('[data-follow]');
    if (follow) {
      var handle = bar.getAttribute('data-handle') || '';
      var following = (window.__taFollowing || []).indexOf(handle) !== -1;
      follow.hidden = !handle || (window.__taMe && window.__taMe.handle === handle);
      follow.innerHTML = ICON_FOLLOW;
      follow.title = following ? t('following') : t('follow');
      follow.setAttribute('aria-label', follow.title);
      follow.classList.toggle('is-on', following);
    }
    var edit = bar.querySelector('[data-edit]');
    var del = bar.querySelector('[data-delete]');
    var h = (bar.getAttribute('data-handle') || data.handle || pageHandle() || '').replace(/^@/, '').toLowerCase();
    var me = window.__taMe;
    var isAuthor = !!(me && me.handle && h && String(me.handle).replace(/^@/, '').toLowerCase() === h);
    if (edit) {
      edit.hidden = !isAuthor;
      if (isAuthor) edit.removeAttribute('hidden');
      else edit.setAttribute('hidden', '');
    }
    if (del) del.hidden = !isAuthor;
  }

  function getSocialStats(slug) {
    try {
      return JSON.parse(localStorage.getItem('atm_social_' + slug) || '{}');
    } catch (e) { return {}; }
  }

  function setSocialStats(slug, stats) {
    try {
      localStorage.setItem('atm_social_' + slug, JSON.stringify(stats));
    } catch (e) {}
  }

  async function hydrate(forcedSlug) {
    var slug = (forcedSlug || slugFromPath() || '').toLowerCase().trim();
    var bars = Array.from(document.querySelectorAll('.social-bar'));
    if (!bars.length && slug) {
      var meta = document.querySelector('#guide-meta-bar, .meta-bar, .poster-bar, header.doc-header');
      if (meta) {
        var bar = document.createElement('div');
        bar.className = 'social-bar';
        bar.setAttribute('data-slug', slug);
        bar.innerHTML = barHtml();
        meta.insertAdjacentElement('afterend', bar);
        bars = [bar];
      }
    }
    if (slug && bars.length) {
      bars.forEach(function (b) {
        if (!b.getAttribute('data-slug')) b.setAttribute('data-slug', slug);
      });
    }
    var me = null;
    try {
      me = JSON.parse(localStorage.getItem('trujillo_ai_user') || localStorage.getItem('auth_user') || 'null');
    } catch (e) {}
    window.__taFollowing = [];
    try {
      window.__taFollowing = JSON.parse(localStorage.getItem('atm_following') || '[]');
    } catch (e) {}
    window.__taMe = me;
    document.dispatchEvent(new CustomEvent('atm:me'));
    var profile = document.getElementById('me-profile');
    if (profile && me && me.handle) {
      profile.hidden = false;
      profile.href = '/u/@' + me.handle;
    }
    if (!bars.length) return;

    bars.forEach(function (b) {
      var s = b.getAttribute('data-slug') || slug || slugFromPath();
      if (!s) return;
      if (!b.getAttribute('data-slug')) b.setAttribute('data-slug', s);
      if (!b.querySelector('[data-vote]')) {
        b.innerHTML = barHtml();
      }
      var stats = getSocialStats(s);
      var handle = b.getAttribute('data-handle') || pageHandle();
      if (handle) b.setAttribute('data-handle', handle);
      var canPin = !!(me && (me.owner || (me.handle && handle && me.handle === handle)));
      setBar(b, {
        likes: stats.likes || 0,
        up: stats.up || stats.likes || 0,
        down: stats.down || 0,
        liked: !!stats.liked,
        disliked: !!stats.disliked,
        pinned: !!stats.pinned,
        canPin: canPin
      });
    });
  }

  document.addEventListener('click', async function (e) {
    var bar = e.target.closest('.social-bar');
    var slug = (bar && bar.getAttribute('data-slug')) || slugFromPath();
    var vote = e.target.closest('[data-vote]');
    if (vote && slug) {
      e.preventDefault();
      var dir = vote.getAttribute('data-vote');
      var stats = getSocialStats(slug);
      var up = stats.up || stats.likes || 0;
      var down = stats.down || 0;
      var wasLiked = !!stats.liked;
      var wasDisliked = !!stats.disliked;

      if (dir === 'up') {
        if (wasLiked) {
          stats.liked = false;
          stats.up = Math.max(0, up - 1);
        } else {
          stats.liked = true;
          stats.up = up + 1;
          if (wasDisliked) {
            stats.disliked = false;
            stats.down = Math.max(0, down - 1);
          }
        }
      } else if (dir === 'down') {
        if (wasDisliked) {
          stats.disliked = false;
          stats.down = Math.max(0, down - 1);
        } else {
          stats.disliked = true;
          stats.down = down + 1;
          if (wasLiked) {
            stats.liked = false;
            stats.up = Math.max(0, up - 1);
          }
        }
      }
      stats.likes = stats.up;
      setSocialStats(slug, stats);
      document.querySelectorAll('.social-bar[data-slug="' + slug + '"]').forEach(function (b) {
        setBar(b, Object.assign({ canPin: true }, stats));
      });
      return;
    }
    var editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      e.preventDefault();
      var b = editBtn.closest('.social-bar, .poster-bar') || document.querySelector('.social-bar, .poster-bar');
      var s = (b && b.getAttribute('data-slug')) || slugFromPath();
      if (s) location.href = '/write?slug=' + encodeURIComponent(s);
      return;
    }
    var delBtn = e.target.closest('[data-delete]');
    if (delBtn && slug) {
      e.preventDefault();
      if (!await confirmModal(t('confirmDelete'))) return;
      try {
        var localGuides = JSON.parse(localStorage.getItem('atm_local_guides') || '[]');
        localGuides = localGuides.filter(function (g) { return g.slug !== slug; });
        localStorage.setItem('atm_local_guides', JSON.stringify(localGuides));
      } catch (err) {}
      location.href = '/';
      return;
    }
    var pin = e.target.closest('[data-pin]');
    if (pin && slug) {
      e.preventDefault();
      var stats = getSocialStats(slug);
      stats.pinned = !stats.pinned;
      setSocialStats(slug, stats);
      document.querySelectorAll('.social-bar[data-slug="' + slug + '"]').forEach(function (b) {
        setBar(b, Object.assign({ canPin: true }, stats));
      });
      return;
    }
    var share = e.target.closest('[data-share]');
    if (share) {
      e.preventDefault();
      var url = location.href;
      function done() {
        share.classList.add('is-on');
        share.title = t('copied');
        share.setAttribute('aria-label', t('copied'));
        setTimeout(function () {
          share.classList.remove('is-on');
          share.title = t('share');
          share.setAttribute('aria-label', t('share'));
        }, 1600);
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(done).catch(function () {
          window.prompt(t('share'), url);
          done();
        });
      } else {
        window.prompt(t('share'), url);
        done();
      }
      return;
    }
    var save = e.target.closest('[data-save]');
    if (save && slug) {
      e.preventDefault();
      var list = savedList();
      var i = list.indexOf(slug);
      if (i >= 0) list.splice(i, 1);
      else list.unshift(slug);
      setSaved(list);
      document.querySelectorAll('.social-bar[data-slug="' + slug + '"]').forEach(function (b) {
        var btn = b.querySelector('[data-save]');
        if (!btn) return;
        var on = isSaved(slug);
        btn.innerHTML = ICON_SAVE;
        btn.title = on ? t('saved') : t('save');
        btn.setAttribute('aria-label', btn.title);
        btn.classList.toggle('is-on', on);
      });
      return;
    }
    var follow = e.target.closest('[data-follow]');
    if (follow && bar) {
      e.preventDefault();
      var handle = bar.getAttribute('data-handle');
      if (!handle) return;
      var following = window.__taFollowing || [];
      var fIdx = following.indexOf(handle);
      if (fIdx >= 0) following.splice(fIdx, 1);
      else following.push(handle);
      window.__taFollowing = following;
      try { localStorage.setItem('atm_following', JSON.stringify(following)); } catch (err) {}
      hydrate();
    }
  });

  window.atmHydrateSocial = hydrate;
  document.addEventListener('atm:content', function (e) {
    var slug = e && e.detail && e.detail.slug;
    hydrate(slug);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { hydrate(); });
  else hydrate();
})();

