(function () {
  'use strict';

  var SUN = '<svg class="sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var MOON = '<svg class="moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function themeNow() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(next) {
    next = next === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('trujillo_theme', next);
      localStorage.setItem('atm_theme', next);
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#ffffff' : '#09090b');
  }

  function themeButtonHtml() {
    var t = typeof window.atmT === 'function' ? window.atmT : function (k) { return k; };
    return '<button type="button" class="theme-toggle-btn" id="theme-btn" data-i18n-title="theme" title="' + t('theme') + '" aria-label="' + t('theme') + '">' +
      SUN + MOON + '</button>';
  }

  function langPickerHtml() {
    var current = (typeof window.atmLang === 'function' && window.atmLang()) || 'es';
    var langs = window.ATM_LANGS || [];
    var meta = langs.filter(function (l) { return (l.id === current || l.code === current); })[0] || { id: 'es', code: 'es', flag: '🇪🇸', name: 'Español' };
    var opts = langs.map(function (l) {
      var code = l.code || l.id;
      return '<button type="button" class="lang-option' + (code === current ? ' active' : '') +
        '" data-lang="' + code + '" role="option"><span class="flag">' + ((window.atmFlag && window.atmFlag(code)) || l.flag) +
        '</span><span>' + l.name + '</span></button>';
    }).join('');
    return '<div class="lang-picker" id="lang-picker">' +
      '<button type="button" class="lang-flag-btn" id="lang-flag-btn" aria-haspopup="listbox" title="' + meta.name + '">' +
      '<span class="flag">' + ((window.atmFlag && window.atmFlag(meta.code || meta.id)) || meta.flag) + '</span><span class="lang-code">' + (meta.code || meta.id).toUpperCase() + '</span></button>' +
      '<div class="lang-menu" id="lang-menu" role="listbox" hidden>' + opts + '</div></div>';
  }

  function isShare() {
    return document.body && document.body.getAttribute('data-share') === '1';
  }

  function guestName() {
    try { return (localStorage.getItem('atm_guest_name') || '').trim(); } catch (e) { return ''; }
  }

  function setGuestName(name) {
    name = String(name || '').trim().slice(0, 40);
    try { if (name) localStorage.setItem('atm_guest_name', name); } catch (e) {}
    return name;
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function firstName(full) {
    var s = String(full || '').trim();
    if (!s) return '';
    if (s.charAt(0) === '@') s = s.slice(1);
    if (s.indexOf('@') !== -1 && s.indexOf(' ') === -1) s = s.split('@')[0];
    return s.split(/\s+/)[0];
  }

  function initials(name) {
    if (!name) return 'AT';
    var parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  function avatarHtml(src, name) {
    if (src) return '<img class="account-photo" src="' + esc(src) + '" alt="" width="24" height="24">';
    return '<span class="account-photo account-initials" aria-hidden="true">' + esc(initials(name)) + '</span>';
  }

  function accountHtml() {
    var t = typeof window.atmT === 'function' ? window.atmT : function (k) { return k; };
    var me = window.__taMe;
    if (me && (me.handle || me.name || me.username || me.email)) {
      var displayName = me.name || me.username || me.handle || me.email || 'Usuario';
      var label = firstName(displayName);
      var cleanHandle = (me.handle || me.username || 'user').replace(/^@+/, '');
      return '<div class="account-menu-wrap" id="account-menu-wrap" data-notranslate>' +
        '<button type="button" class="account-chip nav-profile-btn bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200" id="account-btn" aria-haspopup="menu" aria-expanded="false" title="' + esc(displayName) + '">' +
        avatarHtml(me.avatar || me.picture, displayName) +
        (label ? '<span class="account-first">' + esc(label) + '</span>' : '') +
        '</button>' +
        '<div class="account-menu" id="account-menu" hidden role="menu">' +
        '<a href="/write" role="menuitem" data-i18n="newGuide">' + t('newGuide') + '</a>' +
        '<div class="account-menu-head"><strong>' + esc(displayName) + '</strong><span>@' + esc(cleanHandle) + '</span></div>' +
        '<a href="/u/@' + encodeURIComponent(cleanHandle) + '" role="menuitem">' + (window.atmTx ? window.atmTx('Mi perfil') : 'Mi perfil') + '</a>' +
        '<a href="/settings" role="menuitem" data-i18n="settings">' + (t('settings') || 'Configuración') + '</a>' +
        '<a href="/achievements" role="menuitem">' + (window.atmTx ? window.atmTx('Logros') : 'Logros') + '</a>' +
        (me.role === 'internal' ? '<a href="/admin" role="menuitem" class="account-menu-admin">' + (window.atmTx ? window.atmTx('Panel interno') : 'Panel interno') + '</a>' : '') +
        '<a href="https://trujillomingorance.com/" role="menuitem">trujillomingorance.com</a>' +
        '<button type="button" role="menuitem" data-logout>' + ((window.atmT && window.atmT('logoutFull')) || 'Cerrar sesión') + '</button>' +
        '</div></div>';
    }
    var g = guestName();
    if (g && g !== 'Usuario') {
      var gFirst = firstName(g);
      var guestHandle = (g || 'guest').toLowerCase().replace(/[^a-z0-9_]/g, '');
      return '<div class="account-menu-wrap" id="account-menu-wrap" data-notranslate>' +
        '<button type="button" class="account-chip nav-profile-btn bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200" id="account-btn" aria-haspopup="menu" aria-expanded="false" title="' + esc(g) + '">' +
        avatarHtml('', g) +
        (gFirst ? '<span class="account-first">' + esc(gFirst) + '</span>' : '') +
        '</button>' +
        '<div class="account-menu" id="account-menu" hidden role="menu">' +
        '<a href="/write" role="menuitem" data-i18n="newGuide">' + t('newGuide') + '</a>' +
        '<a href="/u/@' + encodeURIComponent(guestHandle || 'atrumin16') + '" role="menuitem" data-i18n="profile">' + (t('profile') || 'Perfil') + '</a>' +
        '<a href="/settings" role="menuitem" data-i18n="settings">' + (t('settings') || 'Configuración') + '</a>' +
        '<button type="button" role="menuitem" data-open-auth data-i18n="changeName">' + t('changeName') + '</button>' +
        '<button type="button" role="menuitem" data-logout>' + ((window.atmT && window.atmT('logoutFull')) || 'Cerrar sesión') + '</button>' +
        '</div></div>';
    }
    return '<button type="button" class="account-chip account-login nav-profile-btn" id="auth-open" data-open-auth data-i18n="login">' +
      t('login') + '</button>';
  }

  function paintAccount() {
    var actions = document.querySelector('.docs-topbar .topbar-actions');
    if (!actions) return;
    actions.querySelectorAll('#account-menu-wrap, #me-profile, #guest-chip, #auth-open, .account-chip, .nav-profile-btn, #nav-user-btn').forEach(function (el) {
      el.remove();
    });
    actions.insertAdjacentHTML('beforeend', accountHtml());
  }

  function closeAccountMenu() {
    var menu = document.getElementById('account-menu');
    var btn = document.getElementById('account-btn');
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function setSharedCookie(name, val, maxAge) {
    var host = location.hostname;
    var domain = '';
    if (host.indexOf('trujillomingorance.com') !== -1) {
      domain = '; domain=.trujillomingorance.com';
    } else if (host.indexOf('pages.dev') !== -1) {
      domain = '; domain=' + host;
    }
    var exp = typeof maxAge === 'number' ? '; Max-Age=' + maxAge : '';
    document.cookie = name + '=' + encodeURIComponent(val) + '; Path=/; SameSite=Lax; Secure' + domain + exp;
  }

  function getSharedCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function studioLoginUrl(popup) {
    var redirect = encodeURIComponent(window.location.href);
    return 'https://ai.trujillomingorance.com/login?redirect_to=' + redirect +
      '&return=' + redirect + (popup ? '&popup=1' : '');
  }

  function openStudioLogin() {
    var w = 520;
    var h = 680;
    var y = Math.max(0, Math.round(((window.top.outerHeight || window.innerHeight) - h) / 2 + (window.top.screenY || window.screenY || 0)));
    var x = Math.max(0, Math.round(((window.top.outerWidth || window.innerWidth) - w) / 2 + (window.top.screenX || window.screenX || 0)));
    var popup = window.open(
      studioLoginUrl(true),
      'trujillo_ai_login',
      'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=' + w + ',height=' + h + ',top=' + y + ',left=' + x
    );
    if (popup) {
      popup.focus();
    } else {
      location.href = studioLoginUrl(false);
    }
  }

  function logout() {
    try {
      localStorage.removeItem('trujillo_ai_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('atm_guest_name');
      localStorage.removeItem('atm_user');
      localStorage.removeItem('trujillo_ai_user');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('atm_studio_session');
      // Purge all user achievements keys and cached progress to avoid session leaks
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (k && (k.indexOf('achievements_') === 0 || k.indexOf('atm_achievements') === 0 || k.indexOf('atm_used_langs') === 0 || k === 'achievements_guest')) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}
    try {
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    window.__taMe = null;
    if (window.ATM_ACHIEVEMENTS && window.ATM_ACHIEVEMENTS.clearUserAchievements) {
      window.ATM_ACHIEVEMENTS.clearUserAchievements();
    }
    setSharedCookie('atm_session', '', 0);
    setSharedCookie('ta_session', '', 0);
    setSharedCookie('auth_token', '', 0);
    setSharedCookie('session_active', '', 0);
    closeAccountMenu();
    paintAccount();
    document.dispatchEvent(new CustomEvent('atm:logout'));
    var nameInput = document.querySelector('#guide-forum [name="name"]');
    if (nameInput) {
      nameInput.value = '';
      nameInput.hidden = false;
    }
  }

  function setSharedToken(tok, user) {
    if (!tok) return;
    try {
      localStorage.setItem('trujillo_ai_token', tok);
      localStorage.setItem('auth_token', tok);
      localStorage.setItem('trujillo_auth_token', tok);
      if (user) {
        localStorage.setItem('trujillo_ai_user', JSON.stringify(user));
        localStorage.setItem('auth_user', JSON.stringify(user));
        if (user.name) localStorage.setItem('atm_guest_name', user.name);
      }
    } catch (e) {}
    setSharedCookie('ta_session', tok);
    setSharedCookie('auth_token', tok);
    setSharedCookie('session_active', '1');
  }

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'AUTH_SUCCESS' && event.data.token) {
      setSharedToken(event.data.token, event.data.user);
      closeAuth();
      location.reload();
    }
  });

  function authModalHtml() {
    return '<div id="auth-modal" class="auth-backdrop" style="display: none;" hidden>' +
      '<div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-subtitle">' +
      '<span class="auth-grabber" aria-hidden="true"></span>' +
      '<button type="button" class="auth-close-btn" id="auth-modal-close" data-close-auth data-i18n-title="close" aria-label="' + ((window.atmT && window.atmT('close')) || 'Cerrar') + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<div class="auth-header">' +
      '<div class="auth-icon-badge">' +
      '<img src="/avatar.png" alt="" width="28" height="28">' +
      '</div>' +
      '<h2 class="auth-title" id="auth-title" data-tx="Entra en Trujillo Guides">Entra en Trujillo Guides</h2>' +
      '<p class="auth-subtitle" id="auth-subtitle" data-tx="Publica guías, guarda favoritas y sincroniza borradores.">Publica guías, guarda favoritas y sincroniza borradores.</p>' +
      '</div>' +
      '<div class="auth-tabs" role="tablist" aria-label="Modo de acceso" data-tx-aria="Modo de acceso">' +
      '<button type="button" class="auth-tab active" id="tab-auth-login" data-tx="Acceder">Acceder</button>' +
      '<button type="button" class="auth-tab" id="tab-auth-register" data-tx="Crear cuenta">Crear cuenta</button>' +
      '</div>' +
      '<div class="auth-social-buttons">' +
      '<div class="btn-social-google-wrap">' +
      '<button type="button" class="auth-social-btn" id="btn-login-google" data-oauth="google">' +
      '<svg width="18" height="18" viewBox="0 0 24 24">' +
      '<path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>' +
      '<path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>' +
      '<path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"/>' +
      '<path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>' +
      '</svg>' +
      '<span data-tx="Continuar con Google">Continuar con Google</span>' +
      '</button>' +
      '<div id="google-btn-overlay" class="google-btn-overlay"></div>' +
      '</div>' +
      '<button type="button" class="auth-social-btn" id="btn-login-x" data-oauth="x">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' +
      '</svg>' +
      '<span data-tx="Continuar con X">Continuar con X</span>' +
      '</button>' +
      '<button type="button" class="auth-social-btn auth-provider-ms" id="btn-login-ms" data-oauth="microsoft" hidden>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 2h9.5v9.5H2zM12.5 2H22v9.5h-9.5zM2 12.5h9.5V22H2zM12.5 12.5H22V22h-9.5z" opacity=".9"/></svg>' +
      '<span data-tx="Continuar con Microsoft">Continuar con Microsoft</span>' +
      '</button>' +
      '</div>' +
      '<div class="auth-divider"><span data-tx="o continúa con correo">o continúa con correo</span></div>' +
      '<div id="auth-msg" class="auth-msg" role="alert" aria-live="polite" hidden></div>' +
      '<form id="auth-form" novalidate onsubmit="event.preventDefault();">' +
      '<div id="auth-field-name" style="display: none; margin-bottom: 12px;">' +
      '<label class="auth-input-label" for="auth-name-input" data-tx="Nombre">Nombre</label>' +
      '<input type="text" class="auth-input" placeholder="Tu nombre" data-tx-ph="Tu nombre" id="auth-name-input">' +
      '</div>' +
      '<div style="margin-bottom: 12px;">' +
      '<label class="auth-input-label" for="auth-email-input" data-tx="Correo electrónico">Correo electrónico</label>' +
      '<input type="email" class="auth-input" placeholder="tu@correo.com" data-tx-ph="tu@correo.com" id="auth-email-input" autocomplete="email" inputmode="email" required>' +
      '</div>' +
      '<div style="margin-bottom: 16px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">' +
      '<label class="auth-input-label" for="auth-pwd-input" data-tx="Contraseña">Contraseña</label>' +
      '<a href="#" class="auth-forgot-link" id="auth-forgot-pwd" data-tx="¿Olvidaste la contraseña?">¿Olvidaste la contraseña?</a>' +
      '</div>' +
      '<div class="auth-pwd-wrap">' +
      '<input type="password" class="auth-input" placeholder="Mínimo 8 caracteres" data-tx-ph="Mínimo 8 caracteres" id="auth-pwd-input" autocomplete="current-password" minlength="8" required>' +
      '<button type="button" class="auth-pwd-toggle" id="auth-pwd-toggle" aria-label="Mostrar contraseña" data-tx-aria="Mostrar contraseña" aria-pressed="false">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>' +
      '</button>' +
      '</div>' +
      '</div>' +
      '<button type="submit" class="auth-submit-btn" id="auth-submit-action"><span class="auth-spinner" aria-hidden="true"></span><span class="auth-submit-label" data-tx="Acceder">Acceder</span></button>' +
      '</form>' +
      '<div class="auth-guest-wrap" style="text-align: center; margin-top: 14px;">' +
      '<button type="button" class="auth-guest-btn" id="auth-guest-action" data-tx="Continuar como invitado →">Continuar como invitado &rarr;</button>' +
      '</div>' +
      '<div class="auth-footer-links">' +
      '<a href="/legal/terms" data-tx="Términos">Términos</a>' +
      '<span>·</span>' +
      '<a href="/legal/privacy" data-tx="Privacidad">Privacidad</a>' +
      '<span>·</span>' +
      '<a href="https://ai.trujillomingorance.com" target="_blank" rel="noopener">ai.trujillomingorance.com</a>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  var GOOGLE_CLIENT_ID = '161745150528-5pb84k9upvamvlvnc7lg6nr1ku74vc4a.apps.googleusercontent.com';

  function ensureGoogleGsi() {
    if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
    return new Promise(function (resolve) {
      var existing = document.getElementById('google-gsi-script');
      if (existing) {
        var interval = setInterval(function () {
          if (window.google && window.google.accounts && window.google.accounts.id) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
        setTimeout(function () { clearInterval(interval); resolve(); }, 3000);
        return;
      }
      var s = document.createElement('script');
      s.id = 'google-gsi-script';
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }

  function deferMountGoogle() {
    var go = function () {
      if (window.requestIdleCallback) window.requestIdleCallback(mountGoogle, { timeout: 4000 });
      else setTimeout(mountGoogle, 1500);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }

  function mountGoogle() {
    ensureGoogleGsi().then(function () {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          ux_mode: 'popup'
        });
        var slot = document.getElementById('google-btn-overlay');
        if (slot && !slot.getAttribute('data-ready')) {
          window.google.accounts.id.renderButton(slot, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: Math.max(slot.parentElement ? slot.parentElement.offsetWidth : 350, 280),
            text: 'continue_with'
          });
          slot.setAttribute('data-ready', '1');
        }
      } catch (err) {
        console.warn('Google GSI mount error:', err);
      }
    });
  }

  async function handleGoogleCredential(response) {
    if (!response || !response.credential) return;
    try {
      var res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential })
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión con Google');
      if (data.token) {
        setSharedToken(data.token, data.user);
      }
      window.__taMe = data.user;
      closeAuth();
      paintAccount();
      location.reload();
    } catch (err) {
      alert((window.atmTx || String)(err.message || 'No se pudo iniciar sesión con Google'));
    }
  }

  function bindAuthModal() {
    var modal = document.getElementById('auth-modal');
    if (!modal || modal.getAttribute('data-bound') === 'true') return;
    modal.setAttribute('data-bound', 'true');

    var closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeAuth();
      });
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeAuth();
    });

    var tabLogin = document.getElementById('tab-auth-login');
    var tabReg = document.getElementById('tab-auth-register');
    var fieldName = document.getElementById('auth-field-name');
    var submitBtn = document.getElementById('auth-submit-action');
    var pwdEl = document.getElementById('auth-pwd-input');
    var pwdToggle = document.getElementById('auth-pwd-toggle');
    if (pwdToggle && pwdEl) {
      pwdToggle.addEventListener('click', function () {
        var show = pwdEl.type === 'password';
        pwdEl.type = show ? 'text' : 'password';
        pwdToggle.setAttribute('aria-pressed', show ? 'true' : 'false');
        pwdToggle.setAttribute('aria-label', (window.atmTx || String)(show ? 'Ocultar contraseña' : 'Mostrar contraseña'));
      });
    }

    if (tabLogin && tabReg) {
      tabLogin.addEventListener('click', function (e) {
        e.preventDefault();
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
        if (fieldName) fieldName.style.display = 'none';
        if (submitBtn) submitBtn.querySelector('.auth-submit-label').textContent = (window.atmTx || String)('Acceder'); if (pwdEl) pwdEl.setAttribute('autocomplete', 'current-password'); authMsg('');
      });

      tabReg.addEventListener('click', function (e) {
        e.preventDefault();
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
        if (fieldName) fieldName.style.display = 'block';
        if (submitBtn) submitBtn.querySelector('.auth-submit-label').textContent = (window.atmTx || String)('Crear cuenta'); if (pwdEl) pwdEl.setAttribute('autocomplete', 'new-password'); authMsg('');
      });
    }

    var guestBtn = document.getElementById('auth-guest-action');
    if (guestBtn) {
      guestBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var current = guestName();
        if (!current) {
          setGuestName((window.atmTx || String)('Invitado'));
        }
        closeAuth();
        paintAccount();
        document.dispatchEvent(new CustomEvent('atm:guest', { detail: { name: guestName() } }));
        if (typeof window.atmApplyUi === 'function') window.atmApplyUi(window.atmLang());
      });
    }

    // The Google button lives in the (hidden) auth modal: load GSI once the page is idle
    // instead of competing with first paint. openAuth() still mounts it immediately.
    deferMountGoogle();

    var googleBtn = document.getElementById('btn-login-google') || document.getElementById('btn-oauth-google');
    if (googleBtn) {
      googleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // One Tap (prompt) a menudo no se muestra (cookies de terceros, FedCM, cooldown)
        // y el clic no hacía nada. Si no aparece, usamos el login por redirección.
        if (window.google && window.google.accounts && window.google.accounts.id) {
          try {
            window.google.accounts.id.prompt(function (n) {
              if (n && ((n.isNotDisplayed && n.isNotDisplayed()) || (n.isSkippedMoment && n.isSkippedMoment()))) {
                openStudioLogin();
              }
            });
            return;
          } catch (err) {}
        }
        openStudioLogin();
      });
    }

    var xBtn = document.getElementById('btn-login-x') || document.getElementById('btn-oauth-x');
    if (xBtn) {
      xBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '/api/auth/x?returnTo=' + encodeURIComponent(window.location.pathname + window.location.search);
      });
    }

    var msBtn = document.getElementById('btn-login-ms');
    if (msBtn) {
      msBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '/api/auth/microsoft?returnTo=' + encodeURIComponent(window.location.pathname + window.location.search);
      });
      // Solo visible si el servidor tiene configurado Microsoft Entra ID
      fetch('/api/auth/providers', { cache: 'default' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (p) {
        if (p && p.microsoft) msBtn.hidden = false;
      }).catch(function () {});
    }

    var forgotBtn = document.getElementById('auth-forgot-pwd');
    if (forgotBtn) {
      forgotBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        var emailInput = document.getElementById('auth-email-input');
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email) {
          authMsg('Escribe tu correo y te enviaremos un enlace para restablecer la contraseña.', 'error', emailInput);
          return;
        }
        try {
          var res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
          });
          var data = await res.json();
          authMsg(data.message || 'Si tu correo está registrado, recibirás un enlace válido durante 15 minutos.', 'ok');
        } catch (err) {
          authMsg('No hemos podido enviar el enlace. Inténtalo de nuevo en un momento.', 'error');
        }
      });
    }

    var form = document.getElementById('auth-form');
    if (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var emailInput = document.getElementById('auth-email-input');
        var nameInput = document.getElementById('auth-name-input');
        var pwdInput = document.getElementById('auth-pwd-input');
        var email = emailInput ? emailInput.value.trim() : '';
        var name = nameInput ? nameInput.value.trim() : '';
        var pwd = pwdInput ? pwdInput.value : '';

        authMsg('');
        if (!email || (emailInput && !emailInput.checkValidity())) {
          authMsg('Introduce un correo electrónico válido.', 'error', emailInput);
          return;
        }
        if (!pwd || pwd.length < 8) {
          authMsg('La contraseña debe tener al menos 8 caracteres.', 'error', pwdInput);
          return;
        }

        var isRegister = tabReg && tabReg.classList.contains('active');

        authLoading(true);
        try {
          if (isRegister) {
            var regRes = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, password: pwd, name: name })
            });
            var regData = await regRes.json();
            if (!regRes.ok) {
              authMsg(regData.error || 'No se ha podido crear la cuenta.', 'error');
              return;
            }
            authMsg(regData.message || 'Cuenta creada. Revisa tu correo para verificarla.', 'ok');
          } else {
            var loginRes = await fetch('/api/auth/login', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, password: pwd })
            });
            var loginData = await loginRes.json();
            if (!loginRes.ok) {
              authMsg(loginData.error || 'Correo o contraseña incorrectos.', 'error', pwdInput);
              return;
            }
            window.__taMe = loginData.user;
            paintAccount();
            closeAuth();
            window.location.reload();
          }
        } catch (err) {
          authMsg('No hay conexión con el servicio de acceso. Inténtalo de nuevo.', 'error');
        } finally {
          authLoading(false);
        }
      });
    }
  }

  function authMsg(text, type, field) {
    var box = document.getElementById('auth-msg');
    document.querySelectorAll('#auth-modal .auth-input[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    if (!box) return;
    if (!text) { box.hidden = true; box.textContent = ''; return; }
    box.textContent = window.atmTx ? window.atmTx(text) : text;
    box.className = 'auth-msg ' + (type === 'ok' ? 'is-ok' : 'is-error');
    box.hidden = false;
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }

  function authLoading(on) {
    var btn = document.getElementById('auth-submit-action');
    if (!btn) return;
    btn.disabled = !!on;
    btn.classList.toggle('is-loading', !!on);
    btn.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  var authLastFocus = null;
  function authTrap(e) {
    var modal = document.getElementById('auth-modal');
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeAuth(); return; }
    if (e.key !== 'Tab') return;
    var items = Array.prototype.filter.call(
      modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (el) { return !el.disabled && el.offsetParent !== null; }
    );
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function ensureAuthModal() {
    if (document.getElementById('auth-modal')) return;
    document.body.insertAdjacentHTML('beforeend', authModalHtml());
    bindAuthModal();
  }

  function openAuth() {
    ensureAuthModal();
    var modal = document.getElementById('auth-modal');
    if (!modal) return;
    authLastFocus = document.activeElement;
    modal.style.display = 'flex';
    modal.removeAttribute('hidden');
    document.documentElement.classList.add('auth-open');
    document.addEventListener('keydown', authTrap);
    bindAuthModal();
    mountGoogle();
    var emailInput = document.getElementById('auth-email-input');
    if (emailInput) {
      setTimeout(function () { emailInput.focus(); }, 50);
    }
  }

  function closeAuth() {
    var modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('hidden', '');
    }
    document.documentElement.classList.remove('auth-open');
    document.removeEventListener('keydown', authTrap);
    if (authLastFocus && typeof authLastFocus.focus === 'function') {
      try { authLastFocus.focus(); } catch (e) {}
    }
    authLastFocus = null;
  }

  async function checkSession() {
    try {
      var res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (res.ok) {
        var data = await res.json();
        if (data && data.authenticated && data.user) {
          window.__taMe = data.user;
          paintAccount();
          document.dispatchEvent(new CustomEvent('atm:me', { detail: { user: data.user } }));
          return;
        }
      }

      // Strictly evaluate to null if unauthenticated: NEVER mock Alberto
      window.__taMe = null;
      paintAccount();
      document.dispatchEvent(new CustomEvent('atm:me', { detail: { user: null } }));
    } catch (e) {
      window.__taMe = null;
      paintAccount();
      document.dispatchEvent(new CustomEvent('atm:me', { detail: { user: null } }));
    }
  }

  window.atmGuestName = guestName;
  window.atmOpenAuth = openAuth;
  window.atmOpenStudioLogin = openAuth;
  window.atmCheckSession = checkSession;

  function headerHtml() {
    if (isShare()) {
      return '<span class="brand"><span>Doc</span></span>' +
        '<div class="topbar-actions">' + themeButtonHtml() + langPickerHtml() + '</div>';
    }
    return '<a href="/" class="brand">' +
      '<img src="/avatar.png" alt="" class="brand-avatar" width="28" height="28">' +
      '<span>ATM Docs</span></a>' +
      '<div class="topbar-actions">' +
      themeButtonHtml() +
      langPickerHtml() +
      accountHtml() +
      '</div>';
  }

  function footerHtml() {
    if (isShare()) return '<p data-i18n="docLabel">Documento</p>';
    var t = typeof window.atmT === 'function' ? window.atmT : function (k) { return k; };
    return '<nav class="docs-footer-nav">' +
      '<a href="/" data-i18n="index">' + t('index') + '</a>' +
      '<a href="https://ai.trujillomingorance.com" rel="noopener" data-i18n="studio">' + t('studio') + '</a>' +
      '</nav>' + atmNetHtml();
  }

  // ATM Software Labs: shared network footer strip (v1); same markup on every *.trujillomingorance.com site.
  function atmNetHtml() {
    var lang = (document.documentElement.lang || 'es').slice(0, 2);
    var T = {
      es: ['Sitios de ATM Software Labs', 'Privacidad', 'Términos', 'Guías', 'https://trujillomingorance.com/privacy', 'https://trujillomingorance.com/terms'],
      en: ['ATM Software Labs sites', 'Privacy', 'Terms', 'Guides', 'https://trujillomingorance.com/en/privacy/', 'https://trujillomingorance.com/en/terms/'],
      ca: ['Llocs d’ATM Software Labs', 'Privacitat', 'Termes', 'Guies', 'https://trujillomingorance.com/ca/privacy/', 'https://trujillomingorance.com/ca/terms/']
    }[lang] || null;
    if (!T) T = ['ATM Software Labs', 'Privacy', 'Terms', 'Guides', 'https://trujillomingorance.com/en/privacy/', 'https://trujillomingorance.com/en/terms/'];
    var cur = location.hostname.indexOf('savings.') === 0 ? 'savings' : 'guides';
    var sites = [['labs', 'https://labs.trujillomingorance.com/', 'ATM Labs'], ['invest', 'https://invest.trujillomingorance.com/', 'INVEST'], ['charts', 'https://charts.trujillomingorance.com/', 'Markets Briefing'], ['ai', 'https://ai.trujillomingorance.com/', 'Trujillo AI'], ['guides', 'https://guides.trujillomingorance.com/', T[3]], ['tools', 'https://tools.trujillomingorance.com/', 'Tools'], ['rewrite', 'https://rewrite.trujillomingorance.com/', 'Rewrite']];
    var li = sites.map(function (x) { return '<li><a href="' + x[1] + '"' + (x[0] === cur ? ' aria-current="page"' : '') + '>' + x[2] + '</a></li>'; }).join('');
    return '<div class="atm-net"><div class="atm-net__in">' +
      '<a class="atm-net__brand" href="https://trujillomingorance.com/">ATM Software Labs</a>' +
      '<nav aria-label="' + T[0] + '"><ul class="atm-net__sites">' + li + '</ul></nav>' +
      '<p class="atm-net__legal">© 2026 ATM Software Labs · Alberto Trujillo Mingorance · <a href="' + T[4] + '">' + T[1] + '</a> · <a href="' + T[5] + '">' + T[2] + '</a></p>' +
      '</div></div>';
  }

  function fillActions(actions) {
    var existingTheme = actions.querySelector('.theme-toggle-btn');
    if (!existingTheme) {
      actions.insertAdjacentHTML('afterbegin', themeButtonHtml());
    } else if (!existingTheme.querySelector('svg')) {
      existingTheme.outerHTML = themeButtonHtml();
    }
    if (!actions.querySelector('.lang-picker, #lang-picker')) {
      var theme = actions.querySelector('.theme-toggle-btn');
      if (theme) theme.insertAdjacentHTML('afterend', langPickerHtml());
      else actions.insertAdjacentHTML('afterbegin', langPickerHtml());
    }
    actions.querySelectorAll('.hub-link, .lang-toggle-group').forEach(function (el) { el.remove(); });
    paintAccount();
  }

  function ensureHeader() {
    document.body.classList.add('docs-body');
    var bar = document.querySelector('.docs-topbar');
    if (!bar) {
      bar = document.createElement('header');
      bar.className = 'docs-topbar';
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.id = 'docs-topbar';
    var crumb = bar.querySelector('.ee-crumb');
    if (crumb) crumb.remove();
    if (isShare() || !bar.querySelector('.brand')) {
      bar.innerHTML = headerHtml();
    } else {
      var actions = bar.querySelector('.topbar-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'topbar-actions';
        bar.appendChild(actions);
      }
      fillActions(actions);
    }
    var legacy = document.querySelector('.site-header');
    if (legacy) legacy.setAttribute('hidden', '');
    ensureAuthModal();
  }

  function ensureFooter() {
    document.querySelectorAll('footer.site-footer').forEach(function (el) { el.remove(); });
    var foot = document.getElementById('docs-footer');
    if (!foot) {
      foot = document.createElement('footer');
      foot.className = 'docs-footer';
      foot.id = 'docs-footer';
      document.body.appendChild(foot);
    }
    foot.innerHTML = footerHtml();
  }

  function bindOnce() {
    if (window.__atmChromeBound) return;
    window.__atmChromeBound = true;
    document.addEventListener('click', function (e) {
      var themeBtn = e.target.closest('.theme-toggle-btn');
      if (themeBtn) {
        e.preventDefault();
        var next = themeNow() === 'light' ? 'dark' : 'light';
        applyTheme(next);
        document.dispatchEvent(new CustomEvent('atm:theme-toggled', { detail: { theme: next } }));
        return;
      }
      if (e.target.closest('[data-logout]')) {
        e.preventDefault();
        logout();
        return;
      }
      var accBtn = e.target.closest('#account-btn');
      if (accBtn) {
        e.preventDefault();
        var accMenu = document.getElementById('account-menu');
        if (accMenu) {
          accMenu.hidden = !accMenu.hidden;
          accBtn.setAttribute('aria-expanded', accMenu.hidden ? 'false' : 'true');
        }
        var langOpen = document.getElementById('lang-menu');
        if (langOpen) langOpen.hidden = true;
        return;
      }
      if (e.target.closest('[data-open-auth]')) {
        e.preventDefault();
        closeAccountMenu();
        openAuth();
        return;
      }
      if (e.target.closest('[data-close-auth]') || (e.target.id === 'auth-modal')) {
        closeAuth();
        return;
      }
      var studioBtn = e.target.closest('[data-studio-login], .auth-studio');
      if (studioBtn) {
        e.preventDefault();
        openStudioLogin();
        return;
      }
      var xBtn = e.target.closest('#btn-guides-x');
      if (xBtn) {
        e.preventDefault();
        var state = 'x_oauth_' + Math.random().toString(36).slice(2, 10);
        try { localStorage.setItem('trujillo_x_oauth_state', state); } catch (err) {}
        var redirectUri = encodeURIComponent(window.location.origin + '/?auth=x_callback');
        window.location.href = 'https://twitter.com/i/oauth2/authorize?response_type=code&client_id=NF94WVVIT1dzSXZNaTJuYjRXSEc6MTpjaQ' +
          '&redirect_uri=' + redirectUri + '&scope=users.read%20tweet.read&state=' + state +
          '&code_challenge=challenge&code_challenge_method=plain';
        return;
      }
      if (!e.target.closest('.account-menu-wrap')) closeAccountMenu();
      var flagBtn = e.target.closest('#lang-flag-btn');
      if (flagBtn) {
        var menu = document.getElementById('lang-menu');
        if (menu) menu.hidden = !menu.hidden;
        return;
      }
      var langBtn = e.target.closest('.lang-option[data-lang], .lang-btn[data-lang]');
      if (!langBtn) {
        var open = document.getElementById('lang-menu');
        if (open && !e.target.closest('.lang-picker')) open.hidden = true;
        return;
      }
      var lang = langBtn.getAttribute('data-lang');
      var menuClose = document.getElementById('lang-menu');
      if (menuClose) menuClose.hidden = true;
      if (typeof window.atmApplyUi === 'function') window.atmApplyUi(lang);
    });
    document.addEventListener('submit', function (e) {
      var form = e.target.closest('#guest-form');
      if (!form) return;
      e.preventDefault();
      var name = setGuestName((form.guestName && form.guestName.value) || '');
      if (!name) return;
      closeAuth();
      paintAccount();
      document.dispatchEvent(new CustomEvent('atm:guest', { detail: { name: name } }));
      if (typeof window.atmApplyUi === 'function') window.atmApplyUi(window.atmLang());
    });
    document.addEventListener('atm:me', paintAccount);
    try {
      if (new URLSearchParams(location.search).get('login') === '1') {
        setTimeout(openAuth, 300);
        history.replaceState(null, '', location.pathname);
      }
    } catch (e) {}
    document.addEventListener('atm:lang', paintAccount);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAuth();
        closeAccountMenu();
      }
    });

    window.addEventListener('message', function (e) {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'AUTH_SUCCESS' || e.data.type === 'LOGIN_SUCCESS' || e.data.token || e.data.auth_token) {
        var tok = e.data.token || e.data.auth_token;
        if (tok) {
          localStorage.setItem('trujillo_ai_token', tok);
          localStorage.setItem('auth_token', tok);
          setSharedCookie('auth_token', tok);
          setSharedCookie('session_active', '1');
        }
        closeAuth();
        checkSession();
      }
    });
  }

  /* ==========================================================================
     ATM CUSTOM DIALOGS (ALERT, CONFIRM, PROMPT) & TOASTS
     ========================================================================== */
  function getOrCreateBackdrop() {
    var b = document.getElementById('atm-dialog-backdrop');
    if (!b) {
      b = document.createElement('div');
      b.id = 'atm-dialog-backdrop';
      b.className = 'atm-dialog-backdrop';
      document.body.appendChild(b);
    }
    return b;
  }

  function getOrCreateToastContainer() {
    var c = document.getElementById('atm-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'atm-toast-container';
      c.className = 'atm-toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  window.atmToast = function (message, type, duration) {
    var c = getOrCreateToastContainer();
    var t = document.createElement('div');
    t.className = 'atm-toast';
    var iconSvg = type === 'error'
      ? '<svg class="atm-toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      : '<svg class="atm-toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
    t.innerHTML = iconSvg + '<span>' + (window.atmTx ? window.atmTx(message) : message) + '</span>';
    c.appendChild(t);
    setTimeout(function () {
      t.classList.add('is-leaving');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 220);
    }, duration || 2800);
  };

  window.atmAlert = function (message, title) {
    return new Promise(function (resolve) {
      var backdrop = getOrCreateBackdrop();
      var t = typeof window.atmT === 'function' ? window.atmT : function (k) { return k; };
      var tx = typeof window.atmTx === 'function' ? window.atmTx : function (k) { return k; };
      backdrop.innerHTML =
        '<div class="atm-dialog-card" role="dialog" aria-modal="true">' +
          '<div class="atm-dialog-header">' +
            '<div class="atm-dialog-icon">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
            '</div>' +
            '<h3 class="atm-dialog-title">' + (title ? tx(title) : 'ATM Docs') + '</h3>' +
          '</div>' +
          '<p class="atm-dialog-body">' + tx(message || '') + '</p>' +
          '<div class="atm-dialog-actions">' +
            '<button type="button" class="atm-dialog-btn primary" id="atm-dialog-ok">' + (t('close') || 'Entendido') + '</button>' +
          '</div>' +
        '</div>';
      backdrop.classList.add('is-open');

      function close() {
        backdrop.classList.remove('is-open');
        resolve();
      }

      var okBtn = backdrop.querySelector('#atm-dialog-ok');
      if (okBtn) {
        okBtn.addEventListener('click', close);
        okBtn.focus();
      }
      backdrop.onclick = function (e) {
        if (e.target === backdrop) close();
      };
    });
  };

  window.atmConfirm = function (message, title, isDanger) {
    return new Promise(function (resolve) {
      var backdrop = getOrCreateBackdrop();
      var t = typeof window.atmT === 'function' ? window.atmT : function (k) { return k; };
      var tx = typeof window.atmTx === 'function' ? window.atmTx : function (k) { return k; };
      var iconCls = isDanger ? ' danger' : '';
      var btnCls = isDanger ? ' danger' : ' primary';
      backdrop.innerHTML =
        '<div class="atm-dialog-card" role="dialog" aria-modal="true">' +
          '<div class="atm-dialog-header">' +
            '<div class="atm-dialog-icon' + iconCls + '">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
            '</div>' +
            '<h3 class="atm-dialog-title">' + (title ? tx(title) : (t('confirm') || 'Confirmación')) + '</h3>' +
          '</div>' +
          '<p class="atm-dialog-body">' + tx(message || '') + '</p>' +
          '<div class="atm-dialog-actions">' +
            '<button type="button" class="atm-dialog-btn cancel" id="atm-dialog-cancel">' + (t('cancel') || 'Cancelar') + '</button>' +
            '<button type="button" class="atm-dialog-btn' + btnCls + '" id="atm-dialog-ok">' + (t('confirm') || 'Confirmar') + '</button>' +
          '</div>' +
        '</div>';
      backdrop.classList.add('is-open');

      function close(val) {
        backdrop.classList.remove('is-open');
        resolve(val);
      }

      var okBtn = backdrop.querySelector('#atm-dialog-ok');
      var cancelBtn = backdrop.querySelector('#atm-dialog-cancel');
      if (okBtn) okBtn.addEventListener('click', function () { close(true); });
      if (cancelBtn) cancelBtn.addEventListener('click', function () { close(false); });
      backdrop.onclick = function (e) {
        if (e.target === backdrop) close(false);
      };
      if (okBtn) okBtn.focus();
    });
  };

  window.atmPrompt = function (message, defaultValue, title) {
    return new Promise(function (resolve) {
      var backdrop = getOrCreateBackdrop();
      var t = typeof window.atmT === 'function' ? window.atmT : function (k) { return k; };
      var tx = typeof window.atmTx === 'function' ? window.atmTx : function (k) { return k; };
      backdrop.innerHTML =
        '<div class="atm-dialog-card" role="dialog" aria-modal="true">' +
          '<div class="atm-dialog-header">' +
            '<div class="atm-dialog-icon">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>' +
            '</div>' +
            '<h3 class="atm-dialog-title">' + (title ? tx(title) : 'ATM Docs') + '</h3>' +
          '</div>' +
          '<p class="atm-dialog-body">' + tx(message || '') + '</p>' +
          '<input type="text" class="atm-dialog-input" id="atm-dialog-text-input" value="' + String(defaultValue || '').replace(/"/g, '&quot;') + '">' +
          '<div class="atm-dialog-actions">' +
            '<button type="button" class="atm-dialog-btn cancel" id="atm-dialog-cancel">' + (t('cancel') || 'Cancelar') + '</button>' +
            '<button type="button" class="atm-dialog-btn primary" id="atm-dialog-ok">' + (t('confirm') || 'Aceptar') + '</button>' +
          '</div>' +
        '</div>';
      backdrop.classList.add('is-open');

      var input = backdrop.querySelector('#atm-dialog-text-input');
      if (input) {
        setTimeout(function () { input.focus(); input.select(); }, 50);
      }

      function close(val) {
        backdrop.classList.remove('is-open');
        resolve(val);
      }

      var okBtn = backdrop.querySelector('#atm-dialog-ok');
      var cancelBtn = backdrop.querySelector('#atm-dialog-cancel');
      if (okBtn) okBtn.addEventListener('click', function () { close(input ? input.value : ''); });
      if (cancelBtn) cancelBtn.addEventListener('click', function () { close(null); });
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); close(input.value); }
          if (e.key === 'Escape') { e.preventDefault(); close(null); }
        });
      }
      backdrop.onclick = function (e) {
        if (e.target === backdrop) close(null);
      };
    });
  };

  window.alertModal = window.atmAlert;
  window.confirmModal = window.atmConfirm;
  window.promptModal = window.atmPrompt;

  // Interceptar window.alert nativo para que use el modal estilizado
  window.alert = function (msg) {
    window.atmAlert(msg);
  };

  // --- READING PROGRESS BAR ---
  function initReadingProgressBar() {
    var hasGuide = document.querySelector('.doc-page, .guide-container, article, .md-body, #guide-viewer, #guide-body');
    if (!hasGuide) return;
    var bar = document.getElementById('atm-reading-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'atm-reading-bar';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
    }

    var hasFired100 = false;
    var ticking = false;

    function update() {
      ticking = false;
      var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        bar.style.width = '0%';
        return;
      }
      var progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      bar.style.width = progress.toFixed(1) + '%';

      if (!hasFired100 && progress >= 99) {
        hasFired100 = true;
        document.dispatchEvent(new CustomEvent('atm:guide-scroll-100'));
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // --- FLOATING CODE COPY BUTTON ---
  function initCodeCopyButtons(root) {
    var scope = root || document;
    var pres = scope.querySelectorAll('pre');
    var COPY_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var CHECK_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

    pres.forEach(function (pre) {
      if (pre.querySelector('.atm-code-copy-btn')) return;
      var cs = window.getComputedStyle(pre);
      if (cs.position === 'static') pre.style.position = 'relative';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'atm-code-copy-btn';
      btn.setAttribute('aria-label', 'Copiar código');
      btn.innerHTML = COPY_ICON + '<span>Copiar</span>';

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var code = pre.querySelector('code');
        var text = (code ? code.innerText : pre.innerText).replace(/Copiar|Copiado/g, '').trim();

        function onCopied() {
          btn.innerHTML = CHECK_ICON + '<span>Copiado</span>';
          btn.classList.add('is-copied');
          document.dispatchEvent(new CustomEvent('atm:code-copied'));
          if (window.atmToast) window.atmToast('Código copiado al portapapeles');
          setTimeout(function () {
            btn.innerHTML = COPY_ICON + '<span>Copiar</span>';
            btn.classList.remove('is-copied');
          }, 1800);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(onCopied).catch(function () {
            copyFallback(text, onCopied);
          });
        } else {
          copyFallback(text, onCopied);
        }
      });

      pre.appendChild(btn);
    });

    function copyFallback(text, cb) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
        cb();
      } catch (err) {}
    }
  }
  window.atmInitCodeCopy = initCodeCopyButtons;

  // --- ZEN FOCUS MODE (Alt + Z) ---
  function initZenMode() {
    document.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
        var isZen = document.body.classList.toggle('zen-focus-mode');
        document.dispatchEvent(new CustomEvent('atm:zen-toggled', { detail: { active: isZen } }));
        if (window.atmToast) {
          window.atmToast(isZen ? 'Modo Foco Zen activado (Alt + Z para salir)' : 'Modo Foco Zen desactivado');
        }
      }
    });
  }

  // --- KEYBOARD SHORTCUTS MODAL (? or Alt + /) ---
  function initShortcutsModal() {
    function openShortcuts() {
      var old = document.getElementById('atm-shortcuts-overlay');
      if (old) old.remove();

      var overlay = document.createElement('div');
      overlay.id = 'atm-shortcuts-overlay';
      overlay.className = 'atm-dialog-backdrop is-open';
      overlay.innerHTML =
        '<div class="atm-shortcuts-card" role="dialog" aria-modal="true">' +
          '<div class="atm-shortcuts-header">' +
            '<div class="atm-shortcuts-title-group">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M10 16h4"/></svg>' +
              '<h3>Atajos de Teclado</h3>' +
            '</div>' +
            '<button type="button" class="atm-shortcuts-close" aria-label="Cerrar">&times;</button>' +
          '</div>' +
          '<div class="atm-shortcuts-grid">' +
            '<div class="atm-shortcut-row"><span class="shortcut-desc">Alternar Modo Zen (Foco lectura)</span><div class="shortcut-keys"><kbd class="atm-kbd">Alt</kbd> + <kbd class="atm-kbd">Z</kbd></div></div>' +
            '<div class="atm-shortcut-row"><span class="shortcut-desc">Alternar fuente monoespaciada</span><div class="shortcut-keys"><kbd class="atm-kbd">Alt</kbd> + <kbd class="atm-kbd">M</kbd></div></div>' +
            '<div class="atm-shortcut-row"><span class="shortcut-desc">Alternar vista matricial / tabla</span><div class="shortcut-keys"><kbd class="atm-kbd">Alt</kbd> + <kbd class="atm-kbd">J</kbd></div></div>' +
            '<div class="atm-shortcut-row"><span class="shortcut-desc">Ver atajos de teclado</span><div class="shortcut-keys"><kbd class="atm-kbd">?</kbd> o <kbd class="atm-kbd">Alt</kbd> + <kbd class="atm-kbd">/</kbd></div></div>' +
            '<div class="atm-shortcut-row"><span class="shortcut-desc">Cerrar modales o diálogos</span><div class="shortcut-keys"><kbd class="atm-kbd">Esc</kbd></div></div>' +
            '<div class="atm-shortcut-row"><span class="shortcut-desc">Secuencia de videojuegos clásica</span><div class="shortcut-keys"><kbd class="atm-kbd">↑</kbd><kbd class="atm-kbd">↑</kbd><kbd class="atm-kbd">↓</kbd><kbd class="atm-kbd">↓</kbd><kbd class="atm-kbd">←</kbd><kbd class="atm-kbd">→</kbd><kbd class="atm-kbd">B</kbd><kbd class="atm-kbd">A</kbd></div></div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      function close() {
        overlay.classList.remove('is-open');
        setTimeout(function () { overlay.remove(); }, 200);
      }

      overlay.querySelector('.atm-shortcuts-close').addEventListener('click', close);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });
      document.addEventListener('keydown', function onEsc(e) {
        if (e.key === 'Escape') {
          close();
          document.removeEventListener('keydown', onEsc);
        }
      });
    }

    window.atmOpenShortcuts = openShortcuts;

    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;

      if ((e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) || (e.altKey && e.key === '/')) {
        e.preventDefault();
        openShortcuts();
      }
    });
  }

  function sanitizeFollowingList(user) {
    try {
      var raw = JSON.parse(localStorage.getItem('atm_following') || '[]');
      if (!Array.isArray(raw) || !raw.length) return;
      var me = user || window.__taMe;
      if (!me) {
        try { me = JSON.parse(localStorage.getItem('trujillo_ai_user') || localStorage.getItem('auth_user') || localStorage.getItem('atm_user') || 'null'); } catch (e) {}
      }
      if (!me) return;
      var selfHandles = [me.handle, me.username, me.slug, me.name, 'atrumin16', 'alberto']
        .filter(Boolean)
        .map(function (s) { return String(s).replace(/^@+/, '').toLowerCase().trim(); });
      var cleaned = raw.filter(function (h) {
        var cleanH = String(h || '').replace(/^@+/, '').toLowerCase().trim();
        return selfHandles.indexOf(cleanH) === -1;
      });
      if (cleaned.length !== raw.length) {
        localStorage.setItem('atm_following', JSON.stringify(cleaned));
        window.__taFollowing = cleaned;
      }
    } catch (e) {}
  }

  function boot() {
    applyTheme(themeNow());
    ensureHeader();
    ensureFooter();
    bindOnce();
    sanitizeFollowingList();
    checkSession();
    initReadingProgressBar();
    initCodeCopyButtons();
    initZenMode();
    initShortcutsModal();
    if (typeof window.atmApplyUi === 'function') window.atmApplyUi(window.atmLang());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
