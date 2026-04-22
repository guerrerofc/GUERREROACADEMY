# Guerrero Academy - PRD

## Arquitectura
- Frontend: Vanilla HTML/CSS/JS (`/app/guerrero_uploaded/`)
- Backend API: Vercel Serverless (`/app/api/`)
- Database: Supabase PostgreSQL
- Email: Resend | Pagos: Stripe

## Implementado

### Core
- Login unificado, paneles por rol, URLs limpias, firmas digitales, dashboard

### Campamento 2026 — Completo
- Landing: Hero animado, precios/ofertas, formulario wizard 4 pasos
- Métodos pago reactivos, Stripe Checkout, creación auto padre
- Admin: Inscripciones (aprobar + email coherente + token password)
- Admin: Jugadores (editar perfil completo + foto + semanas)
- Admin: Pagos (registrar, tracking)
- Admin: Semanas (cupos editables, ocupación, quitar jugadores)
- Admin: Fotos (albums, enviar a padres por email)
- Admin: **Asistencia** (por día/semana, marcar todos, resumen semanal con % por día)
- Admin: **Documentos** (subir por jugador: acuerdos, autorizaciones, comprobantes, médicos; filtros por jugador/tipo)
- Admin: Reportes (6 KPIs + 6 gráficos)
- **Migrar a Academia** (preserva datos, selecciona categoría/cuota)
- Emails premium coherentes con estado real

### Landing Config
- 7 toggles secciones, textos editables, precios editables

## SQLs a ejecutar
- SQL_CAMP_ASISTENCIA_DOCS.sql (camp_attendance + camp_documents)

## Backlog
- P1: WhatsApp (Twilio)
- P2: Bug formulario inscripción academia salta pasos
- P3: Galería fotos en panel padres
- P4: Refactoring archivos monolíticos
