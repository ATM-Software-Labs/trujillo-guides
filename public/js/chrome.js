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
    if (meta) meta.setAttribute('content', next === 'light' ? '#ffffff' : '#080c14');
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
        '" data-lang="' + code + '" role="option"><span class="flag">' + l.flag +
        '</span><span>' + l.name + '</span></button>';
    }).join('');
    return '<div class="lang-picker" id="lang-picker">' +
      '<button type="button" class="lang-flag-btn" id="lang-flag-btn" aria-haspopup="listbox" title="' + meta.name + '">' +
      '<span class="flag">' + meta.flag + '</span><span class="lang-code">' + (meta.code || meta.id).toUpperCase() + '</span></button>' +
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
        avatarHtml(me.picture, displayName) +
        (label ? '<span class="account-first">' + esc(label) + '</span>' : '') +
        '</button>' +
        '<div class="account-menu" id="account-menu" hidden role="menu">' +
        '<a href="/write" role="menuitem" data-i18n="newGuide">' + t('newGuide') + '</a>' +
        '<a href="/u/@' + encodeURIComponent(cleanHandle) + '" role="menuitem" data-i18n="profile">' + (t('profile') || 'Perfil') + '</a>' +
        '<a href="/settings" role="menuitem" data-i18n="settings">' + (t('settings') || 'Configuración') + '</a>' +
        '<button type="button" role="menuitem" data-logout data-i18n="logout">' + t('logout') + '</button>' +
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
        '<button type="button" role="menuitem" data-logout data-i18n="logout">' + t('logout') + '</button>' +
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
    return '<div id="auth-modal" class="auth-backdrop" style="display: none;">' +
      '<div class="auth-card">' +
      '<button type="button" class="auth-close-btn" id="auth-modal-close" data-close-auth aria-label="Cerrar">&times;</button>' +
      '<div class="auth-header">' +
      '<div class="auth-icon-badge">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' +
      '</svg>' +
      '</div>' +
      '<h3 class="auth-title">Trujillo Guides</h3>' +
      '<p class="auth-subtitle">Entra para publicar, gestionar guías y sincronizar borradores.</p>' +
      '</div>' +
      '<div class="auth-tabs">' +
      '<button type="button" class="auth-tab active" id="tab-auth-login">Acceder</button>' +
      '<button type="button" class="auth-tab" id="tab-auth-register">Crear cuenta</button>' +
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
      '<span>Continuar con Google</span>' +
      '</button>' +
      '<div id="google-btn-overlay" class="google-btn-overlay"></div>' +
      '</div>' +
      '<button type="button" class="auth-social-btn" id="btn-login-x" data-oauth="x">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' +
      '</svg>' +
      '<span>Continuar con X</span>' +
      '</button>' +
      '</div>' +
      '<div class="auth-divider"><span>o continúa con correo</span></div>' +
      '<form id="auth-form" onsubmit="event.preventDefault();">' +
      '<div id="auth-field-name" style="display: none; margin-bottom: 12px;">' +
      '<label class="auth-input-label">Nombre</label>' +
      '<input type="text" class="auth-input" placeholder="Tu nombre" id="auth-name-input">' +
      '</div>' +
      '<div style="margin-bottom: 12px;">' +
      '<label class="auth-input-label">Correo</label>' +
      '<input type="email" class="auth-input" placeholder="tu@correo.com" id="auth-email-input" required>' +
      '</div>' +
      '<div style="margin-bottom: 16px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">' +
      '<label class="auth-input-label">Contraseña</label>' +
      '<a href="#" class="auth-forgot-link" id="auth-forgot-pwd">¿Olvidaste la contraseña?</a>' +
      '</div>' +
      '<input type="password" class="auth-input" placeholder="••••••••" id="auth-pwd-input" required>' +
      '</div>' +
      '<button type="submit" class="auth-submit-btn" id="auth-submit-action">Acceder</button>' +
      '</form>' +
      '<div class="auth-guest-wrap" style="text-align: center; margin-top: 14px;">' +
      '<button type="button" class="auth-guest-btn" id="auth-guest-action">Continuar como invitado &rarr;</button>' +
      '</div>' +
      '<div class="auth-footer-links">' +
      '<a href="/legal/terms">Términos</a>' +
      '<span>·</span>' +
      '<a href="/legal/privacy">Privacidad</a>' +
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
      alert(err.message || 'No se pudo iniciar sesión con Google');
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

    if (tabLogin && tabReg) {
      tabLogin.addEventListener('click', function (e) {
        e.preventDefault();
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
        if (fieldName) fieldName.style.display = 'none';
        if (submitBtn) submitBtn.textContent = 'Acceder';
      });

      tabReg.addEventListener('click', function (e) {
        e.preventDefault();
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
        if (fieldName) fieldName.style.display = 'block';
        if (submitBtn) submitBtn.textContent = 'Crear cuenta';
      });
    }

    var guestBtn = document.getElementById('auth-guest-action');
    if (guestBtn) {
      guestBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var current = guestName();
        if (!current) {
          setGuestName('Invitado');
        }
        closeAuth();
        paintAccount();
        document.dispatchEvent(new CustomEvent('atm:guest', { detail: { name: guestName() } }));
        if (typeof window.atmApplyUi === 'function') window.atmApplyUi(window.atmLang());
      });
    }

    mountGoogle();

    var googleBtn = document.getElementById('btn-login-google') || document.getElementById('btn-oauth-google');
    if (googleBtn) {
      googleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.google && window.google.accounts && window.google.accounts.id) {
          try {
            window.google.accounts.id.prompt();
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
        window.location.href = '/api/auth/x';
      });
    }

    var forgotBtn = document.getElementById('auth-forgot-pwd');
    if (forgotBtn) {
      forgotBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        var emailInput = document.getElementById('auth-email-input');
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email) {
          alert('Por favor introduce tu correo electrónico para enviarte el enlace de recuperación.');
          if (emailInput) emailInput.focus();
          return;
        }
        try {
          var res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
          });
          var data = await res.json();
          alert(data.message || 'Si tu correo está registrado, recibirás un enlace de 15 minutos.');
          closeAuth();
        } catch (err) {
          alert('Error al solicitar la recuperación de contraseña.');
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

        if (!email) {
          if (emailInput) emailInput.focus();
          return;
        }

        var isRegister = tabReg && tabReg.classList.contains('active');

        try {
          if (isRegister) {
            var regRes = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, password: pwd, name: name })
            });
            var regData = await regRes.json();
            if (!regRes.ok) {
              alert(regData.error || 'Error al registrar la cuenta');
              return;
            }
            alert(regData.message || 'Cuenta creada. Revisa tu correo de verificación.');
            closeAuth();
          } else {
            var loginRes = await fetch('/api/auth/login', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, password: pwd })
            });
            var loginData = await loginRes.json();
            if (!loginRes.ok) {
              alert(loginData.error || 'Credenciales inválidas');
              return;
            }
            window.__taMe = loginData.user;
            paintAccount();
            closeAuth();
            window.location.reload();
          }
        } catch (err) {
          alert('Error de conexión con el servicio de autenticación.');
        }
      });
    }
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
    modal.style.display = 'flex';
    modal.removeAttribute('hidden');
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
    return '<p data-i18n="footer">' + t('footer') + '</p>' +
      '<nav class="docs-footer-nav">' +
      '<a href="/" data-i18n="index">' + t('index') + '</a>' +
      '<a href="https://ai.trujillomingorance.com" rel="noopener" data-i18n="studio">' + t('studio') + '</a>' +
      '</nav>';
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
        applyTheme(themeNow() === 'light' ? 'dark' : 'light');
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

  window.confirmModal = function confirmModal(message) {
    return new Promise(function (resolve) {
      var dialog = document.getElementById('app-confirm-dialog');
      if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = 'app-confirm-dialog';
        dialog.className = 'auth-card';
        dialog.style.position = 'fixed';
        dialog.style.inset = '0';
        dialog.style.margin = 'auto';
        dialog.style.maxWidth = 'min(420px, calc(100vw - 32px))';
        dialog.style.color = 'var(--text-primary)';
        dialog.style.boxSizing = 'border-box';
        dialog.innerHTML =
          '<p class="lede" id="app-confirm-msg" style="margin:0 0 20px;font-size:15px;line-height:1.55;color:var(--text-primary);"></p>' +
          '<div class="comment-actions" style="display:flex;justify-content:flex-end;gap:10px;margin:0;">' +
          '<button type="button" class="tool-btn" id="app-confirm-cancel" data-i18n="cancel">Cancelar</button>' +
          '<button type="button" class="tool-btn danger" id="app-confirm-ok" data-i18n="confirm">Confirmar</button>' +
          '</div>';
        document.body.appendChild(dialog);

        dialog.addEventListener('click', function (ev) {
          if (ev.target === dialog) dialog.close('cancel');
        });

        var cancelBtn = dialog.querySelector('#app-confirm-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function () {
          dialog.close('cancel');
        });

        var okBtn = dialog.querySelector('#app-confirm-ok');
        if (okBtn) okBtn.addEventListener('click', function () {
          dialog.close('confirm');
        });
      }

      var msgEl = dialog.querySelector('#app-confirm-msg');
      if (msgEl) msgEl.textContent = String(message || '');

      var t = typeof window.atmT === 'function' ? window.atmT : function (k) { return k; };
      var cancelBtn = dialog.querySelector('#app-confirm-cancel');
      if (cancelBtn) cancelBtn.textContent = t('cancel') || 'Cancelar';
      var okBtn = dialog.querySelector('#app-confirm-ok');
      if (okBtn) okBtn.textContent = t('confirm') || 'Confirmar';

      function onClose() {
        resolve(dialog.returnValue === 'confirm');
      }
      dialog.addEventListener('close', onClose, { once: true });

      if (dialog.open) dialog.close('cancel');
      dialog.returnValue = '';

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
        if (okBtn) okBtn.focus();
      } else {
        resolve(window.confirm(message));
      }
    });
  };

  function boot() {
    applyTheme(themeNow());
    ensureHeader();
    ensureFooter();
    bindOnce();
    checkSession();
    if (typeof window.atmApplyUi === 'function') window.atmApplyUi(window.atmLang());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
