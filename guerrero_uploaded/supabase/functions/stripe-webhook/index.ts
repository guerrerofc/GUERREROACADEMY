// Supabase Edge Function: stripe-webhook
// Maneja webhooks de Stripe para Guerrero Academy

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASESERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();

    // Verificar firma de Stripe (si está configurada)
    if (STRIPE_WEBHOOK_SECRET) {
      const isValid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid signature');
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log('Webhook event:', event.type);

    // Procesar eventos
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object);
    } else if (event.type === 'checkout.session.expired') {
      await handleCheckoutExpired(event.data.object);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const sig = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !sig) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature_bytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    const expectedSig = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return sig === expectedSig;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function handleCheckoutCompleted(session: any) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const session_id = session.id;
  const payment_status = session.payment_status; // 'paid', 'unpaid', etc.
  const metadata = session.metadata || {};

  console.log('Processing completed session:', session_id);

  // Actualizar transaction
  const { data: existingTransaction, error: fetchError } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('session_id', session_id)
    .single();

  if (fetchError) {
    console.error('Error fetching transaction:', fetchError);
    return;
  }

  // Evitar duplicados: solo procesar si el estado es pending
  if (existingTransaction && existingTransaction.payment_status !== 'pending') {
    console.log('Payment already processed, skipping');
    return;
  }

  // Actualizar transacción
  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update({
      payment_status: payment_status === 'paid' ? 'paid' : 'failed',
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent,
      updated_at: new Date().toISOString()
    })
    .eq('session_id', session_id);

  if (updateError) {
    console.error('Error updating transaction:', updateError);
    return;
  }

  // Si el pago fue exitoso, actualizar tabla de payments
  if (payment_status === 'paid' && existingTransaction) {
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        player_id: existingTransaction.player_id,
        category_id: metadata.category_id || null,
        amount: existingTransaction.amount,
        currency: existingTransaction.currency,
        method: 'card',
        month: existingTransaction.month,
        paid_at: new Date().toISOString().slice(0, 10),
        status: 'paid',
        note: `Pago automático vía Stripe - Session: ${session_id}`
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
    } else {
      console.log('Payment record created successfully');
    }

    // TODO: Aquí puedes agregar lógica para enviar WhatsApp
    // Por ejemplo, llamar a otra Edge Function que envíe el mensaje
  }
}

async function handleCheckoutExpired(session: any) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const session_id = session.id;

  console.log('Processing expired session:', session_id);

  // Actualizar transacción como expirada
  const { error } = await supabase
    .from('payment_transactions')
    .update({
      payment_status: 'expired',
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('session_id', session_id);

  if (error) {
    console.error('Error updating expired transaction:', error);
  }
}
