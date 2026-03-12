# ✅ SOLUCIÓN RÁPIDA - Error de Índices

## ❌ Error que recibiste:
```
Error: Failed to run sql query: ERROR: 42P07: relation "idx_offer_assignments_offer" already exists
```

## ✅ SOLUCIÓN:

### Usa el nuevo archivo SQL:

**`SQL_OFERTAS_Y_CUPONES_V2.sql`**

Este archivo:
- ✅ Verifica si los índices existen antes de crearlos
- ✅ Puede ejecutarse múltiples veces sin errores
- ✅ Usa `IF NOT EXISTS` y bloques `DO $$`

---

## 🚀 PASOS:

1. **Ve a Supabase Dashboard → SQL Editor**

2. **Copia y pega TODO el contenido de:**
   ```
   SQL_OFERTAS_Y_CUPONES_V2.sql
   ```

3. **Haz clic en "Run"**

4. **Deberías ver:**
   - Una tabla con 3 filas (offer_assignments, discount_coupons, coupon_usage)
   - Mensaje: "✅ SQL ejecutado correctamente"

---

## ✅ LISTO

Después de ejecutar el SQL:
- Recarga tu Super Admin (Ctrl+Shift+R)
- Ve a **Super Admin → Cupones**
- Crea tu primer cupón de prueba

---

**¿Funcionó? ¡Avísame cuando lo ejecutes!** 🎉
