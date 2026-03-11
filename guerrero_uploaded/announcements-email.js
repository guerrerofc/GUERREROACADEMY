// ========================================
// SISTEMA DE ANUNCIOS CON EMAIL
// ========================================

// Función para enviar anuncio por email a todos los padres
async function enviarAnuncioPorEmail(titulo, contenido, announcementId) {
  const SUPABASE_URL = 'https://daijiuqqafvjofafwqck.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g';
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-announcement-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        title: titulo,
        content: contenido,
        announcement_id: announcementId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error enviando emails:', error);
      return { success: false, error };
    }

    const result = await response.json();
    console.log('✅ Emails enviados:', result);
    return { success: true, result };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// Interceptar el guardado de anuncios para enviar emails automáticamente
// Esta función debe llamarse después de guardar el anuncio en la BD
async function crearAnuncioConEmail(titulo, contenido) {
  try {
    // 1. Guardar anuncio en la base de datos (código existente)
    const { data, error } = await supabaseClient
      .from('announcements')
      .insert([{
        title: titulo,
        content: contenido,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    const announcementId = data[0]?.id;

    // 2. Enviar por email a todos los padres
    console.log('📧 Enviando anuncio por email a los padres...');
    const emailResult = await enviarAnuncioPorEmail(titulo, contenido, announcementId);

    if (emailResult.success) {
      console.log('✅ Anuncio creado y emails enviados');
      alert('✅ Anuncio publicado y enviado por email a todos los padres');
    } else {
      console.warn('⚠️ Anuncio creado pero error enviando emails:', emailResult.error);
      alert('✅ Anuncio publicado\n⚠️ Hubo un problema enviando los emails');
    }

    return { success: true, data };

  } catch (error) {
    console.error('Error creando anuncio:', error);
    alert('❌ Error creando anuncio: ' + error.message);
    return { success: false, error };
  }
}

// Exportar funciones para uso global
window.enviarAnuncioPorEmail = enviarAnuncioPorEmail;
window.crearAnuncioConEmail = crearAnuncioConEmail;

console.log('✅ Sistema de anuncios con email cargado');
