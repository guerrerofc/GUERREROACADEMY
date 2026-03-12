// ========================================
// GESTIÓN DE USUARIOS - DIRECTOR (RESTRINGIDO)
// ========================================

console.log('👥 Sistema de gestión de usuarios (Director) cargado');

// Variable global para indicar que es panel de director
window.isDirectorPanel = true;

// Inyectar restricciones en el sistema de usuarios
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    restrictUserRoleOptions();
  }, 1000);
});

// ========================================
// RESTRINGIR OPCIONES DE ROL
// ========================================
function restrictUserRoleOptions() {
  console.log('🔒 Aplicando restricciones de Director...');
  
  const roleSelect = document.getElementById('newUserRole');
  if (!roleSelect) {
    console.warn('⚠️ Campo de rol no encontrado');
    return;
  }

  // Remover opción de crear Super Admin
  roleSelect.innerHTML = `
    <option value="">Selecciona un rol...</option>
    <option value="staff">👨‍🏫 Staff/Coach (asistencia y gestión)</option>
    <option value="parent">👨‍👩‍👧 Padre (consulta y pagos)</option>
  `;

  console.log('✅ Restricciones aplicadas: Solo Staff y Padres');
}

// ========================================
// INTERCEPTAR GUARDADO PARA VALIDAR
// ========================================
const originalSaveUser = window.usersManagement?.saveUser;
if (originalSaveUser) {
  // Sobrescribir función para agregar validación adicional
  const saveUserBtn = document.getElementById('saveUser');
  if (saveUserBtn) {
    saveUserBtn.addEventListener('click', (e) => {
      const roleSelect = document.getElementById('newUserRole');
      if (roleSelect) {
        const selectedRole = roleSelect.value;
        
        // Validar que no intente crear super admin
        if (selectedRole === 'super_admin') {
          e.preventDefault();
          e.stopImmediatePropagation();
          alert('❌ Como Director, solo puedes crear usuarios de tipo Staff o Padre');
          return false;
        }
      }
    }, true); // Captura antes que otros listeners
  }
}

console.log('✅ Restricciones de Director activas');
