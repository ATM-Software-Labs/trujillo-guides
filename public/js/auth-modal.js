// public/js/auth-modal.js

document.addEventListener('DOMContentLoaded', () => {
  const btnGoogle = document.getElementById('btn-login-google') || document.getElementById('btn-oauth-google');
  const btnX = document.getElementById('btn-login-x') || document.getElementById('btn-oauth-x');

  // Redirección real al flujo OAuth de Google
  if (btnGoogle) {
    btnGoogle.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/api/auth/google';
    });
  }

  // Redirección real al flujo OAuth de X
  if (btnX) {
    btnX.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/api/auth/x';
    });
  }

  // Comprobar la sesión activa del usuario real al cargar la página
  checkActiveSession();
});

async function checkActiveSession() {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Imprescindible para enviar cookies seguras
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        window.__taMe = data.user;
        updateDOMForAuthenticatedUser(data.user);
        document.dispatchEvent(new CustomEvent('atm:auth-changed', { detail: { user: data.user } }));
        return data.user;
      }
    }
    
    // Si no está autenticado, asegura que el DOM muestre el estado anónimo
    window.__taMe = null;
    updateDOMForAnonymousUser();
    document.dispatchEvent(new CustomEvent('atm:auth-changed', { detail: { user: null } }));
    return null;
  } catch (err) {
    window.__taMe = null;
    updateDOMForAnonymousUser();
    document.dispatchEvent(new CustomEvent('atm:auth-changed', { detail: { user: null } }));
    return null;
  }
}

function updateDOMForAuthenticatedUser(user) {
  const authorName = document.getElementById('author-name');
  const authorHandle = document.getElementById('author-handle');
  const authorAvatar = document.getElementById('author-avatar');

  if (authorName) authorName.textContent = user.name || user.username || user.email;
  if (authorHandle) {
    const raw = (user.handle || user.username || user.email || '').replace(/^@+/, '');
    authorHandle.textContent = raw ? `@${raw}` : '';
  }
  if (authorAvatar && (user.avatar || user.picture)) {
    authorAvatar.src = user.avatar || user.picture;
  }

  const loginTrigger = document.getElementById('btn-open-login');
  if (loginTrigger) loginTrigger.style.display = 'none';

  // Si existe paintAccount de chrome.js, sincronizar
  if (typeof window.atmCheckSession === 'function' && !window.__taMe) {
    window.__taMe = user;
  }
}

function updateDOMForAnonymousUser() {
  // Limpia cualquier residuo en caso de sesión no iniciada
  const loginTrigger = document.getElementById('btn-open-login');
  if (loginTrigger) loginTrigger.style.display = 'block';

  // Asegura que no se muestren datos residuales de otro usuario
  const authorName = document.getElementById('author-name');
  const authorHandle = document.getElementById('author-handle');
  const authorAvatar = document.getElementById('author-avatar');

  if (authorName && authorName.getAttribute('data-default')) {
    authorName.textContent = authorName.getAttribute('data-default');
  }
  if (authorHandle && authorHandle.getAttribute('data-default')) {
    authorHandle.textContent = authorHandle.getAttribute('data-default');
  }
  if (authorAvatar && authorAvatar.getAttribute('data-default')) {
    authorAvatar.src = authorAvatar.getAttribute('data-default');
  }
}

// Exponer en window para integración global
window.checkActiveSession = checkActiveSession;
window.updateDOMForAuthenticatedUser = updateDOMForAuthenticatedUser;
window.updateDOMForAnonymousUser = updateDOMForAnonymousUser;
