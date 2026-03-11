# 🚀 GUÍA: Implementar Sistema de Solicitudes

## ✅ PASO 1: EJECUTAR SQL (5 min)

1. Ve a Supabase → SQL Editor
2. Abre el archivo: `SQL_SOLICITUDES.sql`
3. Copia todo el contenido
4. Pégalo en el editor
5. Click en **RUN**

✅ Esto crea la tabla `inscription_requests`

---

## ✅ PASO 2: ACTUALIZAR LANDING (10 min)

### Opción A: Automático

En `landing-mejorado.html`, busca la línea **455** que dice:
```javascript
await createInscripcion(payload);
```

Y añade **ANTES** de esa línea:
```javascript
// Guardar en nueva tabla de solicitudes
await guardarSolicitudInscripcion({ padre, whatsapp, jugador, edad, categoria });
```

### Opción B: Incluir el script

En `landing-mejorado.html`, antes del cierre de `</body>`, añade:
```html
<script src="solicitudes.js"></script>
```

Y en `app.js`, línea 455, añade:
```javascript
await guardarSolicitudInscripcion({ padre, whatsapp, jugador, edad, categoria });
```

---

## ✅ PASO 3: ACTUALIZAR SUPER ADMIN (5 min)

En `super-admin.html`, añade una nueva sección:

1. Busca donde quieres poner el panel (ejemplo: después de "Gestión de Jugadores")

2. Copia el contenido del archivo: `PANEL_SOLICITUDES.html`

3. Pégalo en `super-admin.html`

4. Añade el script antes del cierre de `</body>`:
```html
<script src="solicitudes.js"></script>
```

---

## ✅ PASO 4: PROBAR (3 min)

### Probar el formulario:

1. Ve a: `landing-mejorado.html#inscripcion`
2. Llena el formulario
3. Envía

### Verificar en Supabase:

1. Ve a: Supabase → Table Editor → `inscription_requests`
2. Deberías ver la solicitud con `status = 'pending'`

### Probar en Super Admin:

1. Inicia sesión en `super-admin.html`
2. Ve a la sección "Solicitudes de Inscripción"
3. Deberías ver la solicitud pendiente
4. Click en "✓ Aprobar"
5. Esto creará el jugador automáticamente

---

## 🎯 FUNCIONALIDADES

### Lo que hace el sistema:

✅ **Landing:**
- Guarda cada solicitud en `inscription_requests`
- Estado inicial: `pending`

✅ **Super Admin:**
- Ver solicitudes: pendientes, aprobadas, rechazadas
- **Aprobar** → Crea jugador automáticamente + marca como `approved`
- **Rechazar** → Marca como `rejected` + guarda razón

✅ **Base de Datos:**
- Tabla `inscription_requests` con RLS
- Cualquiera puede insertar (formulario público)
- Solo admins pueden ver/actualizar

---

## 📁 ARCHIVOS CREADOS

✅ `SQL_SOLICITUDES.sql` - SQL para crear tabla
✅ `solicitudes.js` - Lógica del sistema
✅ `PANEL_SOLICITUDES.html` - HTML para Super Admin
✅ `GUIA_IMPLEMENTACION_SOLICITUDES.md` - Este archivo

---

## 🔧 PERSONALIZACIÓN

### Cambiar colores de badges:
Edita en `PANEL_SOLICITUDES.html`:
```css
.badge-warning { background: ...; color: ...; }
```

### Añadir campos al formulario:
1. Actualiza `SQL_SOLICITUDES.sql` para agregar columnas
2. Actualiza `solicitudes.js` en `guardarSolicitudInscripcion()`
3. Actualiza `PANEL_SOLICITUDES.html` para mostrar nuevos campos

---

## ❓ SOLUCIÓN DE PROBLEMAS

### No aparecen solicitudes en Super Admin:
- Verifica que ejecutaste `SQL_SOLICITUDES.sql`
- Verifica que incluiste `solicitudes.js`
- Abre la consola (F12) y busca errores

### Error al guardar solicitud:
- Verifica RLS en Supabase
- Verifica que la tabla existe
- Revisa consola del navegador

### No se crea el jugador al aprobar:
- Verifica que la tabla `players` existe
- Verifica permisos del usuario admin
- Revisa logs en consola

---

## ✅ CHECKLIST FINAL

- [ ] SQL ejecutado en Supabase
- [ ] Tabla `inscription_requests` existe
- [ ] `solicitudes.js` añadido al proyecto
- [ ] Landing actualizado para guardar solicitudes
- [ ] Super Admin actualizado con panel de solicitudes
- [ ] Probado formulario → solicitud guardada
- [ ] Probado aprobar → jugador creado
- [ ] Probado rechazar → solicitud marcada

---

**🎉 ¡Sistema completo! Ahora tienes control total sobre las inscripciones.**
