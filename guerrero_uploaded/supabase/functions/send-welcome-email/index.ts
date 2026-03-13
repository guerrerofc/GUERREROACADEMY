// ========================================
// EDGE FUNCTION: send-welcome-email
// Envía email de bienvenida a padres nuevos
// ========================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, nombre, playerName, magicLink } = await req.json();

    if (!email || !nombre) {
      return new Response(
        JSON.stringify({ error: 'Email and nombre are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Bienvenido a Guerrero Academy!</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f9fafb;
          }
          .container {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #D87093, #8B5CF6);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 32px;
            color: #D87093;
            margin-bottom: 15px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #111827;
            margin-top: 0;
            font-size: 22px;
          }
          .content p {
            color: #4b5563;
            margin: 15px 0;
          }
          .highlight-box {
            background: linear-gradient(135deg, rgba(216, 112, 147, 0.1), rgba(139, 92, 246, 0.1));
            border-left: 4px solid #D87093;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .highlight-box strong {
            color: #D87093;
            font-size: 18px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #D87093, #8B5CF6);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(216, 112, 147, 0.3);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .info-list {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-list li {
            margin: 10px 0;
            color: #4b5563;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f9fafb;
            color: #6b7280;
            font-size: 14px;
          }
          .footer a {
            color: #D87093;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚽</div>
            <h1>¡Bienvenido a Guerrero Academy!</h1>
            <p>Estamos emocionados de tenerte con nosotros</p>
          </div>
          
          <div class="content">
            <h2>Hola ${nombre},</h2>
            
            <p>¡Excelentes noticias! 🎉 La inscripción de <strong>${playerName || 'tu hijo/a'}</strong> ha sido aprobada exitosamente.</p>
            
            <div class="highlight-box">
              <strong>✨ Tu cuenta ha sido creada</strong>
              <p style="margin: 10px 0 0 0;">Ahora puedes acceder a tu portal de padres para:</p>
            </div>

            <ul class="info-list">
              <li>📊 Ver el progreso de tu hijo/a</li>
              <li>💳 Gestionar pagos y cuotas</li>
              <li>📅 Consultar horarios y asistencias</li>
              <li>📢 Recibir anuncios importantes</li>
              <li>📞 Contactar directamente con la academia</li>
            </ul>

            ${magicLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; margin-bottom: 15px;">Haz clic en el botón para establecer tu contraseña:</p>
                <a href="${magicLink}" class="button">🔐 Establecer Contraseña</a>
                <p style="color: #9ca3af; font-size: 13px; margin-top: 15px;">Este link es válido por 24 horas</p>
              </div>
            ` : `
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #6b7280;">Recibirás otro email con el link para establecer tu contraseña.</p>
              </div>
            `}

            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #92400e;"><strong>📌 Importante:</strong> Guarda este email para futuras referencias.</p>
            </div>

            <p>Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp o email.</p>
            
            <p style="margin-top: 30px;">
              ¡Bienvenido a la familia Guerrero! 🎯⚽<br>
              <strong>El equipo de Guerrero Academy</strong>
            </p>
          </div>

          <div class="footer">
            <p><strong>Guerrero Academy</strong></p>
            <p>📧 Email: <a href="mailto:info@guerreroacademy.com">info@guerreroacademy.com</a></p>
            <p>📱 WhatsApp: <a href="https://wa.me/18091234567">+1 809-123-4567</a></p>
            <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
              Este es un mensaje automático. Por favor no respondas a este email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email usando Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Guerrero Academy <onboarding@resend.dev>',
        to: email,
        subject: '🎉 ¡Bienvenido a Guerrero Academy!',
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
