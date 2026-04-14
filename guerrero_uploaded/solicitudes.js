// ========================================
// SISTEMA DE SOLICITUDES - GUERRERO ACADEMY
// ========================================
// Añade este código al final de app.js

// Función para guardar solicitudes en la nueva tabla
async function guardarSolicitudInscripcion(datos) {
  const { padre, whatsapp, jugador, edad, categoria, esPortero } = datos;
  
  const payload = {
    tutor_nombre: padre,
    tutor_whatsapp: whatsapp,
    jugador_nombre: jugador,
    jugador_edad: edad,
    category_name: categoria,
    es_portero: esPortero || false,
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
  if (typeof sb === 'undefined' && typeof window.sb !== 'undefined') {
    // Intentar desde window
    var sb = window.sb;
  }
  
  if (typeof sb === 'undefined') {
    console.warn('⚠️ sb no está definido aún, reintentando...');
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
            <th>Email</th>
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
              <td><small>${s.tutor_email || '-'}</small></td>
              <td>
                <a href="https://wa.me/1${s.tutor_whatsapp}" target="_blank" class="btn-link">
                  ${s.tutor_whatsapp}
                </a>
              </td>
              <td><strong>${s.jugador_nombre}</strong></td>
              <td>${s.jugador_edad} años</td>
              <td>${s.category_name}${s.es_portero ? ' <span style="color: #D87093; font-weight: 700;">🧤 Portero</span>' : ''}</td>
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
  if (!confirm('¿Aprobar esta solicitud y crear el jugador? Se enviará un email al padre para que establezca su contraseña.')) return;

  try {
    // 1. Obtener datos de la solicitud
    const { data: solicitud, error: fetchError } = await sb
      .from('inscription_requests')
      .select('*')
      .eq('id', solicitudId)
      .single();

    if (fetchError) throw fetchError;

    if (!solicitud.tutor_email) {
      alert('❌ Esta solicitud no tiene email registrado. No se puede crear cuenta de padre.');
      return;
    }

    // 2. Obtener ID de la categoría solicitada
    // Primero intentar match exacto, luego buscar por rango de edad
    let categoryId = null;
    let categoriaData = null;
    
    // Intento 1: Match exacto del nombre
    const { data: exactMatch } = await sb
      .from('categories')
      .select('id, name')
      .eq('name', solicitud.category_name)
      .maybeSingle();
    
    if (exactMatch) {
      categoryId = exactMatch.id;
      console.log(`✅ Categoría encontrada (match exacto): ${exactMatch.name} (ID: ${categoryId})`);
    } else {
      // Intento 2: Buscar todas las categorías y hacer match flexible
      const { data: allCategories } = await sb
        .from('categories')
        .select('id, name, age_min, age_max')
        .eq('status', 'active');
      
      // Extraer edad de la solicitud (ej: "14-17 años" -> buscar 14 y 17)
      const edadMatch = solicitud.category_name.match(/(\d+)/g);
      
      if (edadMatch && allCategories) {
        const edadSolicitada = parseInt(edadMatch[0]);
        
        // Buscar categoría que contenga esa edad en su rango
        const matchedCat = allCategories.find(cat => {
          if (cat.age_min && cat.age_max) {
            return edadSolicitada >= cat.age_min && edadSolicitada <= cat.age_max;
          }
          return false;
        });
        
        if (matchedCat) {
          categoryId = matchedCat.id;
          console.log(`✅ Categoría encontrada (por edad): ${matchedCat.name} (ID: ${categoryId})`);
        }
      }
      
      // Si aún no encontró, mostrar categorías disponibles
      if (!categoryId) {
        console.error('❌ Categorías disponibles:', allCategories?.map(c => c.name).join(', '));
        throw new Error(`No se encontró la categoría: "${solicitud.category_name}". Categorías disponibles: ${allCategories?.map(c => c.name).join(', ')}`);
      }
    }

    // 3. Crear jugador en la tabla players
    const { data: jugador, error: playerError} = await sb
      .from('players')
      .insert([{
        nombre: solicitud.jugador_nombre,
        tutor_nombre: solicitud.tutor_nombre,
        tutor_whatsapp: solicitud.tutor_whatsapp,
        es_portero: solicitud.es_portero || false,
        category_id: categoryId, // Mantener por compatibilidad
        status: 'activo'
      }])
      .select();

    if (playerError) throw playerError;

    const playerId = jugador[0].id;
    console.log(`✅ Jugador creado: ${jugador[0].nombre} (ID: ${playerId})`);

    // 4. Asignar a categoría(s) usando player_categories
    const categoriasAAsignar = [categoryId];
    
    // Si es portero, agregar también a categoría "Porteros"
    if (solicitud.es_portero) {
      const { data: categoriaPorteros } = await sb
        .from('categories')
        .select('id')
        .eq('name', 'Porteros')
        .single();
      
      if (categoriaPorteros) {
        categoriasAAsignar.push(categoriaPorteros.id);
        console.log('✅ Jugador será agregado a categoría Porteros también');
      }
    }

    // Insertar en player_categories (relación many-to-many)
    const playerCategoriesData = categoriasAAsignar.map(catId => ({
      player_id: playerId,
      category_id: catId
    }));

    const { error: pcError } = await sb
      .from('player_categories')
      .insert(playerCategoriesData);

    if (pcError) {
      console.error('⚠️ Error asignando categorías:', pcError);
      // No hacemos throw aquí para no bloquear la aprobación
    } else {
      console.log(`✅ Jugador asignado a ${categoriasAAsignar.length} categoría(s)`);
    }

    // 3. Generar token único para invitación
    const token = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    // 4. Guardar invitación (UPSERT para evitar conflictos)
    // Si ya existe una invitación para este email, se actualiza con nuevo token
    const { error: inviteError } = await sb
      .from('parent_invitations')
      .upsert([{
        email: solicitud.tutor_email,
        player_id: playerId,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false,
        used_at: null
      }], {
        onConflict: 'email' // Actualizar si el email ya existe
      });

    if (inviteError) {
      console.error('❌ Error creando invitación:', inviteError);
      alert(`⚠️ Jugador creado pero hubo un problema con la invitación: ${inviteError.message}`);
      return;
    }
    
    console.log('✅ Invitación creada/actualizada correctamente');

    // 5. Enviar email de bienvenida usando nuestra API de Vercel
    try {
      const inviteLink = `${window.location.origin}/establecer-password.html?token=${token}`;
      
      // Llamar a nuestra API en Vercel (sin CORS)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: solicitud.tutor_email,
          nombre: solicitud.tutor_nombre,
          playerName: solicitud.jugador_nombre,
          magicLink: inviteLink
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error enviando email');
      }

      const result = await response.json();
      console.log('✅ Email de bienvenida enviado:', result);
    } catch (emailError) {
      console.error('⚠️  Error enviando email:', emailError);
      alert(`⚠️ Jugador creado pero no se pudo enviar el email a ${solicitud.tutor_email}. Error: ${emailError.message}`);
    }

    // 6. Aprobar solicitud
    await aprobarSolicitud(solicitudId);

    alert(`✅ Solicitud aprobada!\n\n- Jugador creado: ${solicitud.jugador_nombre}\n- Email enviado a: ${solicitud.tutor_email}`);
    
    // Recargar tabla
    const solicitudes = await cargarSolicitudes('pending');
    const contenedor = document.getElementById('tablaSolicitudes');
    renderizarTablaSolicitudes(solicitudes, contenedor);
    
    // Actualizar badge en super-admin
    if (window.updateRequestsBadge) {
      window.updateRequestsBadge();
    }

  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al procesar solicitud: ' + error.message);
  }
}

// Generar token aleatorio seguro
function generateRandomToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
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
    
    // Actualizar badge en super-admin
    if (window.updateRequestsBadge) {
      window.updateRequestsBadge();
    }
  } else {
    alert('❌ Error al rechazar solicitud');
  }
}

// Inicializar panel de solicitudes si existe (solo en super-admin)
(async function initSolicitudes() {
  console.log('🔍 Verificando si hay panel de solicitudes...');
  
  const contenedor = document.getElementById('tablaSolicitudes');
  if (!contenedor) {
    console.log('ℹ️ No hay panel de solicitudes (esto es normal en el landing)');
    return;
  }

  console.log('✅ Panel de solicitudes encontrado, inicializando...');

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
})();

console.log('✅ Sistema de solicitudes cargado');
