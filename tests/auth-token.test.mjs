import { verifyJwt, signJwt } from '../functions/lib/crypto-auth.js';
const secret='test-secret-xyz';
// Token estilo ai.trujillomingorance.com
const header=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}));
const payload=btoa(JSON.stringify({sub:'u1',email:'pepe.ñ@gmail.com'.normalize(),iat:1,exp:Math.floor(Date.now()/1000)+600}).replace(/[^\x00-\xff]/g,'n'));
const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${header}.${payload}`));
const AI_SIG = process.argv[2]==='url' ? Buffer.from(sig).toString('base64url') : btoa(String.fromCharCode(...new Uint8Array(sig)));
const tok=`${header}.${payload}.${AI_SIG}`;
const ok = (await verifyJwt(tok,secret)) && !(await verifyJwt(tok,"x")); console.log(ok ? "OK: tokens de ai y propios verificados" : "FALLO"); if(!ok) process.exit(1);
