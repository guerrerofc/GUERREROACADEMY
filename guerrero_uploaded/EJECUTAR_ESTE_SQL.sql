-- =====================================================
-- SQL PARA INTEGRACIÓN DE STRIPE - GUERRERO ACADEMY
-- =====================================================
-- Ejecuta este script completo en: 
-- Supabase Dashboard → SQL Editor → New Query → Pega todo y haz clic en RUN
-- =====================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tabla para transacciones de Stripe
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  player_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'DOP',
  month TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'initiated',
  metadata JSONB,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_session_id 
  ON public.payment_transactions(session_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_player_id 
  ON public.payment_transactions(player_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_parent_id 
  ON public.payment_transactions(parent_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
  ON public.payment_transactions(payment_status);

-- 4. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar Row Level Security
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para payment_transactions

-- Padres pueden ver sus propias transacciones
DROP POLICY IF EXISTS "Padres pueden ver sus transacciones" ON public.payment_transactions;
CREATE POLICY "Padres pueden ver sus transacciones"
  ON public.payment_transactions
  FOR SELECT
  USING (auth.uid() = parent_id);

-- Padres pueden crear transacciones
DROP POLICY IF EXISTS "Padres pueden crear transacciones" ON public.payment_transactions;
CREATE POLICY "Padres pueden crear transacciones"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- Service role puede hacer todo (para webhooks de Stripe)
DROP POLICY IF EXISTS "Service role full access" ON public.payment_transactions;
CREATE POLICY "Service role full access"
  ON public.payment_transactions
  FOR ALL
  USING (true);

-- 7. Verificar que la tabla payments existe y tiene las columnas correctas
-- Esta tabla debe existir de tu proyecto anterior
-- Si no existe o hay error, verifica primero qué tablas tienes
-- y ajusta las referencias según tu esquema existente

-- 8. SOLO ejecuta esto si la tabla payments NO existe en tu base de datos
-- Si ya existe, salta al paso 9

-- CREATE TABLE IF NOT EXISTS public.payments (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   player_id UUID NOT NULL,
--   category_id UUID NULL,
--   amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
--   currency TEXT NOT NULL DEFAULT 'DOP',
--   method TEXT NOT NULL CHECK (method IN ('cash','transfer','card')),
--   month TEXT NOT NULL,
--   paid_at DATE NOT NULL,
--   status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','pending','refunded')),
--   note TEXT NULL,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX IF NOT EXISTS idx_payments_player_month 
--   ON public.payments(player_id, month);

-- 9. Verificación: Consulta para ver si todo está OK
SELECT 'payment_transactions creada' as tabla, COUNT(*) as registros 
FROM public.payment_transactions
UNION ALL
SELECT 'payments existe' as tabla, COUNT(*) as registros 
FROM public.payments;

-- =====================================================
-- ✅ SQL COMPLETADO
-- =====================================================
-- Ahora puedes desplegar las Edge Functions de Supabase
-- =====================================================
