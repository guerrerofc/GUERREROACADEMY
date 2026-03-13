# 🚨 PASOS URGENTES - Guerrero Academy

## Problema 1: Botón de Borrar Jugadores

### ✅ **SOLUCIONADO**
- El botón 🗑️ ahora está visible nuevamente
- La verificación de Super Admin se hace al hacer clic (no al renderizar)
- Si no eres Super Admin, verás un mensaje de acceso denegado

### **IMPORTANTE**: Ejecutar SQL para que funcione
```
1. Ve a: https://supabase.com/dashboard/project/daijiuqqafvjofafwqck/sql/new
2. Abre el archivo: SQL_FIX_DELETE_PLAYERS.sql
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Haz clic en RUN
```

**¿Por qué?** Row Level Security (RLS) está bloqueando los DELETE. El SQL desactiva RLS.

---

## Problema 2: No Llegan los Correos

### 🔴 **ACCIÓN REQUERIDA**

Para que los correos funcionen, debes completar **3 PASOS OBLIGATORIOS**:

### **PASO 1: Ejecutar SQL en Supabase** ⏱️ 2 min

```
1. Ve a: https://supabase.com/dashboard/project/daijiuqqafvjofafwqck/sql/new
2. Abre el archivo: SQL_FIX_PARENT_INVITATIONS.sql
3. Copia TODO el contenido
4. Pégalo y haz clic en RUN
```

**¿Qué hace?** Crea/verifica la tabla `parent_invitations` necesaria para enviar emails.

---

### **PASO 2: Desplegar Edge Function** ⏱️ 3 min

**Opción A - Desde el Dashboard (Recomendado):**

```
1. Ve a: https://supabase.com/dashboard/project/daijiuqqafvjofafwqck/functions
2. Busca la función: send-welcome-email
   - Si EXISTE: Haz clic en ella → Deploy new version
   - Si NO EXISTE: Create new function → Nombre: send-welcome-email
3. Copia el código de: supabase/functions/send-welcome-email/index.ts
4. Pégalo en el editor
5. Haz clic en Deploy
```

**Código actualizado:**
Abre en GitHub: `https://github.com/guerrerofc/GUERREROACADEMY/blob/main/supabase/functions/send-welcome-email/index.ts`

---

### **PASO 3: Verificar Secret de Resend** ⏱️ 1 min

```
1. Ve a: https://supabase.com/dashboard/project/daijiuqqafvjofafwqck/settings/functions
2. Busca la sección: "Secrets"
3. Verifica que existe:
   - Key: RESEND_API_KEY
   - Value: re_Shffbhd8_JJzCpm24CrEbMYdFQVQAJBfn
4. Si NO existe, agrégalo:
   - Haz clic en "Add secret"
   - Key: RESEND_API_KEY
   - Value: re_Shffbhd8_JJzCpm24CrEbMYdFQVQAJBfn
   - Save
```

---

## 🧪 Probar que Todo Funciona

### **Test 1: Eliminar Jugador**
```
1. Ve a Super Admin → Jugadores
2. Deberías ver el botón 🗑️ rojo
3. Haz clic en 🗑️ de un jugador de prueba
4. Resultado esperado: "✅ Jugador eliminado exitosamente"
```

**Si falla:**
- Error: "row-level security" → Ejecuta SQL_FIX_DELETE_PLAYERS.sql
- Error: "Acceso denegado" → Tu usuario no es super_admin en la tabla users

---

### **Test 2: Enviar Email**
```
1. Ve a Super Admin → Solicitudes
2. Aprueba una solicitud que tenga email
3. Abre la consola del navegador (F12)
4. Resultado esperado:
   - ✅ Sin error CORS
   - ✅ Sin error 409
   - ✅ Mensaje: "Email de bienvenida enviado"
5. Revisa el email del padre (puede estar en spam)
```

**Si falla:**
- Error CORS → Despliega la Edge Function (Paso 2)
- Error 409 → Ejecuta SQL_FIX_PARENT_INVITATIONS.sql (Paso 1)
- Email no llega → Verifica RESEND_API_KEY (Paso 3)
- Resend solo envía a emails verificados en plan gratuito

---

## 📋 Checklist de Verificación

**Antes de continuar, confirma:**

- [ ] ✅ Ejecuté SQL_FIX_DELETE_PLAYERS.sql
- [ ] ✅ Ejecuté SQL_FIX_PARENT_INVITATIONS.sql
- [ ] ✅ Desplegué Edge Function send-welcome-email
- [ ] ✅ Verifiqué que existe RESEND_API_KEY en Secrets
- [ ] ✅ Probé eliminar un jugador → Funciona
- [ ] ✅ Probé aprobar solicitud → Email enviado

---

## ❓ Troubleshooting

### **"No veo el botón de eliminar"**
- Refresca la página (Ctrl + Shift + R)
- Vercel puede tardar 1-2 minutos en desplegar

### **"El botón está pero no elimina"**
- Abre consola (F12) y mira el error
- Si dice "row-level security" → Ejecuta SQL_FIX_DELETE_PLAYERS.sql
- Si dice "Acceso denegado" → Tu rol no es super_admin

### **"Los emails no llegan"**
- Verifica que completaste los 3 pasos
- Revisa spam
- Abre consola y busca errores al aprobar
- Verifica logs de la Edge Function en Supabase Dashboard

---

## 🚀 Una Vez Completado

Cuando hayas completado los 3 pasos y ambas funciones trabajen:

1. Prueba el flujo completo:
   - Padre llena formulario de inscripción
   - Admin aprueba solicitud
   - Padre recibe email
   - Padre establece contraseña
   - Padre hace login

2. Avísame y continuaremos con las siguientes tareas:
   - Integrar cupones en Stripe
   - Fix del wizard de inscripción
   - WhatsApp integration

---

**¿Completaste los pasos? ¿Algún error? Comparte capturas de pantalla si hay problemas.** 🎯
