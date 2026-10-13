// Cambio de avatar: reduce la imagen a 256 px en el navegador, la guarda en el servidor
// y actualiza el avatar en cabecera, perfil y ajustes sin recargar.
(function () {
  'use strict';
  var MAX_IN = 8 * 1024 * 1024, SIZE = 256, MAX_OUT = 110000;
  function T(k) { var v = window.atmT ? window.atmT(k) : k; return v || k; }
  function err(code) { var e = new Error(T('av_' + code)); e.code = code; return e; }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(err('type')); };
      img.src = url;
    });
  }
  // Recorte cuadrado centrado y salida webp (o jpeg si el navegador no sabe webp)
  function resize(file) {
    if (!file || !/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) return Promise.reject(err('type'));
    if (file.size > MAX_IN) return Promise.reject(err('size'));
    return loadImage(file).then(function (img) {
      var s = Math.min(img.naturalWidth, img.naturalHeight);
      if (!s) throw err('type');
      var c = document.createElement('canvas'); c.width = c.height = SIZE;
      var ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, SIZE, SIZE);
      var out = '';
      [0.85, 0.7, 0.55].some(function (q) {
        out = c.toDataURL('image/webp', q);
        if (out.indexOf('data:image/webp') !== 0) out = c.toDataURL('image/jpeg', q);
        return out.length <= MAX_OUT;
      });
      if (out.length > MAX_OUT) throw err('size');
      return out;
    });
  }
  function save(avatar) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    return fetch('/api/user/profile', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ avatar: avatar }), signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401) throw err('auth');
        if (r.status === 413) throw err('size');
        if (r.status === 415) throw err('type');
        if (!r.ok || !d.ok) throw err('fail');
        return d.avatar || avatar;
      });
    }, function () { throw err('fail'); }).finally(function () { clearTimeout(timer); });
  }
  function apply(avatar) {
    if (!avatar) return;
    if (window.__taMe) { window.__taMe.avatar = avatar; window.__taMe.picture = avatar; }
    ['atm_user', 'atm_studio_session'].forEach(function (k) {
      try { var s = JSON.parse(localStorage.getItem(k) || 'null'); if (s) { s.picture = avatar; s.avatar = avatar; localStorage.setItem(k, JSON.stringify(s)); } } catch (e) {}
    });
    try { var st = JSON.parse(localStorage.getItem('atm_settings') || 'null'); if (st && st.author) { st.author.avatar = avatar; localStorage.setItem('atm_settings', JSON.stringify(st)); } } catch (e) {}
    document.querySelectorAll('#author-avatar, .account-avatar img, .account-chip img, .avatar-live-preview img').forEach(function (img) { img.src = avatar; });
    document.dispatchEvent(new CustomEvent('atm:avatar', { detail: { avatar: avatar } }));
    if (window.__taMe) document.dispatchEvent(new CustomEvent('atm:me', { detail: { user: window.__taMe } }));
  }
  function loggedIn() { var m = window.__taMe; return !!(m && (m.id || m.email) && !m.isStudio); }
  window.atmAvatar = { resize: resize, save: save, apply: apply, loggedIn: loggedIn };
})();
