/**
 * Global Edge Security & Cache-Shielding Middleware
 * Guarantees zero session leakage across Cloudflare Edge, CDNs, and mobile browsers.
 */

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Vary': 'Cookie, Authorization'
};

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
};

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.toLowerCase();
  const hostname = url.hostname.toLowerCase();

  // Edge routing for savings subdomain (savings.trujillomingorance.com)
  const isSavingsDomain = hostname === 'savings.trujillomingorance.com' || hostname.startsWith('savings.');

  // Per-host robots.txt + sitemap.xml (guides and savings share this Pages project).
  if (path === '/robots.txt' || path === '/sitemap.xml') {
    const origin = 'https://' + (isSavingsDomain ? 'savings' : 'guides') + '.trujillomingorance.com';
    if (path === '/robots.txt') {
      const body = 'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /settings\nDisallow: /write\nDisallow: /admin\n\nSitemap: ' + origin + '/sitemap.xml\n';
      return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600', ...SECURITY_HEADERS } });
    }
    const urls = [{ loc: origin + '/' }];
    if (!isSavingsDomain && context.env && context.env.ASSETS) {
      try {
        const r = await context.env.ASSETS.fetch(new URL('/data/guides.json', url.origin));
        const data = r.ok ? await r.json() : null;
        for (const g of (data && data.guides) || []) {
          if (!g || typeof g.href !== 'string' || !g.href.startsWith('/')) continue;
          const lm = typeof g.updatedAt === 'number' ? new Date(g.updatedAt).toISOString().slice(0, 10) : String(g.updatedAt || '').slice(0, 10);
          urls.push({ loc: origin + g.href, lastmod: /^\d{4}-\d{2}-\d{2}$/.test(lm) ? lm : '' });
        }
      } catch (e) {}
    }
    const xmlEsc = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map((u) => '  <url><loc>' + xmlEsc(u.loc) + '</loc>' + (u.lastmod ? '<lastmod>' + u.lastmod + '</lastmod>' : '') + '</url>').join('\n') +
      '\n</urlset>\n';
    return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600', ...SECURITY_HEADERS } });
  }

  if (isSavingsDomain) {
    // 1. Serve ATM Savings app at root (/) and /index.html instead of ATM Docs
    if (path === '/' || path === '' || path === '/index.html') {
      try {
        const rewrittenRequest = new Request(new URL('/savings/index.html', url), context.request);
        const nextRes = await context.next(rewrittenRequest);
        if (nextRes.status === 200) {
          const headers = new Headers(nextRes.headers);
          for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
            if (!headers.has(k)) headers.set(k, v);
          }
          return new Response(nextRes.body, {
            status: 200,
            statusText: nextRes.statusText,
            headers
          });
        }
      } catch (e) {}

      try {
        if (context.env && context.env.ASSETS && typeof context.env.ASSETS.fetch === 'function') {
          const assetRes = await context.env.ASSETS.fetch(new URL('/savings/index.html', url.origin));
          if (assetRes.ok) {
            const headers = new Headers(assetRes.headers);
            for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
              if (!headers.has(k)) headers.set(k, v);
            }
            return new Response(assetRes.body, {
              status: assetRes.status,
              statusText: assetRes.statusText,
              headers
            });
          }
        }
      } catch (e) {}

      return Response.redirect(new URL('/savings/', url).toString() + url.search, 302);
    }

    // 2. Ensure /savings redirects cleanly to /savings/
    if (path === '/savings') {
      return Response.redirect(new URL('/savings/', url).toString() + url.search, 301);
    }

    // 3. Fallback for /assets/* requests on savings domain
    if (path.startsWith('/assets/')) {
      if (context.env && context.env.ASSETS && typeof context.env.ASSETS.fetch === 'function') {
        const assetUrl = new URL('/savings' + url.pathname, url);
        return context.env.ASSETS.fetch(new Request(assetUrl, context.request));
      }
    }
  }

  // Execute downstream handler
  const response = await context.next();
  const headers = new Headers(response.headers);

  // Apply base security headers
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(k)) headers.set(k, v);
  }

  // Strict zero-cache shield for all auth routes, user data, and private studio/settings pages
  const isPrivatePath =
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/user/') ||
    path.startsWith('/api/admin/') ||
    path === '/admin' || path === '/admin.html' ||
    path === '/settings' || path.startsWith('/settings/') ||
    path === '/write' || path.startsWith('/write/') ||
    path === '/login';

  if (isPrivatePath) {
    for (const [k, v] of Object.entries(NO_CACHE_HEADERS)) {
      headers.set(k, v);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
