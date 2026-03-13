# 📧 Guía Completa: Configuración de Emails con Resend

## 🎯 Emails que se enviarán

1. **Email de Bienvenida** - Cuando se aprueba una solicitud
2. **Email de Anuncios** - Cuando el admin publica un anuncio
3. **Email de Invitación** - Para establecer contraseña (Magic Link)

---

## 📋 PASO 1: Obtener API Key de Resend

### 1.1 Crear cuenta en Resend
1. Ve a: https://resend.com/
2. Haz clic en "Sign Up"
3. Crea tu cuenta (gratis hasta 3,000 emails/mes)

### 1.2 Obtener API Key
1. Login en Resend
2. Ve a: **Settings** → **API Keys**
3. Haz clic en **"Create API Key"**
4. Nombre: `Guerrero Academy Production`
5. Permisos: **Sending access**
6. Copia la key (empieza con `re_...`)

### 1.3 Verificar dominio (IMPORTANTE)
Para que los emails NO vayan a SPAM:

1. Ve a **Domains** en Resend
2. Haz clic en **"Add Domain"**
3. Opciones:
   - **Opción A**: Usar dominio propio (ej: `guerreroacademy.com`)
   - **Opción B**: Usar dominio de Resend (ej: `guerrero.resend.dev`)

4. Si usas dominio propio:
   - Agrega registros DNS (SPF, DKIM, DMARC)
   - Espera verificación (5-10 minutos)

5. Si usas dominio de Resend:
   - Configuración automática
   - Listo para usar inmediatamente

---

## 📋 PASO 2: Configurar Supabase

### 2.1 Agregar RESEND_API_KEY a Supabase
1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a: **Settings** → **Edge Functions** → **Secrets**
4. Agrega un nuevo secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_...` (tu API key de Resend)
5. Guarda

### 2.2 Desplegar Edge Functions

#### Opción A: Desde Supabase Dashboard (Recomendado)
1. Ve a **Edge Functions** en Supabase
2. Verifica que existan estas funciones:
   - `send-announcement-email`
   - `send-welcome-email` (la crearemos)

#### Opción B: Desde CLI (Avanzado)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link proyecto
supabase link --project-ref TU_PROJECT_REF

# Deploy funciones
supabase functions deploy send-announcement-email
supabase functions deploy send-welcome-email
```

---

## 📋 PASO 3: Configurar Email "From"

### 3.1 En las Edge Functions
Edita el archivo: `/app/guerrero_uploaded/supabase/functions/send-announcement-email/index.ts`

Línea 184, cambia:
```typescript
from: 'Guerrero Academy <noreply@TU-DOMINIO.com>',
```

**Opciones:**
- Con dominio verificado: `noreply@guerreroacademy.com`
- Con dominio Resend: `noreply@guerrero.resend.dev`
- Testing: `onboarding@resend.dev` (solo para pruebas)

---

## 📋 PASO 4: Actualizar código frontend

### 4.1 Activar envío de email en announcements
Archivo: `/app/guerrero_uploaded/announcements-email.js`

Ya está configurado, solo necesitas la API key en Supabase.

### 4.2 Verificar envío en solicitudes
Archivo: `/app/guerrero_uploaded/solicitudes.js`

Línea ~300, verificar que llama a:
```javascript
// Enviar email de bienvenida
await enviarEmailBienvenida(solicitud.tutor_email, solicitud.tutor_nombre);
```

---

## 🧪 PASO 5: Probar el sistema

### Test 1: Email de Anuncios
1. Ve a **Super Admin** → **Anuncios**
2. Crea un nuevo anuncio
3. Haz clic en **"Publicar y Enviar Email"**
4. Verifica que llegue a tu email

### Test 2: Email de Bienvenida
1. Llena formulario de inscripción en landing
2. Admin aprueba la solicitud
3. Verifica que llegue email al padre

### Test 3: Magic Link (Password Setup)
1. El email de bienvenida debe incluir un link
2. Al hacer clic, el padre puede establecer su contraseña
3. Luego puede hacer login

---

## 📧 Plantillas de Email

### Email de Bienvenida (Padre Nuevo)
**Asunto**: ¡Bienvenido a Guerrero Academy! 🎉

**Contenido**:
- Saludo personalizado
- Confirmación de inscripción del hijo
- Link para establecer contraseña
- Información de contacto

### Email de Anuncio
**Asunto**: 📢 Nuevo Anuncio: [Título]

**Contenido**:
- Logo de Guerrero Academy
- Título del anuncio
- Contenido completo
- Footer con info de contacto

---

## ⚠️ Troubleshooting

### Problema: Emails van a SPAM
**Solución**:
1. Verifica dominio en Resend
2. Agrega registros SPF/DKIM
3. No uses palabras spam ("gratis", "urgente", etc.)

### Problema: Error "RESEND_API_KEY not configured"
**Solución**:
1. Verifica que agregaste el secret en Supabase
2. Re-deploya las edge functions
3. Espera 1-2 minutos para propagación

### Problema: "Invalid from address"
**Solución**:
1. Usa solo direcciones de tu dominio verificado
2. O usa `onboarding@resend.dev` para testing
3. Verifica que el dominio esté verificado en Resend

---

## ✅ Checklist Final

- [ ] Cuenta creada en Resend
- [ ] API Key obtenida
- [ ] Dominio verificado (propio o Resend)
- [ ] API Key agregada a Supabase secrets
- [ ] Edge functions desplegadas
- [ ] Email "from" configurado correctamente
- [ ] Test de email de anuncios exitoso
- [ ] Test de email de bienvenida exitoso

---

## 🚀 Siguientes Pasos

Una vez configurado todo:
1. Los anuncios se enviarán automáticamente
2. Las bienvenidas se enviarán al aprobar solicitudes
3. Los padres recibirán magic links para login

---

## 📞 Soporte

Si algo no funciona:
1. Revisa logs en Supabase → Edge Functions → Logs
2. Revisa logs en Resend → Emails → Logs
3. Verifica que RESEND_API_KEY esté correcta

---

**¿Ya tienes cuenta en Resend y tu API Key?**  
Si sí, dime y te guío en la configuración de Supabase.
