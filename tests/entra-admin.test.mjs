// Pruebas locales de Microsoft Entra ID y del panel interno con un IdP simulado.
// Ejecutar: node --test tests/entra-admin.test.mjs   (no usa secretos reales)
import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest as auth } from '../functions/api/auth/[[route]].js';
import { onRequest as admin } from '../functions/api/admin/[[route]].js';
import { onRequestGet as moderation } from '../functions/api/moderation.js';
import { signJwt } from '../functions/lib/crypto-auth.js';

const TENANT = '686bb631-e5e4-4fbf-bf55-835dd40fb263';
const CLIENT = 'test-client-id';
const G = 'https://guides.trujillomingorance.com';

function kv() {
  const m = new Map();
  return {
    m,
    async get(k) { return m.has(k) ? m.get(k) : null; },
    async put(k, v) { m.set(k, String(v)); },
    async delete(k) { m.delete(k); },
    async list({ prefix = '' } = {}) { return { keys: [...m.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
  };
}
const GUIDES = { ok: true, guides: [{ slug: 'informe-msft', title: 'Informe', handle: 'atrumin16', kind: 'analysis' }, { slug: 'it-glossary', title: 'Glosario', handle: 'atrumin16', pinned: true }] };
function envOf(extra = {}) {
  return { JWT_SECRET: 'localtest', MS_CLIENT_ID: CLIENT, MS_CLIENT_SECRET: 'test-secret', BOT_MEMORY: kv(),
    ASSETS: { fetch: async () => new Response(JSON.stringify(GUIDES), { headers: { 'Content-Type': 'application/json' } }) }, ...extra };
}
const ctx = (request, env) => ({ request, env, params: {}, waitUntil() {}, next: async () => new Response('next') });
const b64u = (buf) => Buffer.from(buf).toString('base64url');

const good = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const evil = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const pubJwk = await crypto.subtle.exportKey('jwk', good.publicKey);
const JWKS = { keys: [{ kty: 'RSA', kid: 'k1', use: 'sig', n: pubJwk.n, e: pubJwk.e }] };

async function idToken(claims, key = good.privateKey, kid = 'k1') {
  const h = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid }));
  const p = b64u(JSON.stringify(claims));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(h + '.' + p));
  return h + '.' + p + '.' + b64u(sig);
}

let nextToken = null;
let tokenCalls = [];
globalThis.fetch = async (input, init = {}) => {
  const u = String(input && input.url ? input.url : input);
  if (u === `https://login.microsoftonline.com/${TENANT}/discovery/v2.0/keys`) return new Response(JSON.stringify(JWKS));
  if (u === `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`) {
    tokenCalls.push(Object.fromEntries(new URLSearchParams(String(init.body))));
    return nextToken ? new Response(JSON.stringify({ id_token: nextToken, token_type: 'Bearer' })) : new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 });
  }
  throw new Error('unexpected fetch ' + u);
};

function setCookies(res) { return typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('Set-Cookie')]; }
function cookieVal(list, name) { const c = list.find((x) => x.startsWith(name + '=') && !/Max-Age=0/.test(x)); return c ? c.split(';')[0].slice(name.length + 1) : null; }

async function start(env, returnTo = 'https://rewrite.trujillomingorance.com/') {
  const res = await auth(ctx(new Request(`${G}/api/auth/microsoft?returnTo=${encodeURIComponent(returnTo)}`), env));
  assert.equal(res.status, 302);
  const loc = new URL(res.headers.get('Location'));
  const msCookie = cookieVal(setCookies(res), 'ms_oauth');
  return { loc, msCookie, state: loc.searchParams.get('state'), nonce: loc.searchParams.get('nonce') };
}
function baseClaims(nonce, over = {}) {
  const now = Math.floor(Date.now() / 1000);
  return { iss: `https://login.microsoftonline.com/${TENANT}/v2.0`, aud: CLIENT, tid: TENANT, nonce, iat: now, nbf: now, exp: now + 3600,
    oid: '00000000-0000-0000-0000-000000000001', sub: 'sub1', name: 'Alberto Trujillo', preferred_username: 'alberto@trujillomingorance.com', email: 'alberto@trujillomingorance.com', ...over };
}
async function callback(env, s, { state = s.state, cookie = s.msCookie } = {}) {
  return auth(ctx(new Request(`${G}/api/auth/microsoft/callback?code=abc&state=${encodeURIComponent(state)}`, { headers: { Cookie: `ms_oauth=${cookie}` } }), env));
}

