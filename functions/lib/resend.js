/**
 * Trujillo AI / ATM Platform - Resend Transactional Email Engine
 * Uses native fetch for 100% Edge compatibility in Cloudflare Workers / Pages.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'ATM Docs <auth@trujillomingorance.com>';

export async function sendEmail({ to, subject, html, text, from = DEFAULT_FROM }, apiKey) {
  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY is not defined. Email dispatch skipped in local dev.');
    return { ok: false, error: 'MISSING_API_KEY' };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || ''
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[Resend Error]', data);
      return { ok: false, error: data };
    }
    return { ok: true, data };
  } catch (err) {
    console.error('[Resend Dispatch Failed]', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Base email layout wrapper with modern dark-mode responsive styling
 */
function emailLayout({ title, previewText, content }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f14; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    .email-container { max-width: 560px; margin: 40px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
    .header { padding: 32px 32px 24px; border-bottom: 1px solid #1e293b; text-align: left; }
    .brand-title { font-size: 18px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em; }
    .brand-sub { font-size: 12px; color: #38bdf8; font-family: monospace; text-transform: uppercase; margin-top: 4px; }
    .content { padding: 32px; line-height: 1.6; font-size: 14px; color: #94a3b8; }
    .content h2 { font-size: 20px; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em; }
    .content p { margin: 0 0 16px; }
    .btn-container { text-align: left; margin: 28px 0; }
    .btn { display: inline-block; background-color: #38bdf8; color: #0b0f14 !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 6px; }
    .notice-box { background-color: #1e293b; border-left: 3px solid #f59e0b; padding: 14px 18px; border-radius: 4px; font-size: 13px; color: #cbd5e1; margin: 20px 0; }
    .footer { padding: 24px 32px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: left; }
    .footer a { color: #94a3b8; text-decoration: underline; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#0b0f14;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <div class="email-container">
    <div class="header">
      <div class="brand-title">ATM Docs · Trujillo AI</div>
      <div class="brand-sub">Sistemas Distribuidos &amp; Arquitectura</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Este correo fue enviado automáticamente por la plataforma de autenticación de ATM Docs.</p>
      <p>Si no has solicitado esta acción, puedes ignorar este mensaje o revisar tu cuenta en <a href="https://guides.trujillomingorance.com">ATM Docs</a>.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 1. Verification Email upon account creation
 */
export async function sendVerificationEmail({ to, name, verifyUrl }, apiKey) {
  const content = `
    <h2>Verifica tu dirección de correo</h2>
    <p>Hola <strong>${name || 'Colega'}</strong>,</p>
    <p>Gracias por unirte a ATM Docs. Para activar tu cuenta de autor, publicar runbooks e interactuar con la comunidad técnica, por favor confirma tu correo electrónico:</p>
    <div class="btn-container">
      <a href="${verifyUrl}" class="btn" target="_blank" rel="noopener">Verificar mi cuenta</a>
    </div>
    <p>O copia y pega este enlace seguro en tu navegador:</p>
    <p style="font-family: monospace; font-size: 12px; color: #38bdf8; word-break: break-all;">${verifyUrl}</p>
    <div class="notice-box">
      <strong>Vigencia:</strong> Este enlace de verificación es válido durante 24 horas.
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Verifica tu cuenta en ATM Docs',
    html: emailLayout({
      title: 'Verificación de Cuenta',
      previewText: 'Confirma tu correo para activar tu cuenta en ATM Docs.',
      content
    }),
    text: `Hola ${name},\n\nVerifica tu cuenta en ATM Docs ingresando al siguiente enlace:\n${verifyUrl}\n\nVálido por 24 horas.`
  }, apiKey);
}

/**
 * 2. Unified Welcome Email (Credentials, Google, or X)
 */
export async function sendWelcomeEmail({ to, name, provider = 'credenciales' }, apiKey) {
  const providerLabel = provider === 'google' ? 'Google' : provider === 'x' ? 'X (Twitter)' : 'Credenciales directas';

  const content = `
    <h2>¡Bienvenido a la comunidad técnica de ATM Docs!</h2>
    <p>Hola <strong>${name || 'Colega'}</strong>,</p>
    <p>Tu cuenta ha sido inicializada exitosamente mediante <strong>${providerLabel}</strong>.</p>
    <p>En ATM Docs tienes acceso a:</p>
    <ul style="color: #cbd5e1; padding-left: 20px; line-height: 1.8;">
      <li>Guías de producción de alta disponibilidad y arquitecturas cloud.</li>
      <li>Simuladores reactivos en tiempo real (DCF, finanzas, telemetría).</li>
      <li>Sistema de gamificación técnica con 25 insignias de maestría.</li>
      <li>Editor Markdown con validación tipográfica y exportación a RFC.</li>
    </ul>
    <div class="btn-container">
      <a href="https://guides.trujillomingorance.com/" class="btn" target="_blank" rel="noopener">Explorar el Catálogo</a>
    </div>
    <p style="font-size: 13px; color: #64748b;">Puedes personalizar tu handle público, biografía y llaves de cifrado en cualquier momento desde la sección de Configuración.</p>
  `;

  return sendEmail({
    to,
    subject: '¡Bienvenido a ATM Docs!',
    html: emailLayout({
      title: 'Bienvenido a ATM Docs',
      previewText: 'Tu cuenta ha sido creada exitosamente.',
      content
    }),
    text: `Hola ${name},\n\nBienvenido a ATM Docs. Tu cuenta ha sido creada con éxito usando ${providerLabel}.\nAccede al catálogo en https://guides.trujillomingorance.com/`
  }, apiKey);
}

/**
 * 3. Password Recovery Email (Single-use token with 15-minute TTL)
 */
export async function sendPasswordResetEmail({ to, name, resetUrl }, apiKey) {
  const content = `
    <h2>Recuperación de contraseña</h2>
    <p>Hola <strong>${name || 'Usuario'}</strong>,</p>
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a <strong>${to}</strong>.</p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn" target="_blank" rel="noopener">Restablecer Contraseña</a>
    </div>
    <div class="notice-box">
      <strong>Aviso de Seguridad Crítico:</strong> Este enlace es de un solo uso y expirará automáticamente en <strong>15 minutos</strong>. Si tú no realizaste esta solicitud, tu cuenta sigue segura y no es necesario realizar ninguna acción.
    </div>
    <p>Si el botón no funciona, puedes copiar este enlace en tu navegador:</p>
    <p style="font-family: monospace; font-size: 12px; color: #38bdf8; word-break: break-all;">${resetUrl}</p>
  `;

  return sendEmail({
    to,
    subject: 'Recuperación de contraseña · ATM Docs (15 min)',
    html: emailLayout({
      title: 'Recuperación de Contraseña',
      previewText: 'Enlace de un solo uso para restablecer tu contraseña (expira en 15 min).',
      content
    }),
    text: `Hola ${name},\n\nPara restablecer tu contraseña en ATM Docs, haz clic en:\n${resetUrl}\n\nEste enlace expira en 15 minutos.`
  }, apiKey);
}
