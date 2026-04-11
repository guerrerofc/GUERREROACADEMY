/**
 * GENERADOR DE PDF PARA DOCUMENTOS FIRMADOS
 * Guerrero Academy
 * 
 * Usa jsPDF para generar PDFs de documentos firmados
 */

const DocumentsPDF = (function() {
    
    // Cargar jsPDF dinámicamente si no está cargado
    async function loadJsPDF() {
        if (window.jspdf) return window.jspdf.jsPDF;
        if (window.jsPDF) return window.jsPDF;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                resolve(window.jspdf.jsPDF);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Generar PDF de un documento firmado
     */
    async function generateSignedDocumentPDF(signature, template, playerData) {
        const jsPDF = await loadJsPDF();
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = margin;
        
        // ========== ENCABEZADO ==========
        doc.setFillColor(29, 29, 31);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('GUERRERO ACADEMY', pageWidth / 2, 18, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Documento Oficial', pageWidth / 2, 28, { align: 'center' });
        
        yPos = 55;
        
        // ========== TÍTULO DEL DOCUMENTO ==========
        doc.setTextColor(29, 29, 31);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(template.title || 'Documento', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(134, 134, 139);
        doc.text(`Versión ${template.version || 1}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
        
        // ========== INFORMACIÓN DEL JUGADOR ==========
        doc.setFillColor(245, 245, 247);
        doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
        
        doc.setTextColor(29, 29, 31);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DEL JUGADOR', margin + 10, yPos + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Jugador: ${playerData?.nombre || playerData?.name || 'N/A'}`, margin + 10, yPos + 20);
        doc.text(`Categoría: ${playerData?.categories?.name || 'N/A'}`, margin + 100, yPos + 20);
        doc.text(`Tutor: ${playerData?.tutor_nombre || 'N/A'}`, margin + 10, yPos + 28);
        doc.text(`Email: ${playerData?.tutor_email || 'N/A'}`, margin + 100, yPos + 28);
        
        yPos += 45;
        
        // ========== CONTENIDO DEL DOCUMENTO ==========
        doc.setFontSize(9);
        doc.setTextColor(61, 61, 63);
        
        // Limpiar HTML y convertir a texto
        const cleanContent = stripHtml(template.content || '');
        const processedContent = processPlaceholders(cleanContent, signature, playerData);
        
        // Dividir en líneas
        const lines = doc.splitTextToSize(processedContent, contentWidth);
        
        // Agregar líneas con paginación automática
        for (let i = 0; i < lines.length; i++) {
            if (yPos > pageHeight - 80) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(lines[i], margin, yPos);
            yPos += 5;
        }
        
        // ========== SECCIÓN DE FIRMA ==========
        // Asegurar que la firma esté en una nueva página si no hay espacio
        if (yPos > pageHeight - 100) {
            doc.addPage();
            yPos = margin;
        }
        
        yPos += 10;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;
        
        doc.setFillColor(245, 245, 247);
        doc.roundedRect(margin, yPos, contentWidth, 70, 3, 3, 'F');
        
        doc.setTextColor(29, 29, 31);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DE LA FIRMA', margin + 10, yPos + 12);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Firmante: ${signature.signer_name}`, margin + 10, yPos + 24);
        doc.text(`Cédula/Pasaporte: ${signature.signer_id_number}`, margin + 10, yPos + 32);
        doc.text(`Rol: ${signature.signer_role || 'Padre/Tutor'}`, margin + 10, yPos + 40);
        doc.text(`Fecha de firma: ${formatDate(signature.signed_at)}`, margin + 10, yPos + 48);
        doc.text(`IP: ${signature.ip_address || 'N/A'}`, margin + 10, yPos + 56);
        
        // Agregar imagen de firma si existe
        if (signature.signature_image_url && signature.signature_image_url.startsWith('data:image')) {
            try {
                doc.addImage(signature.signature_image_url, 'PNG', pageWidth - margin - 60, yPos + 15, 50, 40);
            } catch (e) {
                console.error('Error agregando firma:', e);
            }
        }
        
        yPos += 80;
        
        // ========== PIE DE PÁGINA ==========
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setTextColor(134, 134, 139);
        doc.text(`Documento generado el ${formatDate(new Date())}`, margin, footerY);
        doc.text(`ID: ${signature.id || 'N/A'}`, pageWidth - margin, footerY, { align: 'right' });
        
        // Línea del pie
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        return doc;
    }
    
    /**
     * Limpiar HTML y convertir a texto plano
     */
    function stripHtml(html) {
        // Reemplazar tags de bloque con saltos de línea
        let text = html
            .replace(/<h[1-6][^>]*>/gi, '\n\n')
            .replace(/<\/h[1-6]>/gi, '\n')
            .replace(/<p[^>]*>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<li[^>]*>/gi, '\n• ')
            .replace(/<\/li>/gi, '')
            .replace(/<ul[^>]*>/gi, '\n')
            .replace(/<\/ul>/gi, '\n')
            .replace(/<ol[^>]*>/gi, '\n')
            .replace(/<\/ol>/gi, '\n')
            .replace(/<div[^>]*>/gi, '\n')
            .replace(/<\/div>/gi, '\n');
        
        // Remover todos los demás tags
        text = text.replace(/<[^>]+>/g, '');
        
        // Decodificar entidades HTML
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        text = textarea.value;
        
        // Limpiar espacios múltiples y líneas
        text = text
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
        
        return text;
    }
    
    /**
     * Procesar placeholders con datos reales
     */
    function processPlaceholders(content, signature, playerData) {
        const paymentData = signature.payment_data || {};
        
        const replacements = {
            '{{TUTOR_NAME}}': signature.signer_name || playerData?.tutor_nombre || '',
            '{{TUTOR_ID}}': signature.signer_id_number || '',
            '{{PLAYER_NAME}}': playerData?.nombre || playerData?.name || '',
            '{{CATEGORY}}': playerData?.categories?.name || '',
            '{{INSCRIPTION_DATE}}': formatDate(signature.signed_at),
            '{{INSCRIPTION_AMOUNT}}': (paymentData.inscription_amount || 3500).toLocaleString('es-DO'),
            '{{MONTHLY_AMOUNT}}': (paymentData.monthly_amount || 4000).toLocaleString('es-DO'),
            '{{PAYMENT_DAY}}': (paymentData.payment_day || 30).toString()
        };
        
        let result = content;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
        }
        
        return result;
    }
    
    /**
     * Formatear fecha
     */
    function formatDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Descargar PDF de un documento firmado
     */
    async function downloadSignedDocument(signatureId, supabaseClient) {
        try {
            // Obtener datos de la firma
            const { data: signature, error: sigError } = await supabaseClient
                .from('document_signatures')
                .select('*, document_templates(*)')
                .eq('id', signatureId)
                .single();
            
            if (sigError) throw sigError;
            
            // Obtener datos del jugador
            const { data: player, error: playerError } = await supabaseClient
                .from('players')
                .select('*, categories(name)')
                .eq('id', signature.player_id)
                .single();
            
            if (playerError) throw playerError;
            
            // Generar PDF
            const doc = await generateSignedDocumentPDF(
                signature,
                signature.document_templates,
                player
            );
            
            // Descargar
            const fileName = `${signature.document_templates.name}_${player.nombre || 'jugador'}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            return true;
            
        } catch (err) {
            console.error('Error generando PDF:', err);
            alert('Error al generar el PDF: ' + err.message);
            return false;
        }
    }
    
    /**
     * Generar todos los PDFs de un jugador
     */
    async function downloadAllPlayerDocuments(playerId, supabaseClient) {
        try {
            // Obtener todas las firmas del jugador
            const { data: signatures, error: sigError } = await supabaseClient
                .from('document_signatures')
                .select('*, document_templates(*)')
                .eq('player_id', playerId)
                .eq('status', 'signed');
            
            if (sigError) throw sigError;
            if (!signatures || signatures.length === 0) {
                alert('No hay documentos firmados para este jugador');
                return false;
            }
            
            // Obtener datos del jugador
            const { data: player, error: playerError } = await supabaseClient
                .from('players')
                .select('*, categories(name)')
                .eq('id', playerId)
                .single();
            
            if (playerError) throw playerError;
            
            // Generar y descargar cada PDF
            for (const signature of signatures) {
                const doc = await generateSignedDocumentPDF(
                    signature,
                    signature.document_templates,
                    player
                );
                
                const fileName = `${signature.document_templates.name}_${player.nombre || 'jugador'}.pdf`;
                doc.save(fileName);
                
                // Pequeña pausa entre descargas
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            return true;
            
        } catch (err) {
            console.error('Error generando PDFs:', err);
            alert('Error al generar los PDFs: ' + err.message);
            return false;
        }
    }
    
    /**
     * Previsualizar PDF en nueva ventana
     */
    async function previewSignedDocument(signatureId, supabaseClient) {
        try {
            const { data: signature, error: sigError } = await supabaseClient
                .from('document_signatures')
                .select('*, document_templates(*)')
                .eq('id', signatureId)
                .single();
            
            if (sigError) throw sigError;
            
            const { data: player, error: playerError } = await supabaseClient
                .from('players')
                .select('*, categories(name)')
                .eq('id', signature.player_id)
                .single();
            
            if (playerError) throw playerError;
            
            const doc = await generateSignedDocumentPDF(
                signature,
                signature.document_templates,
                player
            );
            
            // Abrir en nueva ventana
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
            
            return true;
            
        } catch (err) {
            console.error('Error previsualizando PDF:', err);
            alert('Error al previsualizar: ' + err.message);
            return false;
        }
    }
    
    // API pública
    return {
        generateSignedDocumentPDF,
        downloadSignedDocument,
        downloadAllPlayerDocuments,
        previewSignedDocument
    };
    
})();

// Exponer globalmente
window.DocumentsPDF = DocumentsPDF;
