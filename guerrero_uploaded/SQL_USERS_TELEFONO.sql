-- Agregar campo telefono a users para padres del campamento
ALTER TABLE users ADD COLUMN IF NOT EXISTS telefono VARCHAR(50);

SELECT 'Columna telefono agregada a users!' as resultado;
