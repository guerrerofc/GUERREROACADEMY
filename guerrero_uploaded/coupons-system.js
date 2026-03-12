// ========================================
// SISTEMA DE CUPONES DE DESCUENTO
// Guerrero Academy
// ========================================

function initCouponsSystem() {
  console.log('🎟️ Inicializando sistema de cupones...');
  
  const mainContent = document.querySelector('.main');
  if (!mainContent) return;

  const feesView = document.getElementById('view-fees');
  if (!feesView) return;

  const couponsHTML = `
    <!-- CUPONES -->
    <div class="view" id="view-coupons">
      <div class="topbar">
        <div>
          <button class="mobile-menu">☰</button>
          <h1 class="page-title">🎟️ Cupones de Descuento</h1>
          <p class="page-subtitle">Códigos que los padres pueden usar al pagar</p>
        </div>
        <button class="btn btn-primary" id="btnAddCoupon">+ Nuevo Cupón</button>
      </div>

      <div class="card">
        <div id="couponsList"></div>
      </div>
    </div>
  `;

  feesView.insertAdjacentHTML('afterend', couponsHTML);
  addCouponModal();
  bindCouponEvents();
}

function addCouponModal() {
  const modalHTML = `
    <!-- COUPON MODAL -->
    <div class="modal" id="couponModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="couponModalTitle">Nuevo Cupón</h3>
          <button class="btn btn-sm" onclick="closeModal('couponModal')">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="editCouponId">
          
          <div class="form-group">
            <label>Código del Cupón</label>
            <input type="text" id="couponCode" class="input" placeholder="VERANO2024" style="text-transform: uppercase;">
            <div class="hint">Solo letras y números, sin espacios. Se convertirá a mayúsculas.</div>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea id="couponDescription" class="input" rows="2" placeholder="Promoción de verano 2024"></textarea>
          </div>

          <div class="form-group">
            <label>Tipo de Descuento</label>
            <select id="couponType" class="select">
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo (RD$)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Valor del Descuento</label>
            <input type="number" id="couponValue" class="input" placeholder="20" step="0.01" min="0">
            <div class="hint">Para porcentaje: 20 = 20% | Para fijo: 500 = RD$ 500</div>
          </div>

          <div class="form-group">
            <label>Límite de Usos (Opcional)</label>
            <input type="number" id="couponLimit" class="input" placeholder="Dejar vacío = ilimitado" min="1">
            <div class="hint">Cantidad máxima de veces que puede usarse este cupón</div>
          </div>

          <div class="form-group">
            <label>Fecha de Expiración (Opcional)</label>
            <input type="date" id="couponExpires" class="input">
            <div class="hint">Dejar vacío = nunca expira</div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="couponIsActive" checked style="width: auto; margin-right: 8px;">
              Cupón Activo
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="closeModal('couponModal')">Cancelar</button>
          <button class="btn btn-primary" id="saveCoupon">Guardar Cupón</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function bindCouponEvents() {
  document.getElementById('btnAddCoupon')?.addEventListener('click', () => {
    document.getElementById('couponModalTitle').textContent = 'Nuevo Cupón';
    document.getElementById('editCouponId').value = '';
    document.getElementById('couponCode').value = '';
    document.getElementById('couponDescription').value = '';
    document.getElementById('couponType').value = 'percentage';
    document.getElementById('couponValue').value = '';
    document.getElementById('couponLimit').value = '';
    document.getElementById('couponExpires').value = '';
    document.getElementById('couponIsActive').checked = true;
    openModal('couponModal');
  });

  // Auto-uppercase para código
  document.getElementById('couponCode')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  document.getElementById('saveCoupon')?.addEventListener('click', saveCoupon);
}

async function loadCoupons() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );

  if (!sb) return;

  try {
    const { data: coupons, error } = await sb
      .from('discount_coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    renderCoupons(coupons || []);
  } catch (error) {
    console.error('Error cargando cupones:', error);
    document.getElementById('couponsList').innerHTML = 
      '<div class="empty"><p>Error cargando cupones: ' + error.message + '</p></div>';
  }
}

function renderCoupons(coupons) {
  const container = document.getElementById('couponsList');
  if (!container) return;

  if (coupons.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🎟️</div>
        <p>No hay cupones creados</p>
      </div>
    `;
    return;
  }

  const html = coupons.map(coupon => {
    const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    const isExhausted = coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
    const isValid = coupon.is_active && !isExpired && !isExhausted;

    let valueDisplay = '';
    if (coupon.discount_type === 'percentage') {
      valueDisplay = `${coupon.discount_value}% OFF`;
    } else {
      valueDisplay = `RD$ ${coupon.discount_value}`;
    }

    let statusBadge = '';
    if (!coupon.is_active) {
      statusBadge = '<span class="badge badge-warning">Inactivo</span>';
    } else if (isExpired) {
      statusBadge = '<span class="badge badge-danger">Expirado</span>';
    } else if (isExhausted) {
      statusBadge = '<span class="badge badge-danger">Agotado</span>';
    } else {
      statusBadge = '<span class="badge badge-success">Activo</span>';
    }

    return `
      <div style="padding: 20px 0; border-bottom: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
              <code style="font-size: 18px; font-weight: 700; background: rgba(216, 112, 147, 0.15); padding: 4px 12px; border-radius: 6px; color: var(--accent);">
                ${coupon.code}
              </code>
              ${statusBadge}
            </div>
            <p style="color: var(--text-dim); margin: 8px 0; font-size: 14px;">
              ${coupon.description || 'Sin descripción'}
            </p>
            <div style="display: flex; gap: 20px; margin-top: 12px; font-size: 13px;">
              <span style="color: var(--accent); font-weight: 700; font-size: 16px;">${valueDisplay}</span>
              <span style="color: var(--text-muted);">
                📊 Usado: <strong>${coupon.used_count}</strong>${coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' (ilimitado)'}
              </span>
              ${coupon.expires_at ? `
                <span style="color: var(--text-muted);">
                  ⏰ Expira: ${new Date(coupon.expires_at).toLocaleDateString()}
                </span>
              ` : '<span style="color: var(--text-muted);">⏰ No expira</span>'}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm" onclick="editCoupon('${coupon.id}')">✏️</button>
            <button class="btn btn-sm ${coupon.is_active ? 'btn-warning' : 'btn-success'}" 
              onclick="toggleCoupon('${coupon.id}', ${!coupon.is_active})">
              ${coupon.is_active ? '⏸️ Pausar' : '▶️ Activar'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteCoupon('${coupon.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

window.editCoupon = async function(id) {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  
  const { data: coupon, error } = await sb.from('discount_coupons').select('*').eq('id', id).single();
  
  if (error || !coupon) {
    alert('Error al cargar cupón');
    return;
  }

  document.getElementById('couponModalTitle').textContent = 'Editar Cupón';
  document.getElementById('editCouponId').value = coupon.id;
  document.getElementById('couponCode').value = coupon.code || '';
  document.getElementById('couponDescription').value = coupon.description || '';
  document.getElementById('couponType').value = coupon.discount_type || 'percentage';
  document.getElementById('couponValue').value = coupon.discount_value || '';
  document.getElementById('couponLimit').value = coupon.usage_limit || '';
  document.getElementById('couponExpires').value = coupon.expires_at ? coupon.expires_at.slice(0, 10) : '';
  document.getElementById('couponIsActive').checked = coupon.is_active !== false;
  
  openModal('couponModal');
};

window.toggleCoupon = async function(id, activate) {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );

  const { error } = await sb
    .from('discount_coupons')
    .update({ is_active: activate })
    .eq('id', id);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  loadCoupons();
};

window.deleteCoupon = async function(id) {
  if (!confirm('¿Eliminar este cupón? Esta acción no se puede deshacer.')) return;

  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );

  const { error } = await sb.from('discount_coupons').delete().eq('id', id);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  loadCoupons();
};

async function saveCoupon() {
  const sb = window.sb || window.supabase?.createClient(
    window.SUPABASE_URL || "https://daijiuqqafvjofafwqck.supabase.co",
    window.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWppdXFxYWZ2am9mYWZ3cWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTk0MjMsImV4cCI6MjA4ODAzNTQyM30.DtdQALhTs8mt91GiBoWSrPbW2wc2EY5cmPXf-7oSC-g"
  );
  
  if (!sb) {
    alert('Error: Cliente de Supabase no disponible');
    return;
  }
  
  const id = document.getElementById('editCouponId').value;
  const code = document.getElementById('couponCode').value.trim().toUpperCase();
  const description = document.getElementById('couponDescription').value.trim();
  const discountType = document.getElementById('couponType').value;
  const discountValue = parseFloat(document.getElementById('couponValue').value);
  const usageLimit = document.getElementById('couponLimit').value ? parseInt(document.getElementById('couponLimit').value) : null;
  const expiresAt = document.getElementById('couponExpires').value || null;
  const isActive = document.getElementById('couponIsActive').checked;

  if (!code || !discountValue || discountValue <= 0) {
    alert('Por favor completa el código y un valor válido');
    return;
  }

  if (code.length < 3) {
    alert('El código debe tener al menos 3 caracteres');
    return;
  }

  const data = {
    code,
    description,
    discount_type: discountType,
    discount_value: discountValue,
    usage_limit: usageLimit,
    expires_at: expiresAt,
    is_active: isActive
  };

  try {
    if (id) {
      const { error } = await sb.from('discount_coupons').update(data).eq('id', id);
      if (error) throw error;
    } else {
      data.used_count = 0;
      const { error } = await sb.from('discount_coupons').insert(data);
      if (error) throw error;
    }

    closeModal('couponModal');
    loadCoupons();
    alert('✅ Cupón guardado correctamente');
  } catch (error) {
    alert('Error al guardar cupón: ' + error.message);
    console.error(error);
  }
}

// Exportar
window.couponsSystem = {
  init: initCouponsSystem,
  load: loadCoupons
};
