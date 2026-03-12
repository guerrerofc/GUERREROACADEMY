-- ========================================
-- MEJORAS PARA CATEGORÍAS - SCHEMA COMPLETO
-- ========================================

-- 1. Actualizar tabla categories con nuevos campos
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS inscriptions_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS training_days TEXT[], -- ['lunes', 'miércoles', 'viernes']
ADD COLUMN IF NOT EXISTS training_time TEXT, -- '16:00-17:30'
ADD COLUMN IF NOT EXISTS location TEXT, -- 'Cancha Principal'
ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES staff(id),
ADD COLUMN IF NOT EXISTS assistant_coach_id UUID REFERENCES staff(id),
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 0;

-- 2. Agregar campo category_id a players si no existe
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 3. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_players_category ON players(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_coach ON categories(coach_id);

-- 4. Verificar estructura actualizada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- ========================================
-- ✅ SCHEMA DE CATEGORÍAS MEJORADO
-- ========================================
