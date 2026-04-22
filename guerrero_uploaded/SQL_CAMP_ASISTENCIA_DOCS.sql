-- =====================================================
-- ASISTENCIA Y DOCUMENTOS DEL CAMPAMENTO
-- Guerrero Academy
-- =====================================================

-- 1. Asistencia del campamento
CREATE TABLE IF NOT EXISTS camp_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscription_id UUID REFERENCES camp_inscriptions(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  week_number INTEGER NOT NULL,
  present BOOLEAN DEFAULT true,
  registered_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE camp_attendance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_attendance' AND policyname = 'catt_select') THEN
    EXECUTE 'CREATE POLICY catt_select ON camp_attendance FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_attendance' AND policyname = 'catt_insert') THEN
    EXECUTE 'CREATE POLICY catt_insert ON camp_attendance FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_attendance' AND policyname = 'catt_delete') THEN
    EXECUTE 'CREATE POLICY catt_delete ON camp_attendance FOR DELETE USING (true)';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_catt_date ON camp_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_catt_week ON camp_attendance(week_number);

-- 2. Documentos del campamento
CREATE TABLE IF NOT EXISTS camp_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscription_id UUID REFERENCES camp_inscriptions(id) ON DELETE CASCADE,
  player_name VARCHAR(255),
  doc_type VARCHAR(50) NOT NULL,
  file_data TEXT NOT NULL,
  file_name VARCHAR(255),
  note TEXT,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE camp_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_documents' AND policyname = 'cdoc_select') THEN
    EXECUTE 'CREATE POLICY cdoc_select ON camp_documents FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_documents' AND policyname = 'cdoc_insert') THEN
    EXECUTE 'CREATE POLICY cdoc_insert ON camp_documents FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camp_documents' AND policyname = 'cdoc_delete') THEN
    EXECUTE 'CREATE POLICY cdoc_delete ON camp_documents FOR DELETE USING (true)';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cdoc_insc ON camp_documents(inscription_id);
CREATE INDEX IF NOT EXISTS idx_cdoc_type ON camp_documents(doc_type);

SELECT 'Tablas de asistencia y documentos creadas!' as resultado;
