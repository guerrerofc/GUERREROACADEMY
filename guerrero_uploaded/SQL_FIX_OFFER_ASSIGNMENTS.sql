-- ========================================
-- FIX: Crear/Arreglar tabla offer_assignments
-- ========================================

-- PASO 1: Eliminar tabla si existe (para recrearla correctamente)
DROP TABLE IF EXISTS public.offer_assignments CASCADE;

-- PASO 2: Crear tabla desde cero
CREATE TABLE public.offer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL,
  player_id uuid NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(offer_id, player_id)
);

-- PASO 3: Desactivar RLS
ALTER TABLE public.offer_assignments DISABLE ROW LEVEL SECURITY;

-- PASO 4: Crear índices
CREATE INDEX IF NOT EXISTS idx_offer_assignments_offer ON offer_assignments(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_assignments_player ON offer_assignments(player_id);
CREATE INDEX IF NOT EXISTS idx_offer_assignments_active ON offer_assignments(is_active);

-- PASO 5: Agregar foreign keys (después de crear la tabla)
-- Solo si las tablas offers y players existen
DO $$
BEGIN
  -- Agregar FK a offers si la tabla existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offers') THEN
    ALTER TABLE offer_assignments
      ADD CONSTRAINT fk_offer_assignments_offer
      FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE;
  END IF;

  -- Agregar FK a players si la tabla existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'players') THEN
    ALTER TABLE offer_assignments
      ADD CONSTRAINT fk_offer_assignments_player
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
  END IF;
END $$;

-- PASO 6: Verificar que la tabla offers existe, si no crearla
CREATE TABLE IF NOT EXISTS public.offers (
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

-- PASO 7: Verificación
SELECT 
  'offer_assignments' as tabla,
  COUNT(*) as asignaciones_existentes,
  EXISTS(
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name='offer_assignments'
  ) as tabla_existe
FROM offer_assignments;

-- PASO 8: Ver estructura de la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'offer_assignments'
ORDER BY ordinal_position;
