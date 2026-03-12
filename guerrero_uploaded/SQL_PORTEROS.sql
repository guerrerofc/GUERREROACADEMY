-- ===============================================
-- AGREGAR SOPORTE PARA PORTEROS
-- Guerrero Academy - Sistema de Categorías de Porteros
-- ===============================================

-- 1. Agregar columna es_portero a la tabla inscription_requests
ALTER TABLE inscription_requests 
ADD COLUMN IF NOT EXISTS es_portero BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna es_portero a la tabla players
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS es_portero BOOLEAN DEFAULT FALSE;

-- 3. Crear categoría especial de Porteros (si no existe)
INSERT INTO categories (name, age_min, age_max, description, color, status)
VALUES ('Porteros', 8, 17, 'Entrenamiento especializado para porteros de todas las edades', '#FFD700', 'active')
ON CONFLICT (name) DO NOTHING;

-- 4. Comentario informativo
COMMENT ON COLUMN inscription_requests.es_portero IS 'Indica si el jugador se inscribe como portero para recibir entrenamiento especializado';
COMMENT ON COLUMN players.es_portero IS 'Indica si el jugador es portero y recibe entrenamiento especializado además de su categoría por edad';

-- ===============================================
-- NOTAS DE IMPLEMENTACIÓN:
-- ===============================================
-- Los porteros estarán en DOS categorías:
-- 1. Su categoría por edad (8-10, 11-13, 14-17)
-- 2. La categoría especial "Porteros" para entrenamientos específicos
--
-- Al aprobar una solicitud con es_portero=true, el admin debe:
-- - Asignar al jugador su categoría por edad
-- - Asignar también a la categoría "Porteros"
-- ===============================================
