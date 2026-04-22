# Guerrero Academy - PRD

## Problema Original
Sistema de gestión para academia de fútbol sala "Guerrero Academy" con paneles por rol, firmas digitales, pagos automáticos, notificaciones WhatsApp/Email, y campamento de verano.

## Arquitectura
- **Frontend**: Vanilla HTML/CSS/JS en `/app/guerrero_uploaded/`
- **Backend API**: Vercel Serverless Functions en `/app/api/` y `/app/guerrero_uploaded/api/`
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel via GitHub sync
- **Email**: Resend (`notificaciones@guerrerofcsd.com`)
- **Pagos**: Stripe (test keys en CONFIGURACION_STRIPE.md)

## URLs Limpias (vercel.json)
| URL | Archivo |
|---|---|
| `/`, `/landing` | landing-mejorado.html |
| `/login` | login.html |
| `/admin` | super-admin.html |
| `/director` | director-panel.html |
| `/staff` | staff-panel.html |
| `/padres` | parent-panel.html |
| `/operativo` | operativo-panel.html |
| `/password` | establecer-password.html |

## Roles
super_admin, director, operativo, staff (coach), parent (padre/tutor)

## Funcionalidades Implementadas

### Core
- Login unificado con verificación de contraseña
- Paneles por rol con tema Apple/Nike (light)
- Firmas digitales con Canvas + PDF
- Dashboard con datos reales + campamento

### Jugadores
- CRUD con foto anual (historial), acta de nacimiento
- Fecha nacimiento → edad → categoría automática
- Columna edad en tabla

### Categorías
- Color personalizado (barra, punto, chart, progress)
- Coach seleccionable desde usuarios (rol staff)
- Horarios, ubicación, cuota mensual

### Pagos Academia
- Pagos manuales con registered_by
- Email confirmación automático (Resend)
- Ingresos por categoría en dashboard
- Recordatorio masivo a morosos por email

### Campamento de Verano 2026
- Sección informativa en landing con ofertas y precios
- Formulario inscripción (tutor, jugador, fecha nac, talla, 8 semanas selector)
- Ofertas automáticas: 4sem→$22K, 6sem→$33K, 8sem→$40K
- Métodos: Reservación 20%, Pago completo (+tshirt), 2 cuotas
- **Stripe Checkout** integrado (pagar con tarjeta online)
- **Dashboard campamento** en home: inscritos, aprobados, cobrado, pendiente, ocupación por semana (bar chart)
- Admin: Inscripciones Camp (aprobar/rechazar/eliminar + generar acuerdo)
- Admin: Pagos Camp (registrar, tracking pagado/pendiente)
- **Acuerdo de Pago** (HTML doc) + envío automático por email

### Landing Config (Admin)
- Toggle formulario Academia on/off
- Toggle sección Campamento on/off
- Editar textos: Hero title, subtitle, announcement banner/badge
- Editar precios del campamento

### Email (Resend)
- Bienvenida, anuncios masivos, recordatorio pago, confirmación pago, acuerdo de pago

### Usuarios
- Crear, editar, eliminar, cambiar contraseña
- Staff mostrado como "Coach"

## API Endpoints
| Endpoint | Función |
|---|---|
| `/api/send-email` | Email genérico (Resend) |
| `/api/stripe-checkout` | Crear sesión Stripe |
| `/api/stripe-status` | Verificar pago Stripe |
| `/api/generate-agreement` | Generar acuerdo de pago + email |
| `/api/send-whatsapp` | WhatsApp via Twilio |

## SQLs a ejecutar en Supabase
1. SQL_OPERATIVO_UPDATE.sql
2. SQL_FOTOS_ACTAS.sql
3. SQL_CATEGORIAS_UPDATE.sql
4. SQL_FIX_COACHES.sql
5. SQL_FECHA_NACIMIENTO.sql
6. SQL_CAMPAMENTO.sql (camp_inscriptions, camp_payments, site_config)

## Backlog
- P1: WhatsApp (Twilio) verificar integración
- P2: Bug formulario inscripción salta pasos
- P3: WhatsApp facturas post-pago Stripe
- P4: Refactoring archivos monolíticos
- P5: Stripe webhooks para confirmaciones en tiempo real
