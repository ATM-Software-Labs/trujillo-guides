// Moderación pública (solo slugs): la portada oculta o fija según el panel interno
export async function onRequestGet({ env }) {
  let mod = {};
  try { mod = JSON.parse((env.BOT_MEMORY && await env.BOT_MEMORY.get('moderation:guides')) || '{}') || {}; } catch (_) {}
  const out = { hidden: [], pinned: [], unpinned: [] };
  for (const [slug, m] of Object.entries(mod)) {
    if (!m) continue;
    if (m.hidden) out.hidden.push(slug);
    if (m.pinned === true) out.pinned.push(slug);
    if (m.pinned === false) out.unpinned.push(slug);
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
}
