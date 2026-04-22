// Vercel Serverless: Check Stripe Checkout Session Status
// GET /api/stripe-status?session_id=xxx

const STRIPE_SECRET = 'sk_test_51T9hfDGr4koxh8OfT6QzIbnHT3Vbq83NOtAUTqKdq4rnv6zGOA4CM360fIqc0seB2uvngRvmxgXNoRrMSWAr3IRj007h4MHqf6';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET}` }
    });

    const session = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: session.error?.message || 'Error' });
    }

    return res.status(200).json({
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata || {}
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
