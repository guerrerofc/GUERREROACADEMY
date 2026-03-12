// ========================================
// GESTIÓN DE USUARIOS - SUPER ADMIN
// ========================================

console.log('👥 Sistema de gestión de usuarios cargado');

// Variables globales
let currentEditingUserId = null;

// ========================================
// INICIALIZAR MÓDULO
// ========================================
function initUsersManagement() {
  console.log('🔧 Inicializando gestión de usuarios...');
  
  const btnAddUser = document.getElementById('btnAddUser');
  const btnSaveUser = document.getElementById('saveUser');
  const userRoleSelect = document.getElementById('userRole');
  
  if (!btnAddUser || !btnSaveUser) {
    console.warn('⚠️ Botones de usuarios no encontrados');
    return;
  }

  // Evento: Abrir modal para nuevo usuario
  btnAddUser.addEventListener('click', () => {
    openUserModal();
  });

  // Evento: Guardar usuario
  btnSaveUser.addEventListener('click', async () => {
    await saveUser();
  });

  // Evento: Mostrar/ocultar campos según rol
  userRoleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    const phoneGroup = document.getElementById('phoneGroup');
    
    // Mostrar teléfono solo para padres
    if (role === 'parent') {
      phoneGroup.style.display = 'block';
    } else {
      phoneGroup.style.display = 'none';
    }
  });

  console.log('✅ Gestión de usuarios inicializada');
}

// ========================================
// CARGAR USUARIOS
// ========================================
async function loadUsers() {
  console.log('📥 Cargando usuarios...');
  
  const sb = window.sb;
  if (!sb) {
    console.error('❌ Supabase no disponible');
    return;
  }

  try {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;

    usersTable.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Cargando usuarios...</td></tr>';

    // Obtener todos los usuarios de Supabase Auth (requiere permisos de admin)
    // Como no tenemos acceso directo a auth.users desde el cliente, 
    // vamos a cargar usuarios desde las tablas parents y staff
    
    const usersData = [];

    // 1. Cargar padres
    const { data: parents, error: parentsError } = await sb
      .from('parents')
      .select('*')
      .order('created_at', { ascending: false });

    if (parents && !parentsError) {
      parents.forEach(parent => {
        usersData.push({
          id: parent.id,
          email: parent.email,
          name: parent.name || 'Sin nombre',
          role: 'parent',
          roleLabel: '👨‍👩‍👧 Padre',
          status: 'Activo',
          source: 'parents'
        });
      });
    }

    // 2. Cargar staff
    const { data: staff, error: staffError } = await sb
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (staff && !staffError) {
      staff.forEach(member => {
        usersData.push({
          id: member.id,
          email: member.email,
          name: member.name || 'Sin nombre',
          role: 'staff',
          roleLabel: '👨‍🏫 Staff',
          status: 'Activo',
          source: 'staff'
        });
      });
    }

    // 3. Super admins (estos solo están en auth, los detectamos por exclusión)
    // Por ahora, mostraremos un mensaje si no hay usuarios
    
    if (usersData.length === 0) {
      usersTable.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 32px; color: var(--text-dim);">
            <div style="font-size: 48px; margin-bottom: 12px;">👤</div>
            <p>No hay usuarios registrados aún</p>
            <p style="font-size: 13px; margin-top: 8px;">Crea el primer usuario haciendo click en "+ Nuevo Usuario"</p>
          </td>
        </tr>
      `;
      return;
    }

    // Renderizar tabla
    usersTable.innerHTML = usersData.map(user => `
      <tr>
        <td>${user.email}</td>
        <td>${user.name}</td>
        <td><span class="badge badge-${user.role === 'parent' ? 'success' : 'primary'}">${user.roleLabel}</span></td>
        <td><span class="badge badge-success">✓ ${user.status}</span></td>
        <td>
          <button class="btn btn-sm" onclick="editUser('${user.id}', '${user.source}')">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}', '${user.source}', '${user.email}')">🗑️ Eliminar</button>
        </td>
      </tr>
    `).join('');

    console.log(`✅ ${usersData.length} usuarios cargados`);

  } catch (error) {
    console.error('❌ Error cargando usuarios:', error);
    document.getElementById('usersTable').innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color: var(--danger);">
          Error al cargar usuarios: ${error.message}
        </td>
      </tr>
    `;
  }
}

// ========================================
// ABRIR MODAL PARA CREAR/EDITAR
// ========================================
function openUserModal(userId = null, source = null) {
  const modal = document.getElementById('userModal');
  const modalTitle = document.getElementById('userModalTitle');
  const saveBtn = document.getElementById('saveUser');
  const passwordGroup = document.getElementById('passwordGroup');
  const emailInput = document.getElementById('userEmail');
  
  if (userId) {
    // Modo edición
    modalTitle.textContent = 'Editar Usuario';
    saveBtn.textContent = 'Guardar Cambios';
    passwordGroup.style.display = 'none'; // No permitir cambiar contraseña en edición
    emailInput.disabled = true; // No permitir cambiar email
    currentEditingUserId = userId;
    loadUserData(userId, source);
  } else {
    // Modo creación
    modalTitle.textContent = 'Nuevo Usuario';
    saveBtn.textContent = 'Crear Usuario';
    passwordGroup.style.display = 'block';
    emailInput.disabled = false;
    currentEditingUserId = null;
    clearUserForm();
  }

  openModal('userModal');
}

