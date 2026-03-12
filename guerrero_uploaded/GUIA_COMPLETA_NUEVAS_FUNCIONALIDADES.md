# 🎉 GUÍA COMPLETA - NUEVAS FUNCIONALIDADES
# Guerrero Academy

## ✅ LO QUE SE HA IMPLEMENTADO

### 🔐 FASE 1: Sistema de Auto-Registro de Padres

**¿Qué hace?**
- Los padres se registran desde el formulario del landing con su email
- Cuando apruebas una solicitud, automáticamente:
  - Se crea el jugador
  - Se genera un link único de invitación
  - Se envía email al padre (requiere configurar Edge Function)
  - El padre establece su contraseña
  - Puede acceder al panel de padres

**Cómo usarlo:**
1. Ve al landing: `landing-mejorado.html`
2. Los padres llenan el formulario (ahora incluye email)
3. Ve a Super Admin → Solicitudes
4. Haz clic en "Aprobar" → Se crea todo automáticamente
5. El padre recibe el email y establece su contraseña en `establecer-password.html`

**Archivos clave:**
- `landing-mejorado.html` - Formulario con email
- `solicitudes.js` - Lógica de aprobación con emails
- `establecer-password.html` - Página para crear contraseña
- `SQL_NUEVAS_FUNCIONALIDADES.sql` - Base de datos
- `GUIA_AUTO_REGISTRO_PADRES.md` - Guía detallada

---

### 🎁 FASE 2: Sistema de Ofertas y Promociones

**¿Qué hace?**
- Crea ofertas de 3 tipos:
  - **Porcentaje**: 20% OFF, 30% OFF
  - **Descuento Fijo**: RD$ 500 de descuento
  - **Promoción Especial**: "2x1", "Primer mes gratis", etc
- Las ofertas activas se muestran automáticamente en el landing
- Control total de vigencia (fechas de inicio/fin)

**Cómo usarlo:**
1. Ve a Super Admin → Ofertas
2. Clic en "+ Nueva Oferta"
3. Completa:
   - Título (ej: "20% de Descuento")
   - Descripción
   - Tipo (Porcentaje/Fijo/Promo)
   - Valor (ej: 20, 500, "2x1")
   - ✅ Mostrar en Landing (si quieres que aparezca públicamente)
   - Fechas de inicio/fin (opcional)
   - Estado activo/inactivo
4. Guarda y listo!

**Las ofertas aparecen automáticamente en:**
- Landing page (solo las marcadas como "Mostrar en Landing")
- Solo se muestran las ofertas vigentes y activas

**Ejemplos:**
```
Oferta 1:
- Título: "20% de Descuento en Inscripción"
- Tipo: Porcentaje
- Valor: 20
- Muestra: "20% OFF"

Oferta 2:
- Título: "RD$ 500 de Descuento"
- Tipo: Fijo
- Valor: 500
- Muestra: "RD$ 500 de descuento"

Oferta 3:
- Título: "Promoción Hermanos"
- Tipo: Promo
- Valor: "2do hermano 50% OFF"
- Muestra: "2do hermano 50% OFF"
```

**Archivos:**
- `offers-system.js` - Toda la lógica
- Super Admin → sección "Ofertas"

---

### 💵 FASE 3: Gestión de Cuotas

**¿Qué hace?**
- Define cuotas mensuales por categoría (precio base)
- Crea cuotas personalizadas para jugadores específicos
- Útil para descuentos, becas, hermanos, etc

**Cómo usarlo:**

#### A. Cuotas por Categoría (Precio Base)
1. Ve a Super Admin → Cuotas
2. Tab: "Cuotas por Categoría"
3. Edita el monto para cada categoría
4. Clic en "Guardar Cambios"

Ejemplo:
```
8-10 años: RD$ 3,000
11-13 años: RD$ 3,500
14-17 años: RD$ 4,000
```

#### B. Cuotas Personalizadas (Overrides)
1. Ve a Super Admin → Cuotas
2. Tab: "Cuotas Personalizadas"
3. Clic en "+ Nueva Cuota"
4. Busca al jugador
5. Define:
   - Cuota mensual especial
   - Razón (ej: "Hermano menor", "Becado", "Promoción")
   - Fecha de inicio
   - Fecha de fin (opcional, puede ser indefinida)
6. Guarda

**Lógica del sistema:**
```
Si el jugador tiene cuota personalizada activa:
  → Usa la cuota personalizada
Sino:
  → Usa la cuota de su categoría
```

**Ejemplos de uso:**
```
Caso 1: Hermano menor
- Jugador: Carlos Pérez
- Cuota personalizada: RD$ 2,500 (en vez de 3,500)
- Razón: "Segundo hermano - 30% descuento"
- Vigencia: Indefinida

Caso 2: Beca temporal
- Jugador: Juan García
- Cuota personalizada: RD$ 1,000
- Razón: "Beca académica"
- Vigencia: 3 meses (01/01/2024 - 31/03/2024)

Caso 3: Promoción especial
- Jugador: María López
- Cuota personalizada: RD$ 0
- Razón: "Primer mes gratis - promoción"
- Vigencia: Solo enero 2024
```

