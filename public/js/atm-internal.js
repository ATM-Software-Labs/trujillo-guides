/*! ATM Software Labs · enlace «Panel interno» (v1)
 * Copia este archivo en cada sitio de *.trujillomingorance.com y cárgalo con defer.
 * Pregunta a guides /api/auth/me (CORS con credenciales). Solo si la sesión es interna
 * (Microsoft Entra ID, tenant de ATM) añade el enlace al pie común y a [data-atm-internal-slot].
 * Es solo un enlace: el panel y cada /api/admin/* comprueban la sesión en el servidor.
 */
(function () {
  'use strict';
  if (window.__atmInternalLoaded) return;
  window.__atmInternalLoaded = true;
  var ME = 'https://guides.trujillomingorance.com/api/auth/me';
  var PANEL = 'https://guides.trujillomingorance.com/admin';
  var L = { es: 'Panel interno', en: 'Internal panel', ca: 'Tauler intern', fr: 'Panneau interne', de: 'Interner Bereich', it: 'Pannello interno', pt: 'Painel interno',
    nl: 'Intern paneel', pl: 'Panel wewnętrzny', sv: 'Intern panel', ru: 'Внутренняя панель', zh: '内部面板', ja: '内部パネル', ko: '내부 패널', ar: 'اللوحة الداخلية', hi: 'आंतरिक पैनल' };
  function label() {
    var l = String(document.documentElement.getAttribute('lang') || 'es').slice(0, 2).toLowerCase();
    return L[l] || L.en;
  }
  function link(cls) {
    var a = document.createElement('a');
    a.href = PANEL;
    a.className = cls || 'atm-internal-link';
    a.setAttribute('data-atm-internal', '');
    a.textContent = label();
    return a;
  }
  function paint(user) {
    window.__atmInternalUser = { name: user.name, handle: user.handle, admin: !!user.admin };
    var ul = document.querySelector('.atm-net__sites');
    if (ul && !ul.querySelector('[data-atm-internal]')) {
      var li = document.createElement('li');
      li.appendChild(link('atm-net__internal'));
      ul.appendChild(li);
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-atm-internal-slot]'), function (slot) {
      if (!slot.querySelector('[data-atm-internal]')) slot.appendChild(link(slot.getAttribute('data-atm-internal-class') || ''));
      slot.hidden = false;
    });
    if (!window.__atmInternalFired) {
      window.__atmInternalFired = true;
      try { document.dispatchEvent(new CustomEvent('atm:internal', { detail: window.__atmInternalUser })); } catch (e) {}
    }
  }
  function relabel() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-atm-internal]'), function (a) { a.textContent = label(); });
  }
  function run() {
    if (!window.fetch) return;
    fetch(ME, { credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var u = d && d.authenticated && d.user;
        if (!(u && u.role === 'internal' && u.provider === 'microsoft')) return;
        paint(u);
        // Pies o menús que se pintan después (apps de una sola página): reintentar unos segundos
        try {
          var mo = new MutationObserver(function () { paint(u); });
          mo.observe(document.body, { childList: true, subtree: true });
          setTimeout(function () { mo.disconnect(); }, 15000);
        } catch (e) {}
      })
      .catch(function () {});
    try { new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
