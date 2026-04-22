// Vercel Serverless: Stripe Checkout for Camp Payments
// POST /api/stripe-checkout

const STRIPE_SECRET = 'sk_test_51T9hfDGr4koxh8OfT6QzIbnHT3Vbq83NOtAUTqKdq4rnv6zGOA4CM360fIqc0seB2uvngRvmxgXNoRrMSWAr3IRj007h4MHqf6';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { inscription_id, amount, description, origin_url, metadata } = req.body;

    if (!inscription_id || !amount || !origin_url) {
      return res.status(400).json({ error: 'inscription_id, amount and origin_url required' });
    }

    // Create Stripe Checkout Session via API
    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('mode', 'payment');
    params.append('line_items[0][price_data][currency]', 'dop');
    params.append('line_items[0][price_data][unit_amount]', Math.round(amount * 100)); // cents
    params.append('line_items[0][price_data][product_data][name]', description || 'Campamento Guerrero Academy');
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', `${origin_url}/landing?session_id={CHECKOUT_SESSION_ID}&camp_pay=success`);
    params.append('cancel_url', `${origin_url}/landing?camp_pay=cancelled`);
    
    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => {
        params.append(`metadata[${k}]`, String(v));
      });
    }
    params.append('metadata[inscription_id]', inscription_id);
    params.append('metadata[amount]', String(amount));

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', session);
      return res.status(400).json({ error: session.error?.message || 'Stripe error' });
    }

    return res.status(200).json({
      url: session.url,
      session_id: session.id
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
