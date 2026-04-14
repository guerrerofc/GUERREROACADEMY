// ========================================
// SISTEMA DE EMAILS - GUERRERO ACADEMY
// Integración con Resend via Vercel API
// ========================================

const EmailSystem = {
  // URL base del API (Vercel serverless)
  apiUrl: '/api/send-email',

  // Enviar email genérico
  async send(type, body) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, body })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error enviando email:', result);
        return { success: false, error: result.error || 'Error desconocido' };
      }

      console.log('Email enviado:', result);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error de red al enviar email:', error);
      return { success: false, error: error.message };
    }
  },

  // =============================================
  // FUNCIONES ESPECÍFICAS
  // =============================================

  // 1. Email de bienvenida a nuevo padre
  async sendWelcome({ email, nombre, playerName, magicLink }) {
    return this.send('welcome', { email, nombre, playerName, magicLink });
  },

  // 2. Anuncio a todos los padres
  async sendAnnouncement({ title, content, emails }) {
    return this.send('announcement', { title, content, emails });
  },

  // 3. Recordatorio de pago
  async sendPaymentReminder({ email, nombre, playerName, amount, month }) {
    return this.send('payment_reminder', { email, nombre, playerName, amount, month });
  },

  // 4. Confirmación de pago
  async sendPaymentConfirmation({ email, nombre, playerName, amount, method, month }) {
    return this.send('payment_confirmation', { email, nombre, playerName, amount, method, month });
  },

  // =============================================
  // FUNCIONES MASIVAS
  // =============================================

  // Enviar anuncio a todos los padres de la academia
  async broadcastAnnouncement(title, content) {
    const sb = window.sb;
    if (!sb) return { success: false, error: 'Supabase no disponible' };

    // Obtener emails de todos los padres
    const { data: parents } = await sb
      .from('users')
      .select('email')
      .eq('rol', 'parent');

    // También obtener emails de tutores de jugadores activos
    const { data: players } = await sb
      .from('players')
      .select('tutor_email')
      .eq('status', 'activo');

    // Combinar y deduplicar emails
    const emailSet = new Set();
    (parents || []).forEach(p => { if (p.email) emailSet.add(p.email); });
    (players || []).forEach(p => { if (p.tutor_email) emailSet.add(p.tutor_email); });

    const emails = Array.from(emailSet);

    if (emails.length === 0) {
      return { success: false, error: 'No hay padres registrados con email' };
    }

    console.log(`Enviando anuncio "${title}" a ${emails.length} padres...`);
    return this.sendAnnouncement({ title, content, emails });
  },

  // Enviar recordatorio de pago a todos los morosos
  async sendBulkPaymentReminders() {
    const sb = window.sb;
    if (!sb) return { success: false, error: 'Supabase no disponible' };

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const monthName = new Date().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });

    // Obtener pagos del mes
    const { data: payments } = await sb
      .from('payments')
      .select('player_id')
      .eq('month', currentMonth)
      .eq('status', 'paid');

    const paidIds = new Set((payments || []).map(p => p.player_id));

    // Obtener jugadores activos no pagados
    const { data: players } = await sb
      .from('players')
      .select('id, nombre, tutor_nombre, tutor_email, agreed_monthly_fee')
      .eq('status', 'activo');

    const morosos = (players || []).filter(p => !paidIds.has(p.id) && p.tutor_email);

    if (morosos.length === 0) {
      return { success: false, error: 'No hay morosos con email registrado' };
    }

    let sent = 0;
    let failed = 0;

    for (const m of morosos) {
      const result = await this.sendPaymentReminder({
        email: m.tutor_email,
        nombre: m.tutor_nombre || 'Padre/Madre',
        playerName: m.nombre,
        amount: Number(m.agreed_monthly_fee || 4000).toLocaleString('es-DO'),
        month: monthName
      });

      if (result.success) sent++;
      else failed++;
    }

    return { success: true, sent, failed, total: morosos.length };
  }
};

// Exponer globalmente
window.EmailSystem = EmailSystem;

console.log('Email system loaded (Resend)');
