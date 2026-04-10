// Vercel Serverless Function para enviar WhatsApp masivo via Twilio
// Endpoint: POST /api/send-whatsapp-bulk

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipients, message, type } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de destinatarios' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Se requiere un mensaje' });
    }

    // Credenciales de Twilio (desde variables de entorno)
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ error: 'Credenciales de Twilio no configuradas' });
    }

    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      details: []
    };

    // Enviar mensajes con un pequeño delay para evitar rate limiting
    for (const recipient of recipients) {
      const { phone, name } = recipient;
      
      if (!phone) {
        results.failed++;
        results.details.push({ name, phone, status: 'error', error: 'Sin número' });
        continue;
      }

      try {
        // Formatear número
        let phoneNumber = String(phone).replace(/\D/g, '');
        if (phoneNumber.length === 10) {
          phoneNumber = '1' + phoneNumber;
        }
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+' + phoneNumber;
        }

        // Personalizar mensaje si tiene nombre
        let personalizedMessage = message;
        if (name) {
          personalizedMessage = message.replace('{nombre}', name).replace('{NOMBRE}', name);
        }

        const toWhatsapp = `whatsapp:${phoneNumber}`;

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
              Body: personalizedMessage,
            }),
          }
        );

        const result = await twilioResponse.json();

        if (twilioResponse.ok) {
          results.sent++;
          results.details.push({ 
            name, 
            phone: phoneNumber, 
            status: 'sent', 
            sid: result.sid 
          });
        } else {
          results.failed++;
          results.details.push({ 
            name, 
            phone: phoneNumber, 
            status: 'error', 
            error: result.message || 'Error de Twilio',
            code: result.code
          });
        }

        // Pequeño delay entre mensajes (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        results.failed++;
        results.details.push({ 
          name, 
          phone, 
          status: 'error', 
          error: err.message 
        });
      }
    }

    console.log(`📱 WhatsApp Bulk: ${results.sent}/${results.total} enviados`);

    return res.status(200).json({
      success: true,
      type: type || 'bulk',
      ...results
    });

  } catch (error) {
    console.error('❌ Error interno:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
