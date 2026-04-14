-- =====================================================
-- ACTUALIZACIÓN PARA ROL OPERATIVO
-- Guerrero Academy
-- =====================================================

-- 1. Agregar campo registered_by a payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS registered_by VARCHAR(255);

-- 2. Crear tabla de anuncios (si no existe)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status VARCHAR(20) DEFAULT 'approved',
  created_by VARCHAR(255),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agregar columnas extra a announcements si ya existía
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 4. Eliminar tabla attendance si existe con esquema incorrecto y recrearla
DROP TABLE IF EXISTS attendance;

CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  present BOOLEAN DEFAULT true,
  registered_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, fecha)
);

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_payments_registered_by ON payments(registered_by);
CREATE INDEX IF NOT EXISTS idx_attendance_fecha ON attendance(fecha);
CREATE INDEX IF NOT EXISTS idx_attendance_player ON attendance(player_id);

SELECT 'Actualización para rol Operativo completada!' as resultado;
