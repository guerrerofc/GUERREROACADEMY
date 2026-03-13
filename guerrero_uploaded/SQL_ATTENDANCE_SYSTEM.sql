-- ===============================================
-- SQL COMPLETO PARA SISTEMA DE ASISTENCIA
-- Ejecuta en Supabase SQL Editor
-- ===============================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla de sesiones de entrenamiento
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_sessions_category ON public.sessions(category_id);
CREATE INDEX IF NOT EXISTS idx_sessions_fecha ON public.sessions(fecha DESC);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  estado TEXT NOT NULL CHECK (estado IN ('present','absent','late')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS ux_attendance_session_player
  ON public.attendance(session_id, player_id);

-- Índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_player ON public.attendance(player_id);
CREATE INDEX IF NOT EXISTS idx_attendance_estado ON public.attendance(estado);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_attendance_updated_at ON public.attendance;
CREATE TRIGGER trigger_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_updated_at();

-- Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Políticas para sessions
DROP POLICY IF EXISTS "sessions_select_authenticated" ON public.sessions;
CREATE POLICY "sessions_select_authenticated"
  ON public.sessions FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "sessions_insert_authenticated" ON public.sessions;
CREATE POLICY "sessions_insert_authenticated"
  ON public.sessions FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "sessions_update_authenticated" ON public.sessions;
CREATE POLICY "sessions_update_authenticated"
  ON public.sessions FOR UPDATE 
  TO authenticated 
  USING (true);

-- Políticas para attendance
DROP POLICY IF EXISTS "attendance_select_authenticated" ON public.attendance;
CREATE POLICY "attendance_select_authenticated"
  ON public.attendance FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "attendance_insert_authenticated" ON public.attendance;
CREATE POLICY "attendance_insert_authenticated"
  ON public.attendance FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "attendance_update_authenticated" ON public.attendance;
CREATE POLICY "attendance_update_authenticated"
  ON public.attendance FOR UPDATE 
  TO authenticated 
  USING (true);

-- ===============================================
-- VERIFICACIÓN
-- ===============================================
-- Ejecuta esto después para confirmar:
/*
SELECT 'Tabla sessions' as check_name,
       EXISTS(SELECT 1 FROM information_schema.tables 
              WHERE table_name='sessions') as exists;

SELECT 'Tabla attendance' as check_name,
       EXISTS(SELECT 1 FROM information_schema.tables 
              WHERE table_name='attendance') as exists;
*/

-- FIN DEL SCRIPT
