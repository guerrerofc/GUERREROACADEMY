// ========================================
// GESTIÓN AVANZADA DE CATEGORÍAS - JUGADORES
// ========================================

console.log('👥 Módulo de gestión de jugadores por categoría cargado');

// ========================================
// MODAL: VER JUGADORES DE CATEGORÍA
// ========================================
function createCategoryPlayersModal() {
  const modalHTML = `
    <div class="modal" id="categoryPlayersModal">
      <div class="modal-content" style="max-width: 1000px; max-height: 85vh;">
        <div class="modal-header">
          <div>
            <h3 id="categoryPlayersTitle">Jugadores de la Categoría</h3>
            <p id="categoryPlayersSubtitle" style="font-size: 13px; color: var(--text-dim); margin-top: 4px;"></p>
          </div>
          <button class="btn btn-sm" onclick="closeModal('categoryPlayersModal')">✕</button>
        </div>
        
        <div class="modal-body" style="padding: 0;">
          <!-- Estadísticas de la categoría -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 20px; background: var(--bg-glass); border-bottom: 1px solid var(--border);">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: var(--accent);" id="catStatTotal">0</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">TOTAL JUGADORES</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #10b981;" id="catStatCapacity">0%</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">CAPACIDAD</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #3b82f6;" id="catStatAvgAge">0</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">EDAD PROMEDIO</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #f59e0b;" id="catStatRevenue">$0</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">INGRESOS/MES</div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm" id="btnSendCategoryAnnouncement">
              📢 Enviar Anuncio a Padres
            </button>
            <button class="btn btn-sm" id="btnExportCategoryPlayers">
              📊 Exportar Lista (CSV)
            </button>
            <button class="btn btn-sm" id="btnViewCategoryMorosos">
              ⚠️ Ver Morosos
            </button>
          </div>

          <!-- Lista de jugadores -->
          <div style="padding: 20px; max-height: 400px; overflow-y: auto;">
            <div id="categoryPlayersList"></div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn" onclick="closeModal('categoryPlayersModal')">Cerrar</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ========================================
// ABRIR MODAL DE JUGADORES
// ========================================
window.viewCategoryPlayers = async function(categoryId, categoryName) {
  console.log('👥 Abriendo vista de jugadores para categoría:', categoryId);
  
  const sb = window.sb;
  if (!sb) {
    alert('Error: Supabase no disponible');
    return;
  }

  // Abrir modal
  if (!document.getElementById('categoryPlayersModal')) {
    createCategoryPlayersModal();
  }

  document.getElementById('categoryPlayersTitle').textContent = `Jugadores de ${categoryName}`;
  openModal('categoryPlayersModal');

  // Cargar datos
  await loadCategoryPlayers(categoryId, categoryName);
  
  // Bind eventos de botones
  bindCategoryActions(categoryId, categoryName);
};

// ========================================
// CARGAR JUGADORES DE LA CATEGORÍA
// ========================================
async function loadCategoryPlayers(categoryId, categoryName) {
  const sb = window.sb;
  const playersList = document.getElementById('categoryPlayersList');
  
  try {
    playersList.innerHTML = '<p style="text-align:center; color: var(--text-dim);">Cargando jugadores...</p>';

    console.log('📋 Cargando jugadores para categoría:', categoryId);

    // Obtener jugadores usando player_categories (relación many-to-many)
    const { data: playerCategoryData, error: pcError } = await sb
      .from('player_categories')
      .select(`
        player_id,
        players (
          id,
          nombre,
          tutor_nombre,
          tutor_whatsapp,
          es_portero,
          status,
          category_id,
          created_at
        )
      `)
      .eq('category_id', categoryId);

    if (pcError) {
      console.error('❌ Error cargando desde player_categories:', pcError);
      throw pcError;
    }

    // Extraer y filtrar jugadores activos
    const players = (playerCategoryData || [])
      .map(pc => pc.players)
      .filter(p => p && p.status === 'activo');

    console.log(`✅ ${players.length} jugadores cargados`);

    // Obtener datos de la categoría
    const { data: category } = await sb
      .from('categories')
      .select('max_players, monthly_fee')
      .eq('id', categoryId)
      .single();

    if (!players || players.length === 0) {
      playersList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-dim);">
          <div style="font-size: 48px; margin-bottom: 12px;">⚽</div>
          <p>No hay jugadores en esta categoría aún</p>
        </div>
      `;
      
      // Actualizar stats con 0 - Verificar que los elementos existan
      const statTotal = document.getElementById('catStatTotal');
      const statCapacity = document.getElementById('catStatCapacity');
      const statAvgAge = document.getElementById('catStatAvgAge');
      const statRevenue = document.getElementById('catStatRevenue');
      const playersSubtitle = document.getElementById('categoryPlayersSubtitle');
      
      if (statTotal) statTotal.textContent = '0';
      if (statCapacity) statCapacity.textContent = '0%';
      if (statAvgAge) statAvgAge.textContent = '-';
      if (statRevenue) statRevenue.textContent = '$0.00';
      if (playersSubtitle) playersSubtitle.textContent = `0 / ${category?.max_players || 30} jugadores`;
      
      console.log('📊 Estadísticas actualizadas (sin jugadores)');
      return;
    }

    // Calcular estadísticas
    const totalPlayers = players.length;
    const maxPlayers = category?.max_players || 30;
    const capacity = Math.round((totalPlayers / maxPlayers) * 100);
    const monthlyRevenue = (category?.monthly_fee || 0) * totalPlayers;

    // Actualizar stats - Verificar que los elementos existan
    const statTotal = document.getElementById('catStatTotal');
    const statCapacity = document.getElementById('catStatCapacity');
    const statAvgAge = document.getElementById('catStatAvgAge');
    const statRevenue = document.getElementById('catStatRevenue');
    const playersSubtitle = document.getElementById('categoryPlayersSubtitle');

    if (statTotal) statTotal.textContent = totalPlayers;
    if (statCapacity) statCapacity.textContent = `${capacity}%`;
    if (statAvgAge) statAvgAge.textContent = '-'; // No tenemos edad en BD
    if (statRevenue) statRevenue.textContent = `$${monthlyRevenue.toLocaleString('es-DO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (playersSubtitle) playersSubtitle.textContent = `${totalPlayers} / ${maxPlayers} jugadores`;

    console.log('📊 Estadísticas actualizadas:', { totalPlayers, capacity: `${capacity}%`, monthlyRevenue });

    // Renderizar lista de jugadores
    playersList.innerHTML = players.map(player => `
      <div style="
        display: grid; 
        grid-template-columns: 48px 1fr auto auto; 
        gap: 16px; 
        align-items: center; 
        padding: 16px; 
        background: var(--bg-glass); 
        border: 1px solid var(--border); 
        border-radius: 12px; 
        margin-bottom: 12px;
      ">
        <div style="
          width: 48px; 
          height: 48px; 
          border-radius: 50%; 
          background: var(--gradient); 
          display: grid; 
          place-items: center; 
          font-weight: 700; 
          font-size: 18px;
        ">
          ${player.nombre ? player.nombre.charAt(0).toUpperCase() : '?'}
        </div>
        
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">
            ${player.nombre || 'Sin nombre'}
            ${player.es_portero ? '<span style="margin-left: 8px; padding: 2px 8px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; border-radius: 6px; font-size: 10px; font-weight: 700;">🧤 PORTERO</span>' : ''}
          </div>
          <div style="font-size: 12px; color: var(--text-dim);">
            Padre: ${player.tutor_nombre || 'No asignado'}
          </div>
        </div>
        
        <div>
          <select 
            class="input" 
            style="font-size: 12px; padding: 8px 12px;" 
            onchange="changeCategoryPlayer('${player.id}', this.value, '${categoryId}')"
          >
            <option value="">Cambiar categoría...</option>
          </select>
        </div>
        
        <div>
          <button 
            class="btn btn-sm" 
            onclick="viewPlayerDetail('${player.id}')" 
            style="font-size: 11px;"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    `).join('');

    // Cargar opciones de categorías en los selects
    loadCategoriesForSelect(categoryId);

  } catch (error) {
    console.error('❌ Error cargando jugadores:', error);
    playersList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--danger);">
        <p>Error al cargar jugadores: ${error.message}</p>
      </div>
    `;
  }
}

