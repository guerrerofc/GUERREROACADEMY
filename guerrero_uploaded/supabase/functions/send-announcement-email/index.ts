// ========================================
// EDGE FUNCTION: send-announcement-email
// Envía anuncios por correo a los padres
// ========================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_JfGK7vw5_AnaLJTPkWbcvCmVosBGDti8g';
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
    const { title, content, announcement_id } = await req.json();

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente de Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Obtener todos los emails de los padres
    // Los padres son usuarios autenticados que tienen hijos registrados
    const { data: parents, error: parentsError } = await supabase
      .from('auth.users')
      .select('email')
      .not('email', 'is', null);

    if (parentsError) {
      console.error('Error fetching parents:', parentsError);
      // Alternativa: obtener de player_parents
      const { data: parentRelations } = await supabase
        .from('player_parents')
        .select('parent_id');

      if (parentRelations && parentRelations.length > 0) {
        const parentIds = parentRelations.map(r => r.parent_id);
        
        // Obtener emails de auth.users
        const { data: users } = await supabase.auth.admin.listUsers();
        
        const parentEmails = users?.users
          ?.filter(u => parentIds.includes(u.id) && u.email)
          .map(u => u.email) || [];

        if (parentEmails.length > 0) {
          await sendEmailsToParents(parentEmails, title, content);
        }
      }
    } else if (parents && parents.length > 0) {
      const emails = parents.map(p => p.email).filter(e => e);
      await sendEmailsToParents(emails, title, content);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully' 
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

async function sendEmailsToParents(emails: string[], title: string, content: string) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          color: white;
          padding: 30px;
          border-radius: 12px 12px 0 0;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          background: white;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 12px 12px;
        }
        .content h2 {
          color: #111827;
          margin-top: 0;
        }
        .content p {
          color: #4b5563;
          white-space: pre-wrap;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 24px;
          color: #8B5CF6;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">GA</div>
        <h1>Guerrero Academy</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Nuevo Anuncio</p>
      </div>
      <div class="content">
        <h2>${title}</h2>
        <p>${content}</p>
      </div>
      <div class="footer">
        <p>Este es un mensaje automático de Guerrero Academy</p>
        <p>Si tienes preguntas, contáctanos por WhatsApp</p>
      </div>
    </body>
    </html>
  `;

  // Enviar emails usando Resend
  const promises = emails.map(async (email) => {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Guerrero Academy <noreply@guerreroacademy.com>',
          to: email,
          subject: `📢 Nuevo Anuncio: ${title}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to send email to ${email}:`, error);
      } else {
        console.log(`Email sent to ${email}`);
      }
    } catch (error) {
      console.error(`Error sending email to ${email}:`, error);
    }
  });

  await Promise.all(promises);
}
