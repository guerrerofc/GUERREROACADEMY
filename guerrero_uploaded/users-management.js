// ========================================
// GESTIÓN DE USUARIOS - SUPER ADMIN
// ========================================

console.log('👥 Sistema de gestión de usuarios cargado');

// Variables globales
let currentEditingUserId = null;

// Función para limpiar formulario
function clearUserForm() {
  const fields = ['editUserId', 'newUserEmail', 'newUserName', 'newUserPassword', 'newUserRole', 'newUserPhone'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// Función para cargar datos de usuario para edición
function loadUserData(userId, source) {
  const sb = window.sb;
  if (!sb) return;
  
  sb.from('users').select('*').eq('id', userId).single().then(({ data, error }) => {
    if (error || !data) {
      console.error('Error cargando usuario:', error);
      return;
    }
    
    const emailField = document.getElementById('newUserEmail');
    const nameField = document.getElementById('newUserName');
    const roleField = document.getElementById('newUserRole');
    
    if (emailField) emailField.value = data.email || '';
    if (nameField) nameField.value = data.nombre || '';
    if (roleField) roleField.value = data.rol || 'parent';
  });
}

// Declarar funciones globales
window.openUserModal = function(userId = null, source = null) {
  const modal = document.getElementById('userModal');
  const modalTitle = document.getElementById('userModalTitle');
  const saveBtn = document.getElementById('saveUser');
  const passwordGroup = document.getElementById('passwordGroup');
  const emailInput = document.getElementById('newUserEmail');
  
  if (userId) {
    modalTitle.textContent = 'Editar Usuario';
    saveBtn.textContent = 'Guardar Cambios';
    if (passwordGroup) passwordGroup.style.display = 'none';
    if (emailInput) emailInput.disabled = true;
    currentEditingUserId = userId;
    loadUserData(userId, source);
  } else {
    modalTitle.textContent = 'Nuevo Usuario';
    saveBtn.textContent = 'Crear Usuario';
    if (passwordGroup) passwordGroup.style.display = 'block';
    if (emailInput) emailInput.disabled = false;
    currentEditingUserId = null;
    clearUserForm();
  }
  openModal('userModal');
};

window.editUser = function(userId, source) {
  window.openUserModal(userId, source);
};

window.deleteUser = async function(userId, email) {
  if (!confirm(`¿Eliminar al usuario ${email}?`)) return;
  
  const sb = window.sb;
  const { error } = await sb.from('users').delete().eq('id', userId);
  
  if (error) {
    alert('Error al eliminar: ' + error.message);
    return;
  }
  
  alert('Usuario eliminado');
  loadUsers();
};

// ========================================
// INICIALIZAR MÓDULO
// ========================================
function initUsersManagement() {
  console.log('🔧 Inicializando gestión de usuarios...');
  
  const btnAddUser = document.getElementById('btnAddUser');
  const btnSaveUser = document.getElementById('saveUser');
  const userRoleSelect = document.getElementById('newUserRole');
  
  if (!btnAddUser || !btnSaveUser) {
    console.warn('⚠️ Botones de usuarios no encontrados');
    return;
  }

  // Evento: Abrir modal para nuevo usuario
  btnAddUser.onclick = function() {
    window.openUserModal();
  };

  // Evento: Guardar usuario
  btnSaveUser.onclick = async function() {
    await saveUser();
  };

  // Evento: Mostrar/ocultar campos según rol
  if (userRoleSelect) {
    userRoleSelect.addEventListener('change', (e) => {
      const role = e.target.value;
      const phoneGroup = document.getElementById('phoneGroup');
      
      // Mostrar teléfono solo para padres
      if (role === 'parent' && phoneGroup) {
        phoneGroup.style.display = 'block';
      } else if (phoneGroup) {
        phoneGroup.style.display = 'none';
      }
    });
  }

  console.log('✅ Gestión de usuarios inicializada');
}

// ========================================
// CARGAR USUARIOS
// ========================================
async function loadUsers() {
  console.log('📥 [users-management.js] Cargando usuarios desde tabla users...');
  
  const sb = window.sb;
  if (!sb) {
    console.error('❌ Supabase no disponible');
    return;
  }

  try {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) {
      console.log('⚠️ usersTable no encontrado, usando sistema inline');
      return;
    }

    usersTable.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Cargando usuarios...</td></tr>';

    // Cargar todos los usuarios de la tabla users
    const { data: users, error } = await sb
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error cargando usuarios:', error);
      throw error;
    }

    const usersData = (users || []).map(user => {
      let roleLabel = 'Usuario';
      let badgeClass = 'primary';
      
      switch(user.rol) {
        case 'parent':
          roleLabel = 'Padre';
          badgeClass = 'success';
          break;
        case 'staff':
          roleLabel = 'Staff';
          badgeClass = 'primary';
          break;
        case 'director':
          roleLabel = 'Director';
          badgeClass = 'warning';
          break;
        case 'super_admin':
          roleLabel = 'Super Admin';
          badgeClass = 'danger';
          break;
      }
      
      return {
        id: user.id,
        email: user.email,
        name: user.nombre || 'Sin nombre',
        role: user.rol,
        roleLabel: roleLabel,
        status: user.activo !== false ? 'Activo' : 'Inactivo',
        badgeClass: badgeClass
      };
    });
    
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
        <td><span class="badge badge-${user.badgeClass}">${user.roleLabel}</span></td>
        <td><span class="badge badge-${user.status === 'Activo' ? 'success' : 'secondary'}">${user.status}</span></td>
        <td>
          <button class="btn btn-sm" onclick="editUser('${user.id}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}', '${user.email}')">Eliminar</button>
        </td>
      </tr>
    `).join('');

    console.log(`✅ ${usersData.length} usuarios cargados desde tabla users`);

  } catch (error) {
    console.error('❌ Error cargando usuarios:', error);
    const usersTable = document.getElementById('usersTable');
    if (usersTable) {
      usersTable.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color: var(--danger);">
            Error al cargar usuarios: ${error.message}
          </td>
      </tr>
    `;
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
  const emailField = document.getElementById('newUserEmail');
  const nameField = document.getElementById('newUserName');
  const passwordField = document.getElementById('newUserPassword');
  const roleField = document.getElementById('newUserRole');
  const phoneField = document.getElementById('newUserPhone');
  
  const email = emailField ? emailField.value.trim() : '';
  const name = nameField ? nameField.value.trim() : '';
  const password = passwordField ? passwordField.value : '';
  const role = roleField ? roleField.value : '';
  const phone = phoneField ? phoneField.value.trim() : '';

  console.log('📝 Datos del formulario:', { email, name, role, hasPassword: !!password });

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

  // 1. Crear registro en la tabla users (esto es suficiente)
  const { data: userData, error: userError } = await sb
    .from('users')
    .insert({
      email: email,
      nombre: name,
      rol: role,
      activo: true,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (userError) {
    console.error('❌ Error creando usuario:', userError);
    throw new Error(userError.message);
  }

  console.log('✅ Usuario creado completamente:', userData);
  return userData;
}

// ========================================
// ACTUALIZAR USUARIO EXISTENTE
// ========================================
async function updateUser(userId, data) {
  const sb = window.sb;
  
  console.log('✏️ Actualizando usuario:', userId, data);

  const { error } = await sb
    .from('users')
    .update({
      nombre: data.name,
      rol: data.role,
      activo: data.activo !== undefined ? data.activo : true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('❌ Error actualizando usuario:', error);
    throw new Error(error.message);
  }

  console.log('✅ Usuario actualizado');
}

  console.log('✅ Usuario actualizado');
}

// ========================================
// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================
window.usersManagement = {
  init: initUsersManagement,
  load: loadUsers
};

console.log('✅ Módulo de gestión de usuarios listo');
