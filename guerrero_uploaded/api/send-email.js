// Vercel Serverless Function para enviar emails con Resend
// Endpoint genérico: POST /api/send-email

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_API_KEY = 're_cVgKVhnY_78wKPHd9sCY98nivugKr4mpa';
  const FROM_EMAIL = 'Guerrero Academy <notificaciones@guerrerofcsd.com>';

  try {
    const { type, body } = req.body;

    if (!type || !body) {
      return res.status(400).json({ error: 'type and body are required' });
    }

    let to, subject, html;

    switch (type) {
      case 'welcome':
        to = body.email;
        subject = '¡Bienvenido a Guerrero Academy!';
        html = buildWelcomeEmail(body);
        break;

      case 'announcement':
        to = body.emails;
        subject = `Guerrero Academy: ${body.title}`;
        html = buildAnnouncementEmail(body);
        break;

      case 'payment_reminder':
        to = body.email;
        subject = 'Recordatorio de Pago - Guerrero Academy';
        html = buildPaymentReminderEmail(body);
        break;

      case 'payment_confirmation':
        to = body.email;
        subject = 'Confirmación de Pago - Guerrero Academy';
        html = buildPaymentConfirmationEmail(body);
        break;

      case 'custom':
        to = body.email || body.emails;
        subject = body.subject;
        html = body.html;
        break;

      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required email fields' });
    }

    // Enviar via Resend API
    const toArray = Array.isArray(to) ? to : [to];

    // Resend permite max 50 destinatarios por llamada, enviar en lotes
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < toArray.length; i += batchSize) {
      const batch = toArray.slice(i, i + batchSize);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: batch,
          subject: subject,
          html: html
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Resend error:', error);
        results.push({ batch: i, error: error.message || 'Failed' });
      } else {
        const result = await response.json();
        results.push({ batch: i, id: result.id, success: true });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Emails sent: ${successCount}/${results.length} batches`);

    return res.status(200).json({
      success: true,
      sent: successCount,
      total_batches: results.length,
      results
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// =============================================
// TEMPLATES DE EMAIL
// =============================================

function buildWelcomeEmail({ nombre, playerName, magicLink }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td style="background: #1d1d1f; padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Guerrero Academy</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Academia de Futbol Sala</p>
          </td>
        </tr>
        <tr>
          <td style="background: #ffffff; padding: 40px 30px;">
            <h2 style="color: #1d1d1f; margin: 0 0 16px;">Hola ${nombre},</h2>
            <p style="color: #3d3d3f; font-size: 16px; line-height: 1.6;">
              La inscripcion de <strong>${playerName || 'tu hijo/a'}</strong> ha sido aprobada exitosamente.
            </p>
            <p style="color: #3d3d3f; font-size: 16px; line-height: 1.6;">
              Tu cuenta ha sido creada. Haz clic en el boton para establecer tu contrasena:
            </p>
            ${magicLink ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding: 24px 0;">
                    <a href="${magicLink}" style="background: #1d1d1f; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block;">
                      Establecer Contrasena
                    </a>
                    <p style="color: #86868b; font-size: 12px; margin-top: 12px;">Este link es valido por 7 dias</p>
                  </td>
                </tr>
              </table>
            ` : ''}
            <p style="color: #3d3d3f; font-size: 16px;">Bienvenido a la familia Guerrero!</p>
          </td>
        </tr>
        <tr>
          <td style="background: #f5f5f7; padding: 20px 30px; text-align: center; border-radius: 0 0 16px 16px;">
            <p style="color: #86868b; font-size: 12px; margin: 0;">Guerrero Academy | guerrerofcsd.com</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function buildAnnouncementEmail({ title, content }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td style="background: #1d1d1f; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Guerrero Academy</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">ANUNCIO IMPORTANTE</p>
          </td>
        </tr>
        <tr>
          <td style="background: #ffffff; padding: 40px 30px;">
            <h2 style="color: #1d1d1f; margin: 0 0 20px; font-size: 22px;">${title}</h2>
            <div style="color: #3d3d3f; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">${content}</div>
          </td>
        </tr>
        <tr>
          <td style="background: #f5f5f7; padding: 20px 30px; text-align: center; border-radius: 0 0 16px 16px;">
            <p style="color: #86868b; font-size: 12px; margin: 0;">Guerrero Academy | guerrerofcsd.com</p>
            <p style="color: #86868b; font-size: 11px; margin: 4px 0 0;">Este email fue enviado a todos los padres de la academia.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function buildPaymentReminderEmail({ nombre, playerName, amount, month }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td style="background: #1d1d1f; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Guerrero Academy</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">RECORDATORIO DE PAGO</p>
          </td>
        </tr>
        <tr>
          <td style="background: #ffffff; padding: 40px 30px;">
            <h2 style="color: #1d1d1f; margin: 0 0 16px;">Hola ${nombre || 'Padre/Madre'},</h2>
            <p style="color: #3d3d3f; font-size: 16px; line-height: 1.6;">
              Le recordamos que la mensualidad de <strong>${playerName || 'su hijo/a'}</strong> correspondiente al mes de <strong>${month || 'este mes'}</strong> se encuentra pendiente.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background: #f5f5f7; border-radius: 12px;">
              <tr>
                <td style="padding: 20px;">
                  <p style="margin: 0 0 8px; color: #86868b; font-size: 13px;">MONTO PENDIENTE</p>
                  <p style="margin: 0; color: #1d1d1f; font-size: 28px; font-weight: 700;">RD$ ${amount || '0'}</p>
                </td>
              </tr>
            </table>
            <p style="color: #3d3d3f; font-size: 16px; line-height: 1.6;">
              Por favor realice el pago a la brevedad posible. Si ya realizo el pago, ignore este mensaje.
            </p>
            <p style="color: #86868b; font-size: 14px;">Gracias por su atencion.</p>
          </td>
        </tr>
        <tr>
          <td style="background: #f5f5f7; padding: 20px 30px; text-align: center; border-radius: 0 0 16px 16px;">
            <p style="color: #86868b; font-size: 12px; margin: 0;">Guerrero Academy | guerrerofcsd.com</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function buildPaymentConfirmationEmail({ nombre, playerName, amount, method, month }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td style="background: #1d1d1f; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Guerrero Academy</h1>
            <p style="color: #34c759; margin: 8px 0 0; font-size: 13px; font-weight: 700;">PAGO CONFIRMADO</p>
          </td>
        </tr>
        <tr>
          <td style="background: #ffffff; padding: 40px 30px;">
            <h2 style="color: #1d1d1f; margin: 0 0 16px;">Hola ${nombre || 'Padre/Madre'},</h2>
            <p style="color: #3d3d3f; font-size: 16px; line-height: 1.6;">
              El pago de la mensualidad de <strong>${playerName || 'su hijo/a'}</strong> ha sido registrado exitosamente.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background: rgba(52,199,89,0.08); border: 1px solid rgba(52,199,89,0.2); border-radius: 12px;">
              <tr>
                <td style="padding: 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 8px 0; color: #86868b; font-size: 13px;">Jugador</td>
                      <td style="padding: 8px 0; text-align: right; color: #1d1d1f; font-weight: 600;">${playerName || '-'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #86868b; font-size: 13px;">Monto</td>
                      <td style="padding: 8px 0; text-align: right; color: #1d1d1f; font-weight: 700; font-size: 20px;">RD$ ${amount || '0'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #86868b; font-size: 13px;">Metodo</td>
                      <td style="padding: 8px 0; text-align: right; color: #1d1d1f; font-weight: 600;">${method || '-'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #86868b; font-size: 13px;">Mes</td>
                      <td style="padding: 8px 0; text-align: right; color: #1d1d1f; font-weight: 600;">${month || '-'}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="color: #3d3d3f; font-size: 16px;">Gracias por mantener su cuenta al dia!</p>
          </td>
        </tr>
        <tr>
          <td style="background: #f5f5f7; padding: 20px 30px; text-align: center; border-radius: 0 0 16px 16px;">
            <p style="color: #86868b; font-size: 12px; margin: 0;">Guerrero Academy | guerrerofcsd.com</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
