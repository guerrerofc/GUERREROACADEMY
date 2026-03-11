// Supabase Edge Function: check-payment-status
// Verifica el estado de un pago

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_API_KEY = Deno.env.get('STRIPE_API_KEY') || 'sk_test_51T9hfDGr4koxh8OfT6QzIbnHT3Vbq83NOtAUTqKdq4rnv6zGOA4CM360fIqc0seB2uvngRvmxgXNoRrMSWAr3IRj007h4MHqf6';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASESERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extraer session_id de la URL
    const url = new URL(req.url);
    const session_id = url.pathname.split('/').pop();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Consultar Stripe para obtener el estado actual
    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_API_KEY}`,
      },
    });

    if (!stripeResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch session from Stripe' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripeResponse.json();

    // Crear cliente de Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar transacción en base de datos
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (fetchError) {
      console.error('Error fetching transaction:', fetchError);
    }

    // Si el pago está completo y aún no se ha procesado, actualizarlo
    if (session.payment_status === 'paid' && transaction && transaction.payment_status === 'pending') {
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          payment_status: 'paid',
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', session_id);

      if (!updateError) {
        // Crear registro en payments
        await supabase
          .from('payments')
          .insert({
            player_id: transaction.player_id,
            category_id: transaction.metadata?.category_id || null,
            amount: transaction.amount,
            currency: transaction.currency,
            method: 'card',
            month: transaction.month,
            paid_at: new Date().toISOString().slice(0, 10),
            status: 'paid',
            note: `Pago automático vía Stripe - Session: ${session_id}`
          });
      }
    }

    // Retornar estado
    return new Response(
      JSON.stringify({
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata
      }),
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
