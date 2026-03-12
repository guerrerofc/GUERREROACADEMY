// ========================================
// SISTEMA DE GESTIÓN DE CUOTAS
// Guerrero Academy
// ========================================

function initFeesSystem() {
  console.log('💵 Inicializando sistema de cuotas...');
  
  const mainContent = document.querySelector('.main');
  if (!mainContent) return;

  const offersView = document.getElementById('view-offers');
  if (!offersView) return;

  const feesHTML = `
    <!-- CUOTAS -->
    <div class="view" id="view-fees">
      <div class="topbar">
        <div>
          <button class="mobile-menu">☰</button>
          <h1 class="page-title">💵 Gestión de Cuotas</h1>
          <p class="page-subtitle">Configura cuotas por categoría y jugador</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab active" data-fee-tab="category">Cuotas por Categoría</button>
        <button class="tab" data-fee-tab="custom">Cuotas Personalizadas</button>
      </div>

      <!-- Cuotas por Categoría -->
      <div id="categoryFeesView" class="card">
        <div class="card-header">
          <h3 class="card-title">Cuotas Mensuales por Categoría</h3>
        </div>
        <div id="categoryFeesList"></div>
        <button class="btn btn-primary" id="saveCategoryFees" style="margin-top: 20px; width: 100%;">💾 Guardar Cambios</button>
      </div>

      <!-- Cuotas Personalizadas -->
      <div id="customFeesView" class="card" style="display: none;">
        <div class="card-header">
          <h3 class="card-title">Cuotas Personalizadas por Jugador</h3>
          <button class="btn btn-primary btn-sm" id="btnAddCustomFee">+ Nueva Cuota</button>
        </div>
        <div id="customFeesList"></div>
      </div>
    </div>
  `;

  offersView.insertAdjacentHTML('afterend', feesHTML);

  // Agregar modal
  addCustomFeeModal();

  // Bind events
  bindFeeEvents();
}

function addCustomFeeModal() {
  const modalHTML = `
    <!-- CUSTOM FEE MODAL -->
    <div class="modal" id="customFeeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Nueva Cuota Personalizada</h3>
          <button class="btn btn-sm" onclick="closeModal('customFeeModal')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Buscar Jugador</label>
            <input type="text" id="feePlayerSearch" class="input" placeholder="Nombre del jugador...">
            <div id="feePlayerSearchResults" style="margin-top: 8px;"></div>
          </div>

          <div class="form-group">
            <label>Cuota Mensual (RD$)</label>
            <input type="number" id="customFeeAmount" class="input" placeholder="3500">
          </div>

          <div class="form-group">
            <label>Razón del Ajuste</label>
            <textarea id="customFeeReason" class="input" rows="3" placeholder="Ej: Descuento por hermano, becado, etc."></textarea>
          </div>

          <div class="form-group">
            <label>Fecha de Inicio</label>
            <input type="date" id="customFeeStartDate" class="input">
          </div>

          <div class="form-group">
            <label>Fecha de Fin (Opcional)</label>
            <input type="date" id="customFeeEndDate" class="input">
            <div class="hint">Dejar vacío para que sea indefinida</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="closeModal('customFeeModal')">Cancelar</button>
          <button class="btn btn-primary" id="saveCustomFee">Guardar</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function bindFeeEvents() {
  // Tab switching
  document.querySelectorAll('[data-fee-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.feeTab;
      document.querySelectorAll('[data-fee-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tabName === 'category') {
        document.getElementById('categoryFeesView').style.display = 'block';
        document.getElementById('customFeesView').style.display = 'none';
        loadCategoryFees();
      } else {
        document.getElementById('categoryFeesView').style.display = 'none';
        document.getElementById('customFeesView').style.display = 'block';
        loadCustomFees();
      }
    });
  });

  // Save category fees
  document.getElementById('saveCategoryFees')?.addEventListener('click', saveCategoryFees);

  // Add custom fee
  document.getElementById('btnAddCustomFee')?.addEventListener('click', () => {
    document.getElementById('feePlayerSearch').value = '';
    document.getElementById('feePlayerSearchResults').innerHTML = '';
    document.getElementById('customFeeAmount').value = '';
    document.getElementById('customFeeReason').value = '';
    document.getElementById('customFeeStartDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('customFeeEndDate').value = '';
    window.selectedFeePlayer = null;
    openModal('customFeeModal');
  });

  // Player search
  document.getElementById('feePlayerSearch')?.addEventListener('input', searchPlayersForFee);

  // Save custom fee
  document.getElementById('saveCustomFee')?.addEventListener('click', saveCustomFee);
}

async function loadCategoryFees() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  if (!sb) return;

  try {
    // Cargar categorías y cuotas
    const { data: categories } = await sb.from('categories').select('*').order('name');
    const { data: fees } = await sb.from('category_fees').select('*');

    const feesMap = {};
    (fees || []).forEach(f => feesMap[f.category_id] = f);

    const html = (categories || []).map(cat => {
      const fee = feesMap[cat.id];
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border);">
          <div style="flex: 1;">
            <strong style="font-size: 16px;">${cat.name}</strong>
            <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
              ${cat.description || 'Sin descripción'}
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: var(--text-dim);">RD$</span>
            <input type="number" 
              class="input" 
              data-category-id="${cat.id}"
              data-fee-id="${fee?.id || ''}"
              value="${fee?.monthly_fee || 3500}" 
              style="width: 150px; text-align: right;"
              placeholder="3500">
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('categoryFeesList').innerHTML = html || '<p class="empty">No hay categorías</p>';
  } catch (error) {
    console.error('Error cargando cuotas de categoría:', error);
  }
}

async function saveCategoryFees() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  const inputs = document.querySelectorAll('#categoryFeesList input[data-category-id]');
  
  const btn = document.getElementById('saveCategoryFees');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    for (const input of inputs) {
      const categoryId = input.dataset.categoryId;
      const feeId = input.dataset.feeId;
      const amount = parseFloat(input.value) || 3500;

      const data = {
        category_id: categoryId,
        monthly_fee: amount,
        currency: 'DOP',
        updated_at: new Date().toISOString()
      };

      if (feeId) {
        await sb.from('category_fees').update(data).eq('id', feeId);
      } else {
        await sb.from('category_fees').insert(data);
      }
    }

    alert('✅ Cuotas guardadas correctamente');
    loadCategoryFees();
  } catch (error) {
    alert('❌ Error al guardar cuotas: ' + error.message);
    console.error(error);
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Guardar Cambios';
  }
}

async function loadCustomFees() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  if (!sb) return;

  try {
    const { data: customFees } = await sb
      .from('player_custom_fees')
      .select('*, players(nombre, categories(name))')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const container = document.getElementById('customFeesList');

    if (!customFees || customFees.length === 0) {
      container.innerHTML = `
        <div class="empty">
          <div class="empty-icon">💵</div>
          <p>No hay cuotas personalizadas activas</p>
        </div>
      `;
      return;
    }

    const html = customFees.map(fee => `
      <div style="padding: 20px 0; border-bottom: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <strong style="font-size: 16px;">${fee.players?.nombre || 'Jugador'}</strong>
            <span style="margin-left: 12px; color: var(--text-muted); font-size: 13px;">
              ${fee.players?.categories?.name || ''}
            </span>
            <p style="color: var(--text-dim); margin: 8px 0; font-size: 14px;">
              ${fee.reason || 'Sin razón especificada'}
            </p>
            <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 13px; color: var(--text-muted);">
              ${fee.start_date ? `<span>Desde: ${new Date(fee.start_date).toLocaleDateString()}</span>` : ''}
              ${fee.end_date ? `<span>Hasta: ${new Date(fee.end_date).toLocaleDateString()}</span>` : '<span>Indefinida</span>'}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">
              RD$ ${Number(fee.custom_fee).toFixed(0)}
            </div>
            <button class="btn btn-sm btn-danger" onclick="deactivateCustomFee('${fee.id}')">Desactivar</button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  } catch (error) {
    console.error('Error cargando cuotas personalizadas:', error);
  }
}

