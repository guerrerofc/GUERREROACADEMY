// Vercel Serverless Function para enviar emails con Resend
// POST /api/send-email

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_API_KEY = 're_cVgKVhnY_78wKPHd9sCY98nivugKr4mpa';
  const FROM_EMAIL = 'Guerrero Academy <notificaciones@guerrerofcsd.com>';

  try {
    const { type, body } = req.body;
    if (!type || !body) return res.status(400).json({ error: 'type and body are required' });

    let to, subject, html;

    switch (type) {
      case 'welcome':
        to = body.email;
        subject = 'Bienvenido a Guerrero Academy';
        html = buildWelcomeEmail(body);
        break;
      case 'announcement':
        to = body.emails;
        subject = 'Guerrero Academy: ' + (body.title || 'Anuncio');
        html = buildAnnouncementEmail(body);
        break;
      case 'payment_reminder':
        to = body.email;
        subject = 'Recordatorio de Pago - Guerrero Academy';
        html = buildPaymentReminderEmail(body);
        break;
      case 'payment_confirmation':
        to = body.email;
        subject = 'Pago Confirmado - Guerrero Academy';
        html = buildPaymentConfirmationEmail(body);
        break;
      case 'camp_inscription':
        to = body.email;
        subject = 'Inscripcion Confirmada - Campamento Guerrero 2026';
        html = buildCampInscriptionEmail(body);
        break;
      case 'camp_photos':
        to = body.emails || body.email;
        subject = 'Fotos del Campamento - Guerrero Academy';
        html = buildCampPhotosEmail(body);
        break;
      case 'custom':
        to = body.email || body.emails;
        subject = body.subject;
        html = body.html;
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    if (!to || !subject || !html) return res.status(400).json({ error: 'Missing required fields' });

    const toArray = Array.isArray(to) ? to : [to];
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < toArray.length; i += batchSize) {
      const batch = toArray.slice(i, i + batchSize);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM_EMAIL, to: batch, subject, html })
      });
      if (!response.ok) {
        const error = await response.json();
        results.push({ batch: i, error: error.message || 'Failed' });
      } else {
        const result = await response.json();
        results.push({ batch: i, id: result.id, success: true });
      }
    }

    return res.status(200).json({ success: true, sent: results.filter(r => r.success).length, results });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// =============================================
// SHARED EMAIL WRAPPER
// =============================================

function emailWrapper(content, accentColor = '#D87093') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <!-- Header -->
  <tr><td style="background:#1d1d1f;padding:32px 40px;text-align:center;border-radius:20px 20px 0 0;">
    <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.02em;">GUERRERO</div>
    <div style="font-size:11px;font-weight:600;color:${accentColor};letter-spacing:0.15em;margin-top:4px;">ACADEMY</div>
  </td></tr>
  <!-- Body -->
  <tr><td style="background:#ffffff;padding:40px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#fafafa;padding:24px 40px;border-radius:0 0 20px 20px;border-top:1px solid #f0f0f0;">
    <table width="100%"><tr>
      <td style="font-size:12px;color:#aeaeb2;line-height:1.6;">
        <strong style="color:#86868b;">Guerrero Academy</strong><br>
        Colegio Loyola, Santo Domingo<br>
        <a href="https://wa.me/18296396001" style="color:${accentColor};text-decoration:none;">+1 829-639-6001</a> |
        <a href="https://guerrerofcsd.com" style="color:${accentColor};text-decoration:none;">guerrerofcsd.com</a>
      </td>
    </tr></table>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

