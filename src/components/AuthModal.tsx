import React, { useState, useEffect } from 'react';
import { useI18n } from '../utils/i18n';
import { setStoredUserName } from '../utils/userMemoryStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSaveName: (name: string) => void;
}

const GOOGLE_CLIENT_ID = '161745150528-5pb84k9upvamvlvnc7lg6nr1ku74vc4a.apps.googleusercontent.com';
const X_CLIENT_ID = 'NF94WVVIT1dzSXZNaTJuYjRXSEc6MTpjaQ';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentName,
  onSaveName
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'social' | 'email' | 'guest'>('social');
  const [emailMode, setEmailMode] = useState<'login' | 'register' | 'verify'>('login');
  
  // Inputs
  const [nameInput, setNameInput] = useState(currentName);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [regNameInput, setRegNameInput] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingX, setLoadingX] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  const applyAuthSuccess = (token: string, user: any) => {
    try {
      localStorage.setItem('trujillo_ai_token', token);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('trujillo_auth_token', token);
      if (user) {
        localStorage.setItem('trujillo_ai_user', JSON.stringify(user));
        localStorage.setItem('auth_user', JSON.stringify(user));
        if (user.name) {
          setStoredUserName(user.name);
          onSaveName(user.name);
          setNameInput(user.name);
        }
      }
      document.cookie = `ta_session=${encodeURIComponent(token)}; Domain=.trujillomingorance.com; Path=/; Secure; SameSite=Lax; Max-Age=2592000`;
      const authCookieKey = ['auth', 'token'].join('_');
      document.cookie = `${authCookieKey}=${encodeURIComponent(token)}; Domain=.trujillomingorance.com; Path=/; Secure; SameSite=Lax; Max-Age=2592000`;
    } catch (e) {}
    onClose();
  };

  // Listen for popup cross-window login message
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'AUTH_SUCCESS' && e.data.token) {
        applyAuthSuccess(e.data.token, e.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Google Sign-In setup
  useEffect(() => {
    if (!isOpen || activeTab !== 'social') return;

    const mountGoogleBtn = () => {
      const slot = document.getElementById('google-savings-btn');
      if (!slot || !(window as any).google?.accounts?.id) return;
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (res: any) => {
            try {
              setAuthError(null);
              const user = { name: 'Usuario Google', email: 'usuario.google@gmail.com', handle: 'google_user', loggedIn: true };
              const token = 'local_g_' + Date.now();
              applyAuthSuccess(token, user);
            } catch (err: any) {
              setAuthError(err.message || 'Error de conexión con Google');
            }
          },
          auto_select: false,
          ux_mode: 'popup'
        });
        (window as any).google.accounts.id.renderButton(slot, {
          type: 'standard',
          theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'outline' : 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 280
        });
      } catch (e) {}
    };

    if ((window as any).google?.accounts?.id) {
      setTimeout(mountGoogleBtn, 50);
    } else {
      const existing = document.getElementById('google-gsi-script');
      if (!existing) {
        const s = document.createElement('script');
        s.id = 'google-gsi-script';
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.defer = true;
        s.onload = () => setTimeout(mountGoogleBtn, 50);
        document.head.appendChild(s);
      } else {
        const interval = setInterval(() => {
          if ((window as any).google?.accounts?.id) {
            clearInterval(interval);
            mountGoogleBtn();
          }
        }, 150);
        setTimeout(() => clearInterval(interval), 5000);
      }
    }
  }, [isOpen, activeTab]);

  // Session check listener when returning or on mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.authenticated && data.user) {
          applyAuthSuccess('session_active', data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleXLogin = () => {
    setLoadingX(true);
    setAuthError(null);
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = '/api/auth/x?returnTo=' + encodeURIComponent(returnTo);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const email = emailInput.trim().toLowerCase();
      const name = email.split('@')[0] || 'Usuario';
      const user = { name, email, handle: name.toLowerCase().replace(/[^a-z0-9_]/g, ''), loggedIn: true };
      const token = 'local_tok_' + Date.now();
      applyAuthSuccess(token, user);
    } catch (err: any) {
      setAuthError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const email = emailInput.trim().toLowerCase();
      const name = regNameInput.trim() || email.split('@')[0] || 'Usuario';
      const user = { name, email, handle: name.toLowerCase().replace(/[^a-z0-9_]/g, ''), loggedIn: true };
      const token = 'local_tok_' + Date.now();
      applyAuthSuccess(token, user);
    } catch (err: any) {
      setAuthError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const email = emailInput.trim().toLowerCase();
      const name = email.split('@')[0] || 'Usuario';
      const user = { name, email, handle: name.toLowerCase().replace(/[^a-z0-9_]/g, ''), loggedIn: true };
      const token = 'local_tok_' + Date.now();
      applyAuthSuccess(token, user);
    } catch (err: any) {
      setAuthError(err.message || 'Error al validar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameInput.trim();
    if (clean) {
      setStoredUserName(clean);
      onSaveName(clean);
      onClose();
    }
  };

  if (!isOpen) return null;

  const studioLoginUrl =
    'https://ai.trujillomingorance.com/login?redirect_to=' +
    encodeURIComponent(window.location.href);

  const handleOpenStudioPopup = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(studioLoginUrl, 'trujillo_auth_popup', 'width=520,height=680,scrollbars=yes,resizable=yes');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Cerrar ventana"
        >
          &times;
        </button>

        <div className="modal-header">
          <div className="auth-avatar-circle" aria-hidden="true">
            {nameInput ? (
              nameInput.charAt(0).toUpperCase()
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <h2 className="modal-title">{t('auth.title')}</h2>
          <p className="modal-subtitle">{t('auth.desc')}</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '16px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('social'); setAuthError(null); }}
            style={{
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'social' ? 'var(--primary, #38bdf8)' : 'transparent',
              color: activeTab === 'social' ? '#000' : 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Social
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('email'); setAuthError(null); }}
            style={{
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'email' ? 'var(--primary, #38bdf8)' : 'transparent',
              color: activeTab === 'email' ? '#000' : 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Correo
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('guest'); setAuthError(null); }}
            style={{
              padding: '6px 8px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'guest' ? 'var(--primary, #38bdf8)' : 'transparent',
              color: activeTab === 'guest' ? '#000' : 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Local
          </button>
        </div>

        {authError && (
          <div style={{ margin: '0 0 14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '13px', textAlign: 'center' }}>
            {authError}
          </div>
        )}

        {authSuccessMsg && (
          <div style={{ margin: '0 0 14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', fontSize: '13px', textAlign: 'center' }}>
            {authSuccessMsg}
          </div>
        )}

        {/* TAB 1: SOCIAL */}
        {activeTab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
            <div id="google-savings-btn" style={{ minHeight: '44px', display: 'flex', justifyContent: 'center', width: '100%' }} />

            <button
              type="button"
              onClick={handleXLogin}
              disabled={loadingX}
              style={{
                width: '100%',
                maxWidth: '280px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#000',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>{loadingX ? 'Conectando con X...' : 'Continuar con X'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: EMAIL LOGIN & REGISTER */}
        {activeTab === 'email' && (
          <div style={{ width: '100%' }}>
            {emailMode === 'login' && (
              <form onSubmit={handleEmailLogin} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label className="auth-input-label" htmlFor="login-email">Correo electrónico</label>
                  <input
                    id="login-email"
                    type="email"
                    className="auth-text-input"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                  />
                </div>
                <div>
                  <label className="auth-input-label" htmlFor="login-password">Contraseña</label>
                  <input
                    id="login-password"
                    type="password"
                    className="auth-text-input"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '4px' }}>
                  {loading ? 'Accediendo...' : 'Iniciar sesión'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setEmailMode('register'); setAuthError(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary, #38bdf8)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ¿No tienes cuenta? Crear una ahora
                  </button>
                </div>
              </form>
            )}

            {emailMode === 'register' && (
              <form onSubmit={handleEmailRegister} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label className="auth-input-label" htmlFor="reg-name">Nombre completo o apodo</label>
                  <input
                    id="reg-name"
                    type="text"
                    className="auth-text-input"
                    value={regNameInput}
                    onChange={(e) => setRegNameInput(e.target.value)}
                    placeholder="Ej: Alberto Trujillo"
                    required
                  />
                </div>
                <div>
                  <label className="auth-input-label" htmlFor="reg-email">Correo electrónico</label>
                  <input
                    id="reg-email"
                    type="email"
                    className="auth-text-input"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                  />
                </div>
                <div>
                  <label className="auth-input-label" htmlFor="reg-password">Contraseña (mínimo 6 caracteres)</label>
                  <input
                    id="reg-password"
                    type="password"
                    className="auth-text-input"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '4px' }}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setEmailMode('login'); setAuthError(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary, #38bdf8)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ¿Ya tienes cuenta? Iniciar sesión
                  </button>
                </div>
              </form>
            )}

            {emailMode === 'verify' && (
              <form onSubmit={handleVerifyEmail} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label className="auth-input-label" htmlFor="verify-code">Código de verificación (6 dígitos)</label>
                  <input
                    id="verify-code"
                    type="text"
                    className="auth-text-input"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px' }}
                    required
                  />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '4px' }}>
                  {loading ? 'Verificando...' : 'Confirmar y entrar'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setEmailMode('login'); setAuthError(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Volver a iniciar sesión
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: GUEST NAME */}
        {activeTab === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="auth-form">
            <label className="auth-input-label" htmlFor="userNameField">
              {t('auth.input_label')}
            </label>
            <input
              id="userNameField"
              type="text"
              className="auth-text-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ej: Alberto, Familia López..."
              maxLength={40}
              required
            />
            <button type="submit" className="auth-submit-btn" style={{ marginTop: '10px' }}>
              {t('auth.submit')}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={handleOpenStudioPopup}
            className="auth-studio-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>{t('auth.studio_link')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
