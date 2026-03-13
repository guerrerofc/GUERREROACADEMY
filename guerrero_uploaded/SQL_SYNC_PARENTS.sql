-- ========================================
-- FIX: Sincronizar padres de Auth a tabla users
-- ========================================

-- PASO 1: Crear tabla users si no existe
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nombre text,
  rol text NOT NULL DEFAULT 'parent',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PASO 2: Desactivar RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- PASO 3: Insertar padres que están en Auth pero no en users
-- Primero, necesitamos ver qué emails de padres tenemos en invitaciones
INSERT INTO public.users (email, nombre, rol, created_at)
SELECT DISTINCT
  pi.email,
  p.tutor_nombre,
  'parent',
  pi.created_at
FROM parent_invitations pi
LEFT JOIN players p ON p.id = pi.player_id
WHERE pi.used = true
  AND pi.email NOT IN (SELECT email FROM public.users)
ON CONFLICT (email) DO NOTHING;

-- PASO 4: Verificar padres creados
SELECT 
  email,
  nombre,
  rol,
  CASE 
    WHEN rol = 'parent' THEN '👨‍👩‍👧 Padre'
    ELSE rol
  END as tipo,
  created_at
FROM public.users
WHERE rol = 'parent'
ORDER BY created_at DESC;

-- PASO 5: Ver cuántos padres hay
SELECT 
  COUNT(*) as total_padres,
  COUNT(DISTINCT email) as emails_unicos
FROM public.users
WHERE rol = 'parent';

-- ========================================
-- VERIFICACIÓN: Ver invitaciones usadas vs usuarios
-- ========================================
SELECT 
  'Invitaciones usadas' as tipo,
  COUNT(*) as cantidad
FROM parent_invitations
WHERE used = true

UNION ALL

SELECT 
  'Padres en tabla users' as tipo,
  COUNT(*) as cantidad
FROM users
WHERE rol = 'parent';
