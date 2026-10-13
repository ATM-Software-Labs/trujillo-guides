import { verifyJwt } from '../../lib/crypto-auth.js';
// GET /api/user/profile?handle=<handle> → perfil público guardado al iniciar sesión
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const handle = String(url.searchParams.get('handle') || '').replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' };
  if (!handle) return new Response(JSON.stringify({ error: 'Falta el usuario.' }), { status: 400, headers });
  if (!env.BOT_MEMORY) return new Response(JSON.stringify({ found: false }), { status: 404, headers });
  const raw = await env.BOT_MEMORY.get(`profile:${handle}`);
  if (!raw) return new Response(JSON.stringify({ found: false, handle }), { status: 404, headers });
  const p = JSON.parse(raw);
  return new Response(JSON.stringify({
    found: true,
    profile: { handle: p.handle, name: p.name, avatar: p.customAvatar || p.avatar, provider: p.provider, role: p.role, joinedAt: p.joinedAt },
  }), { status: 200, headers });
}

// POST /api/user/profile  { avatar } → cambia el avatar del usuario con sesión
const MAX_AVATAR = 120000; // ~90 KB de imagen en base64; el cliente la reduce a 256 px
function token(request) {
  const c = {};
  (request.headers.get('Cookie') || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) c[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return c.session_token || c.atm_session || c.ta_session || (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
}
export async function onRequestPost({ request, env }) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  const fail = (status, code) => new Response(JSON.stringify({ ok: false, error: code }), { status, headers });
  const raw = token(request);
  if (!raw) return fail(401, 'auth');
  let user = null;
  try { user = await verifyJwt(raw, env.JWT_SECRET || undefined); } catch (e) {}
  if (!user || (user.exp && user.exp < Math.floor(Date.now() / 1000))) return fail(401, 'auth');
  const handle = String(user.handle || (user.email ? user.email.split('@')[0] : '')).replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!handle || !env.BOT_MEMORY) return fail(500, 'storage');
  let body = {};
  try { body = await request.json(); } catch (e) { return fail(400, 'bad'); }
  const av = String(body.avatar || '');
  if (av.length > MAX_AVATAR) return fail(413, 'size');
  const okData = /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/.test(av);
  let dec = av; try { dec = decodeURIComponent(av); } catch (e) {}
  const okSvg = /^data:image\/svg\+xml[;,]/.test(av) && av.length < 20000 && !/script/i.test(dec);
  const okUrl = /^https:\/\/[^\s"'<>]{4,500}$/.test(av);
  if (av && !okData && !okSvg && !okUrl) return fail(415, 'type');
  const key = `profile:${handle}`;
  const prev = JSON.parse((await env.BOT_MEMORY.get(key)) || 'null') || { handle, name: user.name || handle, role: user.role === 'admin' ? 'admin' : 'author', joinedAt: new Date().toISOString() };
  prev.customAvatar = av;
  await env.BOT_MEMORY.put(key, JSON.stringify(prev));
  return new Response(JSON.stringify({ ok: true, avatar: av || prev.avatar || '' }), { status: 200, headers });
}
