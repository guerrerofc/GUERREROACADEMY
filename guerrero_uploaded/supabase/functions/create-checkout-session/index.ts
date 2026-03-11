// Supabase Edge Function: create-checkout-session
// Crea sesiones de pago de Stripe para Guerrero Academy

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_API_KEY = Deno.env.get('STRIPE_API_KEY') || 'sk_test_emergent';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Paquetes de pago fijos (seguridad: nunca aceptar montos del frontend)
const PACKAGES = {
  mensualidad: {
    amount: 3500.00,
    currency: 'DOP',
    description: 'Mensualidad Guerrero Academy'
  }
};

interface CheckoutRequest {
  package_id: string;
  player_id: string;
  parent_id: string;
  origin_url: string;
  month?: string;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { package_id, player_id, parent_id, origin_url, month }: CheckoutRequest = await req.json();

    // Validación
    if (!package_id || !player_id || !parent_id || !origin_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar que el paquete existe
    const packageInfo = PACKAGES[package_id as keyof typeof PACKAGES];
    if (!packageInfo) {
      return new Response(
        JSON.stringify({ error: 'Invalid package_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener mes actual si no se proporciona
    const paymentMonth = month || new Date().toISOString().slice(0, 7);

    // Crear cliente de Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Obtener información del jugador
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('nombre, category_id')
      .eq('id', player_id)
      .single();

    if (playerError || !player) {
      return new Response(
        JSON.stringify({ error: 'Player not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construir URLs de éxito y cancelación
    const success_url = `${origin_url}/parent-panel.html?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${origin_url}/parent-panel.html?payment=cancelled`;

    // Crear sesión de Stripe Checkout
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'success_url': success_url,
        'cancel_url': cancel_url,
        'line_items[0][price_data][currency]': packageInfo.currency.toLowerCase(),
        'line_items[0][price_data][product_data][name]': `${packageInfo.description} - ${player.nombre}`,
        'line_items[0][price_data][product_data][description]': `Mes: ${paymentMonth}`,
        'line_items[0][price_data][unit_amount]': Math.round(packageInfo.amount * 100).toString(), // Stripe usa centavos
        'line_items[0][quantity]': '1',
        'metadata[player_id]': player_id,
        'metadata[parent_id]': parent_id,
        'metadata[month]': paymentMonth,
        'metadata[category_id]': player.category_id || '',
        'metadata[package_id]': package_id,
      }),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('Stripe error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create Stripe session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripeResponse.json();

    // Guardar transacción en base de datos
    const { error: dbError } = await supabase
      .from('payment_transactions')
      .insert({
        session_id: session.id,
        player_id,
        parent_id,
        amount: packageInfo.amount,
        currency: packageInfo.currency,
        month: paymentMonth,
        payment_status: 'pending',
        status: 'initiated',
        metadata: {
          player_name: player.nombre,
          category_id: player.category_id,
          package_id
        }
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // No fallar si hay error en DB, la sesión de Stripe ya fue creada
    }

    // Retornar URL de checkout
    return new Response(
      JSON.stringify({
        checkout_url: session.url,
        session_id: session.id
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
