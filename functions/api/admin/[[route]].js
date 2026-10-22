// Panel interno: cada endpoint comprueba en servidor la sesión interna (Entra ID, tenant de ATM).
// Lectura: rol internal. Cambios (moderación): además admin (rol de app Admin o MS_ADMIN_EMAILS).
import { internalSession, msConfig } from '../../lib/entra.js';
import { SITES, DEPLOYS_URL, checkSite } from '../../lib/sites.js';

const DEFAULT_JWT_SECRET = 'trujillo_jwt_secret_2026';
const GUIDES_ORIGIN = 'https://guides.trujillomingorance.com';
const H = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };
const json = (d, status = 200) => new Response(JSON.stringify(d), { status, headers: H });

async function listAll(kv, prefix, max = 1000) {
  const out = [];
  let cursor;
  do {
    const r = await kv.list({ prefix, cursor, limit: 1000 });
    for (const k of r.keys) { out.push(k.name); if (out.length >= max) return out; }
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  return out;
}

async function readModeration(kv) {
  try { const m = JSON.parse((await kv.get('moderation:guides')) || '{}'); return m && typeof m === 'object' ? m : {}; } catch (_) { return {}; }
}

async function loadGuides(env, request) {
  try {
    const r = env.ASSETS ? await env.ASSETS.fetch(new URL('/data/guides.json', request.url)) : await fetch(new URL('/data/guides.json', request.url));
    const d = await r.json();
    return Array.isArray(d) ? d : (d.guides || []);
  } catch (_) { return []; }
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (!msConfig(env).enabled) return json({ error: 'not_found' }, 404);

  const me = await internalSession(request, env, env.JWT_SECRET || DEFAULT_JWT_SECRET);
  if (!me) return json({ error: 'forbidden' }, 403);
  const isAdmin = me.admin === true;
  const kv = env.BOT_MEMORY;

  if (request.method === 'GET' && path === '/api/admin/me') {
    return json({ ok: true, user: { name: me.name, handle: me.handle, email: me.email, admin: isAdmin } });
  }

  if (request.method === 'GET' && path === '/api/admin/stats') {
    const guides = await loadGuides(env, request);
    const mod = kv ? await readModeration(kv) : {};
    const profiles = kv ? await listAll(kv, 'profile:') : [];
    const emailUsers = kv ? await listAll(kv, 'user:email:') : [];
    const msUsers = kv ? await listAll(kv, 'user:ms:') : [];
    const byProvider = {};
    if (kv) {
      for (const k of profiles.slice(0, 300)) {
        try { const p = JSON.parse((await kv.get(k)) || 'null'); const pv = (p && p.provider) || 'other'; byProvider[pv] = (byProvider[pv] || 0) + 1; } catch (_) {}
      }
    }
    const vals = Object.values(mod);
    return json({
      ok: true,
      profiles: profiles.length, emailAccounts: emailUsers.length, internalAccounts: msUsers.length, byProvider,
      guides: guides.length, hidden: vals.filter((v) => v && v.hidden).length,
      pinned: guides.filter((g) => (mod[g.slug] && typeof mod[g.slug].pinned === 'boolean') ? mod[g.slug].pinned : !!(g.pinned || g.fixada)).length,
    });
  }

  if (request.method === 'GET' && path === '/api/admin/users') {
    if (!kv) return json({ ok: true, users: [] });
    const keys = await listAll(kv, 'profile:', 500);
    const users = [];
    for (const k of keys) {
      try {
        const p = JSON.parse((await kv.get(k)) || 'null');
        if (!p) continue;
        const pic = p.customAvatar || p.avatar || '';
        users.push({ handle: p.handle, name: p.name, provider: p.provider || '', role: p.role || 'author', avatar: /^https:\/\//.test(pic) || /^data:image\//.test(pic) && pic.length < 60000 ? pic : '', joinedAt: p.joinedAt || '', lastSeenAt: p.lastSeenAt || '' });
      } catch (_) {}
    }
    const internal = [];
    for (const k of await listAll(kv, 'user:ms:', 200)) {
      try { const u = JSON.parse((await kv.get(k)) || 'null'); if (u) internal.push({ handle: u.handle, name: u.name, email: isAdmin ? u.email : '', admin: !!u.admin, lastLoginAt: u.lastLoginAt || '' }); } catch (_) {}
    }
    users.sort((a, b) => String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)));
    return json({ ok: true, users, internal });
  }

  if (request.method === 'GET' && path === '/api/admin/sites') {
    const checks = await Promise.all(SITES.map((s) => checkSite(s)));
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]));
    return json({ ok: true, checkedAt: new Date().toISOString(), deploysUrl: DEPLOYS_URL,
      sites: SITES.map((s) => ({ ...s, health: byId[s.id] })) });
  }

  if (path === '/api/admin/content' && request.method === 'GET') {
    const guides = await loadGuides(env, request);
    const mod = kv ? await readModeration(kv) : {};
    return json({
      ok: true, canModerate: isAdmin,
      items: guides.map((g) => {
        const m = mod[g.slug] || {};
        return { slug: g.slug, title: g.title, handle: g.handle, kind: g.kind || 'guide', date: g.date || g.updatedAt || '', href: g.href || ('/g/' + g.slug),
          pinned: typeof m.pinned === 'boolean' ? m.pinned : !!(g.pinned || g.fixada), hidden: !!m.hidden, by: m.by || '', at: m.at || '' };
      }),
    });
  }

  if (path === '/api/admin/content' && request.method === 'POST') {
    if (!isAdmin) return json({ error: 'admin_required' }, 403);
    // Solo desde el propio panel: mismo origen y cabecera propia (evita CSRF entre subdominios)
    const origin = request.headers.get('Origin') || '';
    if ((origin !== GUIDES_ORIGIN && origin !== url.origin) || request.headers.get('X-ATM-Admin') !== '1') return json({ error: 'bad_origin' }, 403);
    if (!kv) return json({ error: 'storage_unavailable' }, 503);
    let body = {};
    try { body = await request.json(); } catch (_) {}
    const slug = String(body.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 120);
    const action = String(body.action || '');
    if (!slug || !['pin', 'unpin', 'hide', 'unhide', 'reset'].includes(action)) return json({ error: 'bad_request' }, 400);
    const guides = await loadGuides(env, request);
    if (!guides.some((g) => g.slug === slug)) return json({ error: 'unknown_slug' }, 404);
    const mod = await readModeration(kv);
    const m = mod[slug] || {};
    if (action === 'pin') m.pinned = true;
    if (action === 'unpin') m.pinned = false;
    if (action === 'hide') m.hidden = true;
    if (action === 'unhide') m.hidden = false;
    if (action === 'reset') { delete mod[slug]; } else { m.by = me.handle; m.at = new Date().toISOString(); mod[slug] = m; }
    await kv.put('moderation:guides', JSON.stringify(mod));
    return json({ ok: true, slug, state: mod[slug] || null });
  }

  return json({ error: 'not_found' }, 404);
}
