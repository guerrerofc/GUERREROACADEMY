# Guerrero Academy - PRD (Product Requirements Document)

## Problema Original
Sistema de gestión completo para academia de fútbol infantil "Guerrero Academy" en Santo Domingo, República Dominicana.

## Arquitectura
- **Frontend**: React 18 + Tailwind CSS + Lucide React Icons
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **Auth**: JWT tokens (7 días de validez)

## Personas de Usuario
1. **Padres/Tutores**: Acceden a landing page para inscribir hijos
2. **Administrador**: Gestiona jugadores, asistencia, pagos y categorías

## Requisitos Core (Estáticos)
- Categorías: Sub-10 (8-10), Sub-13 (11-13), Sub-17 (14-17)
- Cupos: 30 por categoría
- Mensualidad: RD$ 3,500
- Horario: Sábados 8:00 AM - 12:00 PM
- Ubicación: Colegio Loyola, Santo Domingo
- WhatsApp: 829-639-6001

## ✅ Implementado (10 Marzo 2026)

### Landing Page Pública
- [x] Hero section con call-to-action
- [x] Sección de categorías con cupos en tiempo real
- [x] Información de la academia (beneficios, precio, ubicación)
- [x] Formulario de inscripción funcional
- [x] Validación de edad (8-17 años)
- [x] Asignación automática de categoría por edad
- [x] Prevención de duplicados
- [x] Confirmación de inscripción
- [x] Botón de WhatsApp flotante

### Panel Administrativo
- [x] Login de administrador (dgexp / 123456)
- [x] Dashboard con métricas:
  - Total jugadores activos
  - Pagos pendientes del mes
  - Ingresos del mes
  - Asistencia último sábado
  - Cupos por categoría
  - Últimos inscritos
- [x] Módulo de Jugadores (CRUD completo)
  - Crear/Editar/Eliminar jugadores
  - Búsqueda y filtros
  - Estados activo/inactivo
  - Datos del tutor
- [x] Módulo de Categorías
  - Crear/Editar/Eliminar categorías
  - Cupos máximos
  - Horarios
- [x] Módulo de Asistencia
  - Crear jornadas
  - Marcar presente/ausente/excusado
  - Historial por jornada
- [x] Módulo de Pagos
  - Registrar pagos manuales
  - Ver pendientes
  - Historial por mes
  - Métodos: efectivo/transferencia/tarjeta

### Base de Datos
- [x] Colección admins
- [x] Colección categorias
- [x] Colección jugadores
- [x] Colección jornadas
- [x] Colección asistencias
- [x] Colección pagos

### Validaciones de Negocio
- [x] No sobrepasar cupos
- [x] No duplicar jugadores
- [x] Asignación de categoría por edad
- [x] Cambio manual de categoría
- [x] Historial de pagos por mes

## 📋 Backlog Priorizado

### P0 - Crítico (Próxima iteración)
- [ ] Reportes exportables (Excel/PDF)
- [ ] Recordatorio de pagos por WhatsApp
- [ ] Notificación de inscripción al admin

### P1 - Alta prioridad
- [ ] Multi-academia (preparar estructura)
- [ ] Roles y permisos (asistentes)
- [ ] Backup automático de datos
- [ ] Estadísticas avanzadas de asistencia

### P2 - Media prioridad  
- [ ] Integración pagos online (Stripe/PayPal)
- [ ] Mensajes automáticos por eventos
- [ ] Fotos de jugadores
- [ ] Historial médico

### P3 - Futuro
- [ ] App móvil nativa
- [ ] Portal para padres
- [ ] Calendario de eventos
- [ ] Sistema de torneos

## Próximos Pasos
1. Pruebas con datos reales
2. Ajustar textos según feedback
3. Agregar más validaciones si es necesario
4. Optimizar para móvil
