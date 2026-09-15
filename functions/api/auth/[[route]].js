import { signJwt, verifyJwt, hashPassword, verifyPassword, generateRandomString, generatePkce } from '../../lib/crypto-auth.js';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from '../../lib/resend.js';

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
  // 1. REDIRECCIÓN A GOOGLE OAUTH
  // ==========================================
  if (path === '/api/auth/google' && request.method === 'GET') {
    if (!env.GOOGLE_CLIENT_SECRET) {
      const returnUrl = url.searchParams.get('returnTo') || url.origin;
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
      return new Response(`Fallo al obtener el token de Google: ${errText}`, {
        status: 500,
        headers: NO_CACHE_HEADERS
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
    // 1. Manejar errores directos devueltos por X
    const oauthError = url.searchParams.get('error');
    if (oauthError) {
      const errDesc = url.searchParams.get('error_description') || oauthError;
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Error X OAuth</title></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;padding:2.5rem;background:#0b0f14;color:#f8fafc;max-width:640px;margin:0 auto;line-height:1.6;">
          <h2 style="color:#ef4444;margin-top:0;">Autorización en X cancelada o denegada</h2>
          <p>La plataforma X devolvió el siguiente mensaje de error:</p>
          <pre style="background:#1e293b;padding:1rem;border-radius:8px;color:#fca5a5;overflow-x:auto;">${errDesc}</pre>
          <p><a href="/" style="display:inline-block;margin-top:1rem;background:#38bdf8;color:#0b0f14;font-weight:600;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;">← Volver al inicio</a></p>
        </body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const code = url.searchParams.get('code');
    const stateRaw = url.searchParams.get('state');
    const cookieRaw = cookies.oauth_x_state || cookies.oauth_x_state_local;

    if (!code || !stateRaw || !cookieRaw) {
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Error de Sesión X</title></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;padding:2.5rem;background:#0b0f14;color:#f8fafc;max-width:640px;margin:0 auto;line-height:1.6;">
          <h2 style="color:#f59e0b;margin-top:0;">Estado de autorización expirado o ausente</h2>
          <p>No se encontró la cookie de verificación PKCE o el código de autorización en la solicitud de retorno.</p>
          <p>Causa común: Han pasado más de 10 minutos entre el inicio de sesión y la confirmación, o el navegador bloqueó cookies de terceros durante la redirección.</p>
          <p><a href="/api/auth/x" style="display:inline-block;margin-top:1rem;background:#38bdf8;color:#0b0f14;font-weight:600;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;">Reintentar inicio de sesión con X</a></p>
        </body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    let cookieData = {};
    let stateData = {};
    try {
      cookieData = JSON.parse(atob(cookieRaw));
      stateData = JSON.parse(atob(stateRaw.replace(/-/g, '+').replace(/_/g, '/')));
    } catch (e) {
      return new Response('Payload corrupto en X OAuth.', { status: 400 });
    }

    if (!cookieData.csrf || cookieData.csrf !== stateData.csrf || !cookieData.codeVerifier) {
      return new Response('Fallo de validación CSRF en X OAuth. Por favor reintenta.', { status: 403 });
    }

    const clientSecret = (env.X_CLIENT_SECRET || env.TWITTER_CLIENT_SECRET || '').trim();

    const tokenHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    };

    const tokenBodyParams = {
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${appOrigin}/api/auth/x/callback`,
      code_verifier: cookieData.codeVerifier
    };

    if (clientSecret) {
      // Modo Confidential Client: HTTP Basic Auth
      tokenHeaders['Authorization'] = `Basic ${btoa(`${xClientId}:${clientSecret}`)}`;
    } else {
      // Modo Public Client (PKCE): client_id en el cuerpo
      tokenBodyParams.client_id = xClientId;
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
      return new Response(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Error al intercambiar token con X</title></head>
        <body style="font-family:system-ui,-apple-system,sans-serif;padding:2.5rem;background:#0b0f14;color:#f8fafc;max-width:680px;margin:0 auto;line-height:1.6;">
          <h2 style="color:#ef4444;margin-top:0;">Error en el intercambio de credenciales con X (Twitter)</h2>
          <p><strong>Detalle devuelto por la API de X:</strong></p>
          <pre style="background:#1e293b;padding:1rem;border-radius:8px;color:#fca5a5;overflow-x:auto;">${detail}</pre>
          <hr style="border:0;border-top:1px solid #334155;margin:1.5rem 0;" />
          <h3 style="color:#38bdf8;font-size:1.1rem;">Verificación requerida en X Developer Portal:</h3>
          <ul style="padding-left:1.25rem;">
            <li><strong>Callback URI / Redirect URL en X:</strong> <code>${appOrigin}/api/auth/x/callback</code></li>
            <li><strong>Client ID en uso:</strong> <code>${xClientId}</code></li>
            <li><strong>Client Secret:</strong> ${clientSecret ? 'Configurado en variables de entorno' : 'No configurado (Modo Public Client / Native App). Si en X configuraste "Web App", debes añadir <code>X_CLIENT_SECRET</code> en Cloudflare Pages.'}</li>
          </ul>
          <p><a href="/" style="display:inline-block;margin-top:1rem;background:#38bdf8;color:#0b0f14;font-weight:600;padding:0.5rem 1rem;border-radius:6px;text-decoration:none;">← Volver al inicio</a></p>
        </body></html>`,
        { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
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

    const redirectTarget = stateData.returnTo && stateData.returnTo.startsWith('/') ? stateData.returnTo : '/';
    headers.append('Location', redirectTarget);
    headers.append('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return new Response(null, { status: 302, headers });
  }

  // ==========================================
  // 5. ENDPOINT DE ESTADO DE SESIÓN (/api/auth/me)
  // ==========================================
  if (path === '/api/auth/me') {
    const rawToken = cookies.session_token || cookies.atm_session || cookies.ta_session || (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');

    if (!rawToken) {
      return new Response(JSON.stringify({ authenticated: false, user: null }), {
        status: 401,
        headers: NO_CACHE_HEADERS,
      });
    }

    try {
      // Validar primero firma JWT con secret
      let user = await verifyJwt(rawToken, jwtSecret);

      // Si no fue firmado con JWT estándar, decodificar de forma segura
      if (!user) {
        user = JSON.parse(atob(rawToken));
      }

      if (!user || (user.exp && user.exp < Math.floor(Date.now() / 1000))) {
        throw new Error('Token inválido o expirado');
      }

      const cleanHandle = (user.handle || (user.email ? user.email.split('@')[0] : '') || '').replace(/^@+/, '');

      return new Response(JSON.stringify({
        authenticated: true,
        user: {
          id: user.id || user.sub || '',
          name: user.name || cleanHandle,
          email: user.email || '',
          avatar: user.avatar || user.picture || '',
          handle: cleanHandle,
          role: user.role || 'author'
        }
      }), {
        status: 200,
        headers: NO_CACHE_HEADERS,
      });
    } catch {
      return new Response(JSON.stringify({ authenticated: false, user: null }), {
        status: 401,
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
