# 🏆 GUERRERO ACADEMY - GUÍA COMPLETA DEL SISTEMA

## 📋 ÍNDICE
1. [Resumen del Sistema](#resumen-del-sistema)
2. [Arquitectura](#arquitectura)
3. [Paneles Disponibles](#paneles-disponibles)
4. [Sistema de Pagos](#sistema-de-pagos)
5. [Base de Datos](#base-de-datos)
6. [Cómo Usar Cada Panel](#cómo-usar-cada-panel)
7. [Próximos Pasos](#próximos-pasos)

---

## 🎯 RESUMEN DEL SISTEMA

Guerrero Academy es una plataforma completa de gestión para academias de fútbol con:

- ✅ **3 Paneles** según rol de usuario
- ✅ **Pagos Automáticos** con Stripe
- ✅ **Gestión de Jugadores** y categorías
- ✅ **Control de Asistencia**
- ✅ **Anuncios** y comunicación
- ✅ **Reportes** y estadísticas

---

## 🏗️ ARQUITECTURA

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  (Vanilla HTML + CSS + JavaScript)                      │
│                                                          │
│  ├─ parent-panel.html    → Padres                       │
│  ├─ staff-panel.html     → Coaches/Staff                │
│  └─ super-admin.html     → Administrador                │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE                              │
│                                                          │
│  ├─ Authentication       → Login/Registro               │
│  ├─ Database (PostgreSQL) → Datos                       │
│  └─ Edge Functions       → Lógica de pagos              │
│      ├─ create-checkout-session                         │
│      ├─ stripe-webhook                                  │
│      └─ check-payment-status                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    STRIPE                               │
│           (Procesamiento de Pagos)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 PANELES DISPONIBLES

### 1. 👨‍👩‍👧 **PANEL DE PADRES** (`parent-panel.html`)

**Funcionalidades:**
- ✅ Ver información de sus hijos
- ✅ Pagar mensualidades con Stripe
- ✅ Ver historial de pagos
- ✅ Consultar asistencia
- ✅ Leer anuncios de la academia

**Usuarios:** Padres/Tutores de jugadores

---

### 2. 👨‍🏫 **PANEL DE STAFF** (`staff-panel.html`)

**Funcionalidades:**
- ✅ Tomar asistencia de jugadores
- ✅ Ver lista de jugadores por categoría
- ✅ Registrar llegadas tardías
- ✅ Agregar notas sobre sesiones

**Usuarios:** Entrenadores y personal de la academia

---

### 3. 👑 **PANEL DE SUPER ADMIN** (`super-admin.html`)

**Funcionalidades:**
- ✅ Dashboard completo con estadísticas
- ✅ Gestión de jugadores (crear, editar, eliminar)
- ✅ Gestión de categorías
- ✅ Ver todos los pagos
- ✅ Gestión de anuncios
- ✅ Reportes financieros
- ✅ Control total del sistema

**Usuarios:** Dueño/Administrador de la academia

---

## 💳 SISTEMA DE PAGOS

### Flujo de Pago:

```
1. Padre selecciona hijo → "Pagar Mensualidad"
                ↓
2. Sistema crea sesión de Stripe (Edge Function)
                ↓
3. Usuario redirigido a Stripe Checkout
                ↓
4. Usuario completa pago con tarjeta
                ↓
5. Stripe notifica via Webhook (Edge Function)
                ↓
6. Base de datos actualizada automáticamente
                ↓
7. Pago visible en historial
```

### Tablas Involucradas:

- **`payment_transactions`** - Rastrea cada intento de pago
- **`payments`** - Registro de pagos completados

### Monto Configurado:

- **Mensualidad:** RD$ 3,500.00 (configurado en el backend por seguridad)

---

## 🗄️ BASE DE DATOS

### Tablas Principales:

#### **`players`** (Jugadores)
```sql
- id (UUID)
- nombre (TEXT)
- category_id (UUID) → categories
- tutor_nombre (TEXT)
- tutor_whatsapp (TEXT)
- status (TEXT): 'activo', 'inactivo'
- created_at (TIMESTAMP)
```

#### **`categories`** (Categorías)
```sql
- id (UUID)
- name (TEXT)
- max_players (INTEGER)
```

#### **`player_parents`** (Relación Padres-Jugadores)
```sql
- player_id (UUID) → players
- parent_id (UUID) → auth.users
```

#### **`payments`** (Pagos Completados)
```sql
- id (UUID)
- player_id (UUID) → players
- amount (DECIMAL)
- currency (TEXT): 'DOP', 'USD'
- method (TEXT): 'cash', 'transfer', 'card'
- month (TEXT): formato 'YYYY-MM'
- paid_at (DATE)
- status (TEXT): 'paid', 'pending', 'refunded'
```

#### **`payment_transactions`** (Transacciones Stripe)
```sql
- id (UUID)
- session_id (TEXT) - ID de Stripe
- player_id (UUID)
- parent_id (UUID)
- amount (DECIMAL)
- payment_status (TEXT): 'pending', 'paid', 'failed', 'expired'
- stripe_payment_intent_id (TEXT)
- created_at (TIMESTAMP)
```

#### **`attendance`** (Asistencia)
```sql
- id (UUID)
- player_id (UUID) → players
- session_id (UUID) → sessions
- estado (TEXT): 'present', 'absent', 'late'
- created_at (TIMESTAMP)
```

#### **`sessions`** (Sesiones de Entrenamiento)
```sql
- id (UUID)
- fecha (DATE)
- category_id (UUID) → categories
```

#### **`announcements`** (Anuncios)
```sql
- id (UUID)
- title (TEXT)
- content (TEXT)
- created_at (TIMESTAMP)
```

---

## 📱 CÓMO USAR CADA PANEL

### 👨‍👩‍👧 **USAR PANEL DE PADRES:**

1. **Login:**
   - Abre `parent-panel.html`
   - Email: tu-email@ejemplo.com
   - Password: tu-contraseña

2. **Ver hijos:**
   - En el dashboard verás todos tus hijos registrados
   - Click en "Mis Hijos" para ver detalles

3. **Pagar mensualidad:**
   - Ve a "Pagar Mensualidad"
   - Selecciona el hijo
   - Click en "💳 Pagar con Stripe"
   - Completa el pago en Stripe
   - Serás redirigido de vuelta

4. **Ver historial:**
   - Ve a "Historial de Pagos"
   - Verás todos los pagos realizados

---

### 👨‍🏫 **USAR PANEL DE STAFF:**

1. **Login:**
   - Abre `staff-panel.html`
   - Email de staff
   - Password

2. **Tomar asistencia:**
   - Ve a "Tomar Asistencia"
   - Selecciona la categoría
   - Marca presente/ausente/tarde
   - Guarda

3. **Ver jugadores:**
   - Lista completa de jugadores
   - Filtro por categoría

---

### 👑 **USAR PANEL DE SUPER ADMIN:**

1. **Login:**
   - Abre `super-admin.html`
   - Email de admin
   - Password

2. **Dashboard:**
   - Estadísticas en tiempo real
   - Gráficos de pagos
   - Métricas de asistencia

3. **Gestionar Jugadores:**
   - Ve a "Jugadores"
   - Añadir nuevo jugador
   - Editar información
   - Desactivar jugador

4. **Gestionar Categorías:**
   - Crear nuevas categorías
   - Configurar cupo máximo

5. **Ver Pagos:**
   - Todos los pagos del sistema
   - Filtrar por fecha, jugador, estado
   - Exportar reportes

6. **Publicar Anuncios:**
   - Crear nuevos anuncios
   - Visibles para todos los padres

---

## 🚀 PRÓXIMOS PASOS (Roadmap)

### Fase 1: ✅ COMPLETADA
- [x] Sistema de pagos con Stripe
- [x] Panel de padres
- [x] Panel de staff
- [x] Panel de super admin
- [x] Base de datos configurada

### Fase 2: 🎨 DISEÑO FUTURISTA 2030
- [ ] Rediseño visual de los 3 paneles
- [ ] Animaciones y transiciones avanzadas
- [ ] Tema oscuro/claro
- [ ] Modo responsive mejorado

### Fase 3: 📱 INTEGRACIÓN WHATSAPP
- [ ] Envío automático de facturas por WhatsApp
- [ ] Notificaciones de pagos
- [ ] Recordatorios de pago
- [ ] Edge Function para WhatsApp

### Fase 4: 📊 REPORTES AVANZADOS
- [ ] Reportes financieros detallados
- [ ] Análisis de asistencia
- [ ] Exportar a PDF/Excel
- [ ] Gráficos interactivos

### Fase 5: 🔔 NOTIFICACIONES
- [ ] Sistema de notificaciones en tiempo real
- [ ] Alertas de pagos pendientes
- [ ] Recordatorios de sesiones

---

## 🔧 CONFIGURACIÓN TÉCNICA

### Variables de Entorno (Supabase):

```env
STRIPE_API_KEY=sk_test_51T9hfDGr4koxh8Of...
SUPABASE_URL=https://daijiuqqafvjofafwqck.supabase.co
SUPABASESERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...
STRIPE_WEBHOOK_SECRET=whsec_... (opcional por ahora)
```

### URLs de Edge Functions:

```
https://daijiuqqafvjofafwqck.supabase.co/functions/v1/create-checkout-session
https://daijiuqqafvjofafwqck.supabase.co/functions/v1/stripe-webhook
https://daijiuqqafvjofafwqck.supabase.co/functions/v1/check-payment-status
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: No puedo iniciar sesión
**Solución:** Verifica que el usuario exista en Supabase → Authentication → Users

### Problema: El pago no funciona
**Solución:** 
1. Verifica que las Edge Functions estén desplegadas
2. Verifica las variables de entorno
3. Revisa los logs en Supabase Edge Functions

### Problema: No aparecen los jugadores
**Solución:**
1. Verifica que existan en la tabla `players`
2. Verifica que estén relacionados en `player_parents`

### Problema: Error "Player not found"
**Solución:** Asegúrate de que el jugador existe y tiene el ID correcto

---

## 📞 CONTACTO Y SOPORTE

Para dudas o problemas:
1. Revisa esta documentación completa
2. Revisa los logs en Supabase
3. Verifica la consola del navegador (F12)

---

**🎉 ¡Sistema completamente funcional y listo para usar!**

*Última actualización: Marzo 2025*
