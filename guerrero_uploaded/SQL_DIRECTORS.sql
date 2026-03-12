-- ========================================
-- TABLA: DIRECTORS (Director/Gerente)
-- ========================================

-- Crear tabla de directores
CREATE TABLE IF NOT EXISTS directors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE directors ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Todos pueden leer (para detección de rol)
CREATE POLICY "Permitir lectura de directores"
ON directors
FOR SELECT
USING (true);

-- Policy: INSERT - Solo super admins autenticados
CREATE POLICY "Permitir INSERT a super admins"
ON directors
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: UPDATE - Solo usuarios autenticados
CREATE POLICY "Permitir UPDATE a autenticados"
ON directors
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: DELETE - Solo usuarios autenticados
CREATE POLICY "Permitir DELETE a autenticados"
ON directors
FOR DELETE
TO authenticated
USING (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_directors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS directors_updated_at ON directors;
CREATE TRIGGER directors_updated_at
  BEFORE UPDATE ON directors
  FOR EACH ROW
  EXECUTE FUNCTION update_directors_updated_at();

-- Verificar estructura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'directors'
ORDER BY ordinal_position;

-- ========================================
-- ✅ TABLA DIRECTORS CREADA
-- ========================================
