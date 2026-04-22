# Guerrero Academy - PRD

## Arquitectura
- Frontend: Vanilla HTML/CSS/JS (`/app/guerrero_uploaded/`)
- Backend API: Vercel Serverless (`/app/api/`)
- Database: Supabase PostgreSQL
- Email: Resend (`notificaciones@guerrerofcsd.com`)
- Pagos: Stripe

## Implementado

### Core
- Login unificado, paneles por rol, URLs limpias, firmas digitales, dashboard real

### Jugadores Academia
- CRUD, foto anual, acta nacimiento, edad auto → categoría auto

### Campamento 2026
- Landing: Hero animado, precios/ofertas rosado, formulario wizard 4 pasos
- Métodos pago reactivos (reservación 20%, completo, 2 cuotas)
- Stripe Checkout, creación auto usuario padre
- Admin: Inscripciones (aprobar/rechazar + email coherente con estado)
- Admin: Jugadores Camp (editar perfil completo: nombre, fecha nac, talla, semanas, tutor, foto)
- Admin: Pagos Camp (registrar, tracking)
- Admin: Semanas (8 cards con cupos editables, ocupación, disponibles, quitar jugador de semana)
- Admin: Fotos (albums por fecha/semana, enviar a padres)
- Admin: Reportes (6 KPIs + 6 gráficos)
- **Migrar a Academia** — Botón en jugadores camp para convertir a academia (seleccionar categoría, cuota, preserva historial)
- Acuerdo de pago HTML + email
- Emails coherentes: "Solicitud Recibida" (pendiente/en proceso) vs "Cupo Confirmado" (pagado)
- Creación automática de usuario padre con token seguro al aprobar

### Emails Premium (Resend)
- 7 tipos con diseño premium: header GUERRERO ACADEMY, responsive, profesional

### Admin Landing Config
- 7 toggles secciones, textos editables, precios campamento editables

## Backlog
- P1: Asistencia Campamento (por día/semana)
- P2: Documentos Campamento (por jugador)
- P3: WhatsApp (Twilio) verificar
- P4: Bug formulario inscripción academia salta pasos
- P5: Refactoring archivos monolíticos
