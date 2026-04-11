-- =====================================================
-- SISTEMA DE DOCUMENTOS Y FIRMAS DIGITALES
-- Guerrero Academy
-- =====================================================

-- 1. TABLA: document_templates (Plantillas de documentos)
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reglamento', 'medico', 'imagen', 'responsabilidad', 'pago')),
    version INTEGER DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: document_signatures (Firmas de documentos)
CREATE TABLE IF NOT EXISTS document_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    parent_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    template_id UUID REFERENCES document_templates(id) ON DELETE CASCADE,
    template_version INTEGER NOT NULL,
    signer_name VARCHAR(255) NOT NULL,
    signer_role VARCHAR(100) DEFAULT 'Padre/Tutor',
    signer_id_number VARCHAR(50) NOT NULL,
    signer_email VARCHAR(255),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signature_image_url TEXT,
    accepted_checkbox BOOLEAN DEFAULT true,
    ip_address VARCHAR(45),
    user_agent TEXT,
    pdf_url TEXT,
    status VARCHAR(20) DEFAULT 'signed' CHECK (status IN ('pending', 'signed', 'expired', 'revoked')),
    
    -- Datos dinámicos del compromiso de pago
    payment_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AGREGAR CAMPOS DE ESTADO A PLAYERS
ALTER TABLE players ADD COLUMN IF NOT EXISTS regulations_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE players ADD COLUMN IF NOT EXISTS medical_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE players ADD COLUMN IF NOT EXISTS image_consent_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE players ADD COLUMN IF NOT EXISTS liability_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE players ADD COLUMN IF NOT EXISTS payment_agreement_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE players ADD COLUMN IF NOT EXISTS documents_complete BOOLEAN DEFAULT false;

-- Agregar campos de compromiso de pago
ALTER TABLE players ADD COLUMN IF NOT EXISTS agreed_monthly_fee DECIMAL(10,2);
ALTER TABLE players ADD COLUMN IF NOT EXISTS agreed_payment_day INTEGER DEFAULT 30;
ALTER TABLE players ADD COLUMN IF NOT EXISTS payment_agreement_date TIMESTAMP WITH TIME ZONE;

-- 4. INDICES
CREATE INDEX IF NOT EXISTS idx_doc_templates_type ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_doc_templates_active ON document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_player ON document_signatures(player_id);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_template ON document_signatures(template_id);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_status ON document_signatures(status);
CREATE INDEX IF NOT EXISTS idx_players_docs_complete ON players(documents_complete);

-- 5. INSERTAR DOCUMENTOS POR DEFECTO
INSERT INTO document_templates (name, type, version, title, content, is_required, is_active) VALUES

