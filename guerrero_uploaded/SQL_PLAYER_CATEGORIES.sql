-- ===============================================
-- SISTEMA DE MÚLTIPLES CATEGORÍAS PARA PORTEROS
-- Permite que un jugador esté en varias categorías
-- ===============================================

-- 1. Crear tabla de relación player_categories (many-to-many)
CREATE TABLE IF NOT EXISTS player_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, category_id)
);

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_player_categories_player ON player_categories(player_id);
CREATE INDEX IF NOT EXISTS idx_player_categories_category ON player_categories(category_id);

-- 3. Migrar datos existentes de players.category_id a player_categories
INSERT INTO player_categories (player_id, category_id)
SELECT id, category_id 
FROM players 
WHERE category_id IS NOT NULL
ON CONFLICT (player_id, category_id) DO NOTHING;

-- 4. Row Level Security (RLS) - igual que las otras tablas
ALTER TABLE player_categories ENABLE ROW LEVEL SECURITY;

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

-- 5. Comentarios informativos
COMMENT ON TABLE player_categories IS 'Relación many-to-many entre jugadores y categorías. Permite que un jugador (especialmente porteros) esté en múltiples categorías';
COMMENT ON COLUMN player_categories.player_id IS 'ID del jugador';
COMMENT ON COLUMN player_categories.category_id IS 'ID de la categoría';

-- ===============================================
-- NOTA: 
-- No elimines la columna category_id de players todavía.
-- La mantenemos por compatibilidad con código existente.
-- player_categories es la fuente principal ahora.
-- ===============================================
