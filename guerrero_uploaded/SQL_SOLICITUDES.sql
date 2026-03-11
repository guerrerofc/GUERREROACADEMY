-- =====================================================
-- SQL PARA SISTEMA DE SOLICITUDES DE INSCRIPCIÓN
-- =====================================================
-- Ejecuta este script en: Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Tabla para solicitudes de inscripción
CREATE TABLE IF NOT EXISTS public.inscription_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del tutor
  tutor_nombre TEXT NOT NULL,
  tutor_whatsapp TEXT NOT NULL,
  tutor_email TEXT,
  
  -- Datos del jugador
  jugador_nombre TEXT NOT NULL,
  jugador_edad INTEGER NOT NULL,
  jugador_fecha_nacimiento DATE,
  
  -- Categoría solicitada
  category_id UUID REFERENCES categories(id),
  category_name TEXT,
  
  -- Estado de la solicitud
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Notas del admin
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_inscription_requests_status 
  ON public.inscription_requests(status);

CREATE INDEX IF NOT EXISTS idx_inscription_requests_category 
  ON public.inscription_requests(category_id);

CREATE INDEX IF NOT EXISTS idx_inscription_requests_created 
  ON public.inscription_requests(created_at DESC);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_inscription_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inscription_requests_updated_at_trigger 
  ON public.inscription_requests;

CREATE TRIGGER update_inscription_requests_updated_at_trigger
  BEFORE UPDATE ON public.inscription_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_inscription_requests_updated_at();

-- 4. Habilitar RLS
ALTER TABLE public.inscription_requests ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS

-- Cualquiera puede crear solicitudes (formulario público)
DROP POLICY IF EXISTS "Anyone can create inscription requests" 
  ON public.inscription_requests;
  
CREATE POLICY "Anyone can create inscription requests"
  ON public.inscription_requests
  FOR INSERT
  WITH CHECK (true);

-- Solo admins pueden ver todas las solicitudes
DROP POLICY IF EXISTS "Admins can view all requests" 
  ON public.inscription_requests;
  
CREATE POLICY "Admins can view all requests"
  ON public.inscription_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Solo admins pueden actualizar solicitudes
DROP POLICY IF EXISTS "Admins can update requests" 
  ON public.inscription_requests;
  
CREATE POLICY "Admins can update requests"
  ON public.inscription_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. Verificación
SELECT 'inscription_requests table created' as status, COUNT(*) as count 
FROM public.inscription_requests;

-- =====================================================
-- ✅ SQL COMPLETADO
-- =====================================================
-- Ahora actualiza el landing y el super-admin
-- =====================================================
