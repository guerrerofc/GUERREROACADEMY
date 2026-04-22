// Vercel Serverless: Generate Payment Agreement PDF (HTML-based)
// POST /api/generate-agreement

const RESEND_API_KEY = 're_cVgKVhnY_78wKPHd9sCY98nivugKr4mpa';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { tutor_nombre, tutor_email, jugador_nombre, semanas, total_semanas, precio_total, metodo_pago, fecha_nacimiento, talla_tshirt } = req.body;

    if (!tutor_nombre || !jugador_nombre) {
      return res.status(400).json({ error: 'tutor_nombre and jugador_nombre required' });
    }

    const weeksText = (semanas || []).map(w => 'Semana ' + w).join(', ');
    const today = new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });

    let paymentDetail = '';
    if (metodo_pago === 'reservacion' || metodo_pago === 'stripe_reservacion') {
      const reserva = Math.round(precio_total * 0.2);
      const restante = precio_total - reserva;
      paymentDetail = `
        <tr><td>Reservacion (20%)</td><td style="text-align:right;font-weight:700;">RD$ ${reserva.toLocaleString('es-DO')}</td></tr>
        <tr><td>Restante a pagar antes del inicio</td><td style="text-align:right;">RD$ ${restante.toLocaleString('es-DO')}</td></tr>
      `;
    } else if (metodo_pago === '2cuotas' || metodo_pago === 'stripe_2cuotas') {
      const cuota = Math.round(precio_total / 2);
      paymentDetail = `
        <tr><td>Primera cuota (al inscribir)</td><td style="text-align:right;font-weight:700;">RD$ ${cuota.toLocaleString('es-DO')}</td></tr>
        <tr><td>Segunda cuota (antes de semana 5)</td><td style="text-align:right;">RD$ ${cuota.toLocaleString('es-DO')}</td></tr>
      `;
    } else {
      paymentDetail = `
        <tr><td>Pago completo</td><td style="text-align:right;font-weight:700;">RD$ ${Number(precio_total).toLocaleString('es-DO')}</td></tr>
        <tr><td colspan="2" style="color:#34c759;font-size:13px;">Incluye 1 T-shirt extra gratis</td></tr>
      `;
    }

    const agreementHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><style>
        body { font-family: -apple-system, sans-serif; color: #1d1d1f; max-width: 700px; margin: 0 auto; padding: 40px; }
        h1 { font-size: 22px; text-align: center; margin-bottom: 4px; }
        .subtitle { text-align: center; color: #86868b; font-size: 14px; margin-bottom: 32px; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 16px; border-bottom: 2px solid #1d1d1f; padding-bottom: 6px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .footer { margin-top: 48px; font-size: 12px; color: #86868b; text-align: center; }
        .sig-line { margin-top: 60px; display: flex; justify-content: space-between; }
        .sig-box { width: 45%; border-top: 1px solid #1d1d1f; padding-top: 8px; font-size: 13px; }
      </style></head>
      <body>
        <h1>ACUERDO DE PAGO</h1>
        <p class="subtitle">Campamento de Verano 2026 - Guerrero Academy</p>
        <p style="text-align:center;font-size:13px;color:#86868b;">Fecha: ${today}</p>

        <div class="section">
          <h2>Datos del Participante</h2>
          <table>
            <tr><td>Jugador</td><td style="text-align:right;font-weight:600;">${jugador_nombre}</td></tr>
            <tr><td>Fecha de Nacimiento</td><td style="text-align:right;">${fecha_nacimiento || '-'}</td></tr>
            <tr><td>Talla T-shirt</td><td style="text-align:right;">${talla_tshirt || '-'}</td></tr>
            <tr><td>Padre/Tutor</td><td style="text-align:right;font-weight:600;">${tutor_nombre}</td></tr>
          </table>
        </div>

        <div class="section">
          <h2>Detalles del Campamento</h2>
          <table>
            <tr><td>Semanas seleccionadas</td><td style="text-align:right;">${weeksText}</td></tr>
            <tr><td>Total de semanas</td><td style="text-align:right;font-weight:700;">${total_semanas}</td></tr>
            <tr><td>Horario</td><td style="text-align:right;">Lunes a Viernes</td></tr>
            <tr><td>Incluye</td><td style="text-align:right;">Merienda diaria + T-shirt</td></tr>
          </table>
        </div>

        <div class="section">
          <h2>Plan de Pago</h2>
          <table>
            <tr><td>Precio total</td><td style="text-align:right;font-weight:700;font-size:18px;">RD$ ${Number(precio_total).toLocaleString('es-DO')}</td></tr>
            ${paymentDetail}
          </table>
        </div>

        <div class="section">
          <h2>Terminos y Condiciones</h2>
          <ol style="font-size:13px;line-height:1.8;color:#3d3d3f;">
            <li>El padre/tutor se compromete a cumplir con el plan de pago seleccionado.</li>
            <li>La reservacion (20%) no es reembolsable una vez confirmada la inscripcion.</li>
            <li>En caso de pago en cuotas, la segunda cuota debe completarse antes del inicio de la semana 5.</li>
            <li>El incumplimiento del pago puede resultar en la suspension de la participacion.</li>
            <li>La academia se reserva el derecho de hacer cambios en el horario por causas de fuerza mayor.</li>
            <li>El campamento incluye merienda diaria y una camiseta oficial.</li>
          </ol>
        </div>

        <div class="sig-line">
          <div class="sig-box">
            <strong>Padre/Tutor</strong><br>
            ${tutor_nombre}
          </div>
          <div class="sig-box">
            <strong>Guerrero Academy</strong><br>
            Administracion
          </div>
        </div>

        <div class="footer">
          <p>Guerrero Academy | guerrerofcsd.com | +1 829-639-6001</p>
          <p>Este documento fue generado automaticamente el ${today}</p>
        </div>
      </body>
      </html>
    `;

    // Send by email if email provided
    if (tutor_email) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Guerrero Academy <notificaciones@guerrerofcsd.com>',
          to: [tutor_email],
          subject: 'Acuerdo de Pago - Campamento de Verano 2026',
          html: agreementHtml
        })
      });

      const emailResult = await emailResponse.json();
      if (!emailResponse.ok) {
        console.error('Email error:', emailResult);
      }
    }

    return res.status(200).json({
      success: true,
      html: agreementHtml,
      email_sent: !!tutor_email
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
