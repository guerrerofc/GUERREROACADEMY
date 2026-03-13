// Vercel Serverless Function para enviar emails
// No requiere configuración adicional, se despliega automáticamente

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, nombre, playerName, magicLink } = req.body;

    if (!email || !nombre) {
      return res.status(400).json({ error: 'Email and nombre are required' });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Bienvenido a Guerrero Academy!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
          .container { background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #D87093, #8B5CF6); color: white; padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #D87093, #8B5CF6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚽ ¡Bienvenido a Guerrero Academy!</h1>
          </div>
          <div class="content">
            <h2>Hola ${nombre},</h2>
            <p>¡Excelentes noticias! 🎉 La inscripción de <strong>${playerName || 'tu hijo/a'}</strong> ha sido aprobada exitosamente.</p>
            <p>Tu cuenta ha sido creada. Haz clic en el botón para establecer tu contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" class="button">🔐 Establecer Contraseña</a>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 15px;">Este link es válido por 7 días</p>
            </div>
            <p>¡Bienvenido a la familia Guerrero! 🎯⚽</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Llamar a Resend API desde el servidor
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_QuqVCuKf_BMpVjpcGKEXLnHUi8ubH3eXJ',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Guerrero Academy <onboarding@resend.dev>',
        to: email,
        subject: '🎉 ¡Bienvenido a Guerrero Academy!',
        html: emailHtml
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(response.status).json({ error: error.message || 'Failed to send email' });
    }

    const result = await response.json();
    console.log('✅ Email sent:', result.id);

    return res.status(200).json({ success: true, emailId: result.id });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
