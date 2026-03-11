# Guía de Integración de Stripe con Supabase Edge Functions

## 📋 Descripción General

Esta guía explica cómo implementar pagos de Stripe usando Supabase Edge Functions para Guerrero Academy.

## 🏗️ Arquitectura

```
Frontend (parent-panel.html)
    ↓ (llama API)
Supabase Edge Functions
    ↓ (crea session)
Stripe API
    ↓ (redirige a checkout)
Usuario paga en Stripe
    ↓ (webhook notifica)
Supabase Edge Function (webhook)
    ↓ (actualiza DB)
Base de datos Supabase
```

## 📦 Componentes Necesarios

### 1. Edge Function: create-checkout-session

**Ubicación:** `supabase/functions/create-checkout-session/index.ts`

**Propósito:** Crear sesiones de pago de Stripe

**Request:**
```json
{
  "package_id": "mensualidad",
  "player_id": "uuid-del-jugador",
  "parent_id": "uuid-del-padre",
  "origin_url": "https://tu-dominio.com"
}
```

**Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_..."
}
```

### 2. Edge Function: stripe-webhook

**Ubicación:** `supabase/functions/stripe-webhook/index.ts`

**Propósito:** Recibir notificaciones de pagos completados

**Procesa:**
- `checkout.session.completed` - Pago exitoso
- `checkout.session.expired` - Sesión expirada

### 3. Tabla: payment_transactions

**Campos:**
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  player_id UUID REFERENCES players(id),
  parent_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'DOP',
  month TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'initiated',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Cómo Desplegar Edge Functions

### Opción 1: CLI de Supabase (Recomendado)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref daijiuqqafvjofafwqck

# Deploy función
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Opción 2: Dashboard de Supabase

1. Ve a tu proyecto: https://supabase.com/dashboard/project/daijiuqqafvjofafwqck
2. Navega a **Edge Functions**
3. Crea una nueva función
4. Copia el código de cada función
5. Configura las variables de entorno:
   - `STRIPE_API_KEY=sk_test_emergent`
   - `SUPABASE_SERVICE_ROLE_KEY=<tu-key>`

## 🔧 Configuración de Stripe

### 1. Webhook en Stripe Dashboard

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Crea un nuevo endpoint
3. URL: `https://daijiuqqafvjofafwqck.supabase.co/functions/v1/stripe-webhook`
4. Eventos a escuchar:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Copia el **Signing Secret** y agrégalo como variable de entorno

### 2. Variables de Entorno

En Supabase Dashboard → Settings → Edge Functions:

```
STRIPE_API_KEY=sk_test_emergent
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔐 Paquetes de Pago Fijos

Para seguridad, los montos están definidos en el backend:

```typescript
const PACKAGES = {
  mensualidad: {
    amount: 3500.00,
    currency: 'DOP',
    description: 'Mensualidad Guerrero Academy'
  }
};
```

## ✅ Checklist de Implementación

- [ ] Crear tabla `payment_transactions` en Supabase
- [ ] Desplegar Edge Function `create-checkout-session`
- [ ] Desplegar Edge Function `stripe-webhook`
- [ ] Configurar webhook en Stripe Dashboard
- [ ] Agregar variables de entorno en Supabase
- [ ] Actualizar `parent-panel.html` con lógica de pago
- [ ] Probar flujo completo de pago

## 🧪 Testing

### Test de Checkout Session

```bash
curl -X POST https://daijiuqqafvjofafwqck.supabase.co/functions/v1/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -d '{
    "package_id": "mensualidad",
    "player_id": "test-player-id",
    "parent_id": "test-parent-id",
    "origin_url": "http://localhost:3000"
  }'
```

### Tarjetas de Prueba Stripe

- **Éxito:** `4242 4242 4242 4242`
- **Requiere autenticación:** `4000 0025 0000 3155`
- **Declinada:** `4000 0000 0000 9995`

Fecha: Cualquier fecha futura  
CVV: Cualquier 3 dígitos  
ZIP: Cualquier código postal

## 📚 Recursos

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
