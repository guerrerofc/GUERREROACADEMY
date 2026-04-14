-- =====================================================
-- FIX: Cambiar coach_id de UUID a texto
-- Guerrero Academy
-- =====================================================

-- Eliminar foreign keys si existen
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_coach_id_fkey;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_assistant_coach_id_fkey;

-- Eliminar columnas UUID
ALTER TABLE categories DROP COLUMN IF EXISTS coach_id;
ALTER TABLE categories DROP COLUMN IF EXISTS assistant_coach_id;

-- Crear columnas de texto para nombres de coaches
ALTER TABLE categories ADD COLUMN IF NOT EXISTS coach_name VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS assistant_coach_name VARCHAR(255);

SELECT 'Fix de coaches aplicado!' as resultado;
