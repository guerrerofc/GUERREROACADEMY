# 🔧 SOLUCIÓN RÁPIDA - Error de SQL

## ❌ Error que recibiste:
```
Error: Failed to run sql query: ERROR: 42703: column "is_active" does not exist
```

## ✅ SOLUCIÓN:

### Opción 1: Usar el nuevo SQL limpio (RECOMENDADO)

1. **Ve a Supabase Dashboard → SQL Editor**

2. **Ejecuta este archivo completo:**
   ```
   SQL_NUEVAS_FUNCIONALIDADES_V2.sql
   ```

   Este archivo:
   - ✅ Elimina las tablas existentes si hay conflictos
   - ✅ Crea todo desde cero correctamente
   - ✅ Incluye verificación al final

3. **Espera el resultado:**
   - Deberías ver una tabla con 4 filas mostrando las tablas creadas
   - Todas deben tener 0 registros inicialmente

---

### Opción 2: Ejecutar comandos individuales (si prefieres)

Si prefieres no eliminar las tablas, ejecuta estos comandos uno por uno:

```sql
-- 1. Eliminar solo la tabla offers si existe
DROP TABLE IF EXISTS offers CASCADE;

-- 2. Crear tabla offers correctamente
CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  offer_type TEXT CHECK (offer_type IN ('percentage', 'fixed', 'promo')),
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  show_on_landing BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Desactivar RLS
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;

-- 4. Crear índice
CREATE INDEX idx_offers_active ON offers(is_active, start_date, end_date);
```

Luego continúa con las demás tablas del archivo `SQL_NUEVAS_FUNCIONALIDADES_V2.sql`

---

## 🧪 VERIFICAR QUE FUNCIONÓ

Ejecuta esta query:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'offers';
```

Deberías ver todas las columnas incluyendo `is_active`.

---

## 📝 DESPUÉS DE EJECUTAR EL SQL

1. ✅ Recarga tu sitio en Vercel (ya está desplegado)
2. ✅ Ve a Super Admin → Ofertas
3. ✅ Crea una oferta de prueba
4. ✅ Verifica que aparezca en el landing si la marcas como "Mostrar en Landing"

---

## ⚠️ NOTA IMPORTANTE

El archivo **SQL_NUEVAS_FUNCIONALIDADES_V2.sql** hace `DROP TABLE` para empezar limpio. Si ya tenías datos en alguna de estas tablas, se perderán. Si tienes datos que quieres conservar, usa la Opción 2.

---

## 🆘 SI AÚN HAY PROBLEMAS

Envíame el error exacto que recibes y te ayudo a resolverlo.
