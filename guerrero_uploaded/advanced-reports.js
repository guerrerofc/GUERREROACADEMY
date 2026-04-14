// ========================================
// REPORTES AVANZADOS - GUERRERO ACADEMY
// ========================================

let incomeChart, retentionChart, attendanceChart;

async function loadReports() {
  console.log('📊 Cargando reportes avanzados...');
  
  try {
    // Cargar datos en paralelo (con fallbacks para tablas que no existan)
    const [paymentsRes, playersRes, playerCatsRes, attendanceRes] = await Promise.all([
      sb.from('payments').select('*'),
      sb.from('players').select('*'),
      sb.from('player_categories').select('player_id, category_id'),
      sb.from('attendance').select('*')
    ]);
    
    const payments = paymentsRes.data || [];
    const playersData = playersRes.data || [];
    const playerCats = playerCatsRes.data || [];
    const attendance = attendanceRes.data || [];
    const sessions = [];

    // 1. DASHBOARD EJECUTIVO
    await loadExecutiveDashboard(payments, playersData, playerCats, sessions, attendance);

    // 2. INGRESOS MENSUALES
    await loadIncomeChart(payments);

    // 3. FIDELIDAD POR CATEGORÍA
    await loadRetentionAnalysis(playersData, playerCats);

    // 4. ASISTENCIA POR CATEGORÍA
    await loadAttendanceChart(sessions, attendance, playerCats);
  } catch (err) {
    console.error('Error cargando reportes:', err);
  }
}

async function loadExecutiveDashboard(payments, playersData, playerCats, sessions, attendance) {
  // KPI 1: Ingresos del mes actual
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthPayments = (payments || []).filter(p => 
    p.status === 'paid' && new Date(p.created_at) >= firstDayOfMonth
  );
  const monthlyIncome = currentMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  
  // Comparar con mes anterior
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthPayments = (payments || []).filter(p => 
    p.status === 'paid' && new Date(p.created_at) >= lastMonth && new Date(p.created_at) <= lastMonthEnd
  );
  const lastMonthIncome = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const incomeTrend = lastMonthIncome > 0 ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1) : 0;

  document.getElementById('kpiIngresos').textContent = formatMoney(monthlyIncome);
  document.getElementById('kpiIngresosTrend').textContent = `${incomeTrend > 0 ? '+' : ''}${incomeTrend}% vs mes anterior`;
  document.getElementById('kpiIngresosTrend').style.color = incomeTrend >= 0 ? 'var(--success)' : 'var(--danger)';

  // KPI 2: Ocupación
  const activePlayers = (playersData || []).filter(p => p.status === 'activo').length;
  const totalCapacity = categories.reduce((sum, c) => sum + (c.max_players || 30), 0);
  const occupancyRate = ((activePlayers / totalCapacity) * 100).toFixed(0);

  document.getElementById('kpiOcupacion').textContent = `${occupancyRate}%`;
  document.getElementById('kpiOcupacionText').textContent = `${activePlayers} de ${totalCapacity} cupos`;

  // KPI 3: Asistencia promedio (últimas 4 semanas)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const recentSessions = (sessions || []).filter(s => new Date(s.fecha) >= fourWeeksAgo);
  const recentAttendance = (attendance || []).filter(a => 
    recentSessions.some(s => s.id === a.session_id)
  );
  const presentCount = recentAttendance.filter(a => a.estado === 'present').length;
  const attendanceRate = recentAttendance.length > 0 ? ((presentCount / recentAttendance.length) * 100).toFixed(0) : 0;

  document.getElementById('kpiAsistencia').textContent = `${attendanceRate}%`;
  document.getElementById('kpiAsistenciaText').textContent = `Últimas 4 semanas`;

  // KPI 4: Retención (jugadores activos vs creados hace 3+ meses)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const oldPlayers = (playersData || []).filter(p => new Date(p.created_at) <= threeMonthsAgo);
  const stillActive = oldPlayers.filter(p => p.status === 'activo').length;
  const retentionRate = oldPlayers.length > 0 ? ((stillActive / oldPlayers.length) * 100).toFixed(0) : 0;

  document.getElementById('kpiRetencion').textContent = `${retentionRate}%`;
  document.getElementById('kpiRetencionText').textContent = `${stillActive} de ${oldPlayers.length} jugadores`;
}

