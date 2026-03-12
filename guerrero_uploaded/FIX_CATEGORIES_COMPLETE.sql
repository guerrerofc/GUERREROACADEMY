-- ========================================
-- FIX COMPLETO: Agregar todas las columnas faltantes a 'categories'
-- Guerrero Academy
-- ========================================

-- PASO 1: Verificar la estructura actual de la tabla categories
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- ========================================
-- PASO 2: Agregar columnas faltantes (si no existen)
-- ========================================

-- Agregar columna 'description' (si no existe)
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Agregar columna 'max_players' (si no existe)
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS max_players INTEGER DEFAULT 30;

-- Agregar columna 'color' (si no existe)
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#D87093';

-- Agregar columna 'created_at' (si no existe)
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Agregar columna 'updated_at' (si no existe)
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ========================================
-- PASO 3: Actualizar registros existentes con valores por defecto
-- ========================================

-- Actualizar max_players si es NULL
UPDATE categories 
SET max_players = 30 
WHERE max_players IS NULL;

-- Actualizar color si es NULL
UPDATE categories 
SET color = '#D87093' 
WHERE color IS NULL;

-- Actualizar created_at si es NULL
UPDATE categories 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Actualizar updated_at si es NULL
UPDATE categories 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- ========================================
-- PASO 4: Crear trigger para auto-actualizar 'updated_at'
-- ========================================

-- Crear función si no existe
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS categories_updated_at ON categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- ========================================
-- PASO 5: Verificar que todas las columnas se agregaron correctamente
-- ========================================

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- ========================================
-- PASO 6: Ver todas las categorías con las nuevas columnas
-- ========================================

SELECT 
  id, 
  name, 
  description,
  max_players, 
  color,
  created_at,
  updated_at
FROM categories
ORDER BY created_at DESC;

-- ========================================
-- ✅ FIX COMPLETADO
-- ========================================
-- Ahora la tabla 'categories' tiene todas las columnas necesarias:
-- - id (PRIMARY KEY)
-- - name (TEXT)
-- - description (TEXT)
-- - max_players (INTEGER)
-- - color (TEXT)
-- - created_at (TIMESTAMPTZ)
-- - updated_at (TIMESTAMPTZ)
-- - age_min (INTEGER) - si ya existía
-- - age_max (INTEGER) - si ya existía
