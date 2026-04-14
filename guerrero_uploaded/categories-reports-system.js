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
    <!-- CATEGORY MODAL MEJORADO -->
    <div class="modal" id="categoryModal">
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h3 id="categoryModalTitle">Nueva Categoría</h3>
          <button class="btn btn-sm" onclick="closeModal('categoryModal')">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="editCategoryId">
          
          <!-- TABS -->
          <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab active" onclick="switchCategoryTab('info')">📋 Información</button>
            <button class="tab" onclick="switchCategoryTab('schedule')">📅 Horarios</button>
            <button class="tab" onclick="switchCategoryTab('staff')">👨‍🏫 Staff</button>
            <button class="tab" onclick="switchCategoryTab('config')">⚙️ Configuración</button>
          </div>

          <!-- TAB: INFORMACIÓN -->
          <div id="categoryTabInfo" class="tab-content active">
            <div class="form-group">
              <label>Nombre de la Categoría *</label>
              <input type="text" id="categoryName" class="input" placeholder="Ej: 8-10 años" required>
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea id="categoryDescription" class="input" rows="2" placeholder="Descripción opcional..."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Edad Mínima</label>
                <input type="number" id="categoryAgeMin" class="input" placeholder="8" min="1" max="99">
              </div>

              <div class="form-group">
                <label>Edad Máxima</label>
                <input type="number" id="categoryAgeMax" class="input" placeholder="10" min="1" max="99">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Cupo Máximo *</label>
                <input type="number" id="categoryMaxPlayers" class="input" placeholder="30" min="1" required>
              </div>

              <div class="form-group">
                <label>Tarifa Mensual ($)</label>
                <input type="number" id="categoryMonthlyFee" class="input" placeholder="50.00" min="0" step="0.01">
              </div>
            </div>

            <div class="form-group">
              <label>Color de Identificación</label>
              <input type="color" id="categoryColor" class="input" value="#D87093">
            </div>
          </div>

          <!-- TAB: HORARIOS -->
          <div id="categoryTabSchedule" class="tab-content" style="display:none;">
            <div class="form-group">
              <label>Días de Entrenamiento</label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" class="training-day" value="Lunes"> Lunes
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" class="training-day" value="Martes"> Martes
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" class="training-day" value="Miércoles"> Miércoles
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" class="training-day" value="Jueves"> Jueves
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" class="training-day" value="Viernes"> Viernes
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" class="training-day" value="Sábado"> Sábado
                </label>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label>Hora de Inicio</label>
                <input type="time" id="categoryTimeStart" class="input">
              </div>

              <div class="form-group">
                <label>Hora de Fin</label>
                <input type="time" id="categoryTimeEnd" class="input">
              </div>
            </div>

            <div class="form-group">
              <label>Ubicación / Cancha</label>
              <input type="text" id="categoryLocation" class="input" placeholder="Ej: Cancha Principal">
            </div>
          </div>

          <!-- TAB: STAFF -->
          <div id="categoryTabStaff" class="tab-content" style="display:none;">
            <div class="form-group">
              <label>Coach Principal</label>
              <select id="categoryCoachId" class="input">
                <option value="">Seleccionar coach...</option>
              </select>
            </div>

            <div class="form-group">
              <label>Coach Asistente (Opcional)</label>
              <select id="categoryAssistantCoachId" class="input">
                <option value="">Seleccionar coach asistente...</option>
              </select>
            </div>
          </div>

          <!-- TAB: CONFIGURACIÓN -->
          <div id="categoryTabConfig" class="tab-content" style="display:none;">
            <div class="form-group">
              <label>Estado de la Categoría</label>
              <select id="categoryStatus" class="input">
                <option value="active">✅ Activa</option>
                <option value="inactive">⏸️ Inactiva</option>
              </select>
            </div>

            <div class="form-group">
              <label>Inscripciones</label>
              <select id="categoryInscriptionsOpen" class="input">
                <option value="true">🟢 Abiertas</option>
                <option value="false">🔴 Cerradas</option>
              </select>
            </div>

            <div style="background: var(--bg-glass); padding: 16px; border-radius: 12px; border: 1px solid var(--border); margin-top: 16px;">
              <p style="font-size: 13px; color: var(--text-dim); line-height: 1.6;">
                <strong>Nota:</strong> Las categorías inactivas no aparecerán en el formulario de inscripción público. 
                Si cierras las inscripciones, los padres no podrán inscribir nuevos jugadores en esta categoría.
              </p>
            </div>
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
  
  // Cargar lista de coaches
  loadCoachesForSelect();
}