// ========================================
// LIMPIAR FORMULARIO
// ========================================
function clearUserForm() {
  document.getElementById('editUserId').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('userName').value = '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value = '';
  document.getElementById('userPhone').value = '';
  document.getElementById('phoneGroup').style.display = 'none';
}

// ========================================
// CARGAR DATOS DE USUARIO PARA EDITAR
// ========================================
async function loadUserData(userId, source) {
  const sb = window.sb;
  if (!sb) return;

  try {
    const { data, error } = await sb
      .from(source)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    document.getElementById('editUserId').value = userId;
    document.getElementById('userEmail').value = data.email || '';
    document.getElementById('userName').value = data.name || '';
    document.getElementById('userRole').value = source === 'parents' ? 'parent' : 'staff';
    document.getElementById('userPhone').value = data.phone || '';
    
    if (source === 'parents') {
      document.getElementById('phoneGroup').style.display = 'block';
    }

  } catch (error) {
    console.error('❌ Error cargando datos del usuario:', error);
    alert('Error al cargar datos del usuario: ' + error.message);
  }
}

// ========================================
// GUARDAR USUARIO (CREAR O ACTUALIZAR)
// ========================================
async function saveUser() {
  const sb = window.sb;
  if (!sb) {
    alert('Error: Supabase no disponible');
    return;
  }

  const userId = currentEditingUserId;
  const email = document.getElementById('userEmail').value.trim();
  const name = document.getElementById('userName').value.trim();
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;
  const phone = document.getElementById('userPhone').value.trim();

  // Validaciones
  if (!email || !name || !role) {
    alert('Por favor completa todos los campos obligatorios (Email, Nombre y Rol)');
    return;
  }

  if (!userId && (!password || password.length < 6)) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Por favor ingresa un email válido');
    return;
  }

  const saveBtn = document.getElementById('saveUser');
  saveBtn.disabled = true;
  saveBtn.textContent = userId ? 'Guardando...' : 'Creando...';

  try {
    if (userId) {
      // ACTUALIZAR usuario existente
      await updateUser(userId, { name, phone, role });
    } else {
      // CREAR nuevo usuario
      await createUser(email, password, name, role, phone);
    }

    closeModal('userModal');
    await loadUsers();
    alert(userId ? '✅ Usuario actualizado correctamente' : '✅ Usuario creado correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al guardar usuario: ' + error.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = userId ? 'Guardar Cambios' : 'Crear Usuario';
  }
}

// ========================================
// CREAR NUEVO USUARIO
// ========================================
async function createUser(email, password, name, role, phone) {
  const sb = window.sb;
  
  console.log('🆕 Creando nuevo usuario:', { email, name, role });

  // 1. Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await sb.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name,
        role: role
      }
    }
  });

  if (authError) {
    console.error('❌ Error creando usuario en Auth:', authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('No se pudo crear el usuario en el sistema de autenticación');
  }

  console.log('✅ Usuario creado en Auth:', authData.user.id);

  // 2. Crear registro en la tabla correspondiente según el rol
  if (role === 'parent') {
    const { error: parentError } = await sb.from('parents').insert({
      id: authData.user.id,
      email: email,
      name: name,
      phone: phone || null,
      created_at: new Date().toISOString()
    });

    if (parentError) {
      console.error('❌ Error creando registro en parents:', parentError);
      throw new Error('Usuario creado pero error al guardar datos de padre: ' + parentError.message);
    }
  } else if (role === 'staff') {
    const { error: staffError } = await sb.from('staff').insert({
      id: authData.user.id,
      email: email,
      name: name,
      phone: phone || null,
      created_at: new Date().toISOString()
    });

    if (staffError) {
      console.error('❌ Error creando registro en staff:', staffError);
      throw new Error('Usuario creado pero error al guardar datos de staff: ' + staffError.message);
    }
  }
  // Si es super_admin, no necesita registro en otra tabla

  console.log('✅ Usuario creado completamente');
}

// ========================================
// ACTUALIZAR USUARIO EXISTENTE
// ========================================
async function updateUser(userId, data) {
  const sb = window.sb;
  
  console.log('✏️ Actualizando usuario:', userId, data);

  const table = data.role === 'parent' ? 'parents' : 'staff';
  
  const { error } = await sb
    .from(table)
    .update({
      name: data.name,
      phone: data.phone || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('❌ Error actualizando usuario:', error);
    throw new Error(error.message);
  }

  console.log('✅ Usuario actualizado');
}

// ========================================
// EDITAR USUARIO
// ========================================
window.editUser = function(userId, source) {
  openUserModal(userId, source);
};

// ========================================
// ELIMINAR USUARIO
// ========================================
window.deleteUser = async function(userId, source, email) {
  const confirmed = confirm(`¿Estás seguro de eliminar al usuario ${email}?\n\nEsta acción NO se puede deshacer.`);
  
  if (!confirmed) return;

  const sb = window.sb;
  if (!sb) return;

  try {
    // Eliminar de la tabla correspondiente
    const { error } = await sb
      .from(source)
      .delete()
      .eq('id', userId);

    if (error) throw error;

    // Nota: No podemos eliminar del auth desde el cliente
    // El admin deberá hacerlo manualmente desde Supabase Dashboard si es necesario

    alert('✅ Usuario eliminado correctamente');
    await loadUsers();

  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    alert('Error al eliminar usuario: ' + error.message);
  }
};

// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.usersManagement = {
  init: initUsersManagement,
  load: loadUsers
};

console.log('✅ Módulo de gestión de usuarios listo');
