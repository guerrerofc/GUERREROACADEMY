// ========================================
// SISTEMA DE CATEGORÍAS Y REPORTES
// Guerrero Academy
// ========================================

function initCategoriesAndReports() {
  console.log('📊 Inicializando sistema de categorías y reportes...');
  
  // Bind events
  bindCategoryEvents();
  addCategoryModal();
}

function addCategoryModal() {
  const modalHTML = `
    <!-- CATEGORY MODAL -->
    <div class="modal" id="categoryModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="categoryModalTitle">Nueva Categoría</h3>
          <button class="btn btn-sm" onclick="closeModal('categoryModal')">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="editCategoryId">
          
          <div class="form-group">
            <label>Nombre de la Categoría</label>
            <input type="text" id="categoryName" class="input" placeholder="Ej: 8-10 años">
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea id="categoryDescription" class="input" rows="2" placeholder="Descripción opcional..."></textarea>
          </div>

          <div class="form-group">
            <label>Cupo Máximo</label>
            <input type="number" id="categoryMaxPlayers" class="input" placeholder="30" min="1">
          </div>

          <div class="form-group">
            <label>Color (Opcional)</label>
            <input type="color" id="categoryColor" class="input" value="#D87093">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="closeModal('categoryModal')">Cancelar</button>
          <button class="btn btn-primary" id="saveCategory">Guardar Categoría</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function bindCategoryEvents() {
  const btnAddCategory = document.getElementById('btnAddCategory');
  if (btnAddCategory) {
    btnAddCategory.addEventListener('click', () => {
      document.getElementById('categoryModalTitle').textContent = 'Nueva Categoría';
      document.getElementById('editCategoryId').value = '';
      document.getElementById('categoryName').value = '';
      document.getElementById('categoryDescription').value = '';
      document.getElementById('categoryMaxPlayers').value = '30';
      document.getElementById('categoryColor').value = '#D87093';
      openModal('categoryModal');
    });
  }

  // Bind save button with slight delay to ensure it exists
  setTimeout(() => {
    const saveCategoryBtn = document.getElementById('saveCategory');
    if (saveCategoryBtn) {
      saveCategoryBtn.addEventListener('click', saveCategory);
    }
  }, 500);
}

async function saveCategory() {
  const sb = window.sb;
  if (!sb) {
    alert('Error: Supabase no disponible');
    return;
  }

  const id = document.getElementById('editCategoryId').value;
  const name = document.getElementById('categoryName').value.trim();
  const description = document.getElementById('categoryDescription').value.trim();
  const maxPlayers = parseInt(document.getElementById('categoryMaxPlayers').value) || 30;
  const color = document.getElementById('categoryColor').value;

  if (!name) {
    alert('Por favor ingresa un nombre para la categoría');
    return;
  }

  const data = {
    name,
    description,
    max_players: maxPlayers,
    color
  };

  try {
    if (id) {
      const { error } = await sb.from('categories').update(data).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('categories').insert(data);
      if (error) throw error;
    }

    closeModal('categoryModal');
    alert('✅ Categoría guardada correctamente');
    
    // Recargar categorías
    location.reload();
  } catch (error) {
    alert('Error al guardar categoría: ' + error.message);
    console.error(error);
  }
}

window.editCategory = async function(id) {
  console.log('✏️ Editando categoría:', id);
  const sb = window.sb;
  if (!sb) {
    alert('Error: Supabase no disponible');
    return;
  }
  
  const { data: category, error } = await sb.from('categories').select('*').eq('id', id).single();
  
  if (error || !category) {
    alert('Error al cargar categoría: ' + (error?.message || 'No encontrada'));
    console.error('Error:', error);
    return;
  }

  console.log('Categoría cargada:', category);

  document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
  document.getElementById('editCategoryId').value = category.id;
  document.getElementById('categoryName').value = category.name || '';
  document.getElementById('categoryDescription').value = category.description || '';
  document.getElementById('categoryMaxPlayers').value = category.max_players || 30;
  document.getElementById('categoryColor').value = category.color || '#D87093';
  
  openModal('categoryModal');
};

window.deleteCategory = async function(id) {
  console.log('🗑️ Intentando eliminar categoría:', id);
  if (!confirm('¿Eliminar esta categoría? Los jugadores de esta categoría quedarán sin categoría asignada.')) return;

  const sb = window.sb;
  if (!sb) {
    alert('Error: Supabase no disponible');
    return;
  }

  const { error } = await sb.from('categories').delete().eq('id', id);

  if (error) {
    alert('Error al eliminar categoría: ' + error.message);
    console.error('Error:', error);
    return;
  }

  alert('✅ Categoría eliminada');
  location.reload();
};

// ========================================
// REPORTES MEJORADOS POR CATEGORÍA
// ========================================

async function loadCategoryReports() {
  console.log('📊 Cargando reportes por categoría...');
  const sb = window.sb;
  if (!sb) {
    console.error('❌ Supabase no disponible');
    return;
  }

  try {
    // Cargar todas las categorías
    const { data: categories, error: catError } = await sb.from('categories').select('*').order('name');
    if (catError) throw catError;
    console.log('✅ Categorías cargadas:', categories?.length);
    
    // Cargar jugadores
    const { data: players, error: playersError } = await sb.from('players').select('*, categories(name)');
    if (playersError) throw playersError;
    console.log('✅ Jugadores cargados:', players?.length);
    
    // Cargar pagos del mes actual
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: payments, error: paymentsError } = await sb.from('payments').select('*').eq('month', currentMonth).eq('status', 'paid');
    if (paymentsError) throw paymentsError;
    console.log('✅ Pagos cargados:', payments?.length, 'Mes:', currentMonth);

    // Generar reporte por categoría
    const reports = categories.map(cat => {
      const catPlayers = players.filter(p => p.category_id === cat.id && (p.status === 'activo' || p.status === 'becado'));
      const paidPlayerIds = new Set(payments.map(p => p.player_id));
      const paidCount = catPlayers.filter(p => paidPlayerIds.has(p.id)).length;
      const pendingCount = catPlayers.length - paidCount;
      const totalRevenue = payments
        .filter(p => catPlayers.some(cp => cp.id === p.player_id))
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      return {
        category: cat,
        total: catPlayers.length,
        paid: paidCount,
        pending: pendingCount,
        revenue: totalRevenue,
        occupancy: Math.round((catPlayers.length / (cat.max_players || 30)) * 100)
      };
    });

    console.log('✅ Reportes generados:', reports.length);
    renderCategoryReports(reports);
  } catch (error) {
    console.error('❌ Error cargando reportes:', error);
    const container = document.getElementById('categoryReports');
    if (container) {
      container.innerHTML = `<div class="card"><p style="color: var(--danger);">Error cargando reportes: ${error.message}</p></div>`;
    }
  }
}

function renderCategoryReports(reports) {
  console.log('🎨 Renderizando reportes, total:', reports.length);
  const container = document.getElementById('categoryReports');
  if (!container) {
    console.error('❌ Contenedor #categoryReports no encontrado en el DOM');
    return;
  }

  if (!reports || reports.length === 0) {
    console.warn('⚠️ No hay reportes para renderizar');
    container.innerHTML = `
      <div class="card">
        <p>No hay categorías para mostrar reportes</p>
      </div>
    `;
    return;
  }

  const html = `
    <div class="grid grid-3">
      ${reports.map(r => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <h3 class="card-title">${r.category.name}</h3>
            <span class="badge ${r.occupancy >= 90 ? 'badge-danger' : r.occupancy >= 70 ? 'badge-warning' : 'badge-success'}">
              ${r.occupancy}%
            </span>
          </div>

          <div style="display: grid; gap: 12px;">
            <div>
              <div style="color: var(--text-muted); font-size: 13px;">Total Jugadores</div>
              <div style="font-size: 24px; font-weight: 700;">${r.total} / ${r.category.max_players || 30}</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <div style="color: var(--text-muted); font-size: 13px;">Al Día</div>
                <div style="font-size: 20px; font-weight: 600; color: var(--success);">${r.paid}</div>
              </div>
              <div>
                <div style="color: var(--text-muted); font-size: 13px;">Pendientes</div>
                <div style="font-size: 20px; font-weight: 600; color: ${r.pending > 0 ? 'var(--warning)' : 'var(--text-muted)'};">${r.pending}</div>
              </div>
            </div>

            <div style="padding-top: 12px; border-top: 1px solid var(--border);">
              <div style="color: var(--text-muted); font-size: 13px;">Ingresos del Mes</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--accent);">
                RD$ ${r.revenue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="card" style="margin-top: 24px;">
      <h3 class="card-title" style="margin-bottom: 20px;">📊 Resumen General</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div>
          <div style="color: var(--text-muted); font-size: 13px;">Total Jugadores</div>
          <div style="font-size: 28px; font-weight: 700;">${reports.reduce((sum, r) => sum + r.total, 0)}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 13px;">Pagos al Día</div>
          <div style="font-size: 28px; font-weight: 700; color: var(--success);">${reports.reduce((sum, r) => sum + r.paid, 0)}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 13px;">Pendientes</div>
          <div style="font-size: 28px; font-weight: 700; color: var(--warning);">${reports.reduce((sum, r) => sum + r.pending, 0)}</div>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 13px;">Ingresos Totales</div>
          <div style="font-size: 28px; font-weight: 700; color: var(--accent);">
            RD$ ${reports.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  console.log('✅ Reportes renderizados correctamente en el DOM');
}

// Exportar
window.categoriesReportsSystem = {
  init: initCategoriesAndReports,
  loadReports: loadCategoryReports
};
// Force redeploy
