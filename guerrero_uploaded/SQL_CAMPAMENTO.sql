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

SELECT 'Tabla de campamento creada!' as resultado;
