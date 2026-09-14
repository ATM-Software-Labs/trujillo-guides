/**
 * Trujillo AI / ATM Platform - Production Auth Client
 * Zero hardcoded fallbacks: unauthenticated visitors are strictly evaluated to null.
 */

(function (window) {
  'use strict';

  var _currentUser = null;
  var _authChecked = false;

  var AuthClient = {
    /**
     * Verifies the active session against the Edge backend (/api/auth/me).
     * Returns the verified user profile or null if unauthenticated.
     */
    getCurrentUser: async function (forceRefresh) {
      if (_authChecked && !forceRefresh) {
        return _currentUser;
      }

      try {
        var res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (res.ok) {
          var data = await res.json();
          _currentUser = (data && data.authenticated && data.user) ? data.user : null;
        } else {
          _currentUser = null;
        }
      } catch (err) {
        console.warn('[AuthClient] Session check failed or offline:', err);
        _currentUser = null;
      }

      _authChecked = true;
      document.dispatchEvent(new CustomEvent('atm:auth-changed', { detail: { user: _currentUser } }));
      return _currentUser;
    },

    /**
     * Initiates Google OAuth 2.0 flow
     */
    loginWithGoogle: function (returnTo) {
      var target = returnTo || window.location.pathname + window.location.search;
      window.location.href = '/api/auth/google?returnTo=' + encodeURIComponent(target);
    },

    /**
     * Initiates X (Twitter) OAuth 2.0 PKCE flow
     */
    loginWithX: function (returnTo) {
      var target = returnTo || window.location.pathname + window.location.search;
      window.location.href = '/api/auth/x?returnTo=' + encodeURIComponent(target);
    },

    /**
     * Direct email & password login
     */
    loginWithPassword: async function (email, password) {
      var res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
      });

      var data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      _currentUser = data.user;
      _authChecked = true;
      document.dispatchEvent(new CustomEvent('atm:auth-changed', { detail: { user: _currentUser } }));
      return data.user;
    },

    /**
     * Native registration with Resend email verification
     */
    register: async function (email, password, name, handle) {
      var res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password, name: name, handle: handle })
      });

      var data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar la cuenta');
      }
      return data;
    },

    /**
     * Request 15-minute single-use password recovery link
     */
    forgotPassword: async function (email) {
      var res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });

      return await res.json();
    },

    /**
     * Reset password using single-use token
     */
    resetPassword: async function (token, newPassword) {
      var res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ token: token, new_password: newPassword })
      });

      var data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Token inválido o expirado');
      }
      return data;
    },

    /**
     * Terminate session across Edge and browser
     */
    logout: async function () {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {}

      _currentUser = null;
      _authChecked = true;

      // Clean local storage
      try {
        localStorage.removeItem('atm_studio_session');
        localStorage.removeItem('atm_user');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('trujillo_ai_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('trujillo_ai_token');
        // Purge all user achievements keys and cached progress to avoid session leaks
        for (var i = localStorage.length - 1; i >= 0; i--) {
          var k = localStorage.key(i);
          if (k && (k.indexOf('achievements_') === 0 || k.indexOf('atm_achievements') === 0 || k.indexOf('atm_used_langs') === 0 || k === 'achievements_guest')) {
            localStorage.removeItem(k);
          }
        }
      } catch (e) {}

      if (window.ATM_ACHIEVEMENTS && window.ATM_ACHIEVEMENTS.clearUserAchievements) {
        window.ATM_ACHIEVEMENTS.clearUserAchievements();
      }

      document.dispatchEvent(new CustomEvent('atm:logout'));
      document.dispatchEvent(new CustomEvent('atm:auth-changed', { detail: { user: null } }));
      window.location.reload();
    },

    /**
     * Route protection guard for authenticated pages (e.g. /write, /settings)
     */
    requireAuth: async function (redirectUrl) {
      var user = await this.getCurrentUser();
      if (!user) {
        var loginRedirect = redirectUrl || '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = loginRedirect;
        return null;
      }
      return user;
    }
  };

  window.ATM_AUTH = AuthClient;
})(window);
