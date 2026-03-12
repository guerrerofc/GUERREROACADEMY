# 🔧 Fix: Error de Relación Players/Parents

## ❌ Error Original
```
Error al cargar jugadores: Could not find a relationship between 'players' and 'parents' in the schema cache
```

## 🔍 Causa del Problema
El código intentaba hacer un JOIN con una tabla `parents` que no existe como tabla separada. En la base de datos de Guerrero Academy, los datos del tutor/padre están **directamente en la tabla `players`** con los campos:
- `tutor_nombre`
- `tutor_email` 
- `tutor_whatsapp`

## ✅ Solución Implementada

### Archivo: `/app/guerrero_uploaded/category-players-management.js`

**1. Query de carga de jugadores (línea 110-114)**

❌ **ANTES:**
```javascript
const { data: players, error } = await sb
  .from('players')
  .select('*, parents(name, email)')  // ❌ Relación inexistente
  .eq('category_id', categoryId)
  .order('name');
```

✅ **DESPUÉS:**
```javascript
const { data: players, error } = await sb
  .from('players')
  .select('*')  // ✅ Obtener todos los campos del player
  .eq('category_id', categoryId)
  .order('nombre');
```

**2. Renderizado de jugador (línea 184-188)**

❌ **ANTES:**
```javascript
<div style="font-weight: 600;">${player.name || 'Sin nombre'}</div>
<div>
  Padre: ${player.parents?.name || 'No asignado'}  // ❌ Relación inexistente
</div>
```

✅ **DESPUÉS:**
```javascript
<div style="font-weight: 600;">${player.nombre || 'Sin nombre'}</div>
<div>
  Padre: ${player.tutor_nombre || 'No asignado'}  // ✅ Campo directo
</div>
```

**3. Exportación CSV (línea 357-378)**

❌ **ANTES:**
```javascript
const { data: players, error } = await sb
  .from('players')
  .select('name, age, parents(name, email, phone)')  // ❌ Relación inexistente
  .eq('category_id', categoryId)
  .order('name');

csv += `"${player.name || ''}",`;
csv += `"${player.parents?.name || ''}",`;
csv += `"${player.parents?.email || ''}",`;
```

✅ **DESPUÉS:**
```javascript
const { data: players, error } = await sb
  .from('players')
  .select('nombre, age, tutor_nombre, tutor_email, tutor_whatsapp')  // ✅ Campos directos
  .eq('category_id', categoryId)
  .order('nombre');

csv += `"${player.nombre || ''}",`;
csv += `"${player.tutor_nombre || ''}",`;
csv += `"${player.tutor_email || ''}",`;
```

## 🎯 Resultado

Ahora el modal de "Ver Jugadores" debería:
- ✅ Cargar la lista de jugadores sin errores
- ✅ Mostrar correctamente el nombre del jugador y su padre
- ✅ Mostrar estadísticas (total, capacidad, edad promedio, ingresos)
- ✅ Permitir exportar a CSV con datos completos
- ✅ Todos los botones de acción funcionando

## 📊 Estructura de la Tabla `players`

Para referencia, los campos relevantes en la tabla `players` son:
- `id` (UUID)
- `nombre` (TEXT) - nombre del jugador
- `age` (INT)
- `category_id` (UUID FK)
- `tutor_nombre` (TEXT) - nombre del padre/tutor
- `tutor_email` (TEXT)
- `tutor_whatsapp` (TEXT)
- `status` (TEXT) - activo, becado, inactivo

**NO existe una tabla separada `parents` con relación FK.**

---

**Fecha**: 12 de Marzo, 2025  
**Status**: ✅ Resuelto
