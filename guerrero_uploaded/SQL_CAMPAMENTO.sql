-- =====================================================
-- CAMPAMENTO DE VERANO - Guerrero Academy
-- =====================================================

-- 1. Tabla de inscripciones del campamento
CREATE TABLE IF NOT EXISTS camp_inscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_nombre VARCHAR(255) NOT NULL,
  tutor_email VARCHAR(255),
  tutor_whatsapp VARCHAR(50),
  jugador_nombre VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE,
  talla_tshirt VARCHAR(10),
  semanas INTEGER[] NOT NULL,
  total_semanas INTEGER NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE camp_inscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_inscriptions' AND policyname = 'camp_select_all') THEN
    EXECUTE 'CREATE POLICY camp_select_all ON camp_inscriptions FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_inscriptions' AND policyname = 'camp_insert_all') THEN
    EXECUTE 'CREATE POLICY camp_insert_all ON camp_inscriptions FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_inscriptions' AND policyname = 'camp_update_all') THEN
    EXECUTE 'CREATE POLICY camp_update_all ON camp_inscriptions FOR UPDATE USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_inscriptions' AND policyname = 'camp_delete_all') THEN
    EXECUTE 'CREATE POLICY camp_delete_all ON camp_inscriptions FOR DELETE USING (true)';
  END IF;
END $$;

-- 3. Indices
CREATE INDEX IF NOT EXISTS idx_camp_status ON camp_inscriptions(status);
CREATE INDEX IF NOT EXISTS idx_camp_created ON camp_inscriptions(created_at);

-- 4. Tabla de pagos del campamento
CREATE TABLE IF NOT EXISTS camp_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscription_id UUID REFERENCES camp_inscriptions(id) ON DELETE SET NULL,
  jugador_nombre VARCHAR(255),
  tutor_nombre VARCHAR(255),
  tutor_email VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(50),
  method VARCHAR(50),
  note TEXT,
  registered_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE camp_payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_payments' AND policyname = 'cpay_select_all') THEN
    EXECUTE 'CREATE POLICY cpay_select_all ON camp_payments FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_payments' AND policyname = 'cpay_insert_all') THEN
    EXECUTE 'CREATE POLICY cpay_insert_all ON camp_payments FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_payments' AND policyname = 'cpay_delete_all') THEN
    EXECUTE 'CREATE POLICY cpay_delete_all ON camp_payments FOR DELETE USING (true)';
  END IF;
END $$;

-- 5. Tabla de configuración del sitio
CREATE TABLE IF NOT EXISTS site_config (
  id VARCHAR(50) PRIMARY KEY,
  config JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'cfg_select_all') THEN
    EXECUTE 'CREATE POLICY cfg_select_all ON site_config FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'cfg_insert_all') THEN
    EXECUTE 'CREATE POLICY cfg_insert_all ON site_config FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'cfg_update_all') THEN
    EXECUTE 'CREATE POLICY cfg_update_all ON site_config FOR UPDATE USING (true)';
  END IF;
END $$;

SELECT 'Tablas de campamento, pagos y config creadas!' as resultado;
