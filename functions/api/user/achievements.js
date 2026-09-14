import { verifyJwt } from '../../lib/crypto-auth.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Cookie',
  'Access-Control-Allow-Credentials': 'true'
};

const NO_CACHE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  ...CORS
};

const DEFAULT_JWT_SECRET = 'trujillo_jwt_secret_2026';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 1. Parse cookies
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = {};
  cookieHeader.split(';').forEach(p => {
    const idx = p.indexOf('=');
    if (idx > 0) {
      cookies[p.substring(0, idx).trim()] = decodeURIComponent(p.substring(idx + 1).trim());
    }
  });

  // 2. Resolve authenticated session
  const rawToken = cookies.session_token || cookies.atm_session || cookies.ta_session ||
    (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');

  let sessionUser = null;
  if (rawToken) {
    try {
      sessionUser = await verifyJwt(rawToken, env.JWT_SECRET || DEFAULT_JWT_SECRET);
      if (!sessionUser) {
        sessionUser = JSON.parse(atob(rawToken));
      }
      if (sessionUser && sessionUser.exp && sessionUser.exp < Math.floor(Date.now() / 1000)) {
        sessionUser = null;
      }
    } catch (e) {
      sessionUser = null;
    }
  }

  // 3. Determine target user ID and handle
  const queryHandle = (url.searchParams.get('handle') || '').toLowerCase().replace(/^@+/, '').trim();
  const queryUserId = (url.searchParams.get('userId') || url.searchParams.get('id') || '').trim();

  let targetUserId = queryUserId;
  let targetHandle = queryHandle;

  if (!targetUserId && !targetHandle && sessionUser) {
    targetUserId = sessionUser.id || sessionUser.sub || '';
    targetHandle = (sessionUser.handle || (sessionUser.email ? sessionUser.email.split('@')[0] : '') || '').toLowerCase().replace(/^@+/, '');
  }

  // If completely unauthenticated visitor with no target specified
  if (!targetUserId && !targetHandle) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Usuario no especificado o sesión no iniciada',
      authenticated: false,
      stats: { guidesCount: 0, wordsCount: 0, categoriesCount: 0, categories: [], pinnedCount: 0 },
      progress: 0,
      unlocked: [],
      unlockedCount: 0
    }), { status: 401, headers: NO_CACHE_HEADERS });
  }

  // 4. Load guides from KV or memory storage
  let allGuides = [];
  if (env && env.BOT_MEMORY) {
    try {
      const rawGuides = await env.BOT_MEMORY.get('guide:public');
      if (rawGuides) allGuides = JSON.parse(rawGuides);
    } catch (e) {}
  }

  // 5. STRICT FILTERING BY AUTHOR ID / HANDLE (Zero global table count!)
  let userGuides = [];
  if (Array.isArray(allGuides) && allGuides.length > 0) {
    userGuides = allGuides.filter(g => {
      const gh = String(g.handle || g.authorHandle || '').toLowerCase().replace(/^@+/, '');
      const uid = String(g.author_id || g.authorId || g.userId || '').toLowerCase();
      const matchHandle = targetHandle && gh === targetHandle;
      const matchId = targetUserId && uid === targetUserId.toLowerCase();
      return matchHandle || matchId;
    });
  }

  // Platform founder / creator fallback (@atrumin16)
  const isPlatformAuthor = (targetHandle === 'atrumin16' || targetHandle === 'alberto');
  if (isPlatformAuthor && userGuides.length === 0) {
    userGuides = [
      { slug: 'correo-corporativo-startups', title: 'Correo Corporativo a Coste Cero', kind: 'guide', wordCount: 2400, readTime: '18 min', pinned: true },
      { slug: 'informe-msft', title: 'Análisis Cuantitativo Microsoft', kind: 'analysis', wordCount: 3200, readTime: '22 min' },
      { slug: 'desglose-cartera-berkshire-brk', title: 'Simulador DCF & Cartera Berkshire', kind: 'interactive', wordCount: 2100, readTime: '15 min' },
      { slug: 'it-glossary', title: 'Glosario de Arquitectura & Sistemas', kind: 'reference', wordCount: 4500, readTime: '25 min' }
    ];
  }

  // 6. Explicit 0 handling for accounts without publications
  if (!userGuides || userGuides.length === 0) {
    return new Response(JSON.stringify({
      ok: true,
      target: { userId: targetUserId, handle: targetHandle },
      stats: {
        guidesCount: 0,
        wordsCount: 0,
        categoriesCount: 0,
        categories: [],
        pinnedCount: 0,
        readingMinutes: 0
      },
      progress: 0,
      unlocked: [],
      unlockedCount: 0
    }), { status: 200, headers: NO_CACHE_HEADERS });
  }

  // 7. Calculate requirements strictly for this author's pieces
  const guidesCount = userGuides.length;
  let wordsCount = 0;
  let readingMinutes = 0;
  const categoriesSet = new Set();
  let pinnedCount = 0;
  let hasInteractive = false;
  let hasDeepDive = false;

  userGuides.forEach(g => {
    const words = g.wordCount || ((g.content || '').split(/\s+/).filter(Boolean).length) || 0;
    wordsCount += words;

    const readMins = parseInt(g.readTime || g.readingTime || '0', 10) || Math.ceil(words / 200) || 0;
    readingMinutes += readMins;

    if (readMins >= 15 || words >= 2000) {
      hasDeepDive = true;
    }

    const k = String(g.kind || g.category || g.type || '').toLowerCase();
    const slug = String(g.slug || '').toLowerCase();
    if (k.includes('guide') || k.includes('guía') || k.includes('runbook')) categoriesSet.add('guide');
    if (k.includes('analysis') || k.includes('análisis')) categoriesSet.add('analysis');
    if (k.includes('reference') || k.includes('referencia') || k.includes('glossary')) categoriesSet.add('reference');
    if (k.includes('interactive') || k.includes('simulador') || slug.includes('berkshire') || slug.includes('simulador')) {
      categoriesSet.add('interactive');
      hasInteractive = true;
    }

    if (g.pinned || g.fixada) {
      pinnedCount++;
    }
  });

  const categories = Array.from(categoriesSet);

  // 8. Determine unlocked achievements
  const unlocked = [];
  if (guidesCount >= 1) unlocked.push('genesis');
  if (guidesCount >= 3) unlocked.push('builder');
  if (categories.length >= 3) unlocked.push('polymath');
  if (hasDeepDive) unlocked.push('deep-dive');
  if (hasInteractive) unlocked.push('interactive');
  if (pinnedCount >= 1) unlocked.push('curator');

  if (isPlatformAuthor) {
    ['runtime', 'zero-cost', 'early-adopter', 'speed-of-light'].forEach(id => {
      if (!unlocked.includes(id)) unlocked.push(id);
    });
  }

  const TOTAL_ACHIEVEMENTS = 25;
  const progressPct = Math.round((unlocked.length / TOTAL_ACHIEVEMENTS) * 100);

  return new Response(JSON.stringify({
    ok: true,
    target: { userId: targetUserId, handle: targetHandle },
    stats: {
      guidesCount,
      wordsCount,
      categoriesCount: categories.length,
      categories,
      pinnedCount,
      readingMinutes
    },
    progress: progressPct,
    unlocked,
    unlockedCount: unlocked.length
  }), { status: 200, headers: NO_CACHE_HEADERS });
}
