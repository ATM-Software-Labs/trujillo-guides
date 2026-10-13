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
    profile: { handle: p.handle, name: p.name, avatar: p.avatar, provider: p.provider, role: p.role, joinedAt: p.joinedAt },
  }), { status: 200, headers });
}
