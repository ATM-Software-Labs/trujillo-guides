// Perfil público real (/u/@handle): datos guardados en el servidor al iniciar sesión.
// Sustituye los valores por defecto de user-profile.js cuando el usuario existe.
(function () {
  'use strict';
  function handleFromPath() {
    var m = (location.pathname || '').match(/\/u\/@?([^/?#]+)/);
    return m ? decodeURIComponent(m[1]).replace(/^@+/, '').toLowerCase() : '';
  }
  function set(id, fn) { var el = document.getElementById(id); if (el) fn(el); }
  var PROVIDERS = { google: 'Google', x: 'X', credenciales: 'Correo' };
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }); } catch (e) { return ''; }
  }
  function paint(p, isMe) {
    set('author-name', function (el) { el.textContent = p.name || ('@' + p.handle); });
    set('author-handle', function (el) { el.textContent = '@' + p.handle; });
    set('author-avatar', function (el) { if (p.avatar) { el.src = p.avatar; el.referrerPolicy = 'no-referrer'; } });
    set('author-role', function (el) {
      el.textContent = p.role === 'admin' ? 'Autor principal' : 'Miembro';
    });
    set('author-bio', function (el) {
      var parts = [];
      if (p.provider && PROVIDERS[p.provider]) parts.push('Cuenta de ' + PROVIDERS[p.provider]);
      if (p.joinedAt) parts.push('miembro desde ' + fmtDate(p.joinedAt));
      if (p.role !== 'admin') el.textContent = parts.join(' · ') || 'Miembro de Trujillo Guides';
      else if (parts.length) {
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
        // user-profile.js puede repintar al recibir la sesión: volver a aplicar
        document.addEventListener('atm:me', function () { setTimeout(function () { paint(d.profile, isMe); }, 0); });
      })
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
