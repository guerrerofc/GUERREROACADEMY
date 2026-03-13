-- ========================================
-- FIX: Asegurar que parent_invitations existe
-- Ejecuta esto en Supabase SQL Editor
-- ========================================

-- Crear tabla si no existe
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

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_parent_invitations_token ON parent_invitations(token);
CREATE INDEX IF NOT EXISTS idx_parent_invitations_email ON parent_invitations(email);

-- Desactivar RLS (para desarrollo)
ALTER TABLE parent_invitations DISABLE ROW LEVEL SECURITY;

-- ========================================
-- VERIFICACIÓN
-- ========================================
SELECT 
  'parent_invitations' as tabla,
  COUNT(*) as invitaciones_existentes,
  EXISTS(
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name='parent_invitations'
  ) as tabla_existe
FROM parent_invitations;
