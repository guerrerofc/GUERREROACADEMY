# Guerrero Academy - PRD

## Problema Original
Sistema de gestión para academia de fútbol sala "Guerrero Academy" con paneles por rol, firmas digitales, pagos automáticos, notificaciones WhatsApp/Email, y campamento de verano.

## Arquitectura
- **Frontend**: Vanilla HTML/CSS/JS en `/app/guerrero_uploaded/`
- **Backend API**: Vercel Serverless Functions en `/app/api/`
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel via GitHub sync
- **Email**: Resend (`notificaciones@guerrerofcsd.com`)
- **Pagos**: Stripe (test keys)

## URLs Limpias (vercel.json)
- `/` y `/landing` → Landing page
- `/login` → Login unificado
- `/admin` → Super Admin
- `/director` → Panel Director
- `/staff` → Panel Coach
- `/padres` → Panel Padres
- `/operativo` → Panel Operativo
- `/password` → Establecer contraseña

## Roles
- super_admin, director, operativo, staff (coach), parent (padre/tutor)

## Funcionalidades Implementadas

### Core
- Login unificado con verificación de contraseña
- Paneles por rol con tema Apple/Nike
- Firmas digitales con Canvas + PDF
- Dashboard con datos reales de Supabase

### Jugadores
- CRUD completo con foto anual (historial sin borrar)
- Acta de nacimiento (padres suben, solo admin borra)
- Fecha de nacimiento → edad → categoría automática
- Columna de edad en tabla

### Categorías
- Color personalizado (barra, punto, chart)
- Coach seleccionable desde usuarios
- Horarios, ubicación, cuota mensual
- Inscripciones abiertas/cerradas

### Pagos
- Pagos manuales con `registered_by`
- Email de confirmación automático
- Ingresos por categoría en dashboard
- Recordatorio masivo a morosos por email

### Campamento de Verano 2026
- Sección informativa en landing con ofertas
- Formulario: datos tutor, jugador, fecha nac, talla, selector 8 semanas
- Ofertas: 4sem→$22K, 6sem→$33K, 8sem→$40K (precio base $6,500/sem)
- Métodos: Reservación 20%, Pago completo (+tshirt), 2 cuotas
- Stripe Checkout integrado (pagos con tarjeta)
- Admin: Inscripciones Camp. (aprobar/rechazar/eliminar)
- Admin: Pagos Camp. (registrar, tracking pagado/pendiente)
- Generación de Acuerdo de Pago (HTML) + envío por email

### Landing Config (Admin)
- Toggle formulario Academia on/off
- Toggle sección Campamento on/off
- Editar textos: Hero title, subtitle, announcement banner
- Editar precios del campamento

### Email (Resend)
- Bienvenida a nuevos padres
- Anuncios masivos
- Recordatorio de pago a morosos
- Confirmación de pago
- Acuerdo de pago campamento

### Usuarios
- Crear, editar, eliminar usuarios
- Cambiar contraseña
- Roles: super_admin, director, operativo, staff, parent

## SQLs Pendientes de Ejecutar
- SQL_FOTOS_ACTAS.sql
- SQL_CATEGORIAS_UPDATE.sql
- SQL_FIX_COACHES.sql
- SQL_FECHA_NACIMIENTO.sql
- SQL_CAMPAMENTO.sql (incluye camp_payments y site_config)

## Backlog
- P1: WhatsApp (Twilio) - endpoints existen, verificar
- P2: Formulario público de inscripción salta pasos (bug)
- P3: WhatsApp facturas automáticas post-pago Stripe
- P4: Refactoring archivos monolíticos
