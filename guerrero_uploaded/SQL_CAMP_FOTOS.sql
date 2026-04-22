-- =====================================================
-- FOTOS DEL CAMPAMENTO - Guerrero Academy
-- =====================================================

CREATE TABLE IF NOT EXISTS camp_photo_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  album_date DATE NOT NULL,
  week_number INTEGER NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  photo_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE camp_photo_albums ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_photo_albums' AND policyname = 'cpa_select_all') THEN
    EXECUTE 'CREATE POLICY cpa_select_all ON camp_photo_albums FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_photo_albums' AND policyname = 'cpa_insert_all') THEN
    EXECUTE 'CREATE POLICY cpa_insert_all ON camp_photo_albums FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_photo_albums' AND policyname = 'cpa_update_all') THEN
    EXECUTE 'CREATE POLICY cpa_update_all ON camp_photo_albums FOR UPDATE USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_photo_albums' AND policyname = 'cpa_delete_all') THEN
    EXECUTE 'CREATE POLICY cpa_delete_all ON camp_photo_albums FOR DELETE USING (true)';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cpa_week ON camp_photo_albums(week_number);
CREATE INDEX IF NOT EXISTS idx_cpa_date ON camp_photo_albums(album_date);

SELECT 'Tabla de fotos del campamento creada!' as resultado;
