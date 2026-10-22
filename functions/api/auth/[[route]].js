import { signJwt, verifyJwt, hashPassword, verifyPassword, generateRandomString, generatePkce } from '../../lib/crypto-auth.js';
import { msConfig, msStart, msReadStateCookie, msExchange, msVerifyIdToken, msIsAdmin } from '../../lib/entra.js';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from '../../lib/resend.js';

const escHtml = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Página de error breve y con el estilo de la web; el detalle técnico va plegado
// Destino de vuelta permitido: rutas propias o https://*.trujillomingorance.com
function allowedReturn(raw) {
  if (!raw) return '';
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:' && (u.hostname === 'trujillomingorance.com' || u.hostname.endsWith('.trujillomingorance.com'))) return u.toString();
  } catch (_) {}
  return '';
}

function authErrorPage({ title, message, detail = '', retryHref = '', status = 400, back = '' }) {
  // Página neutra (trujillomingorance.com): también la ven usuarios de otros subdominios, p. ej. rewrite.
  if (back && retryHref === '/api/auth/x') retryHref = '/api/auth/x?returnTo=' + encodeURIComponent(back);
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(title)} · trujillomingorance.com</title><link rel="stylesheet" href="/css/nutri.css?v=202610221330"><link rel="icon" href="/favicon.svg">
<script src="/js/theme-boot.js"></script></head>
<body class="auth-error-page"><main class="auth-error-card">
<img src="/avatar.png" alt="" width="40" height="40" class="auth-error-logo">
<h1 data-tx="${escHtml(title)}">${escHtml(title)}</h1><p data-tx="${escHtml(message)}">${escHtml(message)}</p>
<div class="auth-error-actions">${retryHref ? `<a class="auth-error-btn primary" href="${escHtml(retryHref)}" data-tx="Reintentar">Reintentar</a>` : ''}<a class="auth-error-btn" href="${escHtml(back || '/')}" data-tx="Volver">Volver</a></div>
${detail ? `<details><summary data-tx="Detalle técnico">Detalle técnico</summary><pre>${escHtml(detail)}</pre></details>` : ''}
</main><script src="/js/i18n.js?v=202610221330"></script><script>try{window.atmApplyUi(window.atmLang())}catch(e){}</script></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

