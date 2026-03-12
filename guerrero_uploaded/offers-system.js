// ========================================
// SISTEMA DE OFERTAS Y PROMOCIONES
// Guerrero Academy
// ========================================

// Inicializar cuando el super-admin esté listo
function initOffersSystem() {
  console.log('📢 Inicializando sistema de ofertas...');
  
  // Agregar vista de ofertas al HTML
  const mainContent = document.querySelector('.main');
  if (!mainContent) return;

  // Insertar vista de ofertas después de announcements
  const announcementsView = document.getElementById('view-announcements');
  if (!announcementsView) return;

  const offersHTML = `
    <!-- OFERTAS -->
    <div class="view" id="view-offers">
      <div class="topbar">
        <div>
          <button class="mobile-menu">☰</button>
          <h1 class="page-title">🎁 Ofertas y Promociones</h1>
          <p class="page-subtitle">Gestiona descuentos y ofertas especiales</p>
        </div>
        <button class="btn btn-primary" id="btnAddOffer">+ Nueva Oferta</button>
      </div>

      <div class="card">
        <div id="offersList"></div>
      </div>
    </div>
  `;

  announcementsView.insertAdjacentHTML('afterend', offersHTML);

  // Agregar modal de oferta
  addOfferModal();

  // Bind events
  bindOfferEvents();
}

