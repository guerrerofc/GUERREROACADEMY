# Guerrero Academy - PRD

## Arquitectura
- Frontend: Vanilla HTML/CSS/JS (`/app/guerrero_uploaded/`)
- Backend API: Vercel Serverless (`/app/api/`)
- Database: Supabase PostgreSQL
- Email: Resend (`notificaciones@guerrerofcsd.com`)
- Pagos: Stripe

## Implementado

### Core
- Login unificado, paneles por rol (super_admin, director, operativo, staff/coach, parent)
- URLs limpias via vercel.json, firmas digitales Canvas+PDF, dashboard real

### Jugadores
- CRUD, foto anual, acta nacimiento, fecha nac → edad → categoría auto

### Campamento 2026
- Landing: Hero animado CAMP 2026, precios/ofertas rosado, formulario wizard 4 pasos
- Métodos pago reactivos: Reservación 20%, Completo (+tshirt), 2 Cuotas
- Stripe Checkout, creación auto usuario padre
- Admin: Inscripciones, Jugadores, Pagos, Semanas (8 cards interactivas), Reportes (6 KPIs + 6 gráficos)
- **Fotos Camp**: Subir albums por fecha/semana, preview, enviar a padres por email (todos/semana/individual), historial envíos
- Acuerdo de pago HTML + email

### Emails Premium
- Templates rediseñados: header GUERRERO ACADEMY, cuerpo limpio, footer profesional
- 7 tipos: welcome, announcement, payment_reminder, payment_confirmation, camp_inscription, camp_photos, custom

### Admin Landing Config
- 7 toggles para secciones, textos editables, precios campamento editables

## SQLs necesarios
- SQL_CAMP_FOTOS.sql (tabla camp_photo_albums)
- SQL_USERS_TELEFONO.sql (columna telefono en users)

## Backlog
- P1: WhatsApp (Twilio) verificar
- P2: Bug formulario inscripción academia salta pasos
- P3: Refactoring archivos monolíticos
- P4: Stripe webhooks