// Perfil público por handle (solo campos públicos; nunca email ni tokens)
async function savePublicProfile(env, u) {
  try {
    if (!env.BOT_MEMORY || !u || !u.handle) return;
    const key = `profile:${String(u.handle).toLowerCase()}`;
    const prev = JSON.parse((await env.BOT_MEMORY.get(key)) || 'null') || {};
    await env.BOT_MEMORY.put(key, JSON.stringify({
      customAvatar: prev.customAvatar || '',
      handle: String(u.handle).toLowerCase(),
      name: u.name || prev.name || u.handle,
      avatar: u.avatar || prev.avatar || '',
      provider: u.provider || prev.provider || '',
      role: u.role === 'admin' ? 'admin' : 'author',
      joinedAt: prev.joinedAt || new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    }));
  } catch (e) {}
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const DEFAULT_GOOGLE_CLIENT_ID = '161745150528-5pb84k9upvamvlvnc7lg6nr1ku74vc4a.apps.googleusercontent.com';
  const DEFAULT_X_CLIENT_ID = 'NF94WVVIT1dzSXZNaTJuYjRXSEc6MTpjaQ';
  const DEFAULT_JWT_SECRET = 'trujillo_jwt_secret_2026';

  const googleClientId = env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  const xClientId = env.X_CLIENT_ID || env.TWITTER_CLIENT_ID || DEFAULT_X_CLIENT_ID;
  const jwtSecret = env.JWT_SECRET || DEFAULT_JWT_SECRET;
  const appOrigin = url.origin;

  const hostname = url.hostname;
  const isMainDomain = hostname.endsWith('trujillomingorance.com');
  const domainAttr = isMainDomain ? '; Domain=.trujillomingorance.com' : '';

  const NO_CACHE_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Vary': 'Cookie, Authorization'
  };

  // Helper: parse cookies
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = {};
  cookieHeader.split(';').forEach(p => {
    const idx = p.indexOf('=');
    if (idx > 0) {
      cookies[p.substring(0, idx).trim()] = decodeURIComponent(p.substring(idx + 1).trim());
    }
  });

  // ==========================================
  // 0. PROVEEDORES DISPONIBLES (para mostrar u ocultar botones en todos los sitios)
  // ==========================================
  const ms = msConfig(env);
  if (path === '/api/auth/providers') {
    const origin = request.headers.get('Origin') || '';
    const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60', 'Vary': 'Origin' };
    try { const o = new URL(origin); if (o.protocol === 'https:' && (o.hostname === 'trujillomingorance.com' || o.hostname.endsWith('.trujillomingorance.com'))) h['Access-Control-Allow-Origin'] = origin; } catch (_) {}
    return new Response(JSON.stringify({ google: true, x: true, email: true, microsoft: ms.enabled }), { status: 200, headers: h });
  }

  // ==========================================
  // 0b. MICROSOFT ENTRA ID (solo el tenant de ATM Software Labs)
  // ==========================================
  const GUIDES_HOST = 'guides.trujillomingorance.com';
  const msRedirectUri = isMainDomain ? `https://${GUIDES_HOST}/api/auth/microsoft/callback` : `${appOrigin}/api/auth/microsoft/callback`;
  if (path === '/api/auth/microsoft' && request.method === 'GET') {
    if (!ms.enabled) {
      return authErrorPage({ title: 'Microsoft no está disponible', message: 'El acceso con Microsoft todavía no está activado. Usa Google, X o tu correo.', status: 404, back: allowedReturn(url.searchParams.get('returnTo') || '') });
    }
    // El flujo vive en guides para que la cookie de estado y el callback coincidan
    if (isMainDomain && hostname !== GUIDES_HOST) {
      return Response.redirect(`https://${GUIDES_HOST}/api/auth/microsoft${url.search}`, 302);
    }
    const returnTo = allowedReturn(url.searchParams.get('returnTo') || '') || '/';
    const { location, cookie } = await msStart(ms, { redirectUri: msRedirectUri, returnTo, jwtSecret });
    const headers = new Headers({ Location: location, 'Cache-Control': 'private, no-cache, no-store, must-revalidate' });
    headers.append('Set-Cookie', `ms_oauth=${cookie}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth/microsoft; Max-Age=600`);
    return new Response(null, { status: 302, headers });
  }

  if (path === '/api/auth/microsoft/callback' && request.method === 'GET') {
    const st = await msReadStateCookie(cookies.ms_oauth, jwtSecret);
    const back = (st && allowedReturn(st.r)) || '/';
    const clearState = 'ms_oauth=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth/microsoft; Max-Age=0';
    const fail = (code, status = 400) => {
      const r = authErrorPage({ title: 'No se ha podido entrar con Microsoft', message: 'Solo pueden entrar cuentas de ATM Software Labs. Vuelve a intentarlo o usa otro método.', detail: `Código: ${code}`, retryHref: '/api/auth/microsoft?returnTo=' + encodeURIComponent(back), status, back });
      r.headers.append('Set-Cookie', clearState);
      return r;
    };
    if (!ms.enabled) return fail('provider_disabled', 404);
    if (url.searchParams.get('error')) return fail(String(url.searchParams.get('error')).slice(0, 60));
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!st || !code || !state || state !== st.s) return fail('state_mismatch');
    let claims;
    try {
      const tokens = await msExchange(ms, { code, codeVerifier: st.v, redirectUri: msRedirectUri });
      claims = await msVerifyIdToken(ms, tokens.id_token, { nonce: st.n });
    } catch (e) {
      return fail(String((e && (e.code ? 'token_' + e.code : e.message)) || 'error').slice(0, 60), 401);
    }
    const mail = String(claims.email || claims.preferred_username || '').toLowerCase();
    let handle = (mail.split('@')[0] || String(claims.name || 'user')).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || 'user';
    if (env.BOT_MEMORY) {
      try {
        const prev = JSON.parse((await env.BOT_MEMORY.get(`profile:${handle}`)) || 'null');
        if (prev && prev.provider && prev.provider !== 'microsoft') handle = (handle.slice(0, 21) + '_ms');
      } catch (_) {}
    }
    const sessionPayload = {
      id: 'ms:' + (claims.oid || claims.sub),
      email: mail,
      name: claims.name || handle,
      avatar: '',
      handle,
      role: 'internal',
      admin: msIsAdmin(ms, claims),
      provider: 'microsoft',
      tid: String(claims.tid).toLowerCase(),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 12)
    };
    const sessionToken = await signJwt(sessionPayload, jwtSecret);
    await savePublicProfile(env, sessionPayload);
    if (env.BOT_MEMORY) {
      try {
        await env.BOT_MEMORY.put(`user:ms:${claims.oid || claims.sub}`, JSON.stringify({ id: sessionPayload.id, name: sessionPayload.name, email: mail, handle, role: 'internal', admin: sessionPayload.admin, provider: 'microsoft', lastLoginAt: new Date().toISOString() }));
      } catch (_) {}
    }
    const headers = new Headers({ Location: back, 'Cache-Control': 'private, no-cache, no-store, must-revalidate' });
    const maxAge = 60 * 60 * 12;
    for (const n of ['session_token', 'atm_session', 'ta_session']) {
      if (domainAttr) headers.append('Set-Cookie', `${n}=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.trujillomingorance.com; Max-Age=${maxAge}`);
      headers.append('Set-Cookie', `${n}=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
    }
    headers.append('Set-Cookie', clearState);
    return new Response(null, { status: 302, headers });
  }

  // ==========================================
  // 1. REDIRECCIÓN A GOOGLE OAUTH
  // ==========================================
  if (path === '/api/auth/google' && request.method === 'GET') {
    if (!env.GOOGLE_CLIENT_SECRET) {
      const rawReturn = url.searchParams.get('returnTo') || '/';
      // Siempre URL absoluta del propio sitio: una ruta relativa haría volver al dominio de login
      const returnUrl = rawReturn.startsWith('/') && !rawReturn.startsWith('//') ? url.origin + rawReturn : url.origin;
      return Response.redirect(`https://ai.trujillomingorance.com/login?redirect_to=${encodeURIComponent(returnUrl)}`, 302);
    }
    const state = crypto.randomUUID();
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', googleClientId);
    googleAuthUrl.searchParams.set('redirect_uri', `${appOrigin}/api/auth/google/callback`);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    googleAuthUrl.searchParams.set('state', state);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': googleAuthUrl.toString(),
        'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=600`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  }

  // Soporte para verificación directa de ID token (Google Identity Services - idéntico a Trujillo AI)
  if (path === '/api/auth/google' && request.method === 'POST') {
    try {
      const body = await request.json();
      const credential = body.credential || '';
      if (!credential) {
        return new Response(JSON.stringify({ error: 'Falta la credencial de Google.' }), { status: 400, headers: NO_CACHE_HEADERS });
      }

      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!verifyRes.ok) {
        return new Response(JSON.stringify({ error: 'No se pudo verificar la cuenta de Google.' }), { status: 401, headers: NO_CACHE_HEADERS });
      }

      const googleUser = await verifyRes.json();
      // El ID token debe haberse emitido para nuestro client_id y con email verificado
      if (googleUser.aud !== googleClientId || String(googleUser.email_verified) !== 'true') {
        return new Response(JSON.stringify({ error: 'La credencial de Google no es válida para este sitio.' }), { status: 401, headers: NO_CACHE_HEADERS });
      }
      const email = String(googleUser.email || '').trim().toLowerCase();
      if (!email) {
        return new Response(JSON.stringify({ error: 'La sesión de Google no es válida.' }), { status: 401, headers: NO_CACHE_HEADERS });
      }

      const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      const sessionPayload = {
        id: googleUser.sub || googleUser.id,
        email: email,
        name: googleUser.name || handle,
        avatar: googleUser.picture || '',
        handle: handle,
        role: (email === 'alberto@trujillomingorance.com' || email === 'atrumin16@gmail.com') ? 'admin' : 'author',
        provider: 'google',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
      };

      const sessionToken = await signJwt(sessionPayload, jwtSecret);
    await savePublicProfile(env, sessionPayload);

      if (env.BOT_MEMORY) {
        const existing = await env.BOT_MEMORY.get(`user:email:${email}`);
        if (!existing) {
          await env.BOT_MEMORY.put(`user:email:${email}`, JSON.stringify(sessionPayload));
          if (env.RESEND_API_KEY) {
            context.waitUntil(sendWelcomeEmail({ to: email, name: googleUser.name, provider: 'google' }, env.RESEND_API_KEY));
          }
        }
      }

      const headers = new Headers(NO_CACHE_HEADERS);
      headers.append('Set-Cookie', `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=604800`);
      headers.append('Set-Cookie', `atm_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=604800`);
      headers.append('Set-Cookie', `ta_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=604800`);

      return new Response(JSON.stringify({
        authenticated: true,
        token: sessionToken,
        user: {
          id: sessionPayload.id,
          name: sessionPayload.name,
          email: sessionPayload.email,
          avatar: sessionPayload.avatar,
          handle: sessionPayload.handle,
          role: sessionPayload.role
        }
      }), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e?.message || 'Error de autenticación con Google' }), { status: 500, headers: NO_CACHE_HEADERS });
    }
  }

  // ==========================================
  // 2. CALLBACK DE GOOGLE OAUTH
  // ==========================================
  if (path === '/api/auth/google/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies.oauth_state;

    if (!code || !state || state !== storedState) {
      return new Response('Error de validación de estado CSRF en Google OAuth.', {
        status: 400,
        headers: NO_CACHE_HEADERS
      });
    }

    // Canjear código por tokens en Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        ...(env.GOOGLE_CLIENT_SECRET ? { client_secret: env.GOOGLE_CLIENT_SECRET } : {}),
        redirect_uri: `${appOrigin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => '');
      return authErrorPage({
        title: 'El acceso con Google no está disponible',
        message: 'No hemos podido completar el inicio de sesión con Google. Vuelve a intentarlo en un momento.',
        detail: errText,
        retryHref: '/api/auth/google',
        status: 502,
      });
    }

    const tokens = await tokenRes.json();

    // Obtener datos del perfil del usuario real
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userRes.json();

    if (!profile.email) {
      return new Response('No se pudo obtener el email de Google', {
        status: 500,
        headers: NO_CACHE_HEADERS
      });
    }

    const email = profile.email.toLowerCase().trim();
    const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

    // Payload de sesión real del usuario logueado
    const sessionPayload = {
      id: profile.id,
      email: email,
      name: profile.name || handle,
      avatar: profile.picture || '',
      handle: handle,
      role: (email === 'alberto@trujillomingorance.com' || email === 'atrumin16@gmail.com') ? 'admin' : 'author',
      provider: 'google',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 días
    };

    // Firmado criptográfico seguro con HMAC/JWT
    const sessionToken = await signJwt(sessionPayload, jwtSecret);
    await savePublicProfile(env, sessionPayload);

    // Persistencia y correo de bienvenida si es nuevo usuario
    if (env.BOT_MEMORY) {
      const existing = await env.BOT_MEMORY.get(`user:email:${email}`);
      if (!existing) {
        await env.BOT_MEMORY.put(`user:email:${email}`, JSON.stringify(sessionPayload));
        if (env.RESEND_API_KEY) {
          context.waitUntil(sendWelcomeEmail({ to: email, name: profile.name, provider: 'google' }, env.RESEND_API_KEY));
        }
      }
    }

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=604800`
    );
    headers.append(
      'Set-Cookie',
      `atm_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=604800`
    );
    headers.append(
      'Set-Cookie',
      `ta_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=604800`
    );
    headers.append('Set-Cookie', `oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=0`);
    headers.append('Location', '/');
    headers.append('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return new Response(null, { status: 302, headers });
  }

  // ==========================================
  // 3. X (TWITTER) OAUTH 2.0 PKCE INITIATION
  // ==========================================
  if (path === '/api/auth/x') {
    const { codeVerifier, codeChallenge } = await generatePkce();
    const csrf = crypto.randomUUID();
    const returnTo = url.searchParams.get('returnTo') || '/';
    const statePayload = btoa(JSON.stringify({ csrf, returnTo })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
    twitterAuthUrl.searchParams.set('response_type', 'code');
    twitterAuthUrl.searchParams.set('client_id', xClientId);
    twitterAuthUrl.searchParams.set('redirect_uri', `${appOrigin}/api/auth/x/callback`);
    twitterAuthUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
    twitterAuthUrl.searchParams.set('state', statePayload);
    twitterAuthUrl.searchParams.set('code_challenge', codeChallenge);
    twitterAuthUrl.searchParams.set('code_challenge_method', 'S256');

    const cookiePayload = btoa(JSON.stringify({ csrf, codeVerifier }));

    const headers = new Headers();
    headers.set('Location', twitterAuthUrl.toString());
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    // Cookie de dominio compartido y cookie local (evita que navegadores como Safari pierdan la cookie PKCE al redirigir de vuelta)
    if (domainAttr) {
      headers.append('Set-Cookie', `oauth_x_state=${cookiePayload}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.trujillomingorance.com; Max-Age=600`);
    }
    headers.append('Set-Cookie', `oauth_x_state_local=${cookiePayload}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);

    return new Response(null, { status: 302, headers });
  }

  // ==========================================
  // 4. X (TWITTER) OAUTH 2.0 PKCE CALLBACK
  // ==========================================
  if (path === '/api/auth/x/callback') {
    let back = '';
    try { back = allowedReturn(JSON.parse(atob((url.searchParams.get('state') || '').replace(/-/g, '+').replace(/_/g, '/'))).returnTo || ''); } catch (_) {}
    // 1. Manejar errores directos devueltos por X
    const oauthError = url.searchParams.get('error');
    if (oauthError) {
      const errDesc = url.searchParams.get('error_description') || oauthError;
      return authErrorPage({
        title: 'Has cancelado el acceso con X',
        message: 'No se ha iniciado sesión. Puedes volver a intentarlo o entrar con Google o con tu correo.',
        detail: errDesc,
        retryHref: '/api/auth/x', back,
      });
    }

    const code = url.searchParams.get('code');
    const stateRaw = url.searchParams.get('state');
    const cookieRaw = cookies.oauth_x_state || cookies.oauth_x_state_local;

    if (!code || !stateRaw || !cookieRaw) {
      return authErrorPage({
        title: 'La sesión con X ha caducado',
        message: 'Han pasado demasiados minutos o el navegador bloqueó una cookie durante la redirección. Vuelve a intentarlo.',
        detail: 'Falta el código de autorización, el parámetro state o la cookie PKCE (oauth_x_state).',
        retryHref: '/api/auth/x', back,
      });
    }

    let cookieData = {};
    let stateData = {};
    try {
      cookieData = JSON.parse(atob(cookieRaw));
      stateData = JSON.parse(atob(stateRaw.replace(/-/g, '+').replace(/_/g, '/')));
    } catch (e) {
      return authErrorPage({ title: 'No se ha podido completar el acceso con X', message: 'Los datos de vuelta de X no son válidos. Vuelve a intentarlo.', retryHref: '/api/auth/x', back, status: 400 });
    }

    if (!cookieData.csrf || cookieData.csrf !== stateData.csrf || !cookieData.codeVerifier) {
      return authErrorPage({ title: 'No se ha podido verificar el acceso con X', message: 'Por seguridad no hemos podido confirmar la petición. Vuelve a intentarlo.', retryHref: '/api/auth/x', back, status: 400 });
    }

    const clientSecret = (env.X_CLIENT_SECRET || env.TWITTER_CLIENT_SECRET || '').trim();

    const tokenHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    };

    const tokenBodyParams = {
      code,
      grant_type: 'authorization_code',
      client_id: xClientId,
      redirect_uri: `${appOrigin}/api/auth/x/callback`,
      code_verifier: cookieData.codeVerifier
    };

    if (clientSecret) {
      // Modo Confidential Client: HTTP Basic Auth
      tokenHeaders['Authorization'] = `Basic ${btoa(`${xClientId}:${clientSecret}`)}`;
    }

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: tokenHeaders,
      body: new URLSearchParams(tokenBodyParams)
    });

    const tokenText = await tokenRes.text();
    let tokenData = {};
    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {}

    if (!tokenRes.ok || !tokenData.access_token) {
      const detail = tokenData.error_description || tokenData.error || tokenText || 'Error desconocido al intercambiar código';
      console.error('[X OAuth Error]', detail);
      return authErrorPage({
        title: 'El acceso con X no está disponible',
        message: 'Ahora mismo no se puede entrar con X. Usa Google o tu correo mientras lo arreglamos.',
        detail: `Respuesta de X: ${detail}\nCallback: ${appOrigin}/api/auth/x/callback\nClient secret: ${clientSecret ? 'configurado' : 'no configurado (X_CLIENT_SECRET)'}`,
        status: 502,
      });
    }

    const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,description', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const xUserData = await userRes.json();
    const xUser = xUserData.data || {};

    const handle = (xUser.username || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const sessionPayload = {
      id: xUser.id,
      email: `${handle}@x.com`,
      name: xUser.name || handle,
      avatar: (xUser.profile_image_url || '').replace('_normal.', '_400x400.'),
      handle: handle,
      role: handle === 'atrumin16' ? 'admin' : 'author',
      provider: 'x',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
    };

    const sessionToken = await signJwt(sessionPayload, jwtSecret);
    await savePublicProfile(env, sessionPayload);

    if (env.BOT_MEMORY) {
      try {
        await env.BOT_MEMORY.put(`user:id:${xUser.id}`, JSON.stringify(sessionPayload));
        await env.BOT_MEMORY.put(`user:handle:${handle}`, JSON.stringify(sessionPayload));
      } catch (e) {}
    }

    const headers = new Headers();
    if (domainAttr) {
      headers.append('Set-Cookie', `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.trujillomingorance.com; Max-Age=604800`);
      headers.append('Set-Cookie', `atm_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.trujillomingorance.com; Max-Age=604800`);
      headers.append('Set-Cookie', `ta_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.trujillomingorance.com; Max-Age=604800`);
      headers.append('Set-Cookie', `oauth_x_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.trujillomingorance.com; Max-Age=0`);
    }
    headers.append('Set-Cookie', `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);
    headers.append('Set-Cookie', `atm_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);
    headers.append('Set-Cookie', `ta_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);
    headers.append('Set-Cookie', 'oauth_x_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    headers.append('Set-Cookie', 'oauth_x_state_local=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');

    // Rutas propias o subdominios https de trujillomingorance.com (p. ej. rewrite.) — nunca dominios externos
    const rt = stateData.returnTo || '/';
    let redirectTarget = '/';
    if (rt.startsWith('/') && !rt.startsWith('//')) redirectTarget = rt;
    else {
      try {
        const u = new URL(rt);
        if (u.protocol === 'https:' && (u.hostname === 'trujillomingorance.com' || u.hostname.endsWith('.trujillomingorance.com'))) redirectTarget = u.toString();
      } catch (_) {}
    }
    headers.append('Location', redirectTarget);
    headers.append('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return new Response(null, { status: 302, headers });
  }

  // ==========================================
  // 5. ENDPOINT DE ESTADO DE SESIÓN (/api/auth/me)
  // ==========================================
  // /me con CORS con credenciales solo para https://*.trujillomingorance.com (los demás sitios muestran «Panel interno»)
  if (path === '/api/auth/me') {
    const origin = request.headers.get('Origin') || '';
    let okOrigin = false;
    try { const o = new URL(origin); okOrigin = o.protocol === 'https:' && (o.hostname === 'trujillomingorance.com' || o.hostname.endsWith('.trujillomingorance.com')); } catch (_) {}
    if (okOrigin) {
      NO_CACHE_HEADERS['Access-Control-Allow-Origin'] = origin;
      NO_CACHE_HEADERS['Access-Control-Allow-Credentials'] = 'true';
      NO_CACHE_HEADERS['Vary'] = 'Origin, Cookie, Authorization';
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: okOrigin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '600', 'Vary': 'Origin' } : {} });
    }
  }
  if (path === '/api/auth/me') {
    // Probar todas las cookies de sesión: una caducada no debe tapar otra válida (p. ej. ta_session tras entrar con Google en ai.)
    const candidates = [cookies.session_token, cookies.atm_session, cookies.ta_session, cookies.auth_token, (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')].filter(Boolean);
    const rawToken = candidates[0];

    if (!rawToken) {
      return new Response(JSON.stringify({ authenticated: false, user: null }), {
        // 200 (not 401) for "no session": every client reads data.authenticated, and a 401 shows up as a console error on each anonymous page view.
        status: 200,
        headers: NO_CACHE_HEADERS,
      });
    }

    try {
      // Validar primero firma JWT con secret
      let user = null;
      for (const tk of candidates) {
        try { const u = await verifyJwt(tk, jwtSecret); if (u && !(u.exp && u.exp < Math.floor(Date.now() / 1000))) { user = u; break; } } catch (e) {}
      }

      // Sin firma válida no hay sesión (antes se aceptaba JSON en base64 sin firmar,
      // lo que permitía falsificar cualquier usuario, incluido admin)

      if (!user || (user.exp && user.exp < Math.floor(Date.now() / 1000))) {
        throw new Error('Token inválido o expirado');
      }

      const cleanHandle = (user.handle || (user.email ? user.email.split('@')[0] : '') || '').replace(/^@+/, '');

      // Sesiones creadas en ai.trujillomingorance.com no pasan por nuestros callbacks: crear su perfil público si falta
      if (env.BOT_MEMORY && cleanHandle) {
        context.waitUntil(env.BOT_MEMORY.get(`profile:${cleanHandle.toLowerCase()}`).then((v) => v ? null : savePublicProfile(env, {
          handle: cleanHandle.toLowerCase().replace(/[^a-z0-9_]/g, ''), name: user.name, avatar: user.avatar || user.picture, provider: user.provider || 'trujillo-ai', role: user.role,
        })).catch(() => {}));
      }

      let customAvatar = '';
      if (env.BOT_MEMORY && cleanHandle) {
        try { const pr = JSON.parse((await env.BOT_MEMORY.get(`profile:${cleanHandle.toLowerCase().replace(/[^a-z0-9_]/g, '')}`)) || 'null'); customAvatar = (pr && pr.customAvatar) || ''; } catch (e) {}
      }
      return new Response(JSON.stringify({
        authenticated: true,
        user: {
          id: user.id || user.sub || '',
          name: user.name || cleanHandle,
          email: user.email || '',
          avatar: customAvatar || user.avatar || user.picture || '',
          handle: cleanHandle,
          role: user.role || 'author',
          provider: user.provider || '',
          admin: user.role === 'internal' && user.admin === true
        }
      }), {
        status: 200,
        headers: NO_CACHE_HEADERS,
      });
    } catch {
      return new Response(JSON.stringify({ authenticated: false, user: null }), {
        // 200 (not 401) for "no session": every client reads data.authenticated, and a 401 shows up as a console error on each anonymous page view.
        status: 200,
        headers: NO_CACHE_HEADERS,
      });
    }
  }

  // ==========================================
  // 6. LOGOUT (/api/auth/logout)
  // ==========================================
  if (path === '/api/auth/logout') {
    const headers = new Headers(NO_CACHE_HEADERS);
    headers.append('Set-Cookie', `session_token=; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=0`);
    headers.append('Set-Cookie', `atm_session=; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=0`);
    headers.append('Set-Cookie', `ta_session=; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=0`);
    headers.append('Set-Cookie', `auth_token=; HttpOnly; Secure; SameSite=Lax; Path=/${domainAttr}; Max-Age=0`);
    // Limpiar también cookies locales sin domainAttr por compatibilidad
    headers.append('Set-Cookie', 'session_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    headers.append('Set-Cookie', 'atm_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    headers.append('Set-Cookie', 'ta_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    headers.append('Set-Cookie', 'auth_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');

    if (request.method === 'GET') {
      headers.append('Location', '/');
      return new Response(null, { status: 302, headers });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers
    });
  }

  // ==========================================
  // 7. LOGIN NATIVO CON CONTRASEÑA (/api/auth/login)
  // ==========================================
  if (path === '/api/auth/login' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (e) {}

    const email = (body.email || '').toLowerCase().trim();
    const password = body.password || '';

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Correo y contraseña requeridos' }), { status: 400, headers: NO_CACHE_HEADERS });
    }

    if (!env.BOT_MEMORY) {
      return new Response(JSON.stringify({ error: 'Almacenamiento no disponible' }), { status: 500, headers: NO_CACHE_HEADERS });
    }

    const rawUser = await env.BOT_MEMORY.get(`user:email:${email}`);
    if (!rawUser) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), { status: 401, headers: NO_CACHE_HEADERS });
    }

    const user = JSON.parse(rawUser);
    const valid = user.password_hash && await verifyPassword(password, user.password_hash);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), { status: 401, headers: NO_CACHE_HEADERS });
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatar: user.picture || '',
      picture: user.picture || '',
      role: user.role || 'author',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
    };

    const sessionToken = await signJwt(sessionPayload, jwtSecret);
    await savePublicProfile(env, sessionPayload);

    const headers = new Headers(NO_CACHE_HEADERS);
    headers.append('Set-Cookie', `session_token=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);
    headers.append('Set-Cookie', `atm_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);

    return new Response(JSON.stringify({ ok: true, user: sessionPayload }), { headers });
  }

  // ==========================================
  // 8. REGISTRO NATIVO (/api/auth/register)
  // ==========================================
  if (path === '/api/auth/register' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (e) {}

    const email = (body.email || '').toLowerCase().trim();
    const password = body.password || '';
    const name = (body.name || '').trim() || email.split('@')[0];

    if (!email || !email.includes('@') || password.length < 8) {
      return new Response(JSON.stringify({ error: 'Email inválido o contraseña menor a 8 caracteres' }), { status: 400, headers: NO_CACHE_HEADERS });
    }

    if (!env.BOT_MEMORY) {
      return new Response(JSON.stringify({ error: 'Almacenamiento no disponible' }), { status: 500, headers: NO_CACHE_HEADERS });
    }

    const existing = await env.BOT_MEMORY.get(`user:email:${email}`);
    if (existing) {
      return new Response(JSON.stringify({ error: 'El correo ya está registrado' }), { status: 409, headers: NO_CACHE_HEADERS });
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr_${generateRandomString(18)}`;
    const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

    const userRecord = {
      id: userId,
      email,
      name,
      handle,
      password_hash: passwordHash,
      role: (email === 'alberto@trujillomingorance.com' || email === 'atrumin16@gmail.com') ? 'admin' : 'author',
      created_at: Date.now()
    };

    await env.BOT_MEMORY.put(`user:email:${email}`, JSON.stringify(userRecord));
    await env.BOT_MEMORY.put(`user:id:${userId}`, JSON.stringify(userRecord));

    if (env.RESEND_API_KEY) {
      const verifyToken = generateRandomString(32);
      await env.BOT_MEMORY.put(`verify_token:${verifyToken}`, JSON.stringify({ userId, email }), { expirationTtl: 86400 });
      const verifyUrl = `${origin}/api/auth/verify-email?token=${verifyToken}`;
      context.waitUntil(sendVerificationEmail({ to: email, name, verifyUrl }, env.RESEND_API_KEY));
      context.waitUntil(sendWelcomeEmail({ to: email, name, provider: 'credenciales' }, env.RESEND_API_KEY));
    }

    return new Response(JSON.stringify({ ok: true, message: 'Cuenta creada exitosamente.' }), { status: 201, headers: NO_CACHE_HEADERS });
  }

  // ==========================================
  // 9. FORGOT PASSWORD (/api/auth/forgot-password)
  // ==========================================
  if (path === '/api/auth/forgot-password' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (e) {}
    const email = (body.email || '').toLowerCase().trim();

    if (email && env.BOT_MEMORY) {
      const rawUser = await env.BOT_MEMORY.get(`user:email:${email}`);
      if (rawUser && env.RESEND_API_KEY) {
        const user = JSON.parse(rawUser);
        const resetToken = generateRandomString(36);
        await env.BOT_MEMORY.put(`reset_token:${resetToken}`, JSON.stringify({ userId: user.id }), { expirationTtl: 900 }); // 15 min TTL
        const resetUrl = `${origin}/login?reset_token=${resetToken}`;
        context.waitUntil(sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl }, env.RESEND_API_KEY));
      }
    }

    return new Response(JSON.stringify({ ok: true, message: 'Si el correo existe, recibirás un enlace de 15 minutos.' }), { headers: NO_CACHE_HEADERS });
  }

  // ==========================================
  // 10. RESET PASSWORD (/api/auth/reset-password)
  // ==========================================
  if (path === '/api/auth/reset-password' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (e) {}

    const token = body.token;
    const newPassword = body.new_password || '';

    if (!token || newPassword.length < 8 || !env.BOT_MEMORY) {
      return new Response(JSON.stringify({ error: 'Token inválido o contraseña demasiado corta' }), { status: 400, headers: NO_CACHE_HEADERS });
    }

    const tokenKey = `reset_token:${token}`;
    const rawToken = await env.BOT_MEMORY.get(tokenKey);
    if (!rawToken) {
      return new Response(JSON.stringify({ error: 'El enlace ha expirado o ya fue utilizado (límite 15 min).' }), { status: 400, headers: NO_CACHE_HEADERS });
    }

    await env.BOT_MEMORY.delete(tokenKey); // Consumo atómico
    const tokenInfo = JSON.parse(rawToken);
    const userKey = `user:id:${tokenInfo.userId}`;
    const rawUser = await env.BOT_MEMORY.get(userKey);

    if (rawUser) {
      const user = JSON.parse(rawUser);
      user.password_hash = await hashPassword(newPassword);
      await env.BOT_MEMORY.put(userKey, JSON.stringify(user));
      await env.BOT_MEMORY.put(`user:email:${user.email}`, JSON.stringify(user));
    }

    return new Response(JSON.stringify({ ok: true, message: 'Contraseña actualizada correctamente.' }), { headers: NO_CACHE_HEADERS });
  }

  // ==========================================
  // 11. VERIFY EMAIL (/api/auth/verify-email)
  // ==========================================
  if (path === '/api/auth/verify-email') {
    const token = url.searchParams.get('token');
    if (token && env.BOT_MEMORY) {
      const tokenKey = `verify_token:${token}`;
      const rawToken = await env.BOT_MEMORY.get(tokenKey);
      if (rawToken) {
        const tokenInfo = JSON.parse(rawToken);
        const userKey = `user:id:${tokenInfo.userId}`;
        const rawUser = await env.BOT_MEMORY.get(userKey);
        if (rawUser) {
          const user = JSON.parse(rawUser);
          user.email_verified = true;
          await env.BOT_MEMORY.put(userKey, JSON.stringify(user));
        }
        await env.BOT_MEMORY.delete(tokenKey);
      }
    }
    return Response.redirect(`${origin}/?account_verified=true`, 302);
  }

  return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), { status: 404, headers: NO_CACHE_HEADERS });
}
