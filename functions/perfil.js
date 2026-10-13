// /perfil → perfil público del usuario con sesión, o portada con el login abierto
import { verifyJwt } from './lib/crypto-auth.js';
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const c = request.headers.get('Cookie') || '';
  const m = c.match(/(?:^|;\s*)(?:session_token|atm_session|ta_session)=([^;]+)/);
  const user = m ? await verifyJwt(decodeURIComponent(m[1]), env.JWT_SECRET || 'trujillo_jwt_secret_2026') : null;
  const handle = user && (user.handle || (user.email || '').split('@')[0]);
  const to = handle ? `/u/@${encodeURIComponent(String(handle).replace(/^@+/, '').toLowerCase())}` : '/?login=1';
  return new Response(null, { status: 302, headers: { Location: new URL(to, url).toString(), 'Cache-Control': 'no-store' } });
}
