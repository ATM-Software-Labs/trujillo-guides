// Perfil público real (/u/@handle): datos guardados en el servidor al iniciar sesión.
// Sustituye los valores por defecto de user-profile.js cuando el usuario existe.
(function () {
  'use strict';
  function handleFromPath() {
    var m = (location.pathname || '').match(/\/u\/@?([^/?#]+)/);
    return m ? decodeURIComponent(m[1]).replace(/^@+/, '').toLowerCase() : '';
  }
  function T(k) { return typeof window.atmT === 'function' ? window.atmT(k) : k; }
  function set(id, fn) { var el = document.getElementById(id); if (el) fn(el); }
  var PROVIDERS = { google: 'Google', x: 'X', credenciales: 'Correo' };
  function prov(p) { var v = PROVIDERS[p]; return p === 'credenciales' && window.atmTx ? window.atmTx(v) : v; }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString((window.atmLang && window.atmLang()) || 'es', { month: 'long', year: 'numeric' }); } catch (e) { return ''; }
  }
  function paint(p, isMe) {
    set('author-name', function (el) { el.textContent = p.name || ('@' + p.handle); });
    set('author-handle', function (el) { el.textContent = '@' + p.handle; });
    if (p.avatar) {
      set('avatar-wrap', function (wrap) {
        var img = wrap.querySelector('img#author-avatar');
        if (!img) {
          wrap.innerHTML = '';
          img = document.createElement('img');
          img.id = 'author-avatar';
          img.className = 'profile-large-avatar';
          img.width = 88; img.height = 88; img.alt = '';
          wrap.appendChild(img);
        }
        img.referrerPolicy = 'no-referrer';
        img.src = p.avatar;
      });
    }
    set('author-role', function (el) {
      el.textContent = p.role === 'admin' ? T('role_main') : T('role_member');
    });
    set('author-bio', function (el) {
      var parts = [];
      if (p.provider && PROVIDERS[p.provider]) parts.push(T('pl_account').replace('{p}', prov(p.provider)));
      if (p.joinedAt) parts.push(T('pl_since').replace('{d}', fmtDate(p.joinedAt)));
      if (p.role !== 'admin') el.textContent = parts.join(' · ') || T('role_member');
      else if (parts.length) {
        var old = el.parentNode.querySelector('.profile-joined'); if (old) old.remove();
        var meta = document.createElement('span');
        meta.className = 'profile-joined';
        meta.textContent = parts.join(' · ');
        el.parentNode.insertBefore(meta, el.nextSibling);
      }
    });
    if (p.role !== 'admin') set('author-tags', function (el) { el.hidden = true; });
    if (isMe) set('btn-settings-link', function (el) { el.style.display = ''; });
    document.title = (p.name || p.handle) + ' (@' + p.handle + ') · Trujillo Guides';
  }
  function run() {
    var h = handleFromPath();
    if (!h) return;
    fetch('/api/user/profile?handle=' + encodeURIComponent(h), { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.found) return;
        var me = window.__taMe;
        var isMe = !!(me && String(me.handle || '').replace(/^@+/, '').toLowerCase() === h);
        paint(d.profile, isMe);
        document.addEventListener('atm:avatar', function (e) { if (isMe && e.detail && e.detail.avatar) d.profile.avatar = e.detail.avatar; });
        document.addEventListener('atm:lang', function () { paint(d.profile, isMe); });
        // user-profile.js puede repintar al recibir la sesión: volver a aplicar
        document.addEventListener('atm:me', function () { setTimeout(function () { paint(d.profile, isMe); }, 0); });
      })
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
