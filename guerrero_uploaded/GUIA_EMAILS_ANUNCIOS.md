# 📧 GUÍA: Envío de Anuncios por Email

## ✅ PASOS PARA ACTIVAR EL ENVÍO AUTOMÁTICO

### 📋 PASO 1: Crear cuenta en Resend (3 minutos)

Resend es un servicio moderno y gratuito para enviar emails.

1. **Ve a:** https://resend.com
2. **Sign up** (crear cuenta gratis)
3. **Verifica tu email**
4. **Obtén tu API Key:**
   - Dashboard → API Keys
   - Click en "Create API Key"
   - Nombre: "Guerrero Academy"
   - Permisos: "Sending access"
   - Copia la key (empieza con `re_...`)

---

### 📋 PASO 2: Verificar dominio (OPCIONAL pero recomendado)

**Opción A: Usar dominio genérico (más fácil)**
- Los emails se enviarán desde: `onboarding@resend.dev`
- Funciona inmediatamente
- Puede ir a spam

**Opción B: Usar tu dominio (profesional)**
- Los emails se enviarán desde: `noreply@tudominio.com`
- Requiere configurar DNS
- Más profesional, menos spam

Para empezar, usa **Opción A** (más rápido).

---

### 📋 PASO 3: Configurar en Supabase

1. **Ve a Supabase:** https://supabase.com/dashboard/project/daijiuqqafvjofafwqck

2. **Settings** → **Edge Functions**

3. **Function secrets** → **Add new secret**

4. Añade:
   ```
   Name:  RESEND_API_KEY
   Value: re_tu_api_key_aqui
   ```

---

### 📋 PASO 4: Desplegar Edge Function

**Opción A: Desde Dashboard de Supabase (más fácil)**

1. **Edge Functions** → **Create a new function**
2. **Nombre:** `send-announcement-email`
3. **Copia el código** del archivo:
   ```
   supabase/functions/send-announcement-email/index.ts
   ```
4. **Pega** en el editor
5. **Deploy function**

**Opción B: Desde CLI**

```bash
cd /app/guerrero_uploaded
supabase functions deploy send-announcement-email
```

---

### 📋 PASO 5: Probar el sistema

1. **Ve a super-admin.html**
2. **Login** como admin
3. **Ve a "Anuncios"**
4. **Crea un nuevo anuncio:**
   - Título: "Prueba de correo"
   - Contenido: "Este es un anuncio de prueba"
5. **Guarda**

**Resultado esperado:**
- ✅ Anuncio se guarda en la BD
- ✅ Se envían emails a todos los padres automáticamente
- ✅ Aparece mensaje: "Anuncio publicado y enviado por email"

---

## 🔍 VERIFICAR QUE FUNCIONA

### En Resend Dashboard:
1. Ve a: **Emails** (menú izquierdo)
2. Deberías ver los emails enviados
3. Estado: "Delivered" o "Sent"

### En Supabase:
1. **Edge Functions** → **send-announcement-email** → **Logs**
2. Verifica que no hay errores

### En tu email:
- Revisa tu bandeja (si eres padre registrado)
- Revisa spam también

---

## 📧 CÓMO SE VE EL EMAIL

Los padres recibirán un email con:

- **Asunto:** 📢 Nuevo Anuncio: [Título]
- **De:** Guerrero Academy
- **Contenido:** 
  - Header con logo de Guerrero Academy
  - Título del anuncio
  - Contenido completo
  - Footer profesional

---

## ⚙️ PERSONALIZACIÓN

### Cambiar el remitente:

Edita `send-announcement-email/index.ts` línea ~115:

```typescript
from: 'Guerrero Academy <tudominio@ejemplo.com>',
```

### Cambiar el diseño del email:

Edita la variable `emailHtml` en el mismo archivo (líneas 85-145).

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "RESEND_API_KEY not configured"
**Solución:** Verifica que añadiste la API key en Supabase Edge Functions secrets

### Emails no llegan:
**Solución:** 
1. Verifica en Resend Dashboard si se enviaron
2. Revisa carpeta de spam
3. Verifica que los padres tengan emails en la BD

### Error: "Failed to send email"
**Solución:**
1. Verifica tu API key de Resend
2. Revisa logs en Supabase Edge Functions
3. Verifica que no excediste el límite gratuito (100 emails/día)

---

## 💰 LÍMITES GRATUITOS DE RESEND

**Plan gratuito:**
- 100 emails por día
- 3,000 emails por mes
- Todos los features básicos

**Si necesitas más:**
- Plan Pro: $20/mes (50,000 emails)

Para una academia, el plan gratuito debería ser suficiente.

---

## 📊 FLUJO COMPLETO

```
Admin crea anuncio en super-admin
         ↓
Se guarda en tabla 'announcements'
         ↓
Script llama a Edge Function automáticamente
         ↓
Edge Function obtiene emails de todos los padres
         ↓
Resend envía email a cada padre
         ↓
Padres reciben notificación en su email
```

---

## ✅ CHECKLIST

- [ ] Cuenta de Resend creada
- [ ] API Key obtenida
- [ ] API Key configurada en Supabase
- [ ] Edge Function desplegada
- [ ] Script añadido a super-admin.html
- [ ] Probado creando un anuncio
- [ ] Email recibido correctamente

---

**🎯 Una vez completado, cada anuncio se enviará automáticamente por email a todos los padres!**

¿Necesitas ayuda con algún paso? 🚀
