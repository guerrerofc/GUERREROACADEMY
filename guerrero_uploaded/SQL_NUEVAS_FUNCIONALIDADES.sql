-- ========================================
-- SQL PARA NUEVAS FUNCIONALIDADES
-- Guerrero Academy - Sistema Completo
-- ========================================

-- 1. TABLA DE OFERTAS/PROMOCIONES
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  offer_type TEXT CHECK (offer_type IN ('percentage', 'fixed', 'promo')),
  value TEXT NOT NULL, -- "20", "10", "2x1", etc
  is_active BOOLEAN DEFAULT true,
  show_on_landing BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUOTAS POR CATEGORÍA
CREATE TABLE IF NOT EXISTS category_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  monthly_fee DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'DOP',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by uuid, -- ID del admin que lo modificó
  UNIQUE(category_id)
);

-- 3. CUOTAS PERSONALIZADAS POR JUGADOR (OVERRIDES)
CREATE TABLE IF NOT EXISTS player_custom_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  custom_fee DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'DOP',
  reason TEXT, -- Por qué se hizo el ajuste
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ, -- NULL = indefinido
  created_by uuid, -- ID del admin que lo hizo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 4. AGREGAR CAMPO EMAIL A INSCRIPTION_REQUESTS
ALTER TABLE inscription_requests 
ADD COLUMN IF NOT EXISTS tutor_email TEXT;

-- 5. TABLA DE INVITACIONES PARA PADRES
CREATE TABLE IF NOT EXISTS parent_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ÍNDICES PARA MEJORAR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_category_fees_category ON category_fees(category_id);
CREATE INDEX IF NOT EXISTS idx_player_custom_fees_player ON player_custom_fees(player_id, is_active);
CREATE INDEX IF NOT EXISTS idx_parent_invitations_token ON parent_invitations(token);
CREATE INDEX IF NOT EXISTS idx_parent_invitations_email ON parent_invitations(email);

-- 7. DESACTIVAR RLS EN NUEVAS TABLAS (para desarrollo)
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE category_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE player_custom_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE parent_invitations DISABLE ROW LEVEL SECURITY;

-- OPCIONAL: Si prefieres activar RLS, usa estas políticas:
/*
-- Políticas para offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated reads on offers" ON offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated writes on offers" ON offers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para category_fees
ALTER TABLE category_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated reads on category_fees" ON category_fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated writes on category_fees" ON category_fees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para player_custom_fees
ALTER TABLE player_custom_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated reads on player_custom_fees" ON player_custom_fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated writes on player_custom_fees" ON player_custom_fees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para parent_invitations
ALTER TABLE parent_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public reads for token validation" ON parent_invitations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated writes" ON parent_invitations FOR ALL TO authenticated USING (true) WITH CHECK (true);
*/

-- 8. FUNCIÓN PARA OBTENER CUOTA DE UN JUGADOR
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
