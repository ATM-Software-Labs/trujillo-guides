// www sirve el mismo sitio que la raíz (canonical a la raíz), no redirige.
// Inventario de sitios de trujillomingorance.com (Cloudflare DNS, Pages y Workers, 22/10/2026).
// auth: clave traducida en el panel. summary: endpoint /api/admin/* del propio sitio (CORS con credenciales).
export const SITES = [
  { id: 'apex', name: 'trujillomingorance.com', url: 'https://trujillomingorance.com/', repo: 'ATM-Software-Labs/domain-root', cf: { type: 'pages', name: 'domain-root' }, auth: 'none' },
  { id: 'www', name: 'www', url: 'https://www.trujillomingorance.com/', repo: 'ATM-Software-Labs/domain-root', cf: { type: 'pages', name: 'domain-root' }, auth: 'none' },
  { id: 'guides', name: 'ATM Docs', url: 'https://guides.trujillomingorance.com/', repo: 'ATM-Software-Labs/trujillo-guides', cf: { type: 'pages', name: 'trujillo-guides' }, auth: 'central', admin: 'https://guides.trujillomingorance.com/admin' },
  { id: 'savings', name: 'Savings', url: 'https://savings.trujillomingorance.com/', repo: 'ATM-Software-Labs/trujillo-guides', cf: { type: 'pages', name: 'trujillo-guides' }, auth: 'central' },
  { id: 'rewrite', name: 'Rewrite', url: 'https://rewrite.trujillomingorance.com/', repo: 'ATM-Software-Labs/rewrite-ai', cf: { type: 'pages', name: 'rewrite-ai' }, auth: 'delegated', summary: 'https://rewrite.trujillomingorance.com/api/admin/summary' },
  { id: 'ai', name: 'Trujillo AI', url: 'https://ai.trujillomingorance.com/', repo: 'ATM-Software-Labs/trujillo-ai-studio', cf: { type: 'worker', name: 'groq-discord-bot' }, auth: 'own', summary: 'https://ai.trujillomingorance.com/api/admin/summary' },
  { id: 'labs', name: 'ATM Labs', url: 'https://labs.trujillomingorance.com/', repo: 'ATM-Software-Labs/atm-labs-hub', cf: { type: 'pages', name: 'atm-labs-hub' }, auth: 'proxy-ai' },
  { id: 'tools', name: 'Tools', url: 'https://tools.trujillomingorance.com/', repo: 'ATM-Software-Labs/atm-tools', cf: { type: 'pages', name: 'atm-tools' }, auth: 'none' },
  { id: 'alberto', name: 'Portfolio', url: 'https://alberto.trujillomingorance.com/', repo: 'ATM-Software-Labs/portfolio', cf: { type: 'pages', name: 'alberto-portfolio' }, auth: 'own-admin' },
  { id: 'nutri', name: 'NutriFit', url: 'https://nutri.trujillomingorance.com/', repo: 'ATM-Software-Labs/nutrifit', cf: { type: 'pages', name: 'nutrifit' }, auth: 'own' },
  { id: 'focusguard', name: 'FocusGuard', url: 'https://focusguard.trujillomingorance.com/', repo: 'ATM-Software-Labs/focusguard-saas', cf: { type: 'pages', name: 'focusguard' }, auth: 'own' },
  { id: 'invest', name: 'INVEST', url: 'https://invest.trujillomingorance.com/', repo: 'ATM-Software-Labs/invest-platform', cf: { type: 'worker', name: 'invest' }, auth: 'none' },
  { id: 'charts', name: 'Markets Briefing', url: 'https://charts.trujillomingorance.com/', repo: '', cf: { type: 'worker', name: 'markets-digest' }, auth: 'none' },
  { id: 'api', name: 'API', url: 'https://api.trujillomingorance.com/', repo: '', cf: { type: 'worker', name: 'nutrifit-api-gateway' }, auth: 'api' },
  { id: 'rocky', name: 'Rocky', url: 'https://rocky.trujillomingorance.com/', repo: 'atrumin16/rocky-dog-website', cf: { type: 'pages', name: 'rocky-setter' }, auth: 'none' },
  { id: 'login', name: 'login', url: 'https://login.trujillomingorance.com/', repo: '', cf: { type: 'worker', name: 'groq-discord-bot' }, auth: 'myapps' },
];
export const DEPLOYS_URL = 'https://labs.trujillomingorance.com/api/admin/deploys';

export async function checkSite(site, fetchImpl = fetch, timeoutMs = 6000) {
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetchImpl(site.url, { method: 'GET', redirect: 'manual', signal: ac.signal, headers: { 'User-Agent': 'ATM-internal-health/1', Accept: 'text/html,*/*' } });
    const loc = r.headers.get('Location') || '';
    try { await r.body?.cancel(); } catch (_) {}
    return { id: site.id, status: r.status, ok: r.status < 400, ms: Date.now() - t0, location: loc ? loc.slice(0, 200) : '' };
  } catch (e) {
    return { id: site.id, status: 0, ok: false, ms: Date.now() - t0, error: e && e.name === 'AbortError' ? 'timeout' : 'network' };
  } finally { clearTimeout(timer); }
}