test('proveedor desactivado sin MS_CLIENT_ID/MS_CLIENT_SECRET', async () => {
  const env = envOf({ MS_CLIENT_ID: '', MS_CLIENT_SECRET: '' });
  const p = await (await auth(ctx(new Request(`${G}/api/auth/providers`), env))).json();
  assert.equal(p.microsoft, false);
  assert.equal((await auth(ctx(new Request(`${G}/api/auth/microsoft`), env))).status, 404);
  assert.equal((await admin(ctx(new Request(`${G}/api/admin/me`), env))).status, 404);
});

test('inicio: tenant fijo, PKCE S256, nonce, redirect_uri canónica', async () => {
  const env = envOf();
  const p = await (await auth(ctx(new Request(`${G}/api/auth/providers`, { headers: { Origin: 'https://rewrite.trujillomingorance.com' } }), env)));
  assert.equal((await p.json()).microsoft, true);
  assert.equal(p.headers.get('Access-Control-Allow-Origin'), 'https://rewrite.trujillomingorance.com');
  const s = await start(env);
  assert.equal(s.loc.origin + s.loc.pathname, `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`);
  assert.equal(s.loc.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(s.loc.searchParams.get('redirect_uri'), `${G}/api/auth/microsoft/callback`);
  assert.equal(s.loc.searchParams.get('scope'), 'openid profile email');
  assert.ok(s.nonce && s.state && s.msCookie);
  // Desde otro subdominio se manda primero a guides
  const r = await auth(ctx(new Request('https://savings.trujillomingorance.com/api/auth/microsoft?returnTo=%2F'), env));
  assert.equal(r.status, 302);
  assert.ok(r.headers.get('Location').startsWith(`${G}/api/auth/microsoft`));
});

test('callback válido: sesión internal + admin, cookie compartida y vuelta a rewrite', async () => {
  const env = envOf();
  const s = await start(env);
  nextToken = await idToken(baseClaims(s.nonce));
  tokenCalls = [];
  const res = await callback(env, s);
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('Location'), 'https://rewrite.trujillomingorance.com/');
  assert.equal(tokenCalls[0].client_secret, 'test-secret');
  assert.ok(tokenCalls[0].code_verifier && tokenCalls[0].code_verifier.length >= 43);
  const list = setCookies(res);
  assert.ok(list.some((c) => c.startsWith('ta_session=') && c.includes('Domain=.trujillomingorance.com')));
  const ta = cookieVal(list, 'ta_session');
  const me = await (await auth(ctx(new Request(`${G}/api/auth/me`, { headers: { Cookie: `ta_session=${ta}` } }), env))).json();
  assert.equal(me.authenticated, true);
  assert.equal(me.user.role, 'internal');
  assert.equal(me.user.admin, true);
  assert.equal(me.user.provider, 'microsoft');
  assert.ok(env.BOT_MEMORY.m.has('user:ms:00000000-0000-0000-0000-000000000001'));
});

for (const [name, over, opts] of [
  ['tid de otro tenant', { tid: '11111111-1111-1111-1111-111111111111' }],
  ['iss de otro tenant', { iss: 'https://login.microsoftonline.com/11111111-1111-1111-1111-111111111111/v2.0' }],
  ['aud de otra app', { aud: 'other-client' }],
  ['nonce distinto', { nonce: 'x' }],
  ['caducado', { exp: Math.floor(Date.now() / 1000) - 3600 }],
  ['firma con otra clave', {}, { key: 'evil' }],
  ['kid desconocido', {}, { kid: 'k9' }],
]) {
  test('rechaza id_token: ' + name, async () => {
    const env = envOf();
    const s = await start(env);
    const claims = baseClaims(s.nonce, over);
    nextToken = await idToken(claims, opts && opts.key === 'evil' ? evil.privateKey : good.privateKey, (opts && opts.kid) || 'k1');
    const res = await callback(env, s);
    assert.equal(res.status, 401);
    assert.ok(!setCookies(res).some((c) => c.startsWith('ta_session=') && !/Max-Age=0/.test(c)));
  });
}

