-- =====================================================
-- FOTOS DE JUGADORES Y ACTAS DE NACIMIENTO
-- Guerrero Academy
-- =====================================================

-- 1. Tabla de fotos de jugadores (una por año, sin borrar anteriores)
CREATE TABLE IF NOT EXISTS player_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  photo_data TEXT NOT NULL,
  year INTEGER NOT NULL,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, year)
);

-- 2. Tabla de actas de nacimiento
CREATE TABLE IF NOT EXISTS player_birth_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  file_data TEXT NOT NULL,
  file_name VARCHAR(255),
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agregar campo foto_url a players para acceso rapido
ALTER TABLE players ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 4. Indices
CREATE INDEX IF NOT EXISTS idx_player_photos_player ON player_photos(player_id);
CREATE INDEX IF NOT EXISTS idx_player_photos_year ON player_photos(year);
CREATE INDEX IF NOT EXISTS idx_birth_certs_player ON player_birth_certificates(player_id);

-- 5. Deshabilitar RLS para acceso completo via anon key (como el resto de tablas)
ALTER TABLE player_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_birth_certificates ENABLE ROW LEVEL SECURITY;

-- 6. Politicas de acceso abierto (mismo patron que las otras tablas)
DO $$
BEGIN
  -- player_photos policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_photos' AND policyname = 'photos_select_all') THEN
    EXECUTE 'CREATE POLICY photos_select_all ON player_photos FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_photos' AND policyname = 'photos_insert_all') THEN
    EXECUTE 'CREATE POLICY photos_insert_all ON player_photos FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_photos' AND policyname = 'photos_update_all') THEN
    EXECUTE 'CREATE POLICY photos_update_all ON player_photos FOR UPDATE USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_photos' AND policyname = 'photos_delete_all') THEN
    EXECUTE 'CREATE POLICY photos_delete_all ON player_photos FOR DELETE USING (true)';
  END IF;

  -- player_birth_certificates policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_birth_certificates' AND policyname = 'certs_select_all') THEN
    EXECUTE 'CREATE POLICY certs_select_all ON player_birth_certificates FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_birth_certificates' AND policyname = 'certs_insert_all') THEN
    EXECUTE 'CREATE POLICY certs_insert_all ON player_birth_certificates FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_birth_certificates' AND policyname = 'certs_delete_all') THEN
    EXECUTE 'CREATE POLICY certs_delete_all ON player_birth_certificates FOR DELETE USING (true)';
  END IF;
END $$;

SELECT 'Tablas de fotos y actas creadas correctamente!' as resultado;
