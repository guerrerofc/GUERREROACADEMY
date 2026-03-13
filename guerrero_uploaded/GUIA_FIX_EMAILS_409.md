# 🔧 Guía para Solucionar Problemas de Emails y Error 409

## 📋 Resumen de los Problemas

1. ❌ **Error CORS**: La función Edge no incluía headers CORS → **✅ CORREGIDO**
2. ❌ **Error 409 Conflict**: Al crear invitación porque el email ya existía → **✅ CORREGIDO**

---

## 🚀 Pasos para Implementar las Correcciones

### **PASO 1: Ejecutar SQL en Supabase**

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Abre el **SQL Editor** (icono en el menú lateral)
3. Copia y pega el contenido de `/app/guerrero_uploaded/SQL_FIX_PARENT_INVITATIONS.sql`
4. Haz clic en **RUN** para ejecutarlo

**Resultado esperado**: Verás un mensaje confirmando que la tabla `parent_invitations` existe.

---

### **PASO 2: Desplegar Función Edge Corregida**

La función `send-welcome-email` ya fue corregida para incluir los headers CORS correctos. Ahora debes desplegarla:

#### Opción A: Desde el Dashboard de Supabase

1. Ve a **Edge Functions** en tu proyecto
2. Si ya existe `send-welcome-email`:
   - Haz clic en **Deploy** o **Update**
   - Copia el código desde `/app/guerrero_uploaded/supabase/functions/send-welcome-email/index.ts`
   - Pégalo en el editor
   - Guarda y despliega

3. Si NO existe, créala:
   - Haz clic en **Create new function**
   - Nombre: `send-welcome-email`
   - Copia el código del archivo mencionado arriba
   - Despliega

#### Opción B: Desde la terminal (si tienes Supabase CLI instalado)

```bash
cd /ruta/a/tu/proyecto
supabase functions deploy send-welcome-email
```

---

### **PASO 3: Verificar que el Secret RESEND_API_KEY está configurado**

1. Ve a **Settings** → **Edge Functions** → **Secrets** en Supabase
2. Verifica que existe un secret llamado `RESEND_API_KEY`
3. Si no existe, agrégalo:
   - Key: `RESEND_API_KEY`
   - Value: `re_Shffbhd8_JJzCpm24CrEbMYdFQVQAJBfn` (tu API key de Resend)

---

### **PASO 4: Subir Cambios a GitHub**

Los archivos corregidos son:
- ✅ `solicitudes.js` - Ahora usa UPSERT en vez de INSERT
- ✅ `send-welcome-email/index.ts` - Incluye headers CORS

**Comandos para subir:**

```bash
git add .
git commit -m "Fix: Corregir error 409 en invitaciones y CORS en emails"
git push origin main
```

Vercel automáticamente desplegará los cambios.

---

## ✅ Verificación Final

Una vez completados todos los pasos:

1. Ve a tu aplicación en Vercel
2. Entra como Super Admin
3. Ve a **Solicitudes**
4. Aprueba una solicitud de prueba
5. Abre la **Consola del Navegador** (F12)

**Resultado esperado:**
- ✅ No debe aparecer el error CORS
- ✅ No debe aparecer el error 409 Conflict
- ✅ Debe aparecer: `Email de bienvenida enviado`
- ✅ El email debe llegar a la bandeja del padre

---

## 🔍 Troubleshooting

### Si aún ves el error CORS:
- Verifica que desplegaste la función Edge correctamente
- Espera 1-2 minutos para que se propague el cambio
- Haz hard refresh en el navegador (Ctrl + Shift + R)

### Si aún ves el error 409:
- Verifica que ejecutaste el SQL del Paso 1
- Verifica que los cambios en `solicitudes.js` están en GitHub/Vercel
- Puede ser que el email ya tenga una invitación activa. Intenta con otro email o elimina la invitación existente:

```sql
DELETE FROM parent_invitations WHERE email = 'email@ejemplo.com';
```

### Si el email no llega:
- Verifica que el secret `RESEND_API_KEY` está configurado
- Revisa los logs de la función Edge en Supabase Dashboard → Edge Functions → Logs
- Verifica que el email no esté en spam
- Resend solo permite enviar a emails verificados en el plan gratuito

---

## 📝 ¿Qué cambió en el código?

### 1. solicitudes.js (líneas 340-353)

**ANTES:**
```javascript
const { error: inviteError } = await sb
  .from('parent_invitations')
  .insert([{ ... }]);
```

**DESPUÉS:**
```javascript
const { error: inviteError } = await sb
  .from('parent_invitations')
  .upsert([{ ... }], {
    onConflict: 'email' // Actualizar si ya existe
  });
```

**Beneficio:** Si un padre ya tiene una invitación, se actualiza con un nuevo token en vez de fallar.

---

### 2. send-welcome-email/index.ts (líneas 10-14)

**AGREGADO:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

**Beneficio:** Permite que el frontend llame a la función Edge sin errores CORS.

---

## 🎯 Siguiente Paso

Una vez que confirmes que todo funciona, podemos proceder con:
- Integrar cupones al flujo de pago de Stripe
- Probar el flujo completo end-to-end
- Otras mejoras planificadas

¡Avísame cuando hayas completado los pasos! 🚀
