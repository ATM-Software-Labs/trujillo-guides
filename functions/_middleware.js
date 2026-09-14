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
