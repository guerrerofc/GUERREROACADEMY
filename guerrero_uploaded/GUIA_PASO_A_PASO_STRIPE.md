# 🚀 GUÍA PASO A PASO: Integración de Stripe con Supabase

Esta guía te llevará paso a paso para configurar los pagos automáticos en Guerrero Academy.

---

## 📋 PASO 1: EJECUTAR SQL EN SUPABASE

### 1.1 Accede a tu proyecto de Supabase
- Ve a: https://supabase.com/dashboard/project/daijiuqqafvjofafwqck
- Inicia sesión si es necesario

### 1.2 Abre el SQL Editor
- En el menú lateral, haz clic en **"SQL Editor"**
- Haz clic en **"+ New Query"**

### 1.3 Ejecuta el script SQL
- Abre el archivo: `/app/guerrero_uploaded/EJECUTAR_ESTE_SQL.sql`
- Copia TODO el contenido
- Pégalo en el SQL Editor de Supabase
- Haz clic en **"RUN"** (botón verde abajo a la derecha)

### 1.4 Verifica que funcionó
- Deberías ver un mensaje de éxito
- Verifica que aparezca una tabla llamada `payment_transactions` en:
  - **Database** → **Tables** → busca `payment_transactions`

✅ **Si ves la tabla, perfecto! Continúa al Paso 2**

---

## 🔧 PASO 2: DESPLEGAR EDGE FUNCTIONS EN SUPABASE

Ahora necesitamos subir las 3 funciones de Stripe a Supabase. Tienes 2 opciones:

### OPCIÓN A: Desde el Dashboard de Supabase (MÁS FÁCIL)

#### 2.1 Crea la primera función: `create-checkout-session`

1. Ve a: **Edge Functions** en el menú lateral
2. Haz clic en **"Create a new function"**
3. Nombre: `create-checkout-session`
4. Copia el contenido del archivo:
   `/app/guerrero_uploaded/supabase/functions/create-checkout-session/index.ts`
5. Pégalo en el editor
6. Haz clic en **"Deploy function"**

#### 2.2 Crea la segunda función: `stripe-webhook`

1. Haz clic en **"Create a new function"**
2. Nombre: `stripe-webhook`
3. Copia el contenido del archivo:
   `/app/guerrero_uploaded/supabase/functions/stripe-webhook/index.ts`
4. Pégalo en el editor
5. Haz clic en **"Deploy function"**

#### 2.3 Crea la tercera función: `check-payment-status`

1. Haz clic en **"Create a new function"**
2. Nombre: `check-payment-status`
3. Copia el contenido del archivo:
   `/app/guerrero_uploaded/supabase/functions/check-payment-status/index.ts`
4. Pégalo en el editor
5. Haz clic en **"Deploy function"**

#### 2.4 Configura las variables de entorno

1. Ve a: **Settings** → **Edge Functions**
2. En la sección **"Function secrets"**, añade:

```
STRIPE_API_KEY=sk_test_emergent
SUPABASE_URL=https://daijiuqqafvjofafwqck.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

**IMPORTANTE:** Reemplaza `tu_service_role_key_aqui` con tu Service Role Key que ya tienes.

---

### OPCIÓN B: Desde CLI de Supabase (MÁS RÁPIDO)

Si tienes Supabase CLI instalado:

```bash
# 1. Instalar CLI (si no lo tienes)
npm install -g supabase

# 2. Login
supabase login

# 3. Link al proyecto
supabase link --project-ref daijiuqqafvjofafwqck

# 4. Desplegar las funciones
cd /app/guerrero_uploaded
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook  
supabase functions deploy check-payment-status

# 5. Configurar secretos
supabase secrets set STRIPE_API_KEY=sk_test_emergent
supabase secrets set SUPABASE_URL=https://daijiuqqafvjofafwqck.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

✅ **Una vez desplegadas las funciones, continúa al Paso 3**

