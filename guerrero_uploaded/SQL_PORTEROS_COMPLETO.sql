-- ===============================================
-- SQL COMPLETO PARA SISTEMA DE PORTEROS
-- Ejecuta TODO este script de una vez en Supabase
-- ===============================================

-- PASO 1: Agregar columna es_portero a inscription_requests
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='inscription_requests' AND column_name='es_portero'
    ) THEN
        ALTER TABLE inscription_requests ADD COLUMN es_portero BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- PASO 2: Agregar columna es_portero a players
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='players' AND column_name='es_portero'
    ) THEN
        ALTER TABLE players ADD COLUMN es_portero BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- PASO 3: Crear tabla player_categories (relación many-to-many)
CREATE TABLE IF NOT EXISTS player_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, category_id)
);

-- PASO 4: Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_player_categories_player ON player_categories(player_id);
CREATE INDEX IF NOT EXISTS idx_player_categories_category ON player_categories(category_id);

-- PASO 5: Migrar datos existentes de players a player_categories
INSERT INTO player_categories (player_id, category_id)
SELECT id, category_id 
FROM players 
WHERE category_id IS NOT NULL
ON CONFLICT (player_id, category_id) DO NOTHING;

-- PASO 6: Crear categoría "Porteros" (solo si no existe)
INSERT INTO categories (name, age_min, age_max, description, color, status)
SELECT 'Porteros', 8, 17, 'Entrenamiento especializado para porteros de todas las edades', '#FFD700', 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Porteros'
);

-- PASO 7: Row Level Security para player_categories
ALTER TABLE player_categories ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Allow authenticated users to read player_categories" ON player_categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert player_categories" ON player_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update player_categories" ON player_categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete player_categories" ON player_categories;

-- Crear políticas
CREATE POLICY "Allow authenticated users to read player_categories"
ON player_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert player_categories"
ON player_categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update player_categories"
ON player_categories FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete player_categories"
ON player_categories FOR DELETE
TO authenticated
USING (true);

-- ===============================================
-- VERIFICACIÓN: Ejecuta esto después para confirmar
-- ===============================================
-- SELECT 'es_portero en inscription_requests' as check_name, 
--        EXISTS(SELECT 1 FROM information_schema.columns 
--               WHERE table_name='inscription_requests' AND column_name='es_portero') as exists;
-- 
-- SELECT 'es_portero en players' as check_name,
--        EXISTS(SELECT 1 FROM information_schema.columns 
--               WHERE table_name='players' AND column_name='es_portero') as exists;
--
-- SELECT 'tabla player_categories' as check_name,
--        EXISTS(SELECT 1 FROM information_schema.tables 
--               WHERE table_name='player_categories') as exists;
--
-- SELECT 'categoria Porteros' as check_name,
--        EXISTS(SELECT 1 FROM categories WHERE name='Porteros') as exists;
-- ===============================================

-- FIN DEL SCRIPT
-- Si todo se ejecutó sin errores, el sistema de porteros está listo
