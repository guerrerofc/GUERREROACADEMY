/**
 * GUERRERO ACADEMY - Sistema de WhatsApp con Twilio
 * Funcionalidades:
 * 1. Enviar facturas después de pago Stripe
 * 2. Enviar anuncios masivos
 * 3. Recordatorios de pago
 * 4. Click-to-chat directo
 */

const WhatsAppSystem = {
  // Configuración
  config: {
    apiEndpoint: '/api/send-whatsapp',
    bulkEndpoint: '/api/send-whatsapp-bulk',
    academyPhone: '18296396001', // Número de la academia
    academyName: 'Guerrero Academy'
  },

  /**
   * Enviar mensaje individual de WhatsApp
   */
  async sendMessage(phone, message, type = 'general') {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message, type })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar WhatsApp');
      }

      return { success: true, ...result };
    } catch (error) {
      console.error('❌ Error WhatsApp:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Enviar mensajes masivos
   */
  async sendBulk(recipients, message, type = 'bulk') {
    try {
      const response = await fetch(this.config.bulkEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, message, type })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar mensajes');
      }

      return { success: true, ...result };
    } catch (error) {
      console.error('❌ Error WhatsApp Bulk:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Enviar factura/recibo después de un pago
   */
  async sendInvoice(paymentData) {
    const { playerName, tutorName, tutorPhone, amount, paymentMethod, paymentDate, receiptId } = paymentData;
    
    const message = `🎉 *GUERRERO ACADEMY*
━━━━━━━━━━━━━━━━━━

✅ *PAGO CONFIRMADO*

👤 Jugador: ${playerName}
💰 Monto: RD$ ${amount.toLocaleString()}
📅 Fecha: ${paymentDate || new Date().toLocaleDateString('es-DO')}
💳 Método: ${paymentMethod}
🧾 Recibo: #${receiptId || Date.now().toString(36).toUpperCase()}

━━━━━━━━━━━━━━━━━━
¡Gracias por tu pago, ${tutorName || 'estimado padre'}! ⚽

📞 Contacto: +1 829-639-6001`;

    return await this.sendMessage(tutorPhone, message, 'invoice');
  },

  /**
   * Enviar recordatorio de pago a morosos
   */
  async sendPaymentReminder(playerData) {
    const { playerName, tutorName, tutorPhone, monthsPending, amount } = playerData;
    
    const message = `⚠️ *GUERRERO ACADEMY*
━━━━━━━━━━━━━━━━━━

📋 *RECORDATORIO DE PAGO*

Hola ${tutorName || 'estimado padre'},

Le recordamos que el pago de la mensualidad de *${playerName}* se encuentra pendiente.

📆 Meses pendientes: ${monthsPending || 1}
💰 Monto mensual: RD$ ${(amount || 3500).toLocaleString()}

Para realizar el pago puede:
1️⃣ Acceder al panel de padres
2️⃣ Pagar en efectivo en la academia
3️⃣ Transferencia bancaria

━━━━━━━━━━━━━━━━━━
¡Gracias por mantenerse al día! ⚽

📞 Contacto: +1 829-639-6001`;

    return await this.sendMessage(tutorPhone, message, 'reminder');
  },

  /**
   * Enviar recordatorio masivo a todos los morosos
   */
  async sendBulkReminders(morososos) {
    const recipients = morososos.map(m => ({
      phone: m.tutor_whatsapp || m.whatsapp,
      name: m.tutor_name || m.tutor
    }));

    const message = `⚠️ *GUERRERO ACADEMY*
━━━━━━━━━━━━━━━━━━

📋 *RECORDATORIO DE PAGO*

Hola {nombre},

Le recordamos que tiene pagos pendientes en Guerrero Academy.

Para ponerse al día:
1️⃣ Acceda a su panel de padres
2️⃣ O contáctenos directamente

━━━━━━━━━━━━━━━━━━
¡Gracias! ⚽

📞 +1 829-639-6001`;

    return await this.sendBulk(recipients, message, 'bulk_reminder');
  },

  /**
   * Enviar anuncio a todos los padres
   */
  async sendAnnouncement(title, content, parents) {
    const recipients = parents.map(p => ({
      phone: p.whatsapp || p.tutor_whatsapp,
      name: p.nombre || p.tutor_name
    })).filter(r => r.phone);

    const message = `📢 *GUERRERO ACADEMY*
━━━━━━━━━━━━━━━━━━

*${title}*

${content}

━━━━━━━━━━━━━━━━━━
⚽ Guerrero Academy
📞 +1 829-639-6001`;

    return await this.sendBulk(recipients, message, 'announcement');
  },

  /**
   * Generar link de click-to-chat
   */
  getClickToChatLink(message = '') {
    const phone = this.config.academyPhone;
    const defaultMsg = message || '¡Hola! Me gustaría obtener información sobre Guerrero Academy ⚽';
    return `https://wa.me/${phone}?text=${encodeURIComponent(defaultMsg)}`;
  },

  /**
   * Generar link para enviar mensaje a un número específico
   */
  getWhatsAppLink(phone, message = '') {
    let cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '1' + cleanPhone;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Mostrar modal de envío de WhatsApp
   */
  showSendModal(options = {}) {
    const { phone, name, type, prefilledMessage } = options;

    // Remover modal existente si hay
    const existingModal = document.getElementById('whatsappModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'whatsappModal';
    modal.className = 'modal show';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3>📱 Enviar WhatsApp</h3>
          <button class="btn btn-sm" onclick="document.getElementById('whatsappModal').remove()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Destinatario</label>
            <input type="text" id="waRecipientName" class="input" value="${name || ''}" placeholder="Nombre" readonly style="background: rgba(0,0,0,0.3);">
          </div>
          <div class="form-group">
            <label>Número de WhatsApp</label>
            <input type="text" id="waRecipientPhone" class="input" value="${phone || ''}" placeholder="8291234567">
          </div>
          <div class="form-group">
            <label>Tipo de mensaje</label>
            <select id="waMessageType" class="select" onchange="WhatsAppSystem.updateMessageTemplate()">
              <option value="custom" ${type === 'custom' ? 'selected' : ''}>Mensaje personalizado</option>
              <option value="reminder" ${type === 'reminder' ? 'selected' : ''}>Recordatorio de pago</option>
              <option value="welcome" ${type === 'welcome' ? 'selected' : ''}>Bienvenida</option>
              <option value="info" ${type === 'info' ? 'selected' : ''}>Información general</option>
            </select>
          </div>
          <div class="form-group">
            <label>Mensaje</label>
            <textarea id="waMessageContent" class="input" rows="6" placeholder="Escribe tu mensaje...">${prefilledMessage || ''}</textarea>
          </div>
          <div id="waStatus" style="display: none; padding: 12px; border-radius: 8px; margin-top: 12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="document.getElementById('whatsappModal').remove()">Cancelar</button>
          <button class="btn" onclick="WhatsAppSystem.openInWhatsApp()" style="background: #25D366; border-color: #25D366;">
            🔗 Abrir en WhatsApp
          </button>
          <button class="btn btn-primary" onclick="WhatsAppSystem.sendFromModal()">
            📤 Enviar vía Twilio
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.updateMessageTemplate();
  },

  /**
   * Actualizar plantilla de mensaje según el tipo seleccionado
   */
  updateMessageTemplate() {
    const type = document.getElementById('waMessageType')?.value;
    const textarea = document.getElementById('waMessageContent');
    const name = document.getElementById('waRecipientName')?.value || 'estimado padre';

    if (!textarea) return;

    const templates = {
      reminder: `⚠️ *GUERRERO ACADEMY*
━━━━━━━━━━━━━━━━━━

📋 *RECORDATORIO DE PAGO*

Hola ${name},

Le recordamos que tiene pagos pendientes en Guerrero Academy.

Para ponerse al día puede acceder a su panel de padres o contactarnos directamente.

━━━━━━━━━━━━━━━━━━
¡Gracias! ⚽
📞 +1 829-639-6001`,

      welcome: `🎉 *GUERRERO ACADEMY*
━━━━━━━━━━━━━━━━━━

*¡BIENVENIDO A LA FAMILIA!*

Hola ${name},

Nos alegra mucho que formes parte de Guerrero Academy. Tu hijo/a ha sido inscrito exitosamente.

📍 Horarios y ubicación en nuestro panel
📱 Descarga nuestra app de padres
💳 Realiza pagos en línea

━━━━━━━━━━━━━━━━━━
⚽ ¡Nos vemos en la cancha!
📞 +1 829-639-6001`,

      info: `ℹ️ *GUERRERO ACADEMY*
━━━━━━━━━━━━━━━━━━

Hola ${name},

Gracias por contactarnos. Aquí está la información que solicitaste:

📍 Ubicación: [Tu ubicación]
🕐 Horarios: Lunes a Viernes
💰 Mensualidad: RD$ 3,500

Para más información, visita nuestro sitio web o escríbenos.

━━━━━━━━━━━━━━━━━━
⚽ Guerrero Academy
📞 +1 829-639-6001`,

      custom: ''
    };

    if (templates[type] !== undefined && type !== 'custom') {
      textarea.value = templates[type];
    }
  },

  /**
   * Abrir chat en WhatsApp Web/App
   */
  openInWhatsApp() {
    const phone = document.getElementById('waRecipientPhone')?.value;
    const message = document.getElementById('waMessageContent')?.value;

    if (!phone) {
      alert('Por favor ingresa un número de teléfono');
      return;
    }

    const link = this.getWhatsAppLink(phone, message);
    window.open(link, '_blank');
  },

  /**
   * Enviar mensaje desde el modal vía Twilio
   */
  async sendFromModal() {
    const phone = document.getElementById('waRecipientPhone')?.value;
    const message = document.getElementById('waMessageContent')?.value;
    const type = document.getElementById('waMessageType')?.value;
    const statusDiv = document.getElementById('waStatus');

    if (!phone || !message) {
      if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(239, 68, 68, 0.15)';
        statusDiv.style.color = '#ef4444';
        statusDiv.innerHTML = '❌ Por favor completa todos los campos';
      }
      return;
    }

    // Mostrar loading
    if (statusDiv) {
      statusDiv.style.display = 'block';
      statusDiv.style.background = 'rgba(59, 130, 246, 0.15)';
      statusDiv.style.color = '#3b82f6';
      statusDiv.innerHTML = '⏳ Enviando mensaje...';
    }

    const result = await this.sendMessage(phone, message, type);

    if (statusDiv) {
      if (result.success) {
        statusDiv.style.background = 'rgba(16, 185, 129, 0.15)';
        statusDiv.style.color = '#10b981';
        statusDiv.innerHTML = `✅ Mensaje enviado exitosamente!<br><small>SID: ${result.messageSid}</small>`;
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          document.getElementById('whatsappModal')?.remove();
        }, 2000);
      } else {
        statusDiv.style.background = 'rgba(239, 68, 68, 0.15)';
        statusDiv.style.color = '#ef4444';
        statusDiv.innerHTML = `❌ Error: ${result.error}`;
      }
    }
  },

  /**
   * Crear botón flotante de WhatsApp para la landing
   */
  createFloatingButton(containerId = 'body') {
    const button = document.createElement('a');
    button.id = 'whatsapp-float-btn';
    button.href = this.getClickToChatLink();
    button.target = '_blank';
    button.innerHTML = `
      <svg viewBox="0 0 32 32" width="32" height="32" fill="white">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.837.74 5.496 2.034 7.807L.071 32l8.391-1.893A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.162 22.482c-.341.961-1.707 1.761-2.77 1.994-.731.16-1.685.287-4.898-.988-4.108-1.633-6.75-5.825-6.955-6.096-.197-.264-1.649-2.195-1.649-4.185 0-1.991 1.046-2.968 1.415-3.376.341-.378.897-.551 1.427-.551.171 0 .324.008.462.015.369.016.554.038.798.615.304.723 1.048 2.552 1.138 2.737.091.185.152.402.03.644-.114.25-.171.402-.341.619-.171.217-.36.483-.513.649-.171.182-.349.38-.15.745.198.357.883 1.455 1.897 2.358 1.303 1.161 2.4 1.522 2.74 1.692.341.171.54.143.738-.086.206-.237.876-1.02 1.109-1.371.226-.341.46-.285.768-.171.315.107 1.991.939 2.332 1.11.341.171.569.257.653.398.084.143.084.822-.257 1.783z"/>
      </svg>
    `;
    button.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      background: #25D366;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
      z-index: 9999;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      text-decoration: none;
    `;

    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 30px rgba(37, 211, 102, 0.6)';
    };

    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.4)';
    };

    const container = containerId === 'body' ? document.body : document.getElementById(containerId);
    if (container) {
      container.appendChild(button);
    }

    return button;
  }
};

// Exponer globalmente
window.WhatsAppSystem = WhatsAppSystem;

// Auto-inicializar en landing pages
document.addEventListener('DOMContentLoaded', () => {
  // Si estamos en la landing, agregar botón flotante
  if (window.location.pathname.includes('landing') || window.location.pathname === '/' || window.location.pathname.includes('index')) {
    // WhatsAppSystem.createFloatingButton(); // Descomentar para activar
  }
});

console.log('📱 WhatsApp System cargado');
