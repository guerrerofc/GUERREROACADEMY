// ========================================
// SISTEMA DE SOLICITUDES - GUERRERO ACADEMY
// ========================================
// Añade este código al final de app.js

// Función para guardar solicitudes en la nueva tabla
async function guardarSolicitudInscripcion(datos) {
  const { padre, whatsapp, jugador, edad, categoria } = datos;
  
  const payload = {
    tutor_nombre: padre,
    tutor_whatsapp: whatsapp,
    jugador_nombre: jugador,
    jugador_edad: edad,
    category_name: categoria,
    status: 'pending'
  };

  try {
    const { data, error } = await sb
      .from('inscription_requests')
      .insert([payload])
      .select();

    if (error) throw error;
    
    console.log('✅ Solicitud guardada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error guardando solicitud:', error);
    return { success: false, error };
  }
}

// Modificar el submit del formulario de inscripción
// Encuentra esta línea en app.js (línea ~455):
//     await createInscripcion(payload);
//
// Y añade ANTES de esa línea:
//     await guardarSolicitudInscripcion({ padre, whatsapp, jugador, edad, categoria });

// ========================================
// PANEL DE SOLICITUDES EN SUPER ADMIN
// ========================================

// Función para cargar solicitudes
async function cargarSolicitudes(filtro = 'pending') {
  console.log(`📡 Cargando solicitudes con filtro: ${filtro}`);
  
  // Verificar que sb exista
  if (typeof sb === 'undefined') {
    console.error('❌ sb no está definido');
    alert('Error: Supabase no está configurado correctamente');
    return [];
  }

  try {
    let query = sb
      .from('inscription_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filtro !== 'all') {
      query = query.eq('status', filtro);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error cargando solicitudes:', error);
      alert('Error cargando solicitudes: ' + error.message);
      return [];
    }
    
    console.log(`✅ Solicitudes cargadas:`, data);
    return data || [];
  } catch (error) {
    console.error('❌ Exception cargando solicitudes:', error);
    alert('Error: ' + error.message);
    return [];
  }
}