-- DOCUMENTO 1: Reglamento Interno
('reglamento_interno', 'reglamento', 1, 'Reglamento Interno de Guerrero Academy', 
'<div class="document-content">
<h2>REGLAMENTO INTERNO</h2>
<h3>GUERRERO ACADEMY</h3>

<h4>1. NORMAS GENERALES DE CONDUCTA</h4>
<p>1.1. Todos los jugadores deben mostrar respeto hacia entrenadores, compañeros, rivales y árbitros en todo momento.</p>
<p>1.2. Queda prohibido el uso de lenguaje inapropiado, violencia física o verbal dentro de las instalaciones.</p>
<p>1.3. Los jugadores deben llegar puntualmente a los entrenamientos y partidos programados.</p>
<p>1.4. El uso de teléfonos celulares está prohibido durante los entrenamientos.</p>

<h4>2. ASISTENCIA Y PUNTUALIDAD</h4>
<p>2.1. Se requiere un mínimo de 80% de asistencia mensual para mantener el estatus de jugador activo.</p>
<p>2.2. Las ausencias deben ser notificadas con anticipación al entrenador correspondiente.</p>
<p>2.3. Tres llegadas tarde equivalen a una falta de asistencia.</p>
<p>2.4. Las ausencias injustificadas repetidas pueden resultar en suspensión temporal.</p>

<h4>3. EQUIPAMIENTO Y UNIFORMES</h4>
<p>3.1. Los jugadores deben presentarse con el uniforme oficial de la academia.</p>
<p>3.2. Es obligatorio el uso de espinilleras durante entrenamientos y partidos.</p>
<p>3.3. Los tacos/botines deben ser apropiados para la superficie de juego.</p>
<p>3.4. Cada jugador es responsable de su equipo personal.</p>

<h4>4. COMPORTAMIENTO EN INSTALACIONES</h4>
<p>4.1. Mantener limpias las áreas de entrenamiento y vestidores.</p>
<p>4.2. No se permite el ingreso de alimentos a las canchas de juego.</p>
<p>4.3. Los padres/tutores deben permanecer en las áreas designadas durante los entrenamientos.</p>
<p>4.4. Queda prohibido fumar o consumir bebidas alcohólicas en las instalaciones.</p>

<h4>5. SANCIONES</h4>
<p>5.1. Primera falta: Amonestación verbal.</p>
<p>5.2. Segunda falta: Amonestación escrita a los padres/tutores.</p>
<p>5.3. Tercera falta: Suspensión temporal de 1 semana.</p>
<p>5.4. Faltas graves: Suspensión indefinida o expulsión según la gravedad.</p>

<h4>6. COMPROMISO DEPORTIVO</h4>
<p>6.1. Los jugadores representan a Guerrero Academy en todo momento.</p>
<p>6.2. Se espera el máximo esfuerzo y dedicación en cada entrenamiento.</p>
<p>6.3. La participación en torneos es obligatoria salvo causa justificada.</p>
<p>6.4. El trabajo en equipo es fundamental para el éxito colectivo.</p>

<p class="document-footer"><strong>Este reglamento entra en vigor desde la fecha de firma y permanece vigente mientras el jugador sea miembro activo de Guerrero Academy.</strong></p>
</div>', true, true),

-- DOCUMENTO 2: Autorización Médica
('autorizacion_medica', 'medico', 1, 'Autorización Médica y de Emergencia',
'<div class="document-content">
<h2>AUTORIZACIÓN MÉDICA Y DE EMERGENCIA</h2>
<h3>GUERRERO ACADEMY</h3>

<h4>DECLARACIÓN DE SALUD</h4>
<p>Por medio de la presente, declaro que mi hijo(a)/representado(a) se encuentra en condiciones de salud adecuadas para participar en actividades deportivas de fútbol, incluyendo entrenamientos intensivos y competencias.</p>

<h4>AUTORIZACIÓN DE ATENCIÓN MÉDICA</h4>
<p>Autorizo expresamente a Guerrero Academy y su personal a:</p>
<ul>
<li>Proporcionar primeros auxilios básicos en caso de lesión menor.</li>
<li>Transportar a mi hijo(a) a un centro de salud en caso de emergencia.</li>
<li>Autorizar tratamiento médico de emergencia si no es posible contactarme.</li>
<li>Administrar tratamientos básicos (hielo, vendajes, etc.) según sea necesario.</li>
</ul>

<h4>INFORMACIÓN MÉDICA RELEVANTE</h4>
<p>Me comprometo a informar a la academia sobre:</p>
<ul>
<li>Alergias conocidas (medicamentos, alimentos, picaduras)</li>
<li>Condiciones médicas preexistentes</li>
<li>Medicamentos de uso regular</li>
<li>Lesiones previas que puedan afectar la práctica deportiva</li>
<li>Cualquier cambio en el estado de salud del jugador</li>
</ul>

<h4>CONTACTOS DE EMERGENCIA</h4>
<p>Declaro que la información de contacto proporcionada en el registro está actualizada y me comprometo a notificar cualquier cambio inmediatamente.</p>

<h4>SEGURO MÉDICO</h4>
<p>Entiendo que Guerrero Academy no provee seguro médico y que soy responsable de los gastos médicos que puedan surgir como resultado de lesiones durante las actividades de la academia.</p>

<h4>EXONERACIÓN DE RESPONSABILIDAD MÉDICA</h4>
<p>Reconozco que la práctica del fútbol conlleva riesgos inherentes de lesión y acepto dichos riesgos. Exonero a Guerrero Academy de responsabilidad por lesiones que puedan ocurrir durante la práctica normal del deporte, siempre que se hayan tomado las precauciones razonables de seguridad.</p>

<p class="document-footer"><strong>Esta autorización es válida durante todo el período de inscripción del jugador en Guerrero Academy.</strong></p>
</div>', true, true),

-- DOCUMENTO 3: Uso de Imagen
('uso_imagen', 'imagen', 1, 'Autorización de Uso de Imagen',
'<div class="document-content">
<h2>AUTORIZACIÓN DE USO DE IMAGEN</h2>
<h3>GUERRERO ACADEMY</h3>

<h4>CONSENTIMIENTO PARA USO DE IMAGEN</h4>
<p>Por medio del presente documento, autorizo expresamente a Guerrero Academy a capturar, almacenar y utilizar fotografías y/o videos de mi hijo(a)/representado(a) para los siguientes fines:</p>

<h4>USOS PERMITIDOS</h4>
<ul>
<li><strong>Redes Sociales:</strong> Publicación en Instagram, Facebook, TikTok y otras plataformas oficiales de la academia.</li>
<li><strong>Sitio Web:</strong> Uso en la página web oficial de Guerrero Academy.</li>
<li><strong>Material Promocional:</strong> Folletos, banners, afiches y material impreso.</li>
<li><strong>Comunicaciones Internas:</strong> Boletines, grupos de WhatsApp y comunicados a padres.</li>
<li><strong>Prensa y Medios:</strong> Notas de prensa, entrevistas y coberturas periodísticas.</li>
<li><strong>Archivo Histórico:</strong> Documentación de actividades y eventos de la academia.</li>
</ul>

<h4>CONDICIONES DE USO</h4>
<p>1. Las imágenes serán utilizadas únicamente con fines deportivos, educativos o promocionales relacionados con Guerrero Academy.</p>
<p>2. No se utilizarán las imágenes para fines comerciales con terceros sin consentimiento adicional.</p>
<p>3. La academia se compromete a no vender, transferir o ceder las imágenes a terceros.</p>
<p>4. Se respetará la dignidad e integridad del menor en todo momento.</p>

<h4>DERECHO DE REVOCACIÓN</h4>
<p>Entiendo que puedo revocar esta autorización en cualquier momento mediante comunicación escrita a la administración de Guerrero Academy. La revocación no afectará el material ya publicado o distribuido.</p>

<h4>VIGENCIA</h4>
<p>Esta autorización permanece vigente durante el período de inscripción del jugador y hasta 2 años después de su desvinculación de la academia.</p>

<p class="document-footer"><strong>Al firmar este documento, confirmo que comprendo y acepto los términos aquí establecidos.</strong></p>
</div>', true, true),

-- DOCUMENTO 4: Descargo de Responsabilidad
('descargo_responsabilidad', 'responsabilidad', 1, 'Descargo de Responsabilidad',
'<div class="document-content">
<h2>DESCARGO DE RESPONSABILIDAD</h2>
<h3>GUERRERO ACADEMY</h3>

<h4>RECONOCIMIENTO DE RIESGOS</h4>
<p>Reconozco y acepto que la participación en actividades deportivas de fútbol conlleva riesgos inherentes que incluyen, pero no se limitan a:</p>
<ul>
<li>Lesiones musculares, óseas y articulares</li>
<li>Contusiones y golpes durante el juego</li>
<li>Esguinces, torceduras y fracturas</li>
<li>Lesiones por contacto con otros jugadores</li>
<li>Lesiones causadas por condiciones climáticas</li>
<li>Lesiones por uso de equipamiento deportivo</li>
</ul>

<h4>ASUNCIÓN DE RIESGOS</h4>
<p>Al inscribir a mi hijo(a)/representado(a) en Guerrero Academy, asumo voluntariamente todos los riesgos asociados con la práctica del fútbol, incluyendo aquellos que puedan resultar de la negligencia de otros participantes, entrenadores o de las condiciones de las instalaciones.</p>

<h4>LIBERACIÓN DE RESPONSABILIDAD</h4>
<p>Por medio del presente, libero y eximo de toda responsabilidad a:</p>
<ul>
<li>Guerrero Academy y sus propietarios</li>
<li>Directores, administradores y empleados</li>
<li>Entrenadores y asistentes técnicos</li>
<li>Voluntarios y colaboradores</li>
</ul>
<p>De cualquier reclamo, demanda o acción legal que pueda surgir como resultado de lesiones, daños o pérdidas sufridas durante la participación en actividades de la academia.</p>

<h4>EXCEPCIONES</h4>
<p>Esta liberación no aplica en casos de negligencia grave o conducta intencional que cause daño.</p>

<h4>COMPROMISO DE SUPERVISIÓN</h4>
<p>Me comprometo a:</p>
<ul>
<li>Asegurar que mi hijo(a) llegue y salga de las instalaciones de manera segura.</li>
<li>Proveer el equipamiento de seguridad necesario.</li>
<li>Informar sobre cualquier condición que pueda afectar la seguridad del jugador.</li>
<li>Recoger a mi hijo(a) puntualmente al finalizar las actividades.</li>
</ul>

<h4>INDEMNIZACIÓN</h4>
<p>Acepto indemnizar y mantener libre de responsabilidad a Guerrero Academy de cualquier reclamo de terceros relacionado con la participación de mi hijo(a) en las actividades de la academia.</p>

<p class="document-footer"><strong>He leído, entendido y acepto voluntariamente los términos de este descargo de responsabilidad.</strong></p>
</div>', true, true),

-- DOCUMENTO 5: Compromiso de Pago (Con placeholders dinámicos)
('compromiso_pago', 'pago', 1, 'Compromiso de Pago',
'<div class="document-content">
<h2>COMPROMISO DE PAGO</h2>
<h3>GUERRERO ACADEMY</h3>

<div class="payment-summary">
<h4>DATOS DEL COMPROMISO</h4>
<table class="payment-table">
<tr><td><strong>Padre/Tutor:</strong></td><td>{{TUTOR_NAME}}</td></tr>
<tr><td><strong>Jugador:</strong></td><td>{{PLAYER_NAME}}</td></tr>
<tr><td><strong>Categoría:</strong></td><td>{{CATEGORY}}</td></tr>
<tr><td><strong>Fecha de Inscripción:</strong></td><td>{{INSCRIPTION_DATE}}</td></tr>
</table>
</div>

<h4>MONTOS ACORDADOS</h4>
<div class="amounts-box">
<p><strong>Inscripción (pago único):</strong> RD$ {{INSCRIPTION_AMOUNT}}</p>
<p><strong>Mensualidad:</strong> RD$ {{MONTHLY_AMOUNT}}</p>
<p><strong>Día de pago:</strong> Día {{PAYMENT_DAY}} de cada mes</p>
</div>

<h4>DECLARACIÓN DE COMPROMISO</h4>
<p>Yo, <strong>{{TUTOR_NAME}}</strong>, identificado(a) con cédula/pasaporte número <strong>{{TUTOR_ID}}</strong>, en mi calidad de padre/madre/tutor legal del jugador <strong>{{PLAYER_NAME}}</strong>, me comprometo formalmente a:</p>

<ol>
<li><strong>Pagar puntualmente</strong> la mensualidad de <strong>RD$ {{MONTHLY_AMOUNT}}</strong> antes del día <strong>{{PAYMENT_DAY}}</strong> de cada mes.</li>
<li><strong>Mantener los pagos al día</strong> durante todo el período de inscripción del jugador.</li>
<li><strong>Comunicar con anticipación</strong> cualquier dificultad para realizar los pagos en las fechas establecidas.</li>
<li><strong>Aceptar las consecuencias</strong> establecidas en caso de mora o incumplimiento.</li>
</ol>

<h4>MÉTODOS DE PAGO ACEPTADOS</h4>
<ul>
<li>Transferencia bancaria</li>
<li>Pago en efectivo en oficinas de la academia</li>
<li>Tarjeta de crédito/débito (vía Stripe)</li>
<li>Depósito bancario</li>
</ul>

<h4>POLÍTICAS DE MORA</h4>
<p><strong>Período de gracia:</strong> 5 días después de la fecha de vencimiento.</p>
<p><strong>Recargo por mora:</strong> 10% adicional sobre el monto adeudado después del período de gracia.</p>
<p><strong>Suspensión temporal:</strong> Después de 15 días de mora, el jugador será suspendido de entrenamientos hasta regularizar su situación.</p>
<p><strong>Deuda acumulada:</strong> Deudas mayores a 2 meses podrán resultar en la desvinculación del jugador.</p>

<h4>POLÍTICA DE NO REEMBOLSO</h4>
<p>Entiendo y acepto que:</p>
<ul>
<li>El pago de inscripción NO es reembolsable bajo ninguna circunstancia.</li>
<li>Las mensualidades pagadas NO son reembolsables, incluso si el jugador no asiste a los entrenamientos.</li>
<li>En caso de retiro voluntario, no se devolverán los pagos realizados.</li>
<li>La academia se reserva el derecho de modificar las tarifas con 30 días de aviso previo.</li>
</ul>

<h4>BENEFICIOS POR PAGO PUNTUAL</h4>
<p>Los jugadores con historial de pago puntual durante 6 meses consecutivos podrán acceder a:</p>
<ul>
<li>Descuentos en inscripciones de temporadas futuras</li>
<li>Prioridad en torneos y eventos especiales</li>
<li>Acceso a programas exclusivos de la academia</li>
</ul>

<h4>ACEPTACIÓN DEL COMPROMISO</h4>
<p>Al firmar este documento, confirmo que:</p>
<ul>
<li>He leído y comprendido todas las condiciones establecidas.</li>
<li>Acepto los montos, fechas y políticas de pago descritas.</li>
<li>Me comprometo a cumplir con mis obligaciones de pago.</li>
<li>Entiendo las consecuencias del incumplimiento.</li>
</ul>

<p class="document-footer"><strong>Este compromiso de pago es válido durante todo el período de inscripción del jugador en Guerrero Academy.</strong></p>
</div>', true, true)

ON CONFLICT DO NOTHING;

-- 6. FUNCIÓN PARA VERIFICAR DOCUMENTOS COMPLETOS
CREATE OR REPLACE FUNCTION check_player_documents_complete()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si todos los documentos están firmados
    IF NEW.regulations_status = 'signed' AND
       NEW.medical_status = 'signed' AND
       NEW.image_consent_status = 'signed' AND
       NEW.liability_status = 'signed' AND
       NEW.payment_agreement_status = 'signed' THEN
        NEW.documents_complete := true;
    ELSE
        NEW.documents_complete := false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar documents_complete automáticamente
DROP TRIGGER IF EXISTS trigger_check_documents ON players;
CREATE TRIGGER trigger_check_documents
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION check_player_documents_complete();

-- 7. FUNCIÓN PARA ACTUALIZAR ESTADO DE DOCUMENTO DEL JUGADOR
CREATE OR REPLACE FUNCTION update_player_document_status()
RETURNS TRIGGER AS $$
DECLARE
    doc_type VARCHAR(50);
BEGIN
    -- Obtener el tipo de documento
    SELECT type INTO doc_type FROM document_templates WHERE id = NEW.template_id;
    
    -- Actualizar el campo correspondiente en players
    IF doc_type = 'reglamento' THEN
        UPDATE players SET regulations_status = NEW.status WHERE id = NEW.player_id;
    ELSIF doc_type = 'medico' THEN
        UPDATE players SET medical_status = NEW.status WHERE id = NEW.player_id;
    ELSIF doc_type = 'imagen' THEN
        UPDATE players SET image_consent_status = NEW.status WHERE id = NEW.player_id;
    ELSIF doc_type = 'responsabilidad' THEN
        UPDATE players SET liability_status = NEW.status WHERE id = NEW.player_id;
    ELSIF doc_type = 'pago' THEN
        UPDATE players SET 
            payment_agreement_status = NEW.status,
            agreed_monthly_fee = (NEW.payment_data->>'monthly_amount')::DECIMAL,
            agreed_payment_day = (NEW.payment_data->>'payment_day')::INTEGER,
            payment_agreement_date = NEW.signed_at
        WHERE id = NEW.player_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estado del jugador cuando se firma un documento
DROP TRIGGER IF EXISTS trigger_update_player_doc_status ON document_signatures;
CREATE TRIGGER trigger_update_player_doc_status
    AFTER INSERT ON document_signatures
    FOR EACH ROW
    EXECUTE FUNCTION update_player_document_status();

-- 8. RLS POLICIES
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;

-- Políticas para document_templates (todos pueden leer documentos activos)
DROP POLICY IF EXISTS "Anyone can view active templates" ON document_templates;
CREATE POLICY "Anyone can view active templates" ON document_templates
    FOR SELECT USING (is_active = true);

-- Políticas para document_signatures
DROP POLICY IF EXISTS "Users can view own signatures" ON document_signatures;
CREATE POLICY "Users can view own signatures" ON document_signatures
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert signatures" ON document_signatures;
CREATE POLICY "Users can insert signatures" ON document_signatures
    FOR INSERT WITH CHECK (true);

-- 9. VISTA PARA ESTADO DE DOCUMENTOS POR JUGADOR
CREATE OR REPLACE VIEW player_documents_status AS
SELECT 
    p.id as player_id,
    p.nombre as player_name,
    p.tutor_nombre,
    p.tutor_email,
    p.regulations_status,
    p.medical_status,
    p.image_consent_status,
    p.liability_status,
    p.payment_agreement_status,
    p.documents_complete,
    p.agreed_monthly_fee,
    p.agreed_payment_day,
    (SELECT COUNT(*) FROM document_signatures ds WHERE ds.player_id = p.id AND ds.status = 'signed') as signed_count,
    (SELECT COUNT(*) FROM document_templates dt WHERE dt.is_active = true AND dt.is_required = true) as required_count
FROM players p;

-- 10. GRANT PERMISSIONS
GRANT SELECT ON document_templates TO anon, authenticated;
GRANT SELECT, INSERT ON document_signatures TO anon, authenticated;
GRANT SELECT ON player_documents_status TO anon, authenticated;

SELECT 'Sistema de documentos y firmas creado exitosamente!' as resultado;
