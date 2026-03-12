-- ========================================
-- FASE 4 & 5: OFERTAS ASIGNABLES + CUPONES (VERSIÓN SEGURA)
-- Guerrero Academy
-- ========================================

-- NOTA: Este SQL puede ejecutarse múltiples veces sin errores

-- 1. TABLA PARA ASIGNAR OFERTAS A JUGADORES
CREATE TABLE IF NOT EXISTS offer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by uuid,
  UNIQUE(offer_id, player_id)
);

-- 2. TABLA DE CUPONES/CÓDIGOS DE DESCUENTO
CREATE TABLE IF NOT EXISTS discount_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by uuid
);

-- 3. REGISTRO DE USO DE CUPONES
CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES discount_coupons(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id),
  parent_id uuid,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÍNDICES (con IF NOT EXISTS para evitar errores)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_offer_assignments_offer') THEN
    CREATE INDEX idx_offer_assignments_offer ON offer_assignments(offer_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_offer_assignments_player') THEN
    CREATE INDEX idx_offer_assignments_player ON offer_assignments(player_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_discount_coupons_code') THEN
    CREATE INDEX idx_discount_coupons_code ON discount_coupons(code);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_discount_coupons_active') THEN
    CREATE INDEX idx_discount_coupons_active ON discount_coupons(is_active, expires_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_coupon_usage_coupon') THEN
    CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
  END IF;
END $$;

-- 5. DESACTIVAR RLS
ALTER TABLE offer_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE discount_coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage DISABLE ROW LEVEL SECURITY;

-- 6. FUNCIÓN PARA VALIDAR CUPÓN
CREATE OR REPLACE FUNCTION validate_coupon(coupon_code TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  coupon_id uuid,
  discount_type TEXT,
  discount_value DECIMAL,
  message TEXT
) AS $$
DECLARE
  coupon RECORD;
BEGIN
  -- Buscar cupón
  SELECT * INTO coupon
  FROM discount_coupons
  WHERE code = UPPER(coupon_code)
  LIMIT 1;

  -- Si no existe
  IF coupon IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::TEXT, NULL::DECIMAL, 'Cupón no válido';
    RETURN;
  END IF;

  -- Si no está activo
  IF NOT coupon.is_active THEN
    RETURN QUERY SELECT false, coupon.id, NULL::TEXT, NULL::DECIMAL, 'Cupón desactivado';
    RETURN;
  END IF;

  -- Si expiró
  IF coupon.expires_at IS NOT NULL AND coupon.expires_at < NOW() THEN
    RETURN QUERY SELECT false, coupon.id, NULL::TEXT, NULL::DECIMAL, 'Cupón expirado';
    RETURN;
  END IF;

  -- Si alcanzó el límite de uso
  IF coupon.usage_limit IS NOT NULL AND coupon.used_count >= coupon.usage_limit THEN
    RETURN QUERY SELECT false, coupon.id, NULL::TEXT, NULL::DECIMAL, 'Cupón agotado';
    RETURN;
  END IF;

  -- Cupón válido
  RETURN QUERY SELECT 
    true, 
    coupon.id, 
    coupon.discount_type, 
    coupon.discount_value, 
    'Cupón válido'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 7. FUNCIÓN PARA APLICAR CUPÓN
CREATE OR REPLACE FUNCTION apply_coupon(
  coupon_code TEXT,
  p_player_id uuid,
  p_parent_id uuid,
  original_amount DECIMAL
)
RETURNS TABLE(
  success BOOLEAN,
  final_amount DECIMAL,
  discount_amount DECIMAL,
  message TEXT
) AS $$
DECLARE
  coupon RECORD;
  discount DECIMAL;
  final DECIMAL;
BEGIN
  -- Validar cupón
  SELECT * INTO coupon
  FROM validate_coupon(coupon_code);

  IF NOT coupon.valid THEN
    RETURN QUERY SELECT false, original_amount, 0::DECIMAL, coupon.message;
    RETURN;
  END IF;

  -- Calcular descuento
  IF coupon.discount_type = 'percentage' THEN
    discount := original_amount * (coupon.discount_value / 100);
  ELSE
    discount := coupon.discount_value;
  END IF;

  -- No puede ser mayor que el monto original
  IF discount > original_amount THEN
    discount := original_amount;
  END IF;

  final := original_amount - discount;

  -- Registrar uso
  INSERT INTO coupon_usage (coupon_id, player_id, parent_id, discount_amount)
  VALUES (coupon.coupon_id, p_player_id, p_parent_id, discount);

  -- Incrementar contador
  UPDATE discount_coupons
  SET used_count = used_count + 1
  WHERE id = coupon.coupon_id;

  RETURN QUERY SELECT true, final, discount, 'Descuento aplicado correctamente'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ✅ VERIFICACIÓN
-- ========================================

SELECT 
  'offer_assignments' as tabla, 
  COUNT(*) as registros 
FROM offer_assignments
UNION ALL
SELECT 
  'discount_coupons' as tabla, 
  COUNT(*) as registros 
FROM discount_coupons
UNION ALL
SELECT 
  'coupon_usage' as tabla, 
  COUNT(*) as registros 
FROM coupon_usage;

-- Mensaje final
DO $$
BEGIN
  RAISE NOTICE '✅ SQL ejecutado correctamente';
  RAISE NOTICE '📊 Tablas creadas: offer_assignments, discount_coupons, coupon_usage';
  RAISE NOTICE '🔧 Funciones creadas: validate_coupon(), apply_coupon()';
  RAISE NOTICE '🚀 Sistema de cupones listo para usar';
END $$;
