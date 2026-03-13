-- ========================================
-- FIX: Permitir eliminar jugadores
-- Ejecuta esto en Supabase SQL Editor
-- ========================================

-- OPCIÓN 1: Desactivar RLS en tabla players (recomendado para desarrollo)
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Si prefieres mantener RLS activado, crea políticas permisivas
-- (Descomenta las siguientes líneas si quieres usar RLS)

/*
-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "Allow authenticated users to delete players" ON players;

-- Crear política para permitir DELETE a usuarios autenticados
CREATE POLICY "Allow authenticated users to delete players"
ON players FOR DELETE
TO authenticated
USING (true);
*/

-- También verificar que player_categories tenga CASCADE correcto
-- (Esto ya debería estar, pero lo verificamos)
DO $$ 
BEGIN
    -- Verificar si la constraint existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%player_categories_player_id_fkey%'
    ) THEN
        -- Eliminar constraint antigua
        ALTER TABLE player_categories 
        DROP CONSTRAINT IF EXISTS player_categories_player_id_fkey;
        
        -- Recrear con ON DELETE CASCADE
        ALTER TABLE player_categories
        ADD CONSTRAINT player_categories_player_id_fkey
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Constraint actualizada con CASCADE';
    END IF;
END $$;

-- Verificar attendance_records también tenga CASCADE
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'attendance_records'
    ) THEN
        -- Eliminar constraint antigua si existe
        ALTER TABLE attendance_records 
        DROP CONSTRAINT IF EXISTS attendance_records_player_id_fkey;
        
        -- Recrear con ON DELETE CASCADE
        ALTER TABLE attendance_records
        ADD CONSTRAINT attendance_records_player_id_fkey
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Constraint de attendance_records actualizada';
    END IF;
END $$;

-- Verificar tabla attendance también
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'attendance'
    ) THEN
        ALTER TABLE attendance 
        DROP CONSTRAINT IF EXISTS attendance_player_id_fkey;
        
        ALTER TABLE attendance
        ADD CONSTRAINT attendance_player_id_fkey
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Constraint de attendance actualizada';
    END IF;
END $$;

-- Verificar parent_invitations
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'parent_invitations'
    ) THEN
        ALTER TABLE parent_invitations 
        DROP CONSTRAINT IF EXISTS parent_invitations_player_id_fkey;
        
        ALTER TABLE parent_invitations
        ADD CONSTRAINT parent_invitations_player_id_fkey
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Constraint de parent_invitations actualizada';
    END IF;
END $$;

-- ========================================
-- VERIFICACIÓN
-- ========================================
SELECT 
  'RLS Status en players' as check_name,
  CASE 
    WHEN relrowsecurity = true THEN '⚠️ ACTIVADO (puede bloquear DELETE)'
    ELSE '✅ DESACTIVADO'
  END as status
FROM pg_class
WHERE relname = 'players';

-- Verificar constraints CASCADE
SELECT
  tc.table_name,
  tc.constraint_name,
  rc.delete_rule,
  CASE 
    WHEN rc.delete_rule = 'CASCADE' THEN '✅'
    ELSE '⚠️ NO CASCADE'
  END as status
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND rc.unique_constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'players'
  )
ORDER BY tc.table_name;
