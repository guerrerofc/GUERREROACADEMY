// ========================================
// NAVEGACIÓN UNIFICADA - JavaScript
// ========================================

// Crear header de navegación unificado
function crearNavegacionUnificada(paginaActual) {
  const header = document.createElement('div');
  header.className = 'unified-header';
  header.innerHTML = `
    <a href="index.html" class="unified-logo">
      <div class="unified-logo-icon">GA</div>
      <div class="unified-logo-text">Guerrero Academy</div>
    </a>
    
    <nav class="unified-nav">
      <a href="index.html" class="unified-nav-link ${paginaActual === 'home' ? 'active' : ''}">
        🏠 Inicio
      </a>
      <a href="landing-mejorado.html" class="unified-nav-link ${paginaActual === 'landing' ? 'active' : ''}">
        ⚽ Academia
      </a>
      <a href="parent-panel.html" class="unified-nav-link ${paginaActual === 'parent' ? 'active' : ''}">
        👨‍👩‍👧 Padres
      </a>
      <a href="staff-panel.html" class="unified-nav-link ${paginaActual === 'staff' ? 'active' : ''}">
        👨‍🏫 Staff
      </a>
      <a href="super-admin.html" class="unified-nav-link ${paginaActual === 'admin' ? 'active' : ''}">
        👑 Admin
      </a>
    </nav>
    
    <div class="unified-user">
      <span class="unified-user-name" id="unifiedUserName"></span>
      <button class="unified-logout" onclick="cerrarSesion()">Salir</button>
    </div>
  `;
  
  // Insertar al inicio del body
  document.body.insertBefore(header, document.body.firstChild);
  
  // Ajustar padding del contenido para el header fijo
  if (document.querySelector('.main-content')) {
    document.querySelector('.main-content').style.paddingTop = '60px';
  }
  
  // Mostrar nombre de usuario si está logueado
  const userName = localStorage.getItem('userName') || 'Usuario';
  const userNameEl = document.getElementById('unifiedUserName');
  if (userNameEl) {
    userNameEl.textContent = userName;
  }
}

// Función de cerrar sesión
function cerrarSesion() {
  if (confirm('¿Cerrar sesión?')) {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

// Exportar para uso global
window.crearNavegacionUnificada = crearNavegacionUnificada;
window.cerrarSesion = cerrarSesion;

console.log('✅ Navegación unificada cargada');
