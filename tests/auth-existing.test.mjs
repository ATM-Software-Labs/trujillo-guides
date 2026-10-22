// Regresión de los flujos existentes (X, Google, correo, /me, logout). Secreto de prueba 'localtest' y KV simulado.
import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest as auth } from '../functions/api/auth/[[route]].js';
import { signJwt } from '../functions/lib/crypto-auth.js';

const G = 'https://guides.trujillomingorance.com';
function kv() { const m = new Map(); return { m, async get(k) { return m.has(k) ? m.get(k) : null; }, async put(k, v) { m.set(k, String(v)); }, async delete(k) { m.delete(k); }, async list({ prefix = '' } = {}) { return { keys: [...m.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; } }; }
const ctx = (request, env) => ({ request, env, params: {}, waitUntil() {} });
const envOf = (x = {}) => ({ JWT_SECRET: 'localtest', BOT_MEMORY: kv(), ...x });
const tok = (p) => signJwt({ exp: Math.floor(Date.now() / 1000) + 3600, ...p }, 'localtest');

test('/me con session_token válido', async () => {
  const env = envOf();
  await env.BOT_MEMORY.put('profile:alb', JSON.stringify({ handle: 'alb', customAvatar: 'data:image/webp;base64,AAA' }));
  const r = await auth(ctx(new Request(G + '/api/auth/me', { headers: { Cookie: 'session_token=' + await tok({ handle: 'alb', name: 'A', role: 'author', provider: 'x' }) } }), env));
  const d = await r.json();
  assert.equal(r.status, 200); assert.equal(d.authenticated, true); assert.equal(d.user.handle, 'alb'); assert.equal(d.user.avatar, 'data:image/webp;base64,AAA');
  assert.equal(d.user.role, 'author'); assert.equal(d.user.admin, false);
});
test('/me: cookie caducada no tapa ta_session válida', async () => {
  const r = await auth(ctx(new Request(G + '/api/auth/me', { headers: { Cookie: 'session_token=bad.stale.tok; ta_session=' + await tok({ handle: 'alb' }) } }), envOf()));
  assert.equal((await r.json()).authenticated, true);
});
test('/me: un admin de X no se vuelve admin interno', async () => {
  const r = await auth(ctx(new Request(G + '/api/auth/me', { headers: { Cookie: 'ta_session=' + await tok({ handle: 'atrumin16', role: 'admin', provider: 'x', admin: true }) } }), envOf()));
  const d = await r.json(); assert.equal(d.user.role, 'admin'); assert.equal(d.user.admin, false);
});
test('/me sin cookie o con firma falsa → no autenticado', async () => {
  for (const c of ['', 'ta_session=' + await signJwt({ handle: 'x' }, 'otra')]) {
    const r = await auth(ctx(new Request(G + '/api/auth/me', { headers: c ? { Cookie: c } : {} }), envOf()));
    assert.equal((await r.json()).authenticated, false);
  }
});
test('X: inicio con PKCE y callback con error → página 400 traducible', async () => {
  const r = await auth(ctx(new Request(G + '/api/auth/x?returnTo=%2F'), envOf()));
  assert.equal(r.status, 302); assert.ok(r.headers.get('Location').startsWith('https://twitter.com/i/oauth2/authorize'));
  const e = await auth(ctx(new Request(G + '/api/auth/x/callback?error=access_denied'), envOf()));
  assert.equal(e.status, 400); assert.match(await e.text(), /data-tx=/);
});
test('Google GET redirige al login central', async () => {
  const r = await auth(ctx(new Request(G + '/api/auth/google?returnTo=%2F'), envOf()));
  assert.equal(r.status, 302); assert.ok(r.headers.get('Location').includes('ai.trujillomingorance.com/login'));
});
test('correo: credenciales malas → 401', async () => {
  const r = await auth(ctx(new Request(G + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nadie@example.com', password: 'xxxxxxxx' }) }), envOf()));
  assert.equal(r.status, 401);
});
test('logout borra las cookies de sesión', async () => {
  const r = await auth(ctx(new Request(G + '/api/auth/logout', { method: 'POST' }), envOf()));
  const list = r.headers.getSetCookie();
  for (const n of ['ta_session', 'session_token']) assert.ok(list.some((c) => c.startsWith(n + '=;') && /Max-Age=0/.test(c)), n);
});
test('/me: CORS con credenciales solo para https://*.trujillomingorance.com', async () => {
  const ok = await auth(ctx(new Request(G + '/api/auth/me', { headers: { Origin: 'https://labs.trujillomingorance.com' } }), envOf()));
  assert.equal(ok.headers.get('Access-Control-Allow-Origin'), 'https://labs.trujillomingorance.com');
  assert.equal(ok.headers.get('Access-Control-Allow-Credentials'), 'true');
  for (const o of ['https://evil.com', 'http://labs.trujillomingorance.com', 'https://trujillomingorance.com.evil.com']) {
    const r = await auth(ctx(new Request(G + '/api/auth/me', { headers: { Origin: o } }), envOf()));
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), null, o);
  }
  const pre = await auth(ctx(new Request(G + '/api/auth/me', { method: 'OPTIONS', headers: { Origin: 'https://ai.trujillomingorance.com' } }), envOf()));
  assert.equal(pre.status, 204);
});