async function loadIncomeChart(payments) {
  const now = new Date();
  const last6Months = [];
  
  // Generar últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push(date);
  }

  const monthlyData = last6Months.map(month => {
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const monthPayments = (payments || []).filter(p => {
      const pDate = new Date(p.created_at);
      return p.status === 'paid' && pDate >= month && pDate < nextMonth;
    });
    return monthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  });

  const labels = last6Months.map(d => d.toLocaleDateString('es-DO', { month: 'short', year: '2-digit' }));

  if (incomeChart) incomeChart.destroy();
  
  const ctx = document.getElementById('incomeChart').getContext('2d');
  incomeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ingresos',
        data: monthlyData,
        backgroundColor: 'rgba(216, 112, 147, 0.8)',
        borderColor: 'rgba(216, 112, 147, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Ingresos: ${formatMoney(context.parsed.y)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            callback: (value) => `$${(value / 1000).toFixed(0)}K`
          },
          grid: { color: 'rgba(255, 255, 255, 0.06)' }
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.6)' },
          grid: { display: false }
        }
      }
    }
  });
}

async function loadRetentionAnalysis(playersData, playerCats) {
  // Calcular retención por categoría
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const retentionByCategory = {};
  
  categories.forEach(cat => {
    const catPlayers = (playerCats || [])
      .filter(pc => pc.category_id === cat.id)
      .map(pc => (playersData || []).find(p => p.id === pc.player_id))
      .filter(p => p);

    const oldPlayers = catPlayers.filter(p => new Date(p.created_at) <= threeMonthsAgo);
    const stillActive = oldPlayers.filter(p => p.status === 'activo').length;
    const rate = oldPlayers.length > 0 ? ((stillActive / oldPlayers.length) * 100).toFixed(0) : 0;

    retentionByCategory[cat.name] = {
      total: oldPlayers.length,
      active: stillActive,
      rate: Number(rate)
    };
  });

  // Gráfico de barras horizontales
  const labels = Object.keys(retentionByCategory);
  const data = Object.values(retentionByCategory).map(v => v.rate);

  if (retentionChart) retentionChart.destroy();
  
  const ctx = document.getElementById('retentionChart').getContext('2d');
  retentionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tasa de Retención (%)',
        data: data,
        backgroundColor: data.map(v => v >= 80 ? 'rgba(16, 185, 129, 0.8)' : v >= 60 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            callback: (value) => `${value}%`
          },
          grid: { color: 'rgba(255, 255, 255, 0.06)' }
        },
        y: {
          ticks: { color: 'rgba(255, 255, 255, 0.6)' },
          grid: { display: false }
        }
      }
    }
  });

  // Estadísticas detalladas
  document.getElementById('retentionStats').innerHTML = Object.entries(retentionByCategory).map(([name, stats]) => `
    <div style="padding: 12px 0; border-bottom: 1px solid var(--border);">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <strong>${name}</strong>
        <span style="color: ${stats.rate >= 80 ? 'var(--success)' : stats.rate >= 60 ? 'var(--warning)' : 'var(--danger)'}; font-weight: 700;">${stats.rate}%</span>
      </div>
      <div style="font-size: 12px; color: var(--text-dim);">
        ${stats.active} activos de ${stats.total} (3+ meses)
      </div>
    </div>
  `).join('');
}

async function loadAttendanceChart(sessions, attendance, playerCats) {
  // Asistencia promedio por categoría (últimas 4 semanas)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const attendanceByCategory = {};
  
  categories.forEach(cat => {
    const catSessions = (sessions || []).filter(s => 
      s.category_id === cat.id && new Date(s.fecha) >= fourWeeksAgo
    );
    
    if (catSessions.length === 0) {
      attendanceByCategory[cat.name] = 0;
      return;
    }

    const catAttendance = (attendance || []).filter(a => 
      catSessions.some(s => s.id === a.session_id)
    );
    
    const presentCount = catAttendance.filter(a => a.estado === 'present').length;
    const rate = catAttendance.length > 0 ? ((presentCount / catAttendance.length) * 100).toFixed(0) : 0;
    
    attendanceByCategory[cat.name] = Number(rate);
  });

  const labels = Object.keys(attendanceByCategory);
  const data = Object.values(attendanceByCategory);

  if (attendanceChart) attendanceChart.destroy();
  
  const ctx = document.getElementById('attendanceChart').getContext('2d');
  attendanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Asistencia Promedio',
        data: data,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Asistencia: ${context.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            callback: (value) => `${value}%`
          },
          grid: { color: 'rgba(255, 255, 255, 0.06)' }
        },
        x: {
          ticks: { color: 'rgba(255, 255, 255, 0.6)' },
          grid: { display: false }
        }
      }
    }
  });
}

// Botón de actualizar reportes
document.addEventListener('DOMContentLoaded', () => {
  const btnRefresh = document.getElementById('btnRefreshReports');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      btnRefresh.disabled = true;
      btnRefresh.textContent = '⏳ Actualizando...';
      loadReports().finally(() => {
        btnRefresh.disabled = false;
        btnRefresh.textContent = '🔄 Actualizar';
      });
    });
  }
});

console.log('✅ Sistema de reportes avanzados cargado');
