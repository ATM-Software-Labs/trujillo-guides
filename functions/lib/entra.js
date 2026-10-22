// Microsoft Entra ID (OIDC, código de autorización + PKCE, cliente confidencial).
// Solo se aceptan cuentas del tenant configurado. Todo depende de MS_CLIENT_ID y MS_CLIENT_SECRET:
// si faltan, el proveedor queda desactivado y el botón no se muestra.
import { signJwt, verifyJwt, generatePkce, generateRandomString } from './crypto-auth.js';

export const DEFAULT_TENANT = '686bb631-e5e4-4fbf-bf55-835dd40fb263';
const LOGIN = 'https://login.microsoftonline.com';
const jwksCache = new Map();

export function msConfig(env) {
  const clientId = String(env.MS_CLIENT_ID || '').trim();
  const clientSecret = String(env.MS_CLIENT_SECRET || '').trim();
  const tenant = String(env.MS_TENANT_ID || DEFAULT_TENANT).trim().toLowerCase();
  const adminEmails = String(env.MS_ADMIN_EMAILS || 'alberto@trujillomingorance.com')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return { enabled: !!(clientId && clientSecret && tenant), clientId, clientSecret, tenant, adminEmails, login: LOGIN };
}

export function msIssuer(cfg) { return `https://login.microsoftonline.com/${cfg.tenant}/v2.0`; }

// Inicio: estado, nonce y verificador PKCE firmados en una cookie HttpOnly de 10 minutos
export async function msStart(cfg, { redirectUri, returnTo, jwtSecret, loginHint }) {
  const { codeVerifier, codeChallenge } = await generatePkce();
  const state = generateRandomString(32);
  const nonce = generateRandomString(32);
  const cookie = await signJwt({ typ: 'ms_oauth', s: state, n: nonce, v: codeVerifier, r: returnTo || '/', exp: Math.floor(Date.now() / 1000) + 600 }, jwtSecret);
  const u = new URL(`${cfg.login}/${cfg.tenant}/oauth2/v2.0/authorize`);
  u.searchParams.set('client_id', cfg.clientId);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('response_mode', 'query');
  u.searchParams.set('scope', 'openid profile email');
  u.searchParams.set('state', state);
  u.searchParams.set('nonce', nonce);
  u.searchParams.set('code_challenge', codeChallenge);
  u.searchParams.set('code_challenge_method', 'S256');
  u.searchParams.set('prompt', 'select_account');
  if (loginHint) u.searchParams.set('login_hint', loginHint);
  return { location: u.toString(), cookie };
}

export async function msReadStateCookie(raw, jwtSecret) {
  if (!raw) return null;
  try {
    const d = await verifyJwt(raw, jwtSecret);
    if (!d || d.typ !== 'ms_oauth' || !d.s || !d.n || !d.v) return null;
    if (d.exp && d.exp < Math.floor(Date.now() / 1000)) return null;
    return d;
  } catch (_) { return null; }
}

export async function msExchange(cfg, { code, codeVerifier, redirectUri }, fetchImpl = fetch) {
  const body = new URLSearchParams({
    client_id: cfg.clientId, client_secret: cfg.clientSecret, grant_type: 'authorization_code',
    code, redirect_uri: redirectUri, code_verifier: codeVerifier, scope: 'openid profile email',
  });
  const r = await fetchImpl(`${cfg.login}/${cfg.tenant}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body,
  });
  let data = {};
  try { data = await r.json(); } catch (_) {}
  if (!r.ok || !data.id_token) {
    // Solo el código de error de Microsoft, nunca el cuerpo completo
    const err = new Error('token_exchange_failed');
    err.code = String(data.error || r.status);
    err.codes = Array.isArray(data.error_codes) ? data.error_codes.join(',') : '';
    throw err;
  }
  return data;
}

function b64urlBytes(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64urlJson(s) { return JSON.parse(new TextDecoder().decode(b64urlBytes(s))); }

async function getJwks(cfg, fetchImpl, force) {
  const url = `${cfg.login}/${cfg.tenant}/discovery/v2.0/keys`;
  const hit = jwksCache.get(url);
  if (!force && hit && hit.until > Date.now()) return hit.keys;
  const r = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('jwks_unavailable');
  const keys = ((await r.json()).keys) || [];
  jwksCache.set(url, { keys, until: Date.now() + 3600 * 1000 });
  return keys;
}

// Verifica firma RS256 (JWKS del tenant), iss, aud, tid, nonce y tiempos
export async function msVerifyIdToken(cfg, idToken, { nonce }, fetchImpl = fetch) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) throw new Error('id_token_malformed');
  const header = b64urlJson(parts[0]);
  const claims = b64urlJson(parts[1]);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('id_token_alg');
  let keys = await getJwks(cfg, fetchImpl, false);
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) { keys = await getJwks(cfg, fetchImpl, true); jwk = keys.find((k) => k.kid === header.kid); }
  if (!jwk || jwk.kty !== 'RSA') throw new Error('id_token_kid');
  const key = await crypto.subtle.importKey('jwk', { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('id_token_signature');
  const now = Math.floor(Date.now() / 1000);
  const skew = 300;
  if (claims.iss !== msIssuer(cfg)) throw new Error('id_token_iss');
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(cfg.clientId)) throw new Error('id_token_aud');
  if (String(claims.tid || '').toLowerCase() !== cfg.tenant) throw new Error('id_token_tid');
  if (!nonce || claims.nonce !== nonce) throw new Error('id_token_nonce');
  if (!claims.exp || claims.exp + skew < now) throw new Error('id_token_expired');
  if (claims.nbf && claims.nbf - skew > now) throw new Error('id_token_nbf');
  if (claims.iat && claims.iat - skew > now) throw new Error('id_token_iat');
  if (!claims.oid && !claims.sub) throw new Error('id_token_subject');
  return claims;
}

export function msIsAdmin(cfg, claims) {
  const roles = Array.isArray(claims.roles) ? claims.roles : [];
  if (roles.includes('Admin')) return true;
  const mail = String(claims.email || claims.preferred_username || '').toLowerCase();
  return !!mail && cfg.adminEmails.includes(mail);
}

// Sesión interna: solo con sesión firmada por nosotros, rol internal, proveedor microsoft y tenant correcto
export async function internalSession(request, env, jwtSecret) {
  const cfg = msConfig(env);
  if (!cfg.enabled) return null;
  const cookies = {};
  (request.headers.get('Cookie') || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) { try { cookies[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); } catch (_) {} }
  });
  const list = [cookies.session_token, cookies.atm_session, cookies.ta_session, cookies.auth_token].filter(Boolean);
  for (const tk of list) {
    try {
      const u = await verifyJwt(tk, jwtSecret);
      if (!u || (u.exp && u.exp < Math.floor(Date.now() / 1000))) continue;
      if (u.role === 'internal' && u.provider === 'microsoft' && String(u.tid || '').toLowerCase() === cfg.tenant) return u;
    } catch (_) {}
  }
  return null;
}
