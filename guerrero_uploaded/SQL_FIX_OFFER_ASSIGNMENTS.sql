-- ========================================
-- FIX: Crear tabla offer_assignments
-- ========================================

-- PASO 1: Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.offer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(offer_id, player_id)
);

-- PASO 2: Desactivar RLS
ALTER TABLE public.offer_assignments DISABLE ROW LEVEL SECURITY;

-- PASO 3: Crear índices
CREATE INDEX IF NOT EXISTS idx_offer_assignments_offer ON offer_assignments(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_assignments_player ON offer_assignments(player_id);
CREATE INDEX IF NOT EXISTS idx_offer_assignments_active ON offer_assignments(is_active);

-- PASO 4: Verificar que la tabla offers existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    RAISE NOTICE 'Creando tabla offers...';
    
    CREATE TABLE public.offers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text,
      offer_type text NOT NULL CHECK (offer_type IN ('percentage', 'fixed', 'free_month')),
      value numeric NOT NULL,
      start_date timestamptz DEFAULT now(),
      end_date timestamptz,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- PASO 5: Verificación
SELECT 
  'offer_assignments' as tabla,
  COUNT(*) as asignaciones_existentes,
  EXISTS(
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name='offer_assignments'
  ) as tabla_existe
FROM offer_assignments;

-- PASO 6: Ver estructura de la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'offer_assignments'
ORDER BY ordinal_position;

-- PASO 7: Ver constraints
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'offer_assignments'
ORDER BY tc.constraint_type, tc.constraint_name;
