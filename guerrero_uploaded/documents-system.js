/**
 * SISTEMA DE DOCUMENTOS Y FIRMAS DIGITALES
 * Guerrero Academy
 * 
 * Maneja plantillas de documentos, firma digital con canvas,
 * y almacenamiento de firmas en Supabase.
 */

const DocumentsSystem = (function() {
    
    // Configuración por defecto
    const CONFIG = {
        INSCRIPTION_AMOUNT: 3500,
        MONTHLY_AMOUNT: 4000,
        PAYMENT_DAY: 30,
        PAYMENT_METHODS: ['Transferencia bancaria', 'Efectivo', 'Tarjeta de crédito/débito', 'Depósito bancario']
    };
    
    // Estado del wizard
    let wizardState = {
        currentStep: 0,
        documents: [],
        signatures: {},
        playerData: null,
        tutorData: null
    };
    
    // Canvas de firma
    let signatureCanvas = null;
    let signatureCtx = null;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    /**
     * Inicializar el sistema de documentos
     */
    async function init(supabaseClient) {
        window.supabase = supabaseClient;
        window.sb = supabaseClient; // También asignar a sb por compatibilidad
        console.log('DocumentsSystem inicializado');
    }
    
    /**
     * Obtener cliente de Supabase
     */
    function getSupabase() {
        return window.supabase || window.sb;
    }
    
    /**
     * Cargar plantillas de documentos activos
     */
    async function loadDocumentTemplates() {
        try {
            const client = getSupabase();
            if (!client) {
                console.error('Supabase no está inicializado');
                return [];
            }
            
            const { data, error } = await client
                .from('document_templates')
                .select('*')
                .eq('is_active', true)
                .eq('is_required', true)
                .order('type');
            
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error cargando plantillas:', err);
            return [];
        }
    }
    
    /**
     * Verificar estado de documentos de un jugador
     */
    async function getPlayerDocumentsStatus(playerId) {
        try {
            const client = getSupabase();
            if (!client) {
                console.error('Supabase no está inicializado');
                return null;
            }
            
            // Primero obtener datos básicos
            const { data: basicData, error: basicError } = await client
                .from('players')
                .select('id, nombre, tutor_nombre, tutor_email, category_id, categories(name)')
                .eq('id', playerId)
                .single();
            
            if (basicError) {
                console.error('Error cargando datos básicos:', basicError);
                throw basicError;
            }
            
            let result = { ...basicData };
            
            // Intentar obtener columnas de documentos (pueden no existir)
            try {
                const { data: docsData, error: docsError } = await client
                    .from('players')
                    .select('regulations_status, medical_status, image_consent_status, liability_status, payment_agreement_status, documents_complete, agreed_monthly_fee, agreed_payment_day')
                    .eq('id', playerId)
                    .single();
                
                if (!docsError && docsData) {
                    result = { ...result, ...docsData };
                } else {
                    // Las columnas no existen, usar valores por defecto
                    result.regulations_status = 'pending';
                    result.medical_status = 'pending';
                    result.image_consent_status = 'pending';
                    result.liability_status = 'pending';
                    result.payment_agreement_status = 'pending';
                    result.documents_complete = false;
                }
            } catch (e) {
                // Las columnas no existen, usar valores por defecto
                console.log('Usando valores por defecto para documentos');
                result.regulations_status = 'pending';
                result.medical_status = 'pending';
                result.image_consent_status = 'pending';
                result.liability_status = 'pending';
                result.payment_agreement_status = 'pending';
                result.documents_complete = false;
            }
            
            return result;
        } catch (err) {
            console.error('Error obteniendo estado de documentos:', err);
            return null;
        }
    }
    
    /**
     * Obtener firmas existentes de un jugador
     */
    async function getPlayerSignatures(playerId) {
        try {
            const client = getSupabase();
            if (!client) return [];
            
            const { data, error } = await client
                .from('document_signatures')
                .select(`
                    *,
                    document_templates(name, type, title, version)
                `)
                .eq('player_id', playerId)
                .eq('status', 'signed');
            
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error obteniendo firmas:', err);
            return [];
        }
    }
    
    /**
     * Procesar contenido del documento con datos dinámicos
     */
    function processDocumentContent(template, playerData, tutorData) {
        let content = template.content;
        
        const replacements = {
            '{{TUTOR_NAME}}': tutorData?.name || playerData?.tutor_nombre || '[Nombre del Tutor]',
            '{{TUTOR_ID}}': tutorData?.idNumber || '[Cédula/Pasaporte]',
            '{{PLAYER_NAME}}': playerData?.nombre || playerData?.name || '[Nombre del Jugador]',
            '{{CATEGORY}}': playerData?.categories?.name || playerData?.category || 'Sin categoría',
            '{{INSCRIPTION_DATE}}': new Date().toLocaleDateString('es-DO'),
            '{{INSCRIPTION_AMOUNT}}': CONFIG.INSCRIPTION_AMOUNT.toLocaleString('es-DO'),
            '{{MONTHLY_AMOUNT}}': CONFIG.MONTHLY_AMOUNT.toLocaleString('es-DO'),
            '{{PAYMENT_DAY}}': CONFIG.PAYMENT_DAY.toString()
        };
        
        for (const [key, value] of Object.entries(replacements)) {
            content = content.replace(new RegExp(key, 'g'), value);
        }
        
        return content;
    }
    
    /**
     * Crear el modal del wizard de firma
     */
    function createSignatureWizardModal() {
        // Remover modal existente si hay
        const existingModal = document.getElementById('documentsWizardModal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'documentsWizardModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content documents-wizard-modal">
                <div class="wizard-header">
                    <h2 id="wizardTitle">Documentos Obligatorios</h2>
                    <p id="wizardSubtitle">Complete todos los documentos para activar al jugador</p>
                    <button class="modal-close" onclick="DocumentsSystem.closeWizard()">&times;</button>
                </div>
                
                <div class="wizard-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="wizardProgressFill"></div>
                    </div>
                    <span class="progress-text" id="wizardProgressText">Paso 1 de 6</span>
                </div>
                
                <div class="wizard-body" id="wizardBody">
                    <!-- Contenido dinámico -->
                </div>
                
                <div class="wizard-footer">
                    <button class="btn btn-secondary" id="wizardBtnPrev" onclick="DocumentsSystem.prevStep()">
                        Anterior
                    </button>
                    <button class="btn btn-primary" id="wizardBtnNext" onclick="DocumentsSystem.nextStep()">
                        Siguiente
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        addWizardStyles();
        
        return modal;
    }
    
    /**
     * Agregar estilos del wizard
     */
    function addWizardStyles() {
        if (document.getElementById('documentsWizardStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'documentsWizardStyles';
        styles.textContent = `
            /* Modal overlay */
            #documentsWizardModal {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.5) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 10000 !important;
                padding: 20px !important;
                box-sizing: border-box !important;
            }
            
            .documents-wizard-modal {
                max-width: 700px !important;
                width: 100% !important;
                max-height: 85vh !important;
                display: flex !important;
                flex-direction: column !important;
                background: #fff !important;
                border-radius: 20px !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                overflow: hidden !important;
                margin: auto !important;
            }
            
            .wizard-header {
                padding: 20px 24px 16px;
                border-bottom: 1px solid rgba(0,0,0,0.08);
                position: relative;
                flex-shrink: 0;
            }
            
            .wizard-header h2 {
                font-size: 20px;
                font-weight: 700;
                color: #1d1d1f;
                margin-bottom: 4px;
                padding-right: 40px;
            }
            
            .wizard-header p {
                font-size: 13px;
                color: #86868b;
            }
            
            .wizard-header .modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 32px;
                height: 32px;
                border: none;
                background: #f5f5f7;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                color: #86868b;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .wizard-header .modal-close:hover {
                background: #e5e5e7;
                color: #1d1d1f;
            }
            
            .wizard-progress {
                padding: 12px 24px;
                background: #f5f5f7;
                flex-shrink: 0;
            }
            
            .progress-bar {
                height: 6px;
                background: rgba(0,0,0,0.08);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            
            .progress-fill {
                height: 100%;
                background: #1d1d1f;
                border-radius: 3px;
                transition: width 0.3s ease;
            }
            
            .progress-text {
                font-size: 13px;
                color: #86868b;
                font-weight: 500;
            }
            
            .wizard-body {
                flex: 1;
                overflow-y: auto;
                padding: 20px 24px;
                min-height: 200px;
                max-height: calc(85vh - 200px);
            }
            
            .wizard-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(0,0,0,0.08);
                display: flex;
                justify-content: space-between;
                gap: 12px;
                flex-shrink: 0;
                background: #fff;
            }
            
            .wizard-footer .btn {
                min-width: 120px;
                padding: 12px 24px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .wizard-footer .btn-primary {
                background: #1d1d1f;
                color: #fff;
                border: none;
            }
            
            .wizard-footer .btn-primary:hover {
                background: #000;
            }
            
            .wizard-footer .btn-secondary {
                background: #f5f5f7;
                color: #1d1d1f;
                border: 1px solid rgba(0,0,0,0.08);
            }
            
            .wizard-footer .btn-secondary:hover {
                background: #e5e5e7;
            }
            
            /* Paso de resumen */
            .documents-summary {
                display: grid;
                gap: 12px;
            }
            
            .document-summary-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: #f5f5f7;
                border-radius: 12px;
            }
            
            .document-summary-item .icon {
                width: 48px;
                height: 48px;
                background: #fff;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .document-summary-item .info h4 {
                font-size: 15px;
                font-weight: 600;
                color: #1d1d1f;
                margin-bottom: 2px;
            }
            
            .document-summary-item .info p {
                font-size: 13px;
                color: #86868b;
            }
            
            .document-summary-item .status {
                margin-left: auto;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .document-summary-item .status.pending {
                background: rgba(255, 149, 0, 0.12);
                color: #b25000;
            }
            
            .document-summary-item .status.signed {
                background: rgba(52, 199, 89, 0.12);
                color: #248a3d;
            }
            
            /* Contenido del documento */
            .document-content-wrapper {
                background: #f9f9f9;
                border: 1px solid rgba(0,0,0,0.08);
                border-radius: 12px;
                max-height: 200px;
                overflow-y: auto;
                padding: 16px 20px;
                margin-bottom: 16px;
                font-size: 13px;
                line-height: 1.6;
            }
            
            .document-content-wrapper h2 {
                font-size: 16px;
                color: #1d1d1f;
                margin-bottom: 4px;
            }
            
            .document-content-wrapper h3 {
                font-size: 14px;
                color: #86868b;
                margin-bottom: 12px;
            }
            
            .document-content-wrapper h4 {
                font-size: 13px;
                color: #1d1d1f;
                margin: 12px 0 6px;
                font-weight: 600;
            }
            
            .document-content-wrapper p {
                margin-bottom: 8px;
                color: #3d3d3f;
            }
            
            .document-content-wrapper ul, 
            .document-content-wrapper ol {
                margin: 8px 0 8px 16px;
                color: #3d3d3f;
            }
            
            .document-content-wrapper li {
                margin-bottom: 6px;
            }
            
            .document-content-wrapper .payment-summary,
            .document-content-wrapper .amounts-box {
                background: #f5f5f7;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }
            
            .document-content-wrapper .payment-table {
                width: 100%;
            }
            
            .document-content-wrapper .payment-table td {
                padding: 8px 0;
                border-bottom: 1px solid rgba(0,0,0,0.06);
            }
            
            .document-content-wrapper .document-footer {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid rgba(0,0,0,0.08);
                font-style: italic;
                color: #86868b;
                font-size: 12px;
            }
            
            /* Formulario de firma */
            .signature-form {
                display: grid;
                gap: 14px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            
            @media (max-width: 600px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
            
            .form-group label {
                display: block;
                font-size: 12px;
                font-weight: 600;
                color: #1d1d1f;
                margin-bottom: 4px;
            }
            
            .form-group input {
                width: 100%;
                padding: 10px 12px;
                font-size: 14px;
                border: 1px solid rgba(0,0,0,0.12);
                border-radius: 8px;
                background: #fff;
                color: #1d1d1f;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #1d1d1f;
            }
            
            .checkbox-group {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 12px;
                background: #f5f5f7;
                border-radius: 8px;
            }
            
            .checkbox-group input[type="checkbox"] {
                width: 18px;
                height: 18px;
                margin-top: 2px;
                accent-color: #1d1d1f;
                flex-shrink: 0;
            }
            
            .checkbox-group label {
                font-size: 13px;
                color: #3d3d3f;
                line-height: 1.4;
                margin: 0;
            }
            
            /* Canvas de firma */
            .signature-canvas-wrapper {
                border: 2px dashed rgba(0,0,0,0.15);
                border-radius: 10px;
                padding: 6px;
                background: #fafafa;
            }
            
            .signature-canvas-wrapper.active {
                border-color: #1d1d1f;
                border-style: solid;
            }
            
            #signatureCanvas {
                width: 100%;
                height: 100px;
                background: #fff;
                border-radius: 6px;
                cursor: crosshair;
                touch-action: none;
            }
            
            .signature-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 6px;
            }
            
            .signature-actions span {
                font-size: 11px;
                color: #86868b;
            }
            
            .signature-actions button {
                padding: 4px 10px;
                font-size: 12px;
                background: #f5f5f7;
                border: 1px solid rgba(0,0,0,0.08);
                border-radius: 6px;
                cursor: pointer;
                color: #1d1d1f;
            }
            
            .signature-actions button:hover {
                background: #e5e5e7;
            }
            
            /* Paso de confirmación */
            .confirmation-step {
                text-align: center;
            }
            
            .confirmation-icon {
                width: 80px;
                height: 80px;
                background: rgba(52, 199, 89, 0.12);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                margin: 0 auto 24px;
            }
            
            .confirmation-step h3 {
                font-size: 22px;
                color: #1d1d1f;
                margin-bottom: 8px;
            }
            
            .confirmation-step p {
                color: #86868b;
                margin-bottom: 24px;
            }
            
            .signed-documents-list {
                text-align: left;
                background: #f5f5f7;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
            }
            
            .signed-documents-list h4 {
                font-size: 14px;
                color: #1d1d1f;
                margin-bottom: 12px;
            }
            
            .signed-documents-list li {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 0;
                border-bottom: 1px solid rgba(0,0,0,0.06);
                font-size: 14px;
                color: #3d3d3f;
            }
            
            .signed-documents-list li:last-child {
                border-bottom: none;
            }
            
            .signed-documents-list li::before {
                content: "✓";
                color: #34c759;
                font-weight: 700;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    /**
     * Abrir wizard de firma para un jugador
     */
    async function openSignatureWizard(playerId, tutorData = null) {
        // Cargar datos del jugador
        const playerData = await getPlayerDocumentsStatus(playerId);
        if (!playerData) {
            alert('Error: No se pudo cargar los datos del jugador');
            return;
        }
        
        // Cargar plantillas de documentos
        const documents = await loadDocumentTemplates();
        if (documents.length === 0) {
            alert('Error: No hay documentos configurados');
            return;
        }
        
        // Cargar firmas existentes
        const existingSignatures = await getPlayerSignatures(playerId);
        
        // Filtrar documentos pendientes
        const pendingDocuments = documents.filter(doc => {
            const statusField = getStatusFieldForType(doc.type);
            return playerData[statusField] !== 'signed';
        });
        
        // Inicializar estado del wizard
        wizardState = {
            currentStep: 0,
            documents: documents,
            pendingDocuments: pendingDocuments,
            signatures: {},
            playerData: playerData,
            tutorData: tutorData || {
                name: playerData.tutor_nombre,
                email: playerData.tutor_email
            },
            existingSignatures: existingSignatures
        };
        
        // Crear y mostrar modal
        const modal = createSignatureWizardModal();
        modal.style.display = 'flex';
        
        // Renderizar primer paso
        renderWizardStep();
    }
    
    /**
     * Obtener campo de estado según tipo de documento
     */
    function getStatusFieldForType(type) {
        const mapping = {
            'reglamento': 'regulations_status',
            'medico': 'medical_status',
            'imagen': 'image_consent_status',
            'responsabilidad': 'liability_status',
            'pago': 'payment_agreement_status'
        };
        return mapping[type] || 'regulations_status';
    }
    
    /**
     * Obtener ícono según tipo de documento
     */
    function getIconForType(type) {
        const icons = {
            'reglamento': '📋',
            'medico': '🏥',
            'imagen': '📷',
            'responsabilidad': '⚖️',
            'pago': '💳'
        };
        return icons[type] || '📄';
    }
    
    /**
     * Renderizar paso actual del wizard
     */
    function renderWizardStep() {
        const body = document.getElementById('wizardBody');
        const title = document.getElementById('wizardTitle');
        const subtitle = document.getElementById('wizardSubtitle');
        const progressFill = document.getElementById('wizardProgressFill');
        const progressText = document.getElementById('wizardProgressText');
        const btnPrev = document.getElementById('wizardBtnPrev');
        const btnNext = document.getElementById('wizardBtnNext');
        
        const totalSteps = wizardState.pendingDocuments.length + 2; // Resumen + docs + confirmación
        const currentStep = wizardState.currentStep;
        
        // Actualizar progreso
        const progress = ((currentStep + 1) / totalSteps) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Paso ${currentStep + 1} de ${totalSteps}`;
        
        // Mostrar/ocultar botones
        btnPrev.style.display = currentStep === 0 ? 'none' : 'block';
        
        if (currentStep === 0) {
            // Paso de resumen inicial
            renderSummaryStep(body, title, subtitle, btnNext);
        } else if (currentStep <= wizardState.pendingDocuments.length) {
            // Pasos de documentos
            const docIndex = currentStep - 1;
            renderDocumentStep(docIndex, body, title, subtitle, btnNext);
        } else {
            // Paso de confirmación final
            renderConfirmationStep(body, title, subtitle, btnNext);
        }
    }
    
    /**
     * Renderizar paso de resumen
     */
    function renderSummaryStep(body, title, subtitle, btnNext) {
        title.textContent = 'Documentos Obligatorios';
        subtitle.textContent = `Jugador: ${wizardState.playerData.nombre || wizardState.playerData.name}`;
        btnNext.textContent = 'Comenzar';
        
        let html = '<div class="documents-summary">';
        
        wizardState.documents.forEach(doc => {
            const statusField = getStatusFieldForType(doc.type);
            const status = wizardState.playerData[statusField];
            const isSigned = status === 'signed';
            
            html += `
                <div class="document-summary-item">
                    <div class="icon">${getIconForType(doc.type)}</div>
                    <div class="info">
                        <h4>${doc.title}</h4>
                        <p>Versión ${doc.version}</p>
                    </div>
                    <span class="status ${isSigned ? 'signed' : 'pending'}">
                        ${isSigned ? 'Firmado' : 'Pendiente'}
                    </span>
                </div>
            `;
        });
        
        html += '</div>';
        
        if (wizardState.pendingDocuments.length === 0) {
            html = `
                <div class="confirmation-step">
                    <div class="confirmation-icon">✅</div>
                    <h3>Todos los documentos firmados</h3>
                    <p>El jugador ${wizardState.playerData.nombre || wizardState.playerData.name} tiene todos los documentos completos.</p>
                </div>
            `;
            btnNext.textContent = 'Cerrar';
        }
        
        body.innerHTML = html;
    }
    
    /**
     * Renderizar paso de documento individual
     */
    function renderDocumentStep(docIndex, body, title, subtitle, btnNext) {
        const doc = wizardState.pendingDocuments[docIndex];
        const content = processDocumentContent(doc, wizardState.playerData, wizardState.tutorData);
        
        title.textContent = doc.title;
        subtitle.textContent = `Versión ${doc.version} - Documento ${docIndex + 1} de ${wizardState.pendingDocuments.length}`;
        btnNext.textContent = docIndex === wizardState.pendingDocuments.length - 1 ? 'Finalizar' : 'Siguiente';
        
        body.innerHTML = `
            <div class="document-content-wrapper">
                ${content}
            </div>
            
            <div class="signature-form">
                <div class="checkbox-group">
                    <input type="checkbox" id="acceptDoc_${doc.id}" required>
                    <label for="acceptDoc_${doc.id}">
                        He leído, entendido y acepto los términos y condiciones establecidos en este documento.
                    </label>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre completo del firmante</label>
                        <input type="text" id="signerName_${doc.id}" 
                               value="${wizardState.tutorData?.name || ''}" 
                               placeholder="Nombre completo" required>
                    </div>
                    <div class="form-group">
                        <label>Cédula o Pasaporte</label>
                        <input type="text" id="signerId_${doc.id}" 
                               value="${wizardState.tutorData?.idNumber || ''}" 
                               placeholder="000-0000000-0" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Firma Digital</label>
                    <div class="signature-canvas-wrapper" id="canvasWrapper_${doc.id}">
                        <canvas id="signatureCanvas"></canvas>
                    </div>
                    <div class="signature-actions">
                        <span>Dibuje su firma con el mouse o dedo</span>
                        <button type="button" onclick="DocumentsSystem.clearSignature()">Borrar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar canvas
        setTimeout(() => initSignatureCanvas(), 100);
        
        // Restaurar datos si existen
        const savedSignature = wizardState.signatures[doc.id];
        if (savedSignature) {
            const checkbox = document.getElementById(`acceptDoc_${doc.id}`);
            const nameInput = document.getElementById(`signerName_${doc.id}`);
            const idInput = document.getElementById(`signerId_${doc.id}`);
            
            if (checkbox) checkbox.checked = savedSignature.accepted;
            if (nameInput) nameInput.value = savedSignature.name;
            if (idInput) idInput.value = savedSignature.idNumber;
            
            // Restaurar firma del canvas
            if (savedSignature.signatureData && signatureCanvas) {
                const img = new Image();
                img.onload = () => {
                    signatureCtx.drawImage(img, 0, 0);
                };
                img.src = savedSignature.signatureData;
            }
        }
    }
    
    /**
     * Renderizar paso de confirmación final
     */
    function renderConfirmationStep(body, title, subtitle, btnNext) {
        title.textContent = 'Documentos Firmados';
        subtitle.textContent = 'Proceso completado exitosamente';
        btnNext.textContent = 'Cerrar';
        
        let signedList = '';
        wizardState.pendingDocuments.forEach(doc => {
            signedList += `<li>${doc.title}</li>`;
        });
        
        body.innerHTML = `
            <div class="confirmation-step">
                <div class="confirmation-icon">✅</div>
                <h3>¡Felicidades!</h3>
                <p>Todos los documentos han sido firmados correctamente.</p>
                
                <div class="signed-documents-list">
                    <h4>Documentos firmados:</h4>
                    <ul>${signedList}</ul>
                </div>
                
                <p style="font-size: 13px; color: #86868b;">
                    Los documentos firmados quedan registrados en el sistema. 
                    Puede descargar copias desde su panel en cualquier momento.
                </p>
            </div>
        `;
    }
    
    /**
     * Inicializar canvas de firma
     */
    function initSignatureCanvas() {
        signatureCanvas = document.getElementById('signatureCanvas');
        if (!signatureCanvas) return;
        
        signatureCtx = signatureCanvas.getContext('2d');
        
        // Ajustar tamaño del canvas
        const wrapper = signatureCanvas.parentElement;
        signatureCanvas.width = wrapper.clientWidth - 16;
        signatureCanvas.height = 100;
        
        // Estilo del trazo
        signatureCtx.strokeStyle = '#1d1d1f';
        signatureCtx.lineWidth = 2;
        signatureCtx.lineCap = 'round';
        signatureCtx.lineJoin = 'round';
        
        // Limpiar canvas
        signatureCtx.fillStyle = '#fff';
        signatureCtx.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        
        // Event listeners para mouse
        signatureCanvas.addEventListener('mousedown', startDrawing);
        signatureCanvas.addEventListener('mousemove', draw);
        signatureCanvas.addEventListener('mouseup', stopDrawing);
        signatureCanvas.addEventListener('mouseout', stopDrawing);
        
        // Event listeners para touch
        signatureCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        signatureCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        signatureCanvas.addEventListener('touchend', stopDrawing);
    }
    
    function startDrawing(e) {
        isDrawing = true;
        const rect = signatureCanvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        
        document.getElementById('canvasWrapper_' + getCurrentDocId())?.classList.add('active');
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = signatureCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        signatureCtx.beginPath();
        signatureCtx.moveTo(lastX, lastY);
        signatureCtx.lineTo(x, y);
        signatureCtx.stroke();
        
        lastX = x;
        lastY = y;
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = signatureCanvas.getBoundingClientRect();
        
        isDrawing = true;
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
        
        document.getElementById('canvasWrapper_' + getCurrentDocId())?.classList.add('active');
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        if (!isDrawing) return;
        
        const touch = e.touches[0];
        const rect = signatureCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        signatureCtx.beginPath();
        signatureCtx.moveTo(lastX, lastY);
        signatureCtx.lineTo(x, y);
        signatureCtx.stroke();
        
        lastX = x;
        lastY = y;
    }
    
    function getCurrentDocId() {
        if (wizardState.currentStep > 0 && wizardState.currentStep <= wizardState.pendingDocuments.length) {
            return wizardState.pendingDocuments[wizardState.currentStep - 1].id;
        }
        return null;
    }
    
    /**
     * Limpiar canvas de firma
     */
    function clearSignature() {
        if (!signatureCanvas || !signatureCtx) return;
        signatureCtx.fillStyle = '#fff';
        signatureCtx.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
    
    /**
     * Verificar si el canvas tiene firma
     */
    function hasSignature() {
        if (!signatureCanvas) return false;
        
        const blank = document.createElement('canvas');
        blank.width = signatureCanvas.width;
        blank.height = signatureCanvas.height;
        const blankCtx = blank.getContext('2d');
        blankCtx.fillStyle = '#fff';
        blankCtx.fillRect(0, 0, blank.width, blank.height);
        
        return signatureCanvas.toDataURL() !== blank.toDataURL();
    }
    
    /**
     * Ir al siguiente paso
     */
    async function nextStep() {
        const currentStep = wizardState.currentStep;
        const totalSteps = wizardState.pendingDocuments.length + 2;
        
        // Paso de resumen
        if (currentStep === 0) {
            if (wizardState.pendingDocuments.length === 0) {
                closeWizard();
                return;
            }
            wizardState.currentStep++;
            renderWizardStep();
            return;
        }
        
        // Pasos de documentos - validar y guardar
        if (currentStep <= wizardState.pendingDocuments.length) {
            const docIndex = currentStep - 1;
            const doc = wizardState.pendingDocuments[docIndex];
            
            // Validar formulario
            const checkbox = document.getElementById(`acceptDoc_${doc.id}`);
            const nameInput = document.getElementById(`signerName_${doc.id}`);
            const idInput = document.getElementById(`signerId_${doc.id}`);
            
            if (!checkbox?.checked) {
                alert('Debe aceptar los términos del documento para continuar.');
                return;
            }
            
            if (!nameInput?.value.trim()) {
                alert('Debe ingresar su nombre completo.');
                nameInput?.focus();
                return;
            }
            
            if (!idInput?.value.trim()) {
                alert('Debe ingresar su número de cédula o pasaporte.');
                idInput?.focus();
                return;
            }
            
            if (!hasSignature()) {
                alert('Debe dibujar su firma digital para continuar.');
                return;
            }
            
            // Guardar datos de la firma
            wizardState.signatures[doc.id] = {
                accepted: true,
                name: nameInput.value.trim(),
                idNumber: idInput.value.trim(),
                signatureData: signatureCanvas.toDataURL('image/png')
            };
            
            // Actualizar datos del tutor para próximos documentos
            wizardState.tutorData = {
                ...wizardState.tutorData,
                name: nameInput.value.trim(),
                idNumber: idInput.value.trim()
            };
            
            // Si es el último documento, guardar todo
            if (currentStep === wizardState.pendingDocuments.length) {
                const success = await saveAllSignatures();
                if (!success) {
                    alert('Error al guardar las firmas. Por favor intente de nuevo.');
                    return;
                }
            }
            
            wizardState.currentStep++;
            renderWizardStep();
            return;
        }
        
        // Paso de confirmación - cerrar
        closeWizard();
        
        // Recargar la página o sección de documentos
        if (typeof loadPlayerDocuments === 'function') {
            loadPlayerDocuments();
        } else {
            window.location.reload();
        }
    }
    
    /**
     * Ir al paso anterior
     */
    function prevStep() {
        if (wizardState.currentStep > 0) {
            wizardState.currentStep--;
            renderWizardStep();
        }
    }
    
    /**
     * Guardar todas las firmas en la base de datos
     */
    async function saveAllSignatures() {
        try {
            const client = getSupabase();
            if (!client) {
                console.error('Supabase no disponible para guardar firmas');
                alert('Error: No se pudo conectar a la base de datos');
                return false;
            }
            
            const signatures = [];
            
            for (const doc of wizardState.pendingDocuments) {
                const sigData = wizardState.signatures[doc.id];
                if (!sigData) {
                    console.log('No hay datos de firma para documento:', doc.id);
                    continue;
                }
                
                // Preparar datos de pago si es documento de pago
                let paymentData = null;
                if (doc.type === 'pago') {
                    paymentData = {
                        inscription_amount: CONFIG.INSCRIPTION_AMOUNT,
                        monthly_amount: CONFIG.MONTHLY_AMOUNT,
                        payment_day: CONFIG.PAYMENT_DAY
                    };
                }
                
                // Obtener IP (con timeout)
                let ipAddress = 'unknown';
                try {
                    ipAddress = await getClientIP();
                } catch (e) {
                    console.log('No se pudo obtener IP');
                }
                
                signatures.push({
                    player_id: wizardState.playerData.id,
                    template_id: doc.id,
                    template_version: doc.version,
                    signer_name: sigData.name,
                    signer_role: 'Padre/Tutor',
                    signer_id_number: sigData.idNumber,
                    signer_email: wizardState.tutorData?.email || wizardState.playerData.tutor_email,
                    signature_image_url: sigData.signatureData,
                    accepted_checkbox: true,
                    ip_address: ipAddress,
                    user_agent: navigator.userAgent.substring(0, 500),
                    status: 'signed',
                    payment_data: paymentData
                });
            }
            
            if (signatures.length === 0) {
                console.error('No hay firmas para guardar');
                return false;
            }
            
            console.log('Guardando', signatures.length, 'firmas...');
            
            // Insertar todas las firmas
            const { data, error } = await client
                .from('document_signatures')
                .insert(signatures)
                .select();
            
            if (error) {
                console.error('Error de Supabase:', error);
                alert('Error al guardar: ' + (error.message || 'Error desconocido'));
                return false;
            }
            
            console.log('Firmas guardadas exitosamente:', data);
            
            // Actualizar estado del jugador si es posible
            try {
                await updatePlayerDocumentStatus(wizardState.playerData.id);
            } catch (e) {
                console.log('No se pudo actualizar estado del jugador:', e);
            }
            
            alert('¡Documentos firmados exitosamente!');
            return true;
            
        } catch (err) {
            console.error('Error guardando firmas:', err);
            alert('Error al guardar las firmas: ' + (err.message || 'Error desconocido'));
            return false;
        }
    }
    
    /**
     * Actualizar estado de documentos del jugador
     */
    async function updatePlayerDocumentStatus(playerId) {
        const client = getSupabase();
        if (!client) return;
        
        // Actualizar estados basado en las firmas
        const updates = {};
        let allSigned = true;
        
        // Lista de todos los tipos de documentos
        const allDocTypes = ['reglamento', 'medico', 'imagen', 'responsabilidad', 'pago'];
        
        for (const doc of wizardState.pendingDocuments) {
            if (wizardState.signatures[doc.id]) {
                if (doc.type === 'reglamento') updates.regulations_status = 'signed';
                if (doc.type === 'medico') updates.medical_status = 'signed';
                if (doc.type === 'imagen') updates.image_consent_status = 'signed';
                if (doc.type === 'responsabilidad') updates.liability_status = 'signed';
                if (doc.type === 'pago') {
                    updates.payment_agreement_status = 'signed';
                    updates.agreed_monthly_fee = CONFIG.MONTHLY_AMOUNT;
                    updates.agreed_payment_day = CONFIG.PAYMENT_DAY;
                    updates.payment_agreement_date = new Date().toISOString();
                }
            }
        }
        
        // Verificar si todos los documentos están firmados
        // (los que ya estaban firmados + los que acabamos de firmar)
        const signedTypes = new Set();
        
        // Agregar los que ya estaban firmados
        if (wizardState.playerData.regulations_status === 'signed') signedTypes.add('reglamento');
        if (wizardState.playerData.medical_status === 'signed') signedTypes.add('medico');
        if (wizardState.playerData.image_consent_status === 'signed') signedTypes.add('imagen');
        if (wizardState.playerData.liability_status === 'signed') signedTypes.add('responsabilidad');
        if (wizardState.playerData.payment_agreement_status === 'signed') signedTypes.add('pago');
        
        // Agregar los que acabamos de firmar
        for (const doc of wizardState.pendingDocuments) {
            if (wizardState.signatures[doc.id]) {
                signedTypes.add(doc.type);
            }
        }
        
        // Si todos los tipos están firmados, marcar como completo
        if (signedTypes.size >= allDocTypes.length) {
            updates.documents_complete = true;
            console.log('Todos los documentos firmados - marcando como completo');
        }
        
        if (Object.keys(updates).length > 0) {
            try {
                const { error } = await client
                    .from('players')
                    .update(updates)
                    .eq('id', playerId);
                
                if (error) {
                    console.error('Error en update:', error);
                } else {
                    console.log('Estado del jugador actualizado:', updates);
                }
            } catch (e) {
                console.log('Error actualizando estado del jugador:', e);
            }
        }
    }
    
    /**
     * Obtener IP del cliente (con timeout)
     */
    async function getClientIP() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch('https://api.ipify.org?format=json', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            return data.ip || 'unknown';
        } catch {
            return 'unknown';
        }
    }
    
    /**
     * Cerrar wizard
     */
    function closeWizard() {
        const modal = document.getElementById('documentsWizardModal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }
        
        // Limpiar estado
        wizardState = {
            currentStep: 0,
            documents: [],
            signatures: {},
            playerData: null,
            tutorData: null
        };
    }
    
    /**
     * Renderizar sección de documentos en el panel de padres
     */
    async function renderParentDocumentsSection(containerId, playerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '<div class="loading"><div class="spinner"></div> Cargando documentos...</div>';
        
        const playerData = await getPlayerDocumentsStatus(playerId);
        if (!playerData) {
            container.innerHTML = '<div class="empty-state"><p>Error al cargar documentos</p></div>';
            return;
        }
        
        const documents = await loadDocumentTemplates();
        const signatures = await getPlayerSignatures(playerId);
        
        let pendingCount = 0;
        let signedCount = 0;
        
        let html = `
            <div class="documents-section">
                <div class="documents-header">
                    <h3>Documentos del Jugador</h3>
                    <p>${playerData.name}</p>
                </div>
                <div class="documents-list">
        `;
        
        documents.forEach(doc => {
            const statusField = getStatusFieldForType(doc.type);
            const status = playerData[statusField];
            const isSigned = status === 'signed';
            const signature = signatures.find(s => s.template_id === doc.id);
            
            if (isSigned) signedCount++;
            else pendingCount++;
            
            html += `
                <div class="document-item ${isSigned ? 'signed' : 'pending'}">
                    <div class="document-icon">${getIconForType(doc.type)}</div>
                    <div class="document-info">
                        <h4>${doc.title}</h4>
                        <p>Versión ${doc.version}</p>
                        ${isSigned && signature ? `
                            <span class="signed-info">
                                Firmado el ${new Date(signature.signed_at).toLocaleDateString('es-DO')} 
                                por ${signature.signer_name}
                            </span>
                        ` : ''}
                    </div>
                    <div class="document-actions">
                        ${isSigned ? `
                            <span class="badge badge-success">Firmado</span>
                            <button class="btn btn-sm btn-secondary" onclick="DocumentsSystem.viewDocument('${doc.id}', '${playerId}')">
                                Ver
                            </button>
                        ` : `
                            <span class="badge badge-warning">Pendiente</span>
                        `}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Botón para firmar documentos pendientes
        if (pendingCount > 0) {
            html += `
                <div class="documents-footer">
                    <button class="btn btn-primary" onclick="DocumentsSystem.openSignatureWizard('${playerId}')">
                        Firmar Documentos Pendientes (${pendingCount})
                    </button>
                </div>
            `;
        } else {
            html += `
                <div class="documents-footer complete">
                    <span class="all-complete">✅ Todos los documentos están firmados</span>
                </div>
            `;
        }
        
        html += '</div>';
        
        container.innerHTML = html;
        
        // Agregar estilos si no existen
        addDocumentsSectionStyles();
    }
    
    /**
     * Agregar estilos para la sección de documentos
     */
    function addDocumentsSectionStyles() {
        if (document.getElementById('documentsSectionStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'documentsSectionStyles';
        styles.textContent = `
            .documents-section {
                background: #fff;
                border: 1px solid rgba(0,0,0,0.08);
                border-radius: 16px;
                overflow: hidden;
            }
            
            .documents-header {
                padding: 20px 24px;
                border-bottom: 1px solid rgba(0,0,0,0.08);
            }
            
            .documents-header h3 {
                font-size: 18px;
                font-weight: 700;
                color: #1d1d1f;
                margin-bottom: 4px;
            }
            
            .documents-header p {
                font-size: 14px;
                color: #86868b;
            }
            
            .documents-list {
                padding: 8px;
            }
            
            .document-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 4px;
                transition: background 0.2s;
            }
            
            .document-item:hover {
                background: #f5f5f7;
            }
            
            .document-icon {
                width: 48px;
                height: 48px;
                background: #f5f5f7;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .document-item.signed .document-icon {
                background: rgba(52, 199, 89, 0.12);
            }
            
            .document-info {
                flex: 1;
            }
            
            .document-info h4 {
                font-size: 15px;
                font-weight: 600;
                color: #1d1d1f;
                margin-bottom: 2px;
            }
            
            .document-info p {
                font-size: 13px;
                color: #86868b;
            }
            
            .document-info .signed-info {
                display: block;
                font-size: 12px;
                color: #34c759;
                margin-top: 4px;
            }
            
            .document-actions {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .documents-footer {
                padding: 16px 24px;
                border-top: 1px solid rgba(0,0,0,0.08);
                background: #f5f5f7;
            }
            
            .documents-footer.complete {
                text-align: center;
            }
            
            .documents-footer .all-complete {
                color: #34c759;
                font-weight: 600;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    /**
     * Ver documento firmado
     */
    async function viewDocument(templateId, playerId) {
        // Implementar visualización de documento
        alert('Función de visualización próximamente disponible');
    }
    
    // API pública
    return {
        init,
        loadDocumentTemplates,
        getPlayerDocumentsStatus,
        getPlayerSignatures,
        openSignatureWizard,
        closeWizard,
        nextStep,
        prevStep,
        clearSignature,
        renderParentDocumentsSection,
        viewDocument,
        CONFIG
    };
    
})();

// Exponer globalmente
window.DocumentsSystem = DocumentsSystem;
