# Guerrero Academy - PRD

## Arquitectura
- Frontend: Vanilla HTML/CSS/JS en `/app/guerrero_uploaded/`
- Backend API: Vercel Serverless Functions en `/app/api/`
- Database: Supabase PostgreSQL
- Email: Resend (`notificaciones@guerrerofcsd.com`)
- Pagos: Stripe

## Implementado

### Core
- Login unificado, paneles por rol, URLs limpias (vercel.json)
- Firmas digitales Canvas + PDF, Dashboard real

### Jugadores
- CRUD, foto anual, acta nacimiento, edad auto, categoría auto

### Campamento 2026
- Landing: Hero animado, precios/ofertas, formulario wizard 4 pasos
- Métodos pago reactivos: Reservación 20%, Completo (+tshirt), 2 Cuotas
- Stripe Checkout integrado
- Creación automática de usuario padre al inscribir
- Admin: Inscripciones, Jugadores, Pagos, Semanas, Reportes
- Semanas: Vista de 8 cards con ocupación, detalle de jugadores por semana, búsqueda
- Reportes: 6 KPIs + 6 gráficos (ocupación, pagos, tallas, edades, timeline)
- Acuerdo de pago HTML + envío por email

### Emails Premium (Resend)
- Templates rediseñados: header negro con logo, cuerpo blanco limpio, footer profesional
- Tipos: welcome, announcement, payment_reminder, payment_confirmation, camp_inscription, camp_photos, custom
- Email de inscripción campamento con datos completos del jugador, semanas, plan de pago

### Admin Landing Config
- 7 toggles: announcement, hero academia, hero camp, info strip, campamento, academia form, camp form
- Textos editables: hero title, subtitle, announcement
- Precios campamento editables

## Backlog
- P1: Apartado Fotos (admin, subir/organizar/enviar a padres)
- P2: WhatsApp (Twilio) verificar
- P3: Bug formulario inscripción academia salta pasos
- P4: Refactoring archivos monolíticos
