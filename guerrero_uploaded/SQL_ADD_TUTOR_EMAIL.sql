-- ===============================================
-- AGREGAR COLUMNA tutor_email A TABLA players
-- Ejecuta en Supabase SQL Editor
-- ===============================================

-- Agregar columna tutor_email si no existe
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS tutor_email TEXT;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_players_tutor_email 
ON public.players(tutor_email);

-- Comentario
COMMENT ON COLUMN public.players.tutor_email IS 'Email del padre/tutor - vincula al jugador con su cuenta de padre';

-- ===============================================
-- VERIFICACIÓN
-- ===============================================
SELECT 'Columna tutor_email agregada' as status,
       EXISTS(
         SELECT 1 
         FROM information_schema.columns 
         WHERE table_name='players' AND column_name='tutor_email'
       ) as exists;