function addOfferModal() {
  const modalHTML = `
    <!-- OFFER MODAL -->
    <div class="modal" id="offerModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="offerModalTitle">Nueva Oferta</h3>
          <button class="btn btn-sm" onclick="closeModal('offerModal')">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="editOfferId">
          
          <div class="form-group">
            <label>Título de la Oferta</label>
            <input type="text" id="offerTitle" class="input" placeholder="Ej: 20% de descuento">
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea id="offerDescription" class="input" rows="3" placeholder="Detalles de la oferta..."></textarea>
          </div>

          <div class="form-group">
            <label>Tipo de Oferta</label>
            <select id="offerType" class="select">
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Descuento Fijo (RD$)</option>
              <option value="promo">Promoción Especial</option>
            </select>
          </div>

          <div class="form-group">
            <label>Valor</label>
            <input type="text" id="offerValue" class="input" placeholder="Ej: 20, 500, 2x1">
            <div class="hint">Para porcentaje: 20 | Para fijo: 500 | Para promo: texto libre</div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="offerShowLanding" style="width: auto; margin-right: 8px;">
              Mostrar en Landing Page
            </label>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="offerAssignPlayers" style="width: auto; margin-right: 8px;">
              Asignar a Jugadores Específicos
            </label>
          </div>

          <div class="form-group" id="playerAssignmentSection" style="display: none;">
            <label>Buscar Jugadores</label>
            <input type="text" id="offerPlayerSearch" class="input" placeholder="Nombre del jugador...">
            <div id="offerPlayerSearchResults" style="margin-top: 8px; max-height: 200px; overflow-y: auto;"></div>
            <div id="selectedPlayersList" style="margin-top: 12px;"></div>
          </div>

          <div class="form-group">
            <label>Fecha de Inicio</label>
            <input type="date" id="offerStartDate" class="input">
          </div>

          <div class="form-group">
            <label>Fecha de Fin</label>
            <input type="date" id="offerEndDate" class="input">
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="offerIsActive" checked style="width: auto; margin-right: 8px;">
              Oferta Activa
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="closeModal('offerModal')">Cancelar</button>
          <button class="btn btn-primary" id="saveOffer">Guardar Oferta</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function bindOfferEvents() {
  const btnAddOffer = document.getElementById('btnAddOffer');
  if (btnAddOffer) {
    btnAddOffer.addEventListener('click', () => {
      document.getElementById('offerModalTitle').textContent = 'Nueva Oferta';
      document.getElementById('editOfferId').value = '';
      document.getElementById('offerTitle').value = '';
      document.getElementById('offerDescription').value = '';
      document.getElementById('offerType').value = 'percentage';
      document.getElementById('offerValue').value = '';
      document.getElementById('offerShowLanding').checked = false;
      document.getElementById('offerAssignPlayers').checked = false;
      document.getElementById('playerAssignmentSection').style.display = 'none';
      document.getElementById('offerStartDate').value = '';
      document.getElementById('offerEndDate').value = '';
      document.getElementById('offerIsActive').checked = true;
      window.selectedOfferPlayers = [];
      document.getElementById('offerPlayerSearch').value = '';
      document.getElementById('offerPlayerSearchResults').innerHTML = '';
      document.getElementById('selectedPlayersList').innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">Ningún jugador seleccionado</p>';
      openModal('offerModal');
      
      // Vincular evento del checkbox DESPUÉS de abrir el modal
      setTimeout(() => {
        const checkbox = document.getElementById('offerAssignPlayers');
        if (checkbox) {
          // Remover listeners previos clonando el elemento
          const newCheckbox = checkbox.cloneNode(true);
          checkbox.parentNode.replaceChild(newCheckbox, checkbox);
          
          newCheckbox.addEventListener('change', function(e) {
            console.log('Checkbox changed:', e.target.checked);
            const section = document.getElementById('playerAssignmentSection');
            if (section) {
              section.style.display = e.target.checked ? 'block' : 'none';
              console.log('Section display:', section.style.display);
            }
          });
        }
        
        // Vincular búsqueda de jugadores
        const searchInput = document.getElementById('offerPlayerSearch');
        if (searchInput) {
          const newSearchInput = searchInput.cloneNode(true);
          searchInput.parentNode.replaceChild(newSearchInput, searchInput);
          newSearchInput.addEventListener('input', searchPlayersForOffer);
        }
      }, 100);
    });
  }

  const saveOfferBtn = document.getElementById('saveOffer');
  if (saveOfferBtn) {
    saveOfferBtn.addEventListener('click', saveOffer);
  }
}

async function loadOffers() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  
  if (!sb) {
    console.error('Supabase client no disponible');
    return;
  }

  try {
    const { data: offers, error } = await sb
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    renderOffers(offers || []);
  } catch (error) {
    console.error('Error cargando ofertas:', error);
    document.getElementById('offersList').innerHTML = 
      '<div class="empty"><p>Error cargando ofertas: ' + error.message + '</p></div>';
  }
}

function renderOffers(offers) {
  const container = document.getElementById('offersList');
  if (!container) return;

  if (offers.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🎁</div>
        <p>No hay ofertas creadas</p>
      </div>
    `;
    return;
  }

  const html = offers.map(offer => {
    const isActive = offer.is_active && 
      (!offer.start_date || new Date(offer.start_date) <= new Date()) &&
      (!offer.end_date || new Date(offer.end_date) >= new Date());

    let valueDisplay = offer.value;
    if (offer.offer_type === 'percentage') valueDisplay = `${offer.value}% OFF`;
    else if (offer.offer_type === 'fixed') valueDisplay = `RD$ ${offer.value} de descuento`;

    return `
      <div style="padding: 20px 0; border-bottom: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div style="flex: 1;">
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 18px;">${offer.title}</strong>
              ${isActive ? '<span class="badge badge-success">Activa</span>' : '<span class="badge badge-warning">Inactiva</span>'}
              ${offer.show_on_landing ? '<span class="badge badge-blue">En Landing</span>' : ''}
            </div>
            <p style="color: var(--text-dim); margin: 8px 0;">${offer.description || 'Sin descripción'}</p>
            <div style="display: flex; gap: 16px; margin-top: 12px;">
              <span style="color: var(--accent); font-weight: 700; font-size: 20px;">${valueDisplay}</span>
              ${offer.start_date ? `<span style="color: var(--text-muted); font-size: 13px;">Desde: ${new Date(offer.start_date).toLocaleDateString()}</span>` : ''}
              ${offer.end_date ? `<span style="color: var(--text-muted); font-size: 13px;">Hasta: ${new Date(offer.end_date).toLocaleDateString()}</span>` : ''}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm" onclick="editOffer('${offer.id}')">✏️ Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deleteOffer('${offer.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

window.editOffer = async function(id) {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  const { data: offer, error } = await sb.from('offers').select('*').eq('id', id).single();
  
  if (error || !offer) {
    alert('Error al cargar la oferta');
    return;
  }

  document.getElementById('offerModalTitle').textContent = 'Editar Oferta';
  document.getElementById('editOfferId').value = offer.id;
  document.getElementById('offerTitle').value = offer.title || '';
  document.getElementById('offerDescription').value = offer.description || '';
  document.getElementById('offerType').value = offer.offer_type || 'percentage';
  document.getElementById('offerValue').value = offer.value || '';
  document.getElementById('offerShowLanding').checked = offer.show_on_landing || false;
  document.getElementById('offerStartDate').value = offer.start_date ? offer.start_date.slice(0, 10) : '';
  document.getElementById('offerEndDate').value = offer.end_date ? offer.end_date.slice(0, 10) : '';
  document.getElementById('offerIsActive').checked = offer.is_active !== false;
  
  openModal('offerModal');
};

window.deleteOffer = async function(id) {
  if (!confirm('¿Eliminar esta oferta?')) return;

  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  const { error } = await sb.from('offers').delete().eq('id', id);

  if (error) {
    alert('Error al eliminar oferta: ' + error.message);
    return;
  }

  loadOffers();
};

async function saveOffer() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  
  if (!sb) {
    alert('Error: Cliente de Supabase no disponible');
    return;
  }
  
  const id = document.getElementById('editOfferId').value;
  const title = document.getElementById('offerTitle').value.trim();
  const description = document.getElementById('offerDescription').value.trim();
  const offerType = document.getElementById('offerType').value;
  const value = document.getElementById('offerValue').value.trim();
  const showLanding = document.getElementById('offerShowLanding').checked;
  const startDate = document.getElementById('offerStartDate').value;
  const endDate = document.getElementById('offerEndDate').value;
  const isActive = document.getElementById('offerIsActive').checked;

  if (!title || !value) {
    alert('Por favor completa los campos requeridos');
    return;
  }

  const data = {
    title,
    description,
    offer_type: offerType,
    value,
    show_on_landing: showLanding,
    start_date: startDate || null,
    end_date: endDate || null,
    is_active: isActive,
    updated_at: new Date().toISOString()
  };

  try {
    if (id) {
      const { error } = await sb.from('offers').update(data).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('offers').insert(data);
      if (error) throw error;
    }

    closeModal('offerModal');
    loadOffers();
  } catch (error) {
    alert('Error al guardar oferta: ' + error.message);
    console.error(error);
  }
}

// ========================================
// ASIGNACIÓN DE JUGADORES A OFERTAS
// ========================================

window.selectedOfferPlayers = [];

async function searchPlayersForOffer() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  
  const query = document.getElementById('offerPlayerSearch').value.toLowerCase();
  
  if (query.length < 2) {
    document.getElementById('offerPlayerSearchResults').innerHTML = '';
    return;
  }

  const { data: players } = await sb
    .from('players')
    .select('*, categories(name)')
    .ilike('nombre', `%${query}%`)
    .limit(8);

  const html = (players || []).map(p => {
    const isSelected = window.selectedOfferPlayers.some(sp => sp.id === p.id);
    return `
      <button class="btn btn-sm ${isSelected ? 'btn-success' : ''}" 
        style="width: 100%; justify-content: flex-start; margin-bottom: 4px;" 
        onclick="togglePlayerSelection('${p.id}', '${(p.nombre || '').replace(/'/g, "\\'")}', '${(p.categories?.name || '').replace(/'/g, "\\'")}')">
        ${isSelected ? '✓ ' : ''}${p.nombre} 
        <span style="margin-left: 8px; color: var(--text-muted);">${p.categories?.name || ''}</span>
      </button>
    `;
  }).join('');

  document.getElementById('offerPlayerSearchResults').innerHTML = html;
}

window.togglePlayerSelection = function(id, name, category) {
  const index = window.selectedOfferPlayers.findIndex(p => p.id === id);
  
  if (index > -1) {
    window.selectedOfferPlayers.splice(index, 1);
  } else {
    window.selectedOfferPlayers.push({ id, name, category });
  }
  
  renderSelectedPlayers();
  searchPlayersForOffer(); // Refresh search results
};

function renderSelectedPlayers() {
  const container = document.getElementById('selectedPlayersList');
  if (!container) return;

  if (window.selectedOfferPlayers.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">Ningún jugador seleccionado</p>';
    return;
  }

  const html = `
    <div style="margin-top: 12px;">
      <strong style="font-size: 13px; color: var(--text-dim);">Jugadores seleccionados (${window.selectedOfferPlayers.length}):</strong>
      <div style="margin-top: 8px;">
        ${window.selectedOfferPlayers.map(p => `
          <span class="badge badge-blue" style="margin: 4px;">
            ${p.name}
            <button onclick="togglePlayerSelection('${p.id}', '${p.name.replace(/'/g, "\\'")}', '${p.category.replace(/'/g, "\\'")}'); event.stopPropagation();" 
              style="margin-left: 6px; background: none; border: none; color: white; cursor: pointer;">✕</button>
          </span>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Exportar funciones necesarias
window.offersSystem = {
  init: initOffersSystem,
  load: loadOffers
};
