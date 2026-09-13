export const STATIC_GUIDES = [
  {
    slug: 'enterprise-email',
    title: 'Arquitectura de Correo Empresarial a Coste 0 €',
    href: '/guides/enterprise-email/',
    handle: 'atrumin16',
    authorName: 'Alberto Trujillo Mingorance',
    authorPicture: '/avatar.png',
    category: 'Guides',
    static: true
  },
  {
    slug: 'it-glossary',
    title: 'Glosario Interactivo de Sistemas e Informática',
    href: '/guides/it-glossary/',
    handle: 'atrumin16',
    authorName: 'Alberto Trujillo Mingorance',
    authorPicture: '/avatar.png',
    category: 'Guides',
    static: true
  },
  {
    slug: 'open-sentinel',
    title: 'Telemetría Host y Detección de Intrusión (Open-Sentinel)',
    href: '/guides/open-sentinel/',
    handle: 'atrumin16',
    authorName: 'Alberto Trujillo Mingorance',
    authorPicture: '/avatar.png',
    category: 'Guides',
    static: true
  },
  {
    slug: 'edge-ai-architecture',
    title: 'Inferencia multimodal sub-100ms en Groq LPU y Cloudflare',
    href: '/guides/edge-ai-architecture/',
    handle: 'atrumin16',
    authorName: 'Alberto Trujillo Mingorance',
    authorPicture: '/avatar.png',
    category: 'Guides',
    static: true
  },
  {
    slug: 'dns-zero-trust',
    title: 'Filtrado DNS DoH y Zero-Trust (AdShield)',
    href: '/guides/dns-zero-trust/',
    handle: 'atrumin16',
    authorName: 'Alberto Trujillo Mingorance',
    authorPicture: '/avatar.png',
    category: 'Guides',
    static: true
  },
  {
    slug: 'crypto-telemetry',
    title: 'Telemetría On-Chain y Mempool (BitPulse)',
    href: '/guides/crypto-telemetry/',
    handle: 'atrumin16',
    authorName: 'Alberto Trujillo Mingorance',
    authorPicture: '/avatar.png',
    category: 'Guides',
    static: true
  }
];

export const STATIC_SLUGS = STATIC_GUIDES.reduce(function (map, g) {
  map[g.slug] = g;
  return map;
}, Object.create(null));

export const HIDDEN_KEY = 'guide:hidden';

export function hiddenSlugSet(list) {
  const set = Object.create(null);
  (Array.isArray(list) ? list : []).forEach(function (it) {
    const slug = typeof it === 'string' ? it : (it && it.slug);
    if (slug) set[String(slug).replace(/^@/, '')] = 1;
  });
  return set;
}

function visible(it) {
  if (!it || !(it.slug || it.href || it.title)) return false;
  return true;
}

export function mergeGuideFeed(kvItems, hidden) {
  const seen = Object.create(null);
  const hide = hiddenSlugSet(hidden);
  const out = [];
  (Array.isArray(kvItems) ? kvItems : []).forEach(function (it) {
    if (!visible(it)) return;
    const slug = String(it.slug || '').replace(/^@/, '');
    if (!slug || seen[slug] || hide[slug]) return;
    seen[slug] = 1;
    out.push({
      slug: slug,
      title: it.title || slug,
      href: it.href || (it.static ? '/guides/' + slug + '/' : '/g/' + slug),
      handle: String(it.handle || '').replace(/^@/, ''),
      authorName: it.authorName || it.author || '',
      authorPicture: it.authorPicture || '/avatar.png',
      category: it.category || 'guide',
      summary: it.summary || (it.extras && it.extras.summary) || '',
      content: it.content || it.body || it.markdown || (it.extras && it.extras.content) || '',
      updatedAt: it.updatedAt || it.date || 0,
      static: !!it.static
    });
  });
  STATIC_GUIDES.forEach(function (g) {
    if (hide[g.slug] || seen[g.slug]) return;
    seen[g.slug] = 1;
    out.push(g);
  });
  return out;
}