test('rechaza state cambiado, cookie ausente y error del IdP', async () => {
  const env = envOf();
  const s = await start(env);
  nextToken = await idToken(baseClaims(s.nonce));
  assert.equal((await callback(env, s, { state: 'otro' })).status, 400);
  assert.equal((await callback(env, s, { cookie: '' })).status, 400);
  const forged = await signJwt({ typ: 'ms_oauth', s: s.state, n: s.nonce, v: 'v', r: '/' }, 'otra-clave');
  assert.equal((await callback(env, s, { cookie: forged })).status, 400);
  nextToken = null;
  assert.equal((await callback(env, s)).status, 401);
  const r = await auth(ctx(new Request(`${G}/api/auth/microsoft/callback?error=access_denied&state=${s.state}`, { headers: { Cookie: `ms_oauth=${s.msCookie}` } }), env));
  assert.equal(r.status, 400);
});

test('returnTo externo se ignora', async () => {
  const env = envOf();
  const s = await start(env, 'https://evil.example.com/');
  nextToken = await idToken(baseClaims(s.nonce));
  const res = await callback(env, s);
  assert.equal(res.headers.get('Location'), '/');
});

async function session(payload, secret = 'localtest') {
  return signJwt({ exp: Math.floor(Date.now() / 1000) + 3600, ...payload }, secret);
}
const req = (path, cookie, init = {}) => new Request(G + path, { ...init, headers: { ...(init.headers || {}), ...(cookie ? { Cookie: `ta_session=${cookie}` } : {}) } });

test('panel: sin sesión, autor normal, firma falsa o proveedor distinto → 403', async () => {
  const env = envOf();
  assert.equal((await admin(ctx(req('/api/admin/stats'), env))).status, 403);
  const author = await session({ handle: 'pepe', role: 'author', provider: 'x' });
  assert.equal((await admin(ctx(req('/api/admin/users', author), env))).status, 403);
  const xAdmin = await session({ handle: 'atrumin16', role: 'admin', provider: 'x' });
  assert.equal((await admin(ctx(req('/api/admin/stats', xAdmin), env))).status, 403);
  const forged = await session({ handle: 'a', role: 'internal', provider: 'microsoft', tid: TENANT, admin: true }, 'otra-clave');
  assert.equal((await admin(ctx(req('/api/admin/stats', forged), env))).status, 403);
  const otherTenant = await session({ handle: 'a', role: 'internal', provider: 'microsoft', tid: '11111111-1111-1111-1111-111111111111', admin: true });
  assert.equal((await admin(ctx(req('/api/admin/stats', otherTenant), env))).status, 403);
  const wrongProv = await session({ handle: 'a', role: 'internal', provider: 'google', tid: TENANT, admin: true });
  assert.equal((await admin(ctx(req('/api/admin/stats', wrongProv), env))).status, 403);
});

test('panel: interno sin admin lee pero no modera', async () => {
  const env = envOf();
  const tok = await session({ handle: 'ana', name: 'Ana', role: 'internal', provider: 'microsoft', tid: TENANT, admin: false });
  for (const p of ['/api/admin/me', '/api/admin/stats', '/api/admin/users', '/api/admin/content']) {
    assert.equal((await admin(ctx(req(p, tok), env))).status, 200, p);
  }
  const c = await (await admin(ctx(req('/api/admin/content', tok), env))).json();
  assert.equal(c.canModerate, false);
  const post = await admin(ctx(req('/api/admin/content', tok, { method: 'POST', headers: { Origin: G, 'X-ATM-Admin': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: 'informe-msft', action: 'hide' }) }), env));
  assert.equal(post.status, 403);
});

test('panel: admin modera con origen y cabecera; la portada lo refleja', async () => {
  const env = envOf();
  const tok = await session({ handle: 'alberto', role: 'internal', provider: 'microsoft', tid: TENANT, admin: true });
  const body = JSON.stringify({ slug: 'informe-msft', action: 'hide' });
  const noHdr = await admin(ctx(req('/api/admin/content', tok, { method: 'POST', headers: { Origin: G, 'Content-Type': 'application/json' }, body }), env));
  assert.equal(noHdr.status, 403);
  const xsite = await admin(ctx(req('/api/admin/content', tok, { method: 'POST', headers: { Origin: 'https://rewrite.trujillomingorance.com', 'X-ATM-Admin': '1' }, body }), env));
  assert.equal(xsite.status, 403);
  const bad = await admin(ctx(req('/api/admin/content', tok, { method: 'POST', headers: { Origin: G, 'X-ATM-Admin': '1' }, body: JSON.stringify({ slug: 'no-existe', action: 'hide' }) }), env));
  assert.equal(bad.status, 404);
  const ok = await admin(ctx(req('/api/admin/content', tok, { method: 'POST', headers: { Origin: G, 'X-ATM-Admin': '1' }, body }), env));
  assert.equal(ok.status, 200);
  await admin(ctx(req('/api/admin/content', tok, { method: 'POST', headers: { Origin: G, 'X-ATM-Admin': '1' }, body: JSON.stringify({ slug: 'it-glossary', action: 'unpin' }) }), env));
  const pub = await (await moderation({ env })).json();
  assert.deepEqual(pub.hidden, ['informe-msft']);
  assert.deepEqual(pub.unpinned, ['it-glossary']);
  const stats = await (await admin(ctx(req('/api/admin/stats', tok), env))).json();
  assert.equal(stats.hidden, 1);
  assert.equal(stats.pinned, 0);
});