function emailButton(text, url, color = '#D87093') {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
    <a href="${url}" style="display:inline-block;background:${color};color:#fff;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">${text}</a>
  </td></tr></table>`;
}

function emailDivider() {
  return '<div style="border-top:1px solid #f0f0f0;margin:24px 0;"></div>';
}

function emailInfoRow(label, value, bold = false) {
  return `<tr><td style="padding:8px 0;font-size:14px;color:#86868b;">${label}</td><td style="padding:8px 0;text-align:right;font-size:14px;color:#1d1d1f;${bold ? 'font-weight:700;' : ''}">${value}</td></tr>`;
}

// =============================================
// EMAIL TEMPLATES
// =============================================

function buildWelcomeEmail({ nombre, playerName, magicLink }) {
  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1d1d1f;margin:0 0 8px;">Bienvenido a la familia</h1>
    <p style="font-size:15px;color:#86868b;margin:0 0 24px;">Hola ${nombre}, tu cuenta ha sido creada exitosamente.</p>
    <div style="background:#f5f5f7;border-radius:14px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${emailInfoRow('Jugador', '<strong>' + (playerName || '-') + '</strong>')}
        ${emailInfoRow('Estado', '<span style="color:#34c759;font-weight:600;">Aprobado</span>')}
      </table>
    </div>
    <p style="font-size:15px;color:#3d3d3f;line-height:1.6;">Haz clic en el boton para configurar tu contrasena y acceder al panel de padres.</p>
    ${magicLink ? emailButton('Configurar mi cuenta', magicLink) : ''}
    <p style="font-size:12px;color:#aeaeb2;text-align:center;">Este enlace es valido por 7 dias.</p>
  `);
}

function buildAnnouncementEmail({ title, content }) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;background:rgba(216,112,147,0.1);color:#D87093;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.05em;">ANUNCIO</span>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#1d1d1f;margin:0 0 16px;text-align:center;">${title}</h1>
    <div style="font-size:15px;color:#3d3d3f;line-height:1.8;white-space:pre-wrap;">${content}</div>
  `);
}

function buildPaymentReminderEmail({ nombre, playerName, amount, month }) {
  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:700;color:#1d1d1f;margin:0 0 8px;">Recordatorio de Pago</h1>
    <p style="font-size:15px;color:#86868b;margin:0 0 24px;">Hola ${nombre || 'Padre/Madre'},</p>
    <p style="font-size:15px;color:#3d3d3f;line-height:1.6;">La mensualidad de <strong>${playerName || 'su hijo/a'}</strong> correspondiente a <strong>${month || 'este mes'}</strong> se encuentra pendiente.</p>
    <div style="background:#f5f5f7;border-radius:14px;padding:24px;text-align:center;margin:24px 0;">
      <div style="font-size:12px;color:#86868b;letter-spacing:0.05em;font-weight:600;">MONTO PENDIENTE</div>
      <div style="font-size:36px;font-weight:800;color:#1d1d1f;margin:8px 0;">RD$ ${amount || '0'}</div>
    </div>
    <p style="font-size:14px;color:#86868b;line-height:1.6;">Por favor realice el pago a la brevedad. Si ya realizo el pago, ignore este mensaje.</p>
  `, '#ff9500');
}