// Función para cambiar tabs
window.switchCategoryTab = function(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('#categoryModal .tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  document.querySelectorAll('#categoryModal .tab').forEach(btn => {
    btn.classList.remove('active');
  });

  // Mostrar tab seleccionado
  const tabContent = document.getElementById(`categoryTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  if (tabContent) tabContent.style.display = 'block';

  // Activar botón
  event.target.classList.add('active');
};

// Cargar lista de coaches para los selects
async function loadCoachesForSelect() {
  const sb = window.sb;
  if (!sb) return;

  try {
    // Buscar usuarios con rol staff o director
    const { data: coaches, error } = await sb
      .from('users')
      .select('id, nombre, email')
      .in('rol', ['staff', 'director'])
      .order('nombre');

    if (error) {
      console.warn('No se pudieron cargar coaches:', error.message);
      return;
    }

    const coachSelect = document.getElementById('categoryCoachId');
    const assistantSelect = document.getElementById('categoryAssistantCoachId');

    if (coaches && coaches.length > 0) {
      const coachOptions = coaches.map(coach => 
        `<option value="${coach.id}">${coach.nombre || coach.email}</option>`
      ).join('');

      if (coachSelect) {
        coachSelect.innerHTML = '<option value="">Seleccionar coach...</option>' + coachOptions;
      }
      if (assistantSelect) {
        assistantSelect.innerHTML = '<option value="">Seleccionar coach asistente...</option>' + coachOptions;
      }
    }
  } catch (error) {
    console.error('Error cargando coaches:', error);
    // No crítico, continuar sin coaches
  }
}

function bindCategoryEvents() {
  const btnAddCategory = document.getElementById('btnAddCategory');
  if (btnAddCategory) {
    btnAddCategory.addEventListener('click', () => {
      document.getElementById('categoryModalTitle').textContent = 'Nueva Categoría';
      document.getElementById('editCategoryId').value = '';
      document.getElementById('categoryName').value = '';
      document.getElementById('categoryDescription').value = '';
      document.getElementById('categoryAgeMin').value = '';
      document.getElementById('categoryAgeMax').value = '';
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
  // Esperar a que sb esté disponible
  let sb = window.sb;
  let attempts = 0;
  while (!sb && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    sb = window.sb;
    attempts++;
  }

  if (!sb) {
    alert('Error: Supabase no disponible después de esperar');
    return;
  }

  const id = document.getElementById('editCategoryId').value;
  const name = document.getElementById('categoryName').value.trim();
  const description = document.getElementById('categoryDescription').value.trim();
  const ageMin = parseInt(document.getElementById('categoryAgeMin').value) || null;
  const ageMax = parseInt(document.getElementById('categoryAgeMax').value) || null;
  const maxPlayers = parseInt(document.getElementById('categoryMaxPlayers').value) || 30;
  const color = document.getElementById('categoryColor').value;
  
  // Nuevos campos
  const monthlyFee = parseFloat(document.getElementById('categoryMonthlyFee').value) || 0;
  const location = document.getElementById('categoryLocation').value.trim();
  const coachId = document.getElementById('categoryCoachId').value || null;
  const assistantCoachId = document.getElementById('categoryAssistantCoachId').value || null;
  const status = document.getElementById('categoryStatus').value || 'active';
  const inscriptionsOpen = document.getElementById('categoryInscriptionsOpen').value === 'true';
  
  // Días de entrenamiento
  const trainingDaysElements = document.querySelectorAll('.training-day:checked');
  const trainingDays = Array.from(trainingDaysElements).map(el => el.value);
  
  // Horarios
  const timeStart = document.getElementById('categoryTimeStart').value;
  const timeEnd = document.getElementById('categoryTimeEnd').value;
  let trainingTime = null;
  if (timeStart && timeEnd) {
    trainingTime = `${timeStart}-${timeEnd}`;
  }

  if (!name) {
    alert('Por favor ingresa un nombre para la categoría');
    return;
  }

  // Validar que si se proporciona edad mínima, también se proporcione edad máxima
  if ((ageMin && !ageMax) || (!ageMin && ageMax)) {
    alert('Si ingresas edad mínima, debes ingresar también edad máxima (y viceversa)');
    return;
  }

  // Validar que edad mínima sea menor que edad máxima
  if (ageMin && ageMax && ageMin >= ageMax) {
    alert('La edad mínima debe ser menor que la edad máxima');
    return;
  }

  const data = {
    name,
    description,
    age_min: ageMin,
    age_max: ageMax,
    max_players: maxPlayers,
    color
  };
  
  // Solo agregar campos opcionales si tienen valor o si la columna existe
  if (monthlyFee) data.monthly_fee = monthlyFee;
  if (trainingDays.length > 0) data.training_days = trainingDays;
  if (trainingTime) data.training_time = trainingTime;
  if (location) data.location = location;
  if (coachId) data.coach_id = coachId;
  if (assistantCoachId) data.assistant_coach_id = assistantCoachId;
  if (status) data.status = status;
  data.inscriptions_open = inscriptionsOpen;

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
    
    // Recargar solo la vista de categorías sin reload completo
    await loadCategoriesView();
  } catch (error) {
    alert('Error al guardar categoría: ' + error.message);
    console.error(error);
  }
}

window.editCategory = async function(id) {
  console.log('✏️ Editando categoría:', id);
  
  // Esperar a que sb esté disponible
  let sb = window.sb;
  let attempts = 0;
  while (!sb && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    sb = window.sb;
    attempts++;
  }

  if (!sb) {
    alert('Error: Supabase no disponible después de esperar');
    console.error('window.sb sigue siendo undefined');
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
  document.getElementById('categoryAgeMin').value = category.age_min || '';
  document.getElementById('categoryAgeMax').value = category.age_max || '';
  document.getElementById('categoryMaxPlayers').value = category.max_players || 30;
  document.getElementById('categoryColor').value = category.color || '#D87093';
  
  // Cargar campos adicionales
  document.getElementById('categoryMonthlyFee').value = category.monthly_fee || '';
  document.getElementById('categoryLocation').value = category.location || '';
  document.getElementById('categoryStatus').value = category.status || 'active';
  document.getElementById('categoryInscriptionsOpen').value = category.inscriptions_open !== false ? 'true' : 'false';
  
  // Horarios
  if (category.training_time) {
    const parts = category.training_time.split('-');
    document.getElementById('categoryTimeStart').value = parts[0] || '';
    document.getElementById('categoryTimeEnd').value = parts[1] || '';
  } else {
    document.getElementById('categoryTimeStart').value = '';
    document.getElementById('categoryTimeEnd').value = '';
  }
  
  // Días de entrenamiento
  document.querySelectorAll('.training-day').forEach(cb => {
    cb.checked = (category.training_days || []).includes(cb.value);
  });
  
  // Coach
  const coachSelect = document.getElementById('categoryCoachId');
  const assistantSelect = document.getElementById('categoryAssistantCoachId');
  if (coachSelect) coachSelect.value = category.coach_id || '';
  if (assistantSelect) assistantSelect.value = category.assistant_coach_id || '';
  
  openModal('categoryModal');
};

window.deleteCategory = async function(id) {
  console.log('🗑️ Intentando eliminar categoría:', id);
  if (!confirm('¿Eliminar esta categoría? Los jugadores de esta categoría quedarán sin categoría asignada.')) return;

  // Esperar a que sb esté disponible
  let sb = window.sb;
  let attempts = 0;
  while (!sb && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    sb = window.sb;
    attempts++;
  }

  if (!sb) {
    alert('Error: Supabase no disponible después de esperar');
    return;
  }

  const { error } = await sb.from('categories').delete().eq('id', id);

  if (error) {
    alert('Error al eliminar categoría: ' + error.message);
    console.error('Error:', error);
    return;
  }

  alert('✅ Categoría eliminada');
  await loadCategoriesView();
};

// ========================================
// REPORTES MEJORADOS POR CATEGORÍA
// ========================================

async function loadCategoryReports() {
  console.log('📊 Cargando reportes por categoría...');
  
  // Esperar a que sb esté disponible
  let sb = window.sb;
  let attempts = 0;
  while (!sb && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    sb = window.sb;
    attempts++;
  }

  if (!sb) {
    console.error('❌ Supabase no disponible después de esperar');
    const container = document.getElementById('categoryReports');
    if (container) {
      container.innerHTML = '<div class="card"><p style="color: var(--danger);">Error: No se pudo conectar con Supabase</p></div>';
    }
    return;
  }

  console.log('✅ Supabase disponible, procediendo...');

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

// ========================================
// FUNCIÓN PARA RECARGAR VISTA DE CATEGORÍAS
// ========================================
async function loadCategoriesView() {
  console.log('🔄 Recargando vista de categorías...');
  
  const sb = window.sb;
  if (!sb) {
    console.error('❌ Supabase no disponible');
    return;
  }

  try {
    // Recargar categorías desde la base de datos
    const { data: newCategories, error } = await sb.from('categories').select('*').order('name');
    if (error) throw error;
    
    // Actualizar la variable global de categorías (si existe)
    if (window.categories !== undefined) {
      window.categories = newCategories || [];
    }
    
    // Recargar jugadores para tener los datos actualizados
    const { data: newPlayers } = await sb.from('players').select('*, categories(name)');
    if (window.players !== undefined) {
      window.players = newPlayers || [];
    }
    
    // Llamar a la función loadCategories del archivo principal
    if (typeof window.loadCategories === 'function') {
      await window.loadCategories();
    } else if (typeof loadCategories === 'function') {
      await loadCategories();
    } else {
      console.warn('⚠️ Función loadCategories no disponible, recargando página...');
      location.reload();
    }
    
    console.log('✅ Vista de categorías recargada');
  } catch (error) {
    console.error('❌ Error recargando categorías:', error);
    alert('Error al recargar categorías: ' + error.message);
  }
}

// Exportar
window.categoriesReportsSystem = {
  init: initCategoriesAndReports,
  loadReports: loadCategoryReports
};
// Force redeploy