// Función para aprobar solicitud
async function aprobarSolicitud(id) {
  try {
    const { data, error } = await sb
      .from('inscription_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    console.log('✅ Solicitud aprobada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error aprobando solicitud:', error);
    return { success: false, error };
  }
}

// Función para rechazar solicitud
async function rechazarSolicitud(id, razon = '') {
  try {
    const { data, error } = await sb
      .from('inscription_requests')
      .update({
        status: 'rejected',
        admin_notes: razon,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    console.log('✅ Solicitud rechazada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error rechazando solicitud:', error);
    return { success: false, error };
  }
}

// Función para renderizar tabla de solicitudes
function renderizarTablaSolicitudes(solicitudes, contenedor) {
  console.log(`🎨 Renderizando ${solicitudes.length} solicitudes`);
  
  if (!contenedor) {
    console.error('❌ Contenedor no proporcionado');
    return;
  }

  if (solicitudes.length === 0) {
    contenedor.innerHTML = `
      <div style="padding: 60px 20px; text-align: center; color: #6B7280;">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">📋</div>
        <p style="font-size: 16px; font-weight: 600; color: #FFF; margin-bottom: 8px;">
          No hay solicitudes ${document.getElementById('btnPendientes')?.classList.contains('active') ? 'pendientes' : ''}
        </p>
        <p style="font-size: 14px;">
          Las solicitudes del formulario de inscripción aparecerán aquí
        </p>
      </div>
    `;
    return;
  }

  const html = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tutor</th>
            <th>WhatsApp</th>
            <th>Jugador</th>
            <th>Edad</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${solicitudes.map(s => `
            <tr data-id="${s.id}">
              <td>${new Date(s.created_at).toLocaleDateString()}</td>
              <td>${s.tutor_nombre}</td>
              <td>
                <a href="https://wa.me/1${s.tutor_whatsapp}" target="_blank" class="btn-link">
                  ${s.tutor_whatsapp}
                </a>
              </td>
              <td><strong>${s.jugador_nombre}</strong></td>
              <td>${s.jugador_edad} años</td>
              <td>${s.category_name}</td>
              <td>
                <span class="badge badge-${
                  s.status === 'pending' ? 'warning' : 
                  s.status === 'approved' ? 'success' : 'danger'
                }">
                  ${s.status === 'pending' ? 'Pendiente' : 
                    s.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                </span>
              </td>
              <td>
                ${s.status === 'pending' ? `
                  <button class="btn btn-sm btn-success" onclick="aprobarYCrearJugador('${s.id}')">
                    ✓ Aprobar
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="rechazarSolicitudUI('${s.id}')">
                    ✗ Rechazar
                  </button>
                ` : `
                  <span class="text-muted">Procesada</span>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  contenedor.innerHTML = html;
}

// Función para aprobar y crear jugador automáticamente
async function aprobarYCrearJugador(solicitudId) {
  if (!confirm('¿Aprobar esta solicitud y crear el jugador?')) return;

  try {
    // 1. Obtener datos de la solicitud
    const { data: solicitud, error: fetchError } = await sb
      .from('inscription_requests')
      .select('*')
      .eq('id', solicitudId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Crear jugador en la tabla players
    const { data: jugador, error: playerError } = await sb
      .from('players')
      .insert([{
        nombre: solicitud.jugador_nombre,
        tutor_nombre: solicitud.tutor_nombre,
        tutor_whatsapp: solicitud.tutor_whatsapp,
        status: 'activo'
      }])
      .select();

    if (playerError) throw playerError;

    // 3. Aprobar solicitud
    await aprobarSolicitud(solicitudId);

    alert('✅ Solicitud aprobada y jugador creado');
    
    // Recargar tabla
    const solicitudes = await cargarSolicitudes('pending');
    const contenedor = document.getElementById('tablaSolicitudes');
    renderizarTablaSolicitudes(solicitudes, contenedor);

  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al procesar solicitud: ' + error.message);
  }
}

// Función para rechazar con UI
async function rechazarSolicitudUI(solicitudId) {
  const razon = prompt('¿Razón del rechazo? (opcional)');
  
  if (razon === null) return; // Usuario canceló
  
  const resultado = await rechazarSolicitud(solicitudId, razon);
  
  if (resultado.success) {
    alert('✅ Solicitud rechazada');
    
    // Recargar tabla
    const solicitudes = await cargarSolicitudes('pending');
    const contenedor = document.getElementById('tablaSolicitudes');
    renderizarTablaSolicitudes(solicitudes, contenedor);
  } else {
    alert('❌ Error al rechazar solicitud');
  }
}

// Inicializar panel de solicitudes si existe
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔍 Inicializando panel de solicitudes...');
  
  const contenedor = document.getElementById('tablaSolicitudes');
  if (!contenedor) {
    console.log('❌ No se encontró tablaSolicitudes');
    return;
  }

  console.log('✅ Contenedor encontrado, cargando solicitudes...');

  // Botones de filtro
  const btnPendientes = document.getElementById('btnPendientes');
  const btnAprobadas = document.getElementById('btnAprobadas');
  const btnRechazadas = document.getElementById('btnRechazadas');
  const btnTodas = document.getElementById('btnTodas');

  // Event listeners para filtros
  if (btnPendientes) {
    btnPendientes.addEventListener('click', async () => {
      console.log('Filtrando pendientes...');
      const solicitudes = await cargarSolicitudes('pending');
      renderizarTablaSolicitudes(solicitudes, contenedor);
    });
  }

  if (btnAprobadas) {
    btnAprobadas.addEventListener('click', async () => {
      console.log('Filtrando aprobadas...');
      const solicitudes = await cargarSolicitudes('approved');
      renderizarTablaSolicitudes(solicitudes, contenedor);
    });
  }

  if (btnRechazadas) {
    btnRechazadas.addEventListener('click', async () => {
      console.log('Filtrando rechazadas...');
      const solicitudes = await cargarSolicitudes('rejected');
      renderizarTablaSolicitudes(solicitudes, contenedor);
    });
  }

  if (btnTodas) {
    btnTodas.addEventListener('click', async () => {
      console.log('Mostrando todas...');
      const solicitudes = await cargarSolicitudes('all');
      renderizarTablaSolicitudes(solicitudes, contenedor);
    });
  }

  // Cargar pendientes por defecto
  console.log('📥 Cargando solicitudes pendientes...');
  const solicitudes = await cargarSolicitudes('pending');
  console.log(`✅ ${solicitudes.length} solicitudes cargadas`);
  renderizarTablaSolicitudes(solicitudes, contenedor);
});

console.log('✅ Sistema de solicitudes cargado');
