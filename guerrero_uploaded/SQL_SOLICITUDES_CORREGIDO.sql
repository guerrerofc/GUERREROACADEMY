-- =====================================================
-- SQL PARA SISTEMA DE SOLICITUDES - VERSION CORREGIDA
-- =====================================================
-- Ejecuta este script en: Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tabla para solicitudes de inscripción
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
  category_id UUID,
  category_name TEXT,
  
  -- Estado de la solicitud
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Notas del admin
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_inscription_requests_status 
  ON public.inscription_requests(status);

CREATE INDEX IF NOT EXISTS idx_inscription_requests_category 
  ON public.inscription_requests(category_id);

CREATE INDEX IF NOT EXISTS idx_inscription_requests_created 
  ON public.inscription_requests(created_at DESC);

-- 4. Trigger para updated_at
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

-- 5. Habilitar RLS
ALTER TABLE public.inscription_requests ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS SIMPLIFICADAS (sin depender de tabla profiles)

-- Cualquiera puede crear solicitudes (formulario público)
DROP POLICY IF EXISTS "Anyone can create inscription requests" 
  ON public.inscription_requests;
  
CREATE POLICY "Anyone can create inscription requests"
  ON public.inscription_requests
  FOR INSERT
  WITH CHECK (true);

-- Usuarios autenticados pueden ver todas las solicitudes
DROP POLICY IF EXISTS "Authenticated users can view all requests" 
  ON public.inscription_requests;
  
CREATE POLICY "Authenticated users can view all requests"
  ON public.inscription_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Usuarios autenticados pueden actualizar solicitudes
DROP POLICY IF EXISTS "Authenticated users can update requests" 
  ON public.inscription_requests;
  
CREATE POLICY "Authenticated users can update requests"
  ON public.inscription_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role puede hacer todo
DROP POLICY IF EXISTS "Service role full access" 
  ON public.inscription_requests;
  
CREATE POLICY "Service role full access"
  ON public.inscription_requests
  FOR ALL
  USING (true);

-- 7. Verificación
SELECT 'inscription_requests table created' as status, COUNT(*) as count 
FROM public.inscription_requests;

-- =====================================================
-- ✅ SQL COMPLETADO Y CORREGIDO
-- =====================================================
-- Ahora el sistema de solicitudes funcionará correctamente
-- =====================================================
