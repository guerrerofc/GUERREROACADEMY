-- ========================================
-- FIX: Agregar columna COLOR a tabla categories
-- Guerrero Academy
-- ========================================

-- Agregar columna color a la tabla categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#D87093';

-- Actualizar categorías existentes con colores por defecto
UPDATE categories 
SET color = '#D87093' 
WHERE color IS NULL;

-- Verificar que se agregó correctamente
SELECT 
  id, 
  name, 
  description, 
  max_players, 
  color,
  created_at
FROM categories
ORDER BY created_at DESC;

-- ========================================
-- ✅ FIX COMPLETADO
-- ========================================
-- Ahora la tabla 'categories' tiene la columna 'color'
-- y el sistema de categorías funcionará correctamente
