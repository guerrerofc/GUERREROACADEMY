-- ========================================
-- SQL PARA NUEVAS FUNCIONALIDADES (VERSIÓN CORREGIDA)
-- Guerrero Academy - Sistema Completo
-- ========================================

-- PASO 1: ELIMINAR TABLAS SI EXISTEN (para empezar limpio)
DROP TABLE IF EXISTS player_custom_fees CASCADE;
DROP TABLE IF EXISTS category_fees CASCADE;
DROP TABLE IF EXISTS parent_invitations CASCADE;
DROP TABLE IF EXISTS offers CASCADE;

-- PASO 2: CREAR TABLA DE OFERTAS/PROMOCIONES
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

-- PASO 3: CUOTAS POR CATEGORÍA
CREATE TABLE category_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  monthly_fee DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'DOP',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by uuid,
  UNIQUE(category_id)
);

-- PASO 4: CUOTAS PERSONALIZADAS POR JUGADOR (OVERRIDES)
CREATE TABLE player_custom_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  custom_fee DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'DOP',
  reason TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_by uuid,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- PASO 5: AGREGAR CAMPO EMAIL A INSCRIPTION_REQUESTS
ALTER TABLE inscription_requests 
ADD COLUMN IF NOT EXISTS tutor_email TEXT;

-- PASO 6: TABLA DE INVITACIONES PARA PADRES
CREATE TABLE parent_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 7: ÍNDICES PARA MEJORAR PERFORMANCE
CREATE INDEX idx_offers_active ON offers(is_active, start_date, end_date);
CREATE INDEX idx_category_fees_category ON category_fees(category_id);
CREATE INDEX idx_player_custom_fees_player ON player_custom_fees(player_id, is_active);
CREATE INDEX idx_parent_invitations_token ON parent_invitations(token);
CREATE INDEX idx_parent_invitations_email ON parent_invitations(email);

-- PASO 8: DESACTIVAR RLS EN NUEVAS TABLAS (para desarrollo)
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE category_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE player_custom_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE parent_invitations DISABLE ROW LEVEL SECURITY;

-- PASO 9: FUNCIÓN PARA OBTENER CUOTA DE UN JUGADOR
CREATE OR REPLACE FUNCTION get_player_fee(p_player_id uuid)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  custom_fee DECIMAL(10,2);
  category_fee DECIMAL(10,2);
  player_category uuid;
BEGIN
  -- Primero buscar si tiene cuota personalizada activa
  SELECT custom_fee INTO custom_fee
  FROM player_custom_fees
  WHERE player_id = p_player_id 
    AND is_active = true
    AND (end_date IS NULL OR end_date > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF custom_fee IS NOT NULL THEN
    RETURN custom_fee;
  END IF;
  
  -- Si no tiene custom fee, buscar la cuota de su categoría
  SELECT category_id INTO player_category
  FROM players
  WHERE id = p_player_id;
  
  SELECT monthly_fee INTO category_fee
  FROM category_fees
  WHERE category_id = player_category;
  
  RETURN COALESCE(category_fee, 3500.00); -- Default si no hay configurada
END;
$$ LANGUAGE plpgsql;

-- PASO 10: INSERTAR CUOTAS INICIALES POR CATEGORÍA (OPCIONAL)
-- Descomenta y ajusta según tus categorías reales

/*
INSERT INTO category_fees (category_id, monthly_fee)
SELECT id, 3500.00
FROM categories
WHERE name IN ('8–10 años', '11–13 años', '14–17 años')
ON CONFLICT (category_id) DO NOTHING;
*/

-- ========================================
-- ✅ SQL COMPLETADO
-- ========================================

-- Verificar que todo se creó correctamente:
SELECT 
  'offers' as tabla, 
  COUNT(*) as registros 
FROM offers
UNION ALL
SELECT 
  'category_fees' as tabla, 
  COUNT(*) as registros 
FROM category_fees
UNION ALL
SELECT 
  'player_custom_fees' as tabla, 
  COUNT(*) as registros 
FROM player_custom_fees
UNION ALL
SELECT 
  'parent_invitations' as tabla, 
  COUNT(*) as registros 
FROM parent_invitations;
