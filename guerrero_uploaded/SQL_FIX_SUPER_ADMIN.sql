-- ========================================
-- FIX: Configurar diego@gmail.com como Super Admin
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

-- PASO 3: Insertar/actualizar diego@gmail.com como super_admin
INSERT INTO public.users (email, nombre, rol)
VALUES ('diego@gmail.com', 'Diego', 'super_admin')
ON CONFLICT (email) 
DO UPDATE SET 
  rol = 'super_admin',
  updated_at = now();

-- PASO 4: Verificar que se creó correctamente
SELECT 
  email, 
  nombre, 
  rol,
  CASE 
    WHEN rol = 'super_admin' THEN '✅ Super Admin'
    WHEN rol = 'director' THEN '⚡ Director'
    WHEN rol = 'staff' THEN '👤 Staff'
    WHEN rol = 'parent' THEN '👨‍👩‍👧 Padre'
    ELSE '❓ ' || rol
  END as estado
FROM public.users
WHERE email = 'diego@gmail.com';

-- PASO 5: Ver todos los usuarios (opcional)
SELECT 
  email,
  nombre,
  rol,
  created_at
FROM public.users
ORDER BY 
  CASE rol
    WHEN 'super_admin' THEN 1
    WHEN 'director' THEN 2
    WHEN 'staff' THEN 3
    WHEN 'parent' THEN 4
    ELSE 5
  END,
  email;

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
-- El rol DEBE ser exactamente 'super_admin' (sin espacios, todo minúsculas)
-- Si ya tenías usuarios con rol diferente, este SQL lo actualiza
-- Después de ejecutar, refresca tu app (Ctrl + Shift + R) y vuelve a hacer login