async function searchPlayersForFee() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  const query = document.getElementById('feePlayerSearch').value.toLowerCase();
  
  if (query.length < 2) {
    document.getElementById('feePlayerSearchResults').innerHTML = '';
    return;
  }

  const { data: players } = await sb
    .from('players')
    .select('*, categories(name)')
    .ilike('nombre', `%${query}%`)
    .limit(5);

  const html = (players || []).map(p => `
    <button class="btn btn-sm" 
      style="width: 100%; justify-content: flex-start; margin-bottom: 4px;" 
      onclick="selectFeePlayer('${p.id}', '${(p.nombre || '').replace(/'/g, "\\'")}', '${(p.categories?.name || '').replace(/'/g, "\\'")}')">
      ${p.nombre} <span style="margin-left: 8px; color: var(--text-muted);">${p.categories?.name || ''}</span>
    </button>
  `).join('');

  document.getElementById('feePlayerSearchResults').innerHTML = html;
}

window.selectFeePlayer = function(id, name, category) {
  window.selectedFeePlayer = { id, name, category };
  document.getElementById('feePlayerSearch').value = `${name} - ${category}`;
  document.getElementById('feePlayerSearchResults').innerHTML = 
    `<span class="badge badge-success">✓ ${name}</span>`;
};

async function saveCustomFee() {
  if (!window.selectedFeePlayer) {
    alert('Por favor selecciona un jugador');
    return;
  }

  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  const amount = parseFloat(document.getElementById('customFeeAmount').value);
  const reason = document.getElementById('customFeeReason').value.trim();
  const startDate = document.getElementById('customFeeStartDate').value;
  const endDate = document.getElementById('customFeeEndDate').value;

  if (!amount || amount <= 0) {
    alert('Por favor ingresa un monto válido');
    return;
  }

  try {
    const data = {
      player_id: window.selectedFeePlayer.id,
      custom_fee: amount,
      currency: 'DOP',
      reason: reason || null,
      start_date: startDate || new Date().toISOString(),
      end_date: endDate || null,
      is_active: true
    };

    const { error } = await sb.from('player_custom_fees').insert(data);
    if (error) throw error;

    closeModal('customFeeModal');
    loadCustomFees();
    alert(`✅ Cuota personalizada creada para ${window.selectedFeePlayer.name}`);
  } catch (error) {
    alert('Error al guardar cuota: ' + error.message);
    console.error(error);
  }
}

window.deactivateCustomFee = async function(id) {
  if (!confirm('¿Desactivar esta cuota personalizada? El jugador volverá a la cuota de su categoría.')) return;

  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  const { error } = await sb
    .from('player_custom_fees')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    alert('Error al desactivar cuota: ' + error.message);
    return;
  }

  loadCustomFees();
};

// Exportar
window.feesSystem = {
  init: initFeesSystem,
  loadCategory: loadCategoryFees,
  loadCustom: loadCustomFees
};
