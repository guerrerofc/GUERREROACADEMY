-- =====================================================
-- ACTUALIZACIÓN PARA ROL OPERATIVO
-- Guerrero Academy
-- =====================================================

-- 1. Agregar campo registered_by a payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS registered_by VARCHAR(255);

-- 2. Agregar rol 'operativo' si no existe en el check constraint
-- (Si da error, ignorar - el campo rol ya acepta cualquier string)

-- 3. Crear tabla de anuncios pendientes de aprobación (si no existe)
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_payments_registered_by ON payments(registered_by);

SELECT 'Actualización para rol Operativo completada!' as resultado;