test('admin por rol de app Admin aunque el correo no esté en la lista', async () => {
  const env = envOf();
  const s = await start(env);
  nextToken = await idToken(baseClaims(s.nonce, { email: 'ana@trujillomingorance.com', preferred_username: 'ana@trujillomingorance.com', roles: ['Admin'], oid: 'o2' }));
  const ta = cookieVal(setCookies(await callback(env, s)), 'ta_session');
  const me = await (await auth(ctx(new Request(`${G}/api/auth/me`, { headers: { Cookie: `ta_session=${ta}` } }), env))).json();
  assert.equal(me.user.admin, true);
  const s2 = await start(env);
  nextToken = await idToken(baseClaims(s2.nonce, { email: 'luis@trujillomingorance.com', preferred_username: 'luis@trujillomingorance.com', oid: 'o3' }));
  const ta2 = cookieVal(setCookies(await callback(env, s2)), 'ta_session');
  const me2 = await (await auth(ctx(new Request(`${G}/api/auth/me`, { headers: { Cookie: `ta_session=${ta2}` } }), env))).json();
  assert.equal(me2.user.role, 'internal');
  assert.equal(me2.user.admin, false);
});

test('el handle no pisa un perfil existente de otro proveedor', async () => {
  const env = envOf();
  await env.BOT_MEMORY.put('profile:alberto', JSON.stringify({ handle: 'alberto', provider: 'x' }));
  const s = await start(env);
  nextToken = await idToken(baseClaims(s.nonce));
  const ta = cookieVal(setCookies(await callback(env, s)), 'ta_session');
  const me = await (await auth(ctx(new Request(`${G}/api/auth/me`, { headers: { Cookie: `ta_session=${ta}` } }), env))).json();
  assert.equal(me.user.handle, 'alberto_ms');
  assert.equal(JSON.parse(env.BOT_MEMORY.m.get('profile:alberto')).provider, 'x');
});

test('sitios: solo sesión interna; devuelve inventario con salud', async () => {
  const env = envOf();
  assert.equal((await admin(ctx(req('/api/admin/sites'), env))).status, 403);
  const author = await session({ handle: 'pepe', role: 'author', provider: 'x' });
  assert.equal((await admin(ctx(req('/api/admin/sites', author), env))).status, 403);
  const prev = globalThis.fetch;
  globalThis.fetch = async (u, init) => {
    const s = String(u);
    if (s.startsWith('https://login.microsoftonline.com/')) return prev(u, init);
    if (s.includes('www.')) return new Response(null, { status: 301, headers: { Location: 'https://trujillomingorance.com/' } });
    if (s.includes('rocky.')) throw new Error('down');
    return new Response('ok', { status: 200 });
  };
  try {
    const tok = await session({ handle: 'ana', role: 'internal', provider: 'microsoft', tid: TENANT });
    const r = await admin(ctx(req('/api/admin/sites', tok), env));
    assert.equal(r.status, 200);
    const d = await r.json();
    const by = Object.fromEntries(d.sites.map((s) => [s.id, s]));
    assert.ok(by.guides && by.rewrite && by.ai && by.labs && by.focusguard && by.nutri);
    assert.equal(by.guides.health.ok, true);
    assert.equal(by.www.health.status, 301);
    assert.equal(by.rocky.health.ok, false);
    assert.ok(d.deploysUrl.startsWith('https://labs.trujillomingorance.com/'));
  } finally { globalThis.fetch = prev; }
});
