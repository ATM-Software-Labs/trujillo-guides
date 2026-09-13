import { mergeGuideFeed, HIDDEN_KEY } from '../../lib/feed.js';
import { readJsonArray } from '../../lib/community.js';
import { attachSocial, featuredGuides, readSession, clientVoterId } from '../../lib/social.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Client-Id'
};

function json(obj, status, isPrivate) {
  const cacheHeader = isPrivate
    ? 'private, no-cache'
    : 'public, max-age=60, s-maxage=180, stale-while-revalidate=300';
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheHeader,
      ...CORS
    }
  });
}

async function fallbackFromAssets(context) {
  try {
    const assets = context.env && context.env.ASSETS;
    if (!assets) return [];
    let res = await assets.fetch(new URL('/data/guides.json', context.request.url));
    if (!res || !res.ok) {
      res = await assets.fetch(new URL('/community-index.json', context.request.url));
    }
    if (!res || !res.ok) return [];
    const data = await res.json();
    return (data && (data.guides || data.items)) || [];
  } catch (e) {
    return [];
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet(context) {
  const kv = context.env && context.env.BOT_MEMORY;
  let kvItems = await readJsonArray(kv, 'guide:public');
  if (!kvItems.length) {
    const fromAssets = await fallbackFromAssets(context);
    if (fromAssets.length) kvItems = fromAssets;
  }
  const hidden = await readJsonArray(kv, HIDDEN_KEY);
  const url = new URL(context.request.url);
  const slug = String(url.searchParams.get('slug') || '').trim().toLowerCase();
  const handle = String(url.searchParams.get('handle') || '').replace(/^@/, '').toLowerCase();
  const view = String(url.searchParams.get('view') || 'home');
  const session = await readSession(context.request, context.env);
  const voter = clientVoterId(context.request, session);
  let guides = mergeGuideFeed(kvItems, hidden);
  if (slug) {
    guides = guides.filter((g) => String(g.slug || '').toLowerCase() === slug);
  } else if (handle) {
    guides = guides.filter((g) => String(g.handle || '').toLowerCase() === handle);
  }
  guides = await attachSocial(kv, guides, voter);
  const featured = featuredGuides(guides);
  const out = slug || view === 'all' || handle ? guides : featured;
  const liked = {};
  out.forEach((g) => { if (g.liked) liked[g.slug] = true; });
  return json({
    ok: true,
    success: true,
    count: out.length,
    featured: featured,
    guides: out,
    allCount: guides.length,
    me: session ? { handle: session.handle, name: session.name, owner: session.owner } : null,
    liked: liked
  }, 200, !!session);
}

export async function onRequestHead(context) {
  const res = await onRequestGet(context);
  return new Response(null, { status: res.status, headers: res.headers });
}
