# 🔐 SISTEMA DE AUTO-REGISTRO DE PADRES
# Guerrero Academy

## ✅ LO QUE YA ESTÁ LISTO

### 1. Base de Datos
- ✅ Tabla `parent_invitations` creada
- ✅ Campo `tutor_email` agregado a `inscription_requests`
- ✅ Función SQL `get_player_fee()` para obtener cuotas

### 2. Frontend
- ✅ Formulario de inscripción actualizado con campo email
- ✅ Página `establecer-password.html` creada
- ✅ Lógica de aprobación mejorada en `solicitudes.js`

### 3. Flujo Completo
1. Padre llena formulario en landing → incluye email
2. Admin aprueba solicitud en Super Admin
3. Se crea jugador en tabla `players`
4. Se genera token único de invitación
5. Se envía email al padre (Edge Function)
6. Padre hace clic en link y establece contraseña
7. Se crea cuenta en Supabase Auth
8. Padre puede acceder al panel de padres

---

## 🚀 LO QUE FALTA CONFIGURAR

### Edge Function para Enviar Emails

Necesitas crear una Edge Function en Supabase para enviar el email de invitación.

#### Pasos:

1. **Ir a tu Dashboard de Supabase**
   - https://supabase.com/dashboard

2. **Crear Edge Function**
   ```bash
   # Desde tu terminal local (si tienes Supabase CLI):
   supabase functions new send-parent-invitation
   ```

3. **Código de la Edge Function** (`supabase/functions/send-parent-invitation/index.ts`):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Permitir CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { to, parentName, playerName, inviteLink } = await req.json()

    if (!to || !inviteLink) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Enviar email con Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Guerrero Academy <noreply@tudominio.com>', // Cambiar con tu dominio verificado
        to: [to],
        subject: '¡Bienvenido a Guerrero Academy! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 48px; font-weight: bold; color: #D87093; }
              h1 { color: #333; margin: 20px 0; }
              p { color: #666; line-height: 1.6; margin: 15px 0; }
              .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #D87093, #9333ea); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">GA</div>
                <h1>¡Bienvenido a Guerrero Academy! ⚽</h1>
              </div>
              
              <p>Hola <strong>${parentName || 'Padre/Tutor'}</strong>,</p>
              
              <p>¡Excelentes noticias! <strong>${playerName || 'Tu hijo'}</strong> ha sido aceptado en Guerrero Academy.</p>
              
              <p>Para acceder al panel de padres y gestionar la inscripción, pagos y asistencia, necesitas establecer tu contraseña:</p>
              
              <div style="text-align: center;">
                <a href="${inviteLink}" class="button">Establecer Mi Contraseña</a>
              </div>
              
              <p style="font-size: 14px; color: #999;">
                Este enlace es válido por 7 días. Si no lo usas en ese tiempo, contacta con nosotros.
              </p>
              
              <p>Si tienes alguna pregunta, escríbenos por WhatsApp al <strong>829-639-6001</strong>.</p>
              
              <div class="footer">
                <p>Guerrero Academy<br>
                Colegio Loyola • Sábados 8:00 AM – 12:00 PM</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(JSON.stringify(data))
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
```

4. **Desplegar la Edge Function**:
   ```bash
   supabase functions deploy send-parent-invitation
   ```

5. **Configurar Secret de Resend**:
   ```bash
   supabase secrets set RESEND_API_KEY=re_JfGK7vw5_AnaLJTPkWbcvCmVosBGDti8g
   ```

   O desde el Dashboard:
   - Settings → Edge Functions → Secrets
   - Agregar: `RESEND_API_KEY` = `re_JfGK7vw5_AnaLJTPkWbcvCmVosBGDti8g`

---

## 🧪 CÓMO PROBAR

1. **Ejecutar el SQL**:
   ```sql
   -- En Supabase SQL Editor, ejecuta:
   -- /app/guerrero_uploaded/SQL_NUEVAS_FUNCIONALIDADES.sql
   ```

2. **Hacer push a GitHub**:
   ```bash
   git add .
   git commit -m "feat: Sistema completo de auto-registro de padres"
   git push origin main
   ```

3. **Probar flujo completo**:
   - Ve al landing: `landing-mejorado.html`
   - Llena formulario con un email real tuyo
   - Ve al Super Admin: `super-admin.html`
   - Aprueba la solicitud
   - Revisa tu email
   - Haz clic en el enlace
   - Establece tu contraseña
   - Accede al panel de padres

---

## ⚠️ IMPORTANTE

- El email se envía desde `noreply@tudominio.com`. **Debes verificar tu dominio en Resend** para que funcione.
- Si no tienes dominio verificado, usa el dominio de prueba de Resend (solo permite enviar a emails que agregues en Resend).
- Los enlaces de invitación expiran en 7 días.
- Si el email no se envía, el admin verá un mensaje de alerta con el error.

---

## 📧 ALTERNATIVA SIN RESEND

Si no quieres usar Resend ahora, puedes:
1. Comentar la parte del email en `solicitudes.js`
2. El sistema creará el jugador y guardará la invitación
3. Manualmente envía el link al padre por WhatsApp:
   ```
   https://tudominio.com/establecer-password.html?token=EL_TOKEN_GENERADO
   ```

---

¿Necesitas ayuda con algo más?
