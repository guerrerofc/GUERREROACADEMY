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
        <button class="tab" data-fee-tab="offers">Asignar Ofertas</button>
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

      <!-- Asignar Ofertas -->
      <div id="assignOffersView" class="card" style="display: none;">
        <div class="card-header">
          <h3 class="card-title">🎁 Asignar Ofertas a Jugadores</h3>
          <p style="color: var(--text-dim); font-size: 14px; margin-top: 8px;">Selecciona una oferta y asígnala a jugadores específicos</p>
        </div>
        <div id="offersAssignmentList"></div>
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
  console.log('🔧 Creando modal de cuota personalizada...');
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
  
  // Agregar modal de asignación de jugadores a ofertas
  addOfferAssignmentModal();
}

function addOfferAssignmentModal() {
  console.log('🎁 Creando modal de asignación de ofertas...');
  const modalHTML = `
    <!-- OFFER ASSIGNMENT MODAL -->
    <div class="modal" id="offerAssignmentModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="offerAssignmentTitle">Asignar Jugadores a Oferta</h3>
          <button class="btn btn-sm" onclick="closeModal('offerAssignmentModal')">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="assignmentOfferId">
          
          <div style="padding: 16px; background: rgba(216, 112, 147, 0.1); border-radius: 12px; margin-bottom: 20px;">
            <div style="font-size: 13px; color: var(--text-dim); margin-bottom: 4px;">Oferta seleccionada:</div>
            <div id="selectedOfferInfo" style="font-size: 18px; font-weight: 600;"></div>
          </div>

          <div class="form-group">
            <label>Buscar Jugadores</label>
            <input type="text" id="offerAssignPlayerSearch" class="input" placeholder="Escribe el nombre del jugador...">
            <div id="offerAssignPlayerSearchResults" style="margin-top: 8px; max-height: 300px; overflow-y: auto;"></div>
          </div>

          <div id="offerAssignSelectedPlayersList" style="margin-top: 16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="closeModal('offerAssignmentModal')">Cancelar</button>
          <button class="btn btn-primary" id="saveOfferAssignment">💾 Guardar Asignaciones</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  console.log('✅ Modal de asignación de ofertas agregado al DOM');
  
  // Adjuntar event listener INMEDIATAMENTE después de crear el modal
  setTimeout(() => {
    const saveOfferBtn = document.getElementById('saveOfferAssignment');
    console.log('🔍 Adjuntando listener al botón saveOfferAssignment:', saveOfferBtn ? 'ENCONTRADO ✅' : 'NO ENCONTRADO ❌');
    
    if (saveOfferBtn) {
      saveOfferBtn.addEventListener('click', async function() {
        console.log('🖱️ Click en Guardar Asignación de Oferta');
        console.log('  - Jugadores seleccionados:', window.selectedAssignmentPlayers?.length || 0);
        console.log('  - Lista:', window.selectedAssignmentPlayers);
        
        const sb = window.sb || window.supabase?.createClient(
          window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
          window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
        );
        
        const offerId = document.getElementById('assignmentOfferId').value;
        console.log('  - Offer ID:', offerId);
        
        if (!offerId) {
          console.log('❌ No hay offer ID');
          alert('Error: No se pudo identificar la oferta');
          return;
        }
        
        try {
          console.log('🗑️ Eliminando asignaciones anteriores...');
          await sb.from('offer_assignments').delete().eq('offer_id', offerId);
          
          if (window.selectedAssignmentPlayers.length > 0) {
            const assignments = window.selectedAssignmentPlayers.map(p => ({
              offer_id: offerId,
              player_id: p.id
            }));
            
            console.log('💾 Insertando nuevas asignaciones:', assignments);
            
            const { error } = await sb.from('offer_assignments').insert(assignments);
            if (error) {
              console.error('❌ Error de Supabase:', error);
              throw error;
            }
          }
          
          console.log('✅ Asignaciones guardadas correctamente');
          alert(`✅ Asignaciones guardadas correctamente: ${window.selectedAssignmentPlayers.length} jugador(es)`);
          closeModal('offerAssignmentModal');
          loadOffersForAssignment();
        } catch (error) {
          console.error('❌ Error al guardar asignaciones:', error);
          alert('Error al guardar asignaciones: ' + error.message);
        }
      });
    }
  }, 100);
}

function bindFeeEvents() {
  console.log('🔗 Adjuntando event listeners...');
  // Tab switching
  document.querySelectorAll('[data-fee-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.feeTab;
      document.querySelectorAll('[data-fee-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tabName === 'category') {
        document.getElementById('categoryFeesView').style.display = 'block';
        document.getElementById('customFeesView').style.display = 'none';
        document.getElementById('assignOffersView').style.display = 'none';
        loadCategoryFees();
      } else if (tabName === 'custom') {
        document.getElementById('categoryFeesView').style.display = 'none';
        document.getElementById('customFeesView').style.display = 'block';
        document.getElementById('assignOffersView').style.display = 'none';
        loadCustomFees();
      } else if (tabName === 'offers') {
        document.getElementById('categoryFeesView').style.display = 'none';
        document.getElementById('customFeesView').style.display = 'none';
        document.getElementById('assignOffersView').style.display = 'block';
        loadOffersForAssignment();
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
  document.getElementById('saveCustomFee')?.addEventListener('click', () => {
    console.log('🖱️ Click en botón Guardar Cuota');
    saveCustomFee();
  });
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
  console.log('💾 Guardar cuota personalizada llamado');
  console.log('  - Jugador seleccionado:', window.selectedFeePlayer);
  
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

  console.log('  - Monto:', amount);
  console.log('  - Razón:', reason);
  console.log('  - Fecha inicio:', startDate);
  console.log('  - Fecha fin:', endDate);

  if (!amount || amount <= 0) {
    console.log('❌ Monto inválido');
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

    console.log('  - Data a insertar:', data);

    const { error } = await sb.from('player_custom_fees').insert(data);
    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log('✅ Cuota personalizada guardada');
    closeModal('customFeeModal');
    loadCustomFees();
    alert(`✅ Cuota personalizada creada para ${window.selectedFeePlayer.name}`);
  } catch (error) {
    console.error('❌ Error al guardar cuota:', error);
    alert('Error al guardar cuota: ' + error.message);
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

// ========================================
// SISTEMA DE ASIGNACIÓN DE OFERTAS
// ========================================

window.selectedAssignmentPlayers = [];

async function loadOffersForAssignment() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );

  if (!sb) return;

  try {
    const { data: offers, error } = await sb
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Cargar asignaciones existentes
    const { data: assignments } = await sb
      .from('offer_assignments')
      .select('*, offers(title), players(nombre)');

    renderOffersForAssignment(offers || [], assignments || []);
  } catch (error) {
    console.error('Error cargando ofertas:', error);
  }
}

function renderOffersForAssignment(offers, assignments) {
  const container = document.getElementById('offersAssignmentList');
  if (!container) return;

  if (offers.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🎁</div>
        <p>No hay ofertas activas para asignar</p>
        <p style="color: var(--text-dim); font-size: 14px; margin-top: 8px;">
          Ve a <strong>Super Admin → Ofertas</strong> para crear ofertas
        </p>
      </div>
    `;
    return;
  }

  // Agrupar asignaciones por oferta
  const assignmentsByOffer = {};
  assignments.forEach(a => {
    if (!assignmentsByOffer[a.offer_id]) {
      assignmentsByOffer[a.offer_id] = [];
    }
    assignmentsByOffer[a.offer_id].push(a);
  });

  const html = offers.map(offer => {
    const offerAssignments = assignmentsByOffer[offer.id] || [];
    
    let valueDisplay = offer.value;
    if (offer.offer_type === 'percentage') {
      valueDisplay = `${offer.value}% OFF`;
    } else if (offer.offer_type === 'fixed') {
      valueDisplay = `RD$ ${offer.value}`;
    }

    return `
      <div style="padding: 20px; border-bottom: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div style="flex: 1;">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${offer.title}</div>
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px; font-weight: 700; color: var(--accent);">${valueDisplay}</span>
              <span class="badge badge-success">Activa</span>
            </div>
            ${offer.description ? `<p style="color: var(--text-dim); font-size: 14px; margin-top: 8px;">${offer.description}</p>` : ''}
          </div>
          <button class="btn btn-primary btn-sm" onclick="openOfferAssignmentModal('${offer.id}', '${offer.title.replace(/'/g, "\\'")}', '${valueDisplay.replace(/'/g, "\\'")}')">
            🎯 Asignar Jugadores
          </button>
        </div>

        ${offerAssignments.length > 0 ? `
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
            <div style="font-size: 13px; color: var(--text-dim); margin-bottom: 8px;">
              Jugadores asignados (${offerAssignments.length}):
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${offerAssignments.map(a => `
                <span class="badge badge-blue">
                  ${a.players?.nombre || 'Jugador'}
                  <button onclick="removeOfferAssignment('${a.id}'); event.stopPropagation();" 
                    style="margin-left: 6px; background: none; border: none; color: white; cursor: pointer;">✕</button>
                </span>
              `).join('')}
            </div>
          </div>
        ` : `
          <div style="color: var(--text-muted); font-size: 13px; font-style: italic;">
            Sin jugadores asignados
          </div>
        `}
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

window.openOfferAssignmentModal = async function(offerId, offerTitle, offerValue) {
  window.selectedAssignmentPlayers = [];
  document.getElementById('assignmentOfferId').value = offerId;
  document.getElementById('selectedOfferInfo').textContent = `${offerTitle} (${offerValue})`;
  document.getElementById('offerAssignPlayerSearch').value = '';
  document.getElementById('offerAssignPlayerSearchResults').innerHTML = '';
  document.getElementById('offerAssignSelectedPlayersList').innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">Ningún jugador seleccionado</p>';

  // Cargar jugadores ya asignados
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );

  const { data: existingAssignments } = await sb
    .from('offer_assignments')
    .select('*, players(id, nombre, categories(name))')
    .eq('offer_id', offerId);

  if (existingAssignments && existingAssignments.length > 0) {
    window.selectedAssignmentPlayers = existingAssignments.map(a => ({
      id: a.players.id,
      name: a.players.nombre,
      category: a.players.categories?.name || ''
    }));
    renderSelectedAssignmentPlayers();
  }

  openModal('offerAssignmentModal');
};

// Búsqueda de jugadores para asignación
document.addEventListener('input', function(e) {
  if (e.target && e.target.id === 'offerAssignPlayerSearch') {
    searchPlayersForAssignment();
  }
});

async function searchPlayersForAssignment() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  
  const query = document.getElementById('offerAssignPlayerSearch').value.toLowerCase();
  
  if (query.length < 2) {
    document.getElementById('offerAssignPlayerSearchResults').innerHTML = '';
    return;
  }

  const { data: players } = await sb
    .from('players')
    .select('*, categories(name)')
    .ilike('nombre', `%${query}%`)
    .limit(10);

  const html = (players || []).map(p => {
    const isSelected = window.selectedAssignmentPlayers.some(sp => sp.id === p.id);
    return `
      <button class="btn btn-sm ${isSelected ? 'btn-success' : ''}" 
        style="width: 100%; justify-content: flex-start; margin-bottom: 4px;" 
        onclick="toggleAssignmentPlayerSelection('${p.id}', '${(p.nombre || '').replace(/'/g, "\\'")}', '${(p.categories?.name || '').replace(/'/g, "\\'")}')">
        ${isSelected ? '✓ ' : ''}${p.nombre} 
        <span style="margin-left: 8px; color: var(--text-muted);">${p.categories?.name || ''}</span>
      </button>
    `;
  }).join('');

  document.getElementById('offerAssignPlayerSearchResults').innerHTML = html;
}

window.toggleAssignmentPlayerSelection = function(id, name, category) {
  const index = window.selectedAssignmentPlayers.findIndex(p => p.id === id);
  
  if (index > -1) {
    window.selectedAssignmentPlayers.splice(index, 1);
  } else {
    window.selectedAssignmentPlayers.push({ id, name, category });
  }
  
  renderSelectedAssignmentPlayers();
  searchPlayersForAssignment(); // Refresh search results
};

function renderSelectedAssignmentPlayers() {
  const container = document.getElementById('offerAssignSelectedPlayersList');
  if (!container) return;

  if (window.selectedAssignmentPlayers.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">Ningún jugador seleccionado</p>';
    return;
  }

  const html = `
    <div>
      <strong style="font-size: 13px; color: var(--text-dim);">Jugadores seleccionados (${window.selectedAssignmentPlayers.length}):</strong>
      <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px;">
        ${window.selectedAssignmentPlayers.map(p => `
          <span class="badge badge-blue" style="cursor: pointer;" 
            onclick="toggleAssignmentPlayerSelection('${p.id}', '${p.name.replace(/'/g, "\\'")}', '${p.category.replace(/'/g, "\\'")}')">
            ${p.name}
            <span style="margin-left: 6px;">✕</span>
          </span>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

window.removeOfferAssignment = async function(assignmentId) {
  if (!confirm('¿Eliminar esta asignación?')) return;

  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );

  const { error } = await sb.from('offer_assignments').delete().eq('id', assignmentId);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  loadOffersForAssignment();
};

// Exportar
window.feesSystem = {
  init: initFeesSystem,
  loadCategory: loadCategoryFees,
  loadCustom: loadCustomFees
};
