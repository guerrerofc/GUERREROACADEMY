// ========================================
// SISTEMA DE ANUNCIOS CON EMAIL
// Usa EmailSystem (email-system.js)
// ========================================

// Función para enviar anuncio por email a todos los padres
async function enviarAnuncioPorEmail(titulo, contenido) {
  if (!window.EmailSystem) {
    console.error('EmailSystem no cargado');
    return { success: false, error: 'Sistema de email no disponible' };
  }

  return window.EmailSystem.broadcastAnnouncement(titulo, contenido);
}

// Interceptar el guardado de anuncios para enviar emails automáticamente
async function crearAnuncioConEmail(titulo, contenido) {
  const sb = window.sb;
  if (!sb) {
    alert('Error: Supabase no disponible');
    return;
  }

  try {
    // 1. Guardar anuncio en la base de datos
    const { data, error } = await sb
      .from('announcements')
      .insert([{
        title: titulo,
        content: contenido,
        status: 'approved',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    // 2. Enviar por email a todos los padres
    console.log('Enviando anuncio por email a los padres...');
    const emailResult = await enviarAnuncioPorEmail(titulo, contenido);

    if (emailResult.success) {
      alert('Anuncio creado y enviado por email exitosamente');
    } else {
      alert('Anuncio creado, pero hubo un problema enviando emails: ' + (emailResult.error || 'Error desconocido'));
    }

    return { success: true, data, emailResult };

  } catch (error) {
    console.error('Error creando anuncio:', error);
    alert('Error al crear anuncio: ' + error.message);
    return { success: false, error: error.message };
  }
}

// Exponer funciones globalmente
window.enviarAnuncioPorEmail = enviarAnuncioPorEmail;
window.crearAnuncioConEmail = crearAnuncioConEmail;

console.log('Announcements email system loaded');
