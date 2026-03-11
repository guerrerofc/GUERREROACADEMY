-- Schema para integración de pagos de Stripe
-- Guerrero Academy

-- Tabla para transacciones de pago
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  player_id UUID REFERENCES players(id),
  parent_id UUID,
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

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_session_id ON payment_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_player_id ON payment_transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_parent_id ON payment_transactions(parent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(payment_status);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Política para padres: solo ver sus propios pagos
CREATE POLICY "Padres pueden ver sus propios pagos"
  ON payment_transactions
  FOR SELECT
  USING (auth.uid() = parent_id);

-- Política para admins: ver todo
CREATE POLICY "Admins pueden ver todos los pagos"
  ON payment_transactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Nota: Ejecuta este script en tu Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Pega este código → Run
