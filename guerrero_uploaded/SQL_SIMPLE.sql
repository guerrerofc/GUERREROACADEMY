-- =====================================================
-- SQL SUPER SIMPLIFICADO - SIN POLICIES COMPLICADAS
-- =====================================================

-- 1. Crear tabla (sin RLS por ahora)
CREATE TABLE IF NOT EXISTS public.inscription_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_nombre TEXT NOT NULL,
  tutor_whatsapp TEXT NOT NULL,
  tutor_email TEXT,
  jugador_nombre TEXT NOT NULL,
  jugador_edad INTEGER NOT NULL,
  jugador_fecha_nacimiento DATE,
  category_id UUID,
  category_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_inscription_requests_status 
  ON public.inscription_requests(status);

CREATE INDEX IF NOT EXISTS idx_inscription_requests_created 
  ON public.inscription_requests(created_at DESC);

-- 3. Deshabilitar RLS (temporalmente para que funcione)
ALTER TABLE public.inscription_requests DISABLE ROW LEVEL SECURITY;

-- 4. Verificación
SELECT 'Tabla creada exitosamente' as mensaje, COUNT(*) as registros 
FROM public.inscription_requests;