**Archivos:**
- `fees-system.js` - Toda la lógica
- Super Admin → sección "Cuotas"

---

## 📝 PASOS PARA ACTIVAR TODO

### 1. Ejecutar SQL en Supabase
```sql
-- Ve a Supabase Dashboard → SQL Editor
-- Ejecuta el contenido completo de:
-- /app/guerrero_uploaded/SQL_NUEVAS_FUNCIONALIDADES.sql
```

### 2. Configurar Edge Function para Emails (Opcional)
Si quieres que los emails de invitación funcionen:
- Lee `GUIA_AUTO_REGISTRO_PADRES.md`
- Crea la Edge Function `send-parent-invitation`
- Configura el secret `RESEND_API_KEY`

### 3. Push a GitHub
```bash
cd guerrero_uploaded
git pull origin main
# Vercel desplegará automáticamente
```

### 4. Probar en Vercel
- Ofertas: Crea una oferta en Super Admin y ve que aparezca en landing
- Cuotas: Configura cuotas por categoría
- Auto-registro: Envía una solicitud y apruébala

---

## 🎯 FLUJOS COMPLETOS

### Flujo 1: Nueva Inscripción con Auto-Registro
1. Padre llena formulario en landing (con email)
2. Admin aprueba en Super Admin → Solicitudes
3. Sistema crea jugador + invitación
4. Padre recibe email (si Edge Function configurada)
5. Padre establece contraseña
6. Padre accede a panel de padres

### Flujo 2: Crear Oferta y Verla en Landing
1. Admin → Ofertas → Nueva Oferta
2. Título: "20% de Descuento"
3. Tipo: Porcentaje, Valor: 20
4. ✅ Mostrar en Landing
5. Fechas: Hoy hasta fin de mes
6. Guardar
7. Ve al landing → Aparece en sección de ofertas

### Flujo 3: Cuota Personalizada para Hermano
1. Admin → Cuotas → Cuotas Personalizadas
2. Nueva Cuota
3. Busca jugador (segundo hermano)
4. Cuota: RD$ 2,500 (en vez de 3,500)
5. Razón: "Descuento hermano menor"
6. Indefinida
7. Guardar
8. Próximo pago usará RD$ 2,500

---

## ⚠️ NOTAS IMPORTANTES

### Auto-Registro de Padres
- ⚠️ Los emails solo funcionan si configuras la Edge Function
- Alternativa: Envía el link manualmente por WhatsApp
- Los links expiran en 7 días

### Ofertas
- Solo se muestran en landing las marcadas con "Mostrar en Landing"
- Solo se muestran si están activas y dentro del rango de fechas
- Puedes tener ofertas inactivas guardadas para el futuro

### Cuotas
- Las cuotas personalizadas siempre prevalecen sobre las de categoría
- Puedes desactivar una cuota personalizada en cualquier momento
- El jugador volverá a la cuota de su categoría al desactivar

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### "Las ofertas no aparecen en landing"
- ✅ Verifica que la oferta esté marcada como "Mostrar en Landing"
- ✅ Verifica que esté activa
- ✅ Verifica las fechas de vigencia
- ✅ Recarga la página con Ctrl+Shift+R

### "No veo la sección de Ofertas/Cuotas en Super Admin"
- ✅ Espera 1 minuto después del deployment
- ✅ Recarga la página con Ctrl+Shift+R
- ✅ Verifica que los archivos `.js` estén en el repositorio

### "El email de invitación no se envía"
- ⚠️ La Edge Function debe estar configurada
- ⚠️ El secret RESEND_API_KEY debe estar en Supabase
- ⚠️ El dominio debe estar verificado en Resend
- ✅ Alternativa: Envía el link manualmente

---

## 📊 RESUMEN DE ARCHIVOS NUEVOS

```
guerrero_uploaded/
├── SQL_NUEVAS_FUNCIONALIDADES.sql (Tablas y funciones)
├── establecer-password.html (Página para padres)
├── offers-system.js (Sistema de ofertas)
├── fees-system.js (Sistema de cuotas)
├── GUIA_AUTO_REGISTRO_PADRES.md (Guía detallada de emails)
└── GUIA_COMPLETA_NUEVAS_FUNCIONALIDADES.md (Este archivo)

Modificados:
├── landing-mejorado.html (+ email, + sección ofertas)
├── app.js (+ captura email)
├── solicitudes.js (+ lógica aprobación con email)
└── super-admin.html (+ navegación, + scripts)
```

---

## 🎓 ¿PREGUNTAS?

Si necesitas ayuda con algo específico, pregúntame:
- "¿Cómo creo una oferta de 2x1?"
- "¿Cómo pongo cuota personalizada?"
- "¿Por qué no funciona el email?"

¡Todo listo para usar! 🚀