---

## 🔔 PASO 3: CONFIGURAR WEBHOOK DE STRIPE

Este paso es CRUCIAL para que Stripe notifique a tu app cuando un pago se complete.

### 3.1 Accede a Stripe Dashboard
- Ve a: https://dashboard.stripe.com/test/webhooks
- (Usa el modo TEST, no producción aún)

### 3.2 Crea un nuevo webhook endpoint

1. Haz clic en **"Add endpoint"**
2. En **"Endpoint URL"**, ingresa:
   ```
   https://daijiuqqafvjofafwqck.supabase.co/functions/v1/stripe-webhook
   ```
3. En **"Events to send"**, selecciona:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Haz clic en **"Add endpoint"**

### 3.3 Obtén el Signing Secret

1. Una vez creado el webhook, verás un **"Signing secret"** que empieza con `whsec_...`
2. Cópialo
3. Ve a Supabase → **Settings** → **Edge Functions** → **Function secrets**
4. Añade:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
   ```

✅ **Webhook configurado! Ahora vamos a probar**

---

## 🧪 PASO 4: PROBAR LA INTEGRACIÓN

### 4.1 Abre la aplicación

1. Accede a tu aplicación en: `https://tu-dominio.com/parent-panel.html`
2. Inicia sesión como padre (necesitas tener un usuario padre creado)

### 4.2 Intenta hacer un pago

1. Ve a la sección **"Pagar Mensualidad"** en el menú
2. Selecciona un hijo
3. Haz clic en **"💳 Pagar con Stripe"**
4. Deberías ser redirigido a la página de checkout de Stripe

### 4.3 Completa el pago con tarjeta de prueba

Usa estos datos de prueba:

- **Número de tarjeta:** `4242 4242 4242 4242`
- **Fecha:** Cualquier fecha futura (ej: 12/26)
- **CVV:** Cualquier 3 dígitos (ej: 123)
- **Código postal:** Cualquier código (ej: 10000)

### 4.4 Verifica que funcionó

1. Después del pago, deberías volver a tu app con un mensaje de éxito
2. Ve a **"Historial de Pagos"** y verifica que aparezca el pago
3. En Supabase, ve a **Database** → **payment_transactions** y verifica que haya un registro con `payment_status = 'paid'`

---

## ❓ SOLUCIÓN DE PROBLEMAS

### Error: "Failed to create Stripe session"
- Verifica que la función `create-checkout-session` esté desplegada
- Verifica que `STRIPE_API_KEY=sk_test_emergent` esté configurada

### El webhook no actualiza la base de datos
- Verifica que el webhook esté configurado en Stripe Dashboard
- Verifica que la URL del webhook sea correcta
- Ve a Stripe Dashboard → Webhooks → Tu endpoint → "Events" para ver los logs

### No aparece el pago en el historial
- Verifica que la tabla `payments` tenga los permisos RLS correctos
- Verifica en Supabase SQL Editor:
  ```sql
  SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 5;
  SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
  ```

---

## ✅ CHECKLIST FINAL

Antes de continuar con los paneles, verifica que:

- [ ] La tabla `payment_transactions` existe en Supabase
- [ ] Las 3 Edge Functions están desplegadas
- [ ] Las variables de entorno están configuradas
- [ ] El webhook de Stripe está creado y apunta a tu Edge Function
- [ ] Pudiste completar un pago de prueba exitoso
- [ ] El pago aparece en el historial

---

## 🎯 PRÓXIMOS PASOS

Una vez que los pagos funcionen correctamente:

1. **Panel de Staff/Coach** - Para tomar asistencia
2. **Panel de Super Admin** - Dashboard completo
3. **Diseño Futurista 2030** - Rediseño visual de los 3 paneles
4. **Integración WhatsApp** - Envío automático de facturas

---

**¿Listo para empezar? Ejecuta el PASO 1 y avísame cómo te va! 🚀**
