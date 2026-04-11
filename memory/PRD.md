# Guerrero Academy - PRD (Product Requirements Document)

## Información General
- **Proyecto**: Sistema de Gestión de Academia de Fútbol
- **Cliente**: Guerrero Academy
- **Idioma del Usuario**: Español
- **Stack**: Vanilla HTML/CSS/JS + Supabase + Vercel

---

## Descripción del Producto

Sistema web completo para gestionar una academia de fútbol que incluye:
- Paneles separados por roles (Super Admin, Director, Staff, Padres)
- Gestión de jugadores, categorías y asistencia
- Sistema de pagos con Stripe
- Sistema de documentos y firmas digitales
- Anuncios y comunicaciones
- Login unificado con redirección automática por rol

---

## Funcionalidades Implementadas

### ✅ Fase 1 - Core (Completado)
- [x] Panel Super Admin con dashboard
- [x] Panel Director con restricciones
- [x] Panel Staff para entrenadores
- [x] Panel Padres
- [x] Gestión de jugadores CRUD
- [x] Gestión de categorías
- [x] Sistema de asistencia
- [x] Pagos con Stripe
- [x] Anuncios con envío de emails (Resend)
- [x] Login unificado con detección de rol

### ✅ Fase 2 - UI/UX (Completado)
- [x] Tema Apple/Nike (fondo blanco, minimalista)
- [x] Override de tema oscuro legacy
- [x] Diseño responsive
- [x] Landing page mejorada

### ✅ Fase 3 - Documentos y Firmas (Completado - Diciembre 2025)
- [x] Sistema de plantillas de documentos
- [x] 5 documentos obligatorios precargados:
  - Reglamento Interno
  - Autorización Médica
  - Uso de Imagen
  - Descargo de Responsabilidad
  - Compromiso de Pago (dinámico)
- [x] Wizard de firma paso a paso
- [x] Canvas de firma digital (mouse y touch)
- [x] Almacenamiento de firmas en Supabase
- [x] Sección de documentos en Panel de Padres
- [x] Estados de documentos por jugador
- [x] Triggers automáticos para actualizar estados

---

## Pendientes / Backlog

### 🔴 P0 - Crítico
- [ ] Sincronización GitHub/Vercel (problema recurrente con "Save to GitHub")
- [ ] Ejecutar SQL de documentos en Supabase

### 🟡 P1 - Alta Prioridad
- [ ] Generación de PDF para documentos firmados
- [ ] Almacenamiento de PDFs en Supabase Storage
- [ ] Panel Admin para gestión de documentos
- [ ] Integrar cupones en flujo de pago de Stripe

### 🟢 P2 - Media Prioridad
- [ ] Integración WhatsApp (Twilio) - endpoints creados, falta testing
- [ ] Recordatorios automáticos de documentos pendientes
- [ ] Bloqueo de activación sin documentos completos
- [ ] Formulario de inscripción pública (arreglar wizard que salta pasos)

### 🔵 P3 - Baja Prioridad
- [ ] Descarga de documentos firmados desde panel padre
- [ ] Envío de documentos por email
- [ ] Refactorización de archivos monolíticos

---

## Arquitectura Técnica

### Frontend
- **Tecnología**: Vanilla HTML/CSS/JS
- **Estilos**: CSS custom + admin-apple-theme.css
- **Ubicación**: /app/guerrero_uploaded/

### Backend
- **Base de datos**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **APIs serverless**: Vercel Functions (/app/api/)
- **Storage**: Supabase Storage (para PDFs futuros)

### Deployment
- **Hosting**: Vercel
- **CI/CD**: GitHub → Vercel (automático)
- **Dominio**: guerreroacademy.vercel.app

---

## Esquema de Base de Datos

### Tablas Principales
- `players` - Jugadores
- `categories` - Categorías
- `users` - Usuarios del sistema
- `payments` - Pagos
- `announcements` - Anuncios
- `sessions` - Sesiones de entrenamiento
- `attendance` - Asistencia
- `offers` - Ofertas/descuentos
- `coupons` - Cupones

### Tablas de Documentos (Nuevas)
- `document_templates` - Plantillas de documentos
- `document_signatures` - Firmas de documentos

### Campos Agregados a Players
```sql
regulations_status VARCHAR(20)
medical_status VARCHAR(20)
image_consent_status VARCHAR(20)
liability_status VARCHAR(20)
payment_agreement_status VARCHAR(20)
documents_complete BOOLEAN
agreed_monthly_fee DECIMAL(10,2)
agreed_payment_day INTEGER
payment_agreement_date TIMESTAMP
```

---

## Configuración de Montos

```javascript
INSCRIPTION_AMOUNT: 3500  // RD$ 3,500
MONTHLY_AMOUNT: 4000      // RD$ 4,000
PAYMENT_DAY: 30           // Día 30 de cada mes
```

---

## Credenciales (Solo para Testing)

- **Supabase URL**: https://daijiuqqafvjofafwqck.supabase.co
- **Supabase Anon Key**: [ver en archivos .html]
- **Resend API Key**: [configurado para emails]

---

## Archivos Clave

### Paneles
- `super-admin.html` - Panel Super Admin
- `director-panel.html` - Panel Director
- `staff-panel.html` - Panel Staff
- `parent-panel.html` - Panel Padres
- `login.html` - Login unificado
- `landing-mejorado.html` - Landing page

### Estilos
- `admin-apple-theme.css` - Tema principal

### JavaScript
- `documents-system.js` - Sistema de documentos y firmas
- `fees-system.js` - Sistema de tarifas
- `offers-system.js` - Sistema de ofertas
- `coupons-system.js` - Sistema de cupones

### SQL
- `SQL_DOCUMENTS_SIGNATURES.sql` - Crear tablas de documentos

### Documentación
- `GUIA_DOCUMENTOS_FIRMAS.md` - Guía del sistema de documentos

---

## Historial de Cambios

### Diciembre 2025
- ✅ Implementado sistema completo de documentos y firmas digitales
- ✅ Creados 5 documentos obligatorios con contenido completo
- ✅ Wizard de firma con canvas digital
- ✅ Integración en Panel de Padres
- ✅ Triggers automáticos para estados de documentos

### Sesiones Anteriores
- Tema Apple/Nike implementado
- Login unificado con redirección por rol
- Arreglos de UI (títulos en negro)
- Corrección de conflictos de git

---

*Última actualización: Diciembre 2025*
