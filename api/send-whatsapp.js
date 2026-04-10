// Vercel Serverless Function para enviar WhatsApp via Twilio
// Endpoint: POST /api/send-whatsapp

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
    const { to, message, type } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Número de teléfono y mensaje son requeridos' });
    }

    // Credenciales de Twilio (desde variables de entorno)
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ error: 'Credenciales de Twilio no configuradas' });
    }

    // Formatear número (asegurar formato E.164)
    let phoneNumber = String(to).replace(/\D/g, '');
    
    // Si el número no tiene código de país, asumir República Dominicana (+1)
    if (phoneNumber.length === 10) {
      phoneNumber = '1' + phoneNumber;
    }
    
    // Si no empieza con +, agregarlo
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    const toWhatsapp = `whatsapp:${phoneNumber}`;

    console.log(`📱 Enviando WhatsApp a: ${toWhatsapp}`);
    console.log(`📝 Mensaje (${type || 'general'}): ${message.substring(0, 50)}...`);

    // Llamar a Twilio API
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_FROM,
          To: toWhatsapp,
          Body: message,
        }),
      }
    );

    const result = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('❌ Error de Twilio:', result);
      return res.status(twilioResponse.status).json({ 
        error: result.message || 'Error al enviar WhatsApp',
        code: result.code,
        details: result
      });
    }

    console.log('✅ WhatsApp enviado! SID:', result.sid);

    return res.status(200).json({ 
      success: true, 
      messageSid: result.sid,
      status: result.status,
      to: toWhatsapp
    });

  } catch (error) {
    console.error('❌ Error interno:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
