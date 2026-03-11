# 🔐 CONFIGURACIÓN DE STRIPE - TUS CLAVES

## 🎯 Claves de API de Stripe (Modo TEST)

```
PUBLISHABLE KEY (Frontend - no sensible):
pk_test_51T9hfDGr4koxh8OfCYWa9OckAQhQih4lHM7iwo61L6yAiybZHxsTVkH23Dn8QkNvVCfvW2KwtT8hwIvsZSs0IiKr00CCG6GpJu

SECRET KEY (Backend - confidencial):
sk_test_51T9hfDGr4koxh8OfT6QzIbnHT3Vbq83NOtAUTqKdq4rnv6zGOA4CM360fIqc0seB2uvngRvmxgXNoRrMSWAr3IRj007h4MHqf6
```

---

## 📦 PASO 2: CONFIGURAR VARIABLES DE ENTORNO EN SUPABASE

Después de ejecutar el SQL (PASO 1), necesitas configurar las claves en Supabase:

### Instrucciones:

1. Ve a tu Dashboard de Supabase:
   👉 https://supabase.com/dashboard/project/daijiuqqafvjofafwqck

2. En el menú, haz clic en:
   ⚙️ **Settings** (esquina inferior izquierda)

3. En el submenú, haz clic en:
   ⚡ **Edge Functions**

4. Busca la sección: **"Function secrets"** o **"Environment variables"**

5. Haz clic en **"Add new secret"** y añade estas 3 variables:

---

### ✅ Variable 1:
```
Name: STRIPE_API_KEY
Value: sk_test_51T9hfDGr4koxh8OfT6QzIbnHT3Vbq83NOtAUTqKdq4rnv6zGOA4CM360fIqc0seB2uvngRvmxgXNoRrMSWAr3IRj007h4MHqf6
```

### ✅ Variable 2:
```
Name: SUPABASE_URL
Value: https://daijiuqqafvjofafwqck.supabase.co
```

### ✅ Variable 3:
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1OTQyMywiZXhwIjoyMDg4MDM1NDIzfQ.iGmxO0HhYx7QvlOhvW9NTuTc5sT-7Abpz2R3c6cnEqc
```

---

## 📝 NOTAS IMPORTANTES:

- ⚠️ La **SECRET KEY** es confidencial - no la compartas públicamente
- ✅ Estas son claves de **TEST** - puedes usarlas libremente para desarrollo
- 🔄 Cuando pases a producción, usarás las claves que empiezan con `sk_live_...`

---

## ✅ CHECKLIST:

- [ ] SQL ejecutado en Supabase (Paso 1)
- [ ] STRIPE_API_KEY configurada
- [ ] SUPABASE_URL configurada
- [ ] SUPABASE_SERVICE_ROLE_KEY configurada

Una vez completado, estarás listo para desplegar las Edge Functions! 🚀
