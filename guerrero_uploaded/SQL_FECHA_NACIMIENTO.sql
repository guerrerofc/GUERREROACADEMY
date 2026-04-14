-- Agregar fecha de nacimiento a jugadores
ALTER TABLE players ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

SELECT 'Columna fecha_nacimiento agregada!' as resultado;