function buildPaymentConfirmationEmail({ nombre, playerName, amount, method, month }) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-flex;width:56px;height:56px;border-radius:50%;background:rgba(52,199,89,0.1);align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#34c759;">&#10003;</span>
      </div>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#1d1d1f;margin:0 0 8px;text-align:center;">Pago Confirmado</h1>
    <p style="font-size:15px;color:#86868b;margin:0 0 24px;text-align:center;">Hola ${nombre || 'Padre/Madre'}, tu pago ha sido registrado exitosamente.</p>
    <div style="background:#f5f5f7;border-radius:14px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${emailInfoRow('Jugador', playerName || '-')}
        ${emailInfoRow('Monto', '<strong style="font-size:18px;">RD$ ' + (amount || '0') + '</strong>', true)}
        ${emailInfoRow('Metodo', method || '-')}
        ${emailInfoRow('Periodo', month || '-')}
        ${emailInfoRow('Estado', '<span style="color:#34c759;font-weight:700;">Pagado</span>')}
      </table>
    </div>
    <p style="font-size:14px;color:#86868b;text-align:center;">Gracias por mantener tu cuenta al dia.</p>
  `, '#34c759');
}

function buildCampInscriptionEmail({ nombre, jugador, semanas, totalSemanas, precioTotal, metodoPago, talla, fechaNac }) {
  const weeksText = (semanas || []).map(w => 'Semana ' + w).join(', ');
  let planText = 'Pago completo';
  let montoAhora = precioTotal;
  if (metodoPago === 'reservacion' || metodoPago === 'stripe_reservacion') {
    planText = 'Reservacion (20%)';
    montoAhora = Math.round(precioTotal * 0.2);
  } else if (metodoPago === '2cuotas' || metodoPago === 'stripe_2cuotas') {
    planText = '2 Cuotas';
    montoAhora = Math.round(precioTotal / 2);
  }

  return emailWrapper(`
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;background:rgba(216,112,147,0.1);color:#D87093;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.05em;">CAMPAMENTO DE VERANO 2026</span>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#1d1d1f;margin:0 0 8px;text-align:center;">Inscripcion Recibida</h1>
    <p style="font-size:15px;color:#86868b;margin:0 0 24px;text-align:center;">Hola ${nombre}, hemos recibido la inscripcion de ${jugador} al campamento.</p>
    
    <div style="background:#f5f5f7;border-radius:14px;padding:20px;margin-bottom:16px;">
      <div style="font-size:12px;color:#86868b;font-weight:600;letter-spacing:0.05em;margin-bottom:12px;">DATOS DEL JUGADOR</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${emailInfoRow('Nombre', '<strong>' + jugador + '</strong>')}
        ${fechaNac ? emailInfoRow('Fecha Nacimiento', fechaNac) : ''}
        ${talla ? emailInfoRow('Talla T-shirt', talla) : ''}
      </table>
    </div>
    
    <div style="background:#f5f5f7;border-radius:14px;padding:20px;margin-bottom:16px;">
      <div style="font-size:12px;color:#86868b;font-weight:600;letter-spacing:0.05em;margin-bottom:12px;">DETALLES DEL CAMPAMENTO</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${emailInfoRow('Semanas', weeksText)}
        ${emailInfoRow('Total Semanas', totalSemanas + ' semanas')}
        ${emailInfoRow('Horario', 'Lunes a Viernes, 8:00 AM - 12:00 PM')}
        ${emailInfoRow('Lugar', 'Colegio Loyola, Santo Domingo')}
        ${emailInfoRow('Incluye', 'Merienda diaria + T-shirt')}
      </table>
    </div>
    
    <div style="background:rgba(216,112,147,0.06);border:1px solid rgba(216,112,147,0.15);border-radius:14px;padding:20px;margin-bottom:24px;">
      <div style="font-size:12px;color:#D87093;font-weight:600;letter-spacing:0.05em;margin-bottom:12px;">PLAN DE PAGO</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${emailInfoRow('Total', 'RD$ ' + Number(precioTotal).toLocaleString('es-DO'), true)}
        ${emailInfoRow('Plan', planText)}
        ${emailInfoRow('A pagar ahora', '<strong style="font-size:18px;color:#D87093;">RD$ ' + Number(montoAhora).toLocaleString('es-DO') + '</strong>', true)}
      </table>
    </div>
    
    <p style="font-size:14px;color:#86868b;text-align:center;line-height:1.6;">Te contactaremos por WhatsApp para confirmar tu inscripcion y coordinar el pago.</p>
    ${emailButton('Ver Campamento', 'https://guerrerofcsd.com/landing#campamento')}
  `);
}

function buildCampPhotosEmail({ title, message, photoCount }) {
  return emailWrapper(`
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;background:rgba(216,112,147,0.1);color:#D87093;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.05em;">CAMPAMENTO 2026</span>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#1d1d1f;margin:0 0 8px;text-align:center;">${title || 'Fotos del Campamento'}</h1>
    <p style="font-size:15px;color:#3d3d3f;line-height:1.6;text-align:center;">${message || 'Aqui tienes las fotos de tu hijo/a en el campamento de hoy.'}</p>
    ${photoCount ? '<p style="font-size:14px;color:#86868b;text-align:center;">' + photoCount + ' fotos adjuntas</p>' : ''}
    ${emailButton('Ver en la web', 'https://guerrerofcsd.com/padres')}
  `);
}
