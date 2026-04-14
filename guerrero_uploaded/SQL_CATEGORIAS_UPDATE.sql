-- =====================================================
-- COLUMNAS ADICIONALES PARA CATEGORÍAS
-- Guerrero Academy
-- =====================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS training_days TEXT[] DEFAULT '{}';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS training_time VARCHAR(20);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS coach_id UUID;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS assistant_coach_id UUID;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS inscriptions_open BOOLEAN DEFAULT true;

SELECT 'Columnas de categorías actualizadas!' as resultado;