// ========================================
// CARGAR CATEGORÍAS PARA SELECT
// ========================================
async function loadCategoriesForSelect(currentCategoryId) {
  const sb = window.sb;
  if (!sb) return;

  try {
    const { data: categories, error } = await sb
      .from('categories')
      .select('id, name')
      .neq('id', currentCategoryId)
      .eq('status', 'active')
      .order('name');

    if (error) throw error;

    const selects = document.querySelectorAll('#categoryPlayersList select');
    const options = categories.map(cat => 
      `<option value="${cat.id}">${cat.name}</option>`
    ).join('');

    selects.forEach(select => {
      select.innerHTML = '<option value="">Cambiar categoría...</option>' + options;
    });

  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// ========================================
// CAMBIAR JUGADOR DE CATEGORÍA
// ========================================
window.changeCategoryPlayer = async function(playerId, newCategoryId, currentCategoryId) {
  if (!newCategoryId) return;

  const sb = window.sb;
  if (!sb) return;

  const confirmed = confirm('¿Estás seguro de cambiar este jugador de categoría?');
  if (!confirmed) {
    // Resetear select
    event.target.value = '';
    return;
  }

  try {
    const { error } = await sb
      .from('players')
      .update({ category_id: newCategoryId })
      .eq('id', playerId);

    if (error) throw error;

    alert('✅ Jugador movido a nueva categoría');
    
    // Recargar lista
    const categoryName = document.getElementById('categoryPlayersTitle').textContent.replace('Jugadores de ', '');
    await loadCategoryPlayers(currentCategoryId, categoryName);

  } catch (error) {
    console.error('Error moviendo jugador:', error);
    alert('Error al mover jugador: ' + error.message);
    event.target.value = '';
  }
};

// ========================================
// BIND ACCIONES DE CATEGORÍA
// ========================================
function bindCategoryActions(categoryId, categoryName) {
  // Botón enviar anuncio
  const btnAnnouncement = document.getElementById('btnSendCategoryAnnouncement');
  if (btnAnnouncement) {
    btnAnnouncement.onclick = () => sendCategoryAnnouncement(categoryId, categoryName);
  }

  // Botón exportar
  const btnExport = document.getElementById('btnExportCategoryPlayers');
  if (btnExport) {
    btnExport.onclick = () => exportCategoryPlayers(categoryId, categoryName);
  }

  // Botón ver morosos
  const btnMorosos = document.getElementById('btnViewCategoryMorosos');
  if (btnMorosos) {
    btnMorosos.onclick = () => viewCategoryMorosos(categoryId, categoryName);
  }
}

// ========================================
// ENVIAR ANUNCIO A PADRES DE CATEGORÍA
// ========================================
async function sendCategoryAnnouncement(categoryId, categoryName) {
  console.log(`📢 Abriendo modal de anuncios para ${categoryName}`);
  
  // Cerrar modal de jugadores
  if (window.closeModal) {
    window.closeModal('categoryPlayersModal');
  }
  
  // Abrir modal de anuncios
  if (window.openModal) {
    window.openModal('announcementModal');
  } else {
    alert('Error: Sistema de anuncios no disponible');
  }
  
  // TODO: Pre-seleccionar padres de esta categoría
}

// ========================================
// EXPORTAR LISTA DE JUGADORES (CSV)
// ========================================
async function exportCategoryPlayers(categoryId, categoryName) {
  const sb = window.sb;
  if (!sb) return;

  try {
    const { data: players, error } = await sb
      .from('players')
      .select('nombre, age, tutor_nombre, tutor_email, tutor_whatsapp')
      .eq('category_id', categoryId)
      .order('nombre');

    if (error) throw error;

    if (!players || players.length === 0) {
      alert('No hay jugadores para exportar');
      return;
    }

    // Crear CSV
    let csv = 'Nombre Jugador,Edad,Nombre Padre,Email Padre,Teléfono Padre\n';
    
    players.forEach(player => {
      csv += `"${player.nombre || ''}",`;
      csv += `"${player.age || ''}",`;
      csv += `"${player.tutor_nombre || ''}",`;
      csv += `"${player.tutor_email || ''}",`;
      csv += `"${player.tutor_whatsapp || ''}"\n`;
    });

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `jugadores_${categoryName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Lista exportada correctamente');

  } catch (error) {
    console.error('Error exportando:', error);
    alert('Error al exportar lista: ' + error.message);
  }
}

// ========================================
// VER MOROSOS DE CATEGORÍA
// ========================================
async function viewCategoryMorosos(categoryId, categoryName) {
  console.log(`⚠️ Mostrando morosos de ${categoryName}`);
  
  // Cerrar modal de jugadores
  if (window.closeModal) {
    window.closeModal('categoryPlayersModal');
  }
  
  // Cambiar a vista de morosos
  if (window.showView) {
    window.showView('morosos');
  }
  
  // Cargar morosos filtrados por categoría
  if (window.loadMorosos) {
    await window.loadMorosos(categoryId);
  } else {
    alert('Error: Sistema de morosos no disponible');
  }
}

// ========================================
// VER DETALLE DE JUGADOR
// ========================================
window.viewPlayerDetail = function(playerId) {
  console.log('Ver detalle de jugador:', playerId);
  
  // Cerrar modal actual
  if (window.closeModal) {
    window.closeModal('categoryPlayersModal');
  }
  
  // Abrir modal de edición de jugador
  if (window.editPlayer) {
    window.editPlayer(playerId);
  } else {
    alert('Error: Sistema de edición de jugadores no disponible');
  }
};

console.log('✅ Módulo de jugadores por categoría listo');
