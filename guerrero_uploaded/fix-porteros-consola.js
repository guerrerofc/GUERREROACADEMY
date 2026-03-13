// ========================================
// SCRIPT DE FIX PARA PORTEROS
// Ejecutar desde consola del navegador en super-admin.html
// ========================================

async function fixPorterosDesdeConsola() {
  console.log('🔍 DIAGNÓSTICO DE PORTEROS\n');

  // 1. Verificar categoría Porteros
  const { data: categoriaPorteros, error: catError } = await sb
    .from('categories')
    .select('id, name, max_players')
    .eq('name', 'Porteros')
    .single();

  if (catError || !categoriaPorteros) {
    console.error('❌ No existe la categoría "Porteros"');
    console.error('   Debes ejecutar SQL_PORTEROS_COMPLETO.sql en Supabase primero');
    return;
  }

  console.log(`✅ Categoría "Porteros" encontrada:`);
  console.log(`   ID: ${categoriaPorteros.id}`);
  console.log(`   Capacidad: ${categoriaPorteros.max_players}\n`);

  // 2. Obtener jugadores marcados como porteros
  const { data: porteros, error: playersError } = await sb
    .from('players')
    .select('id, nombre, es_portero, status')
    .eq('es_portero', true)
    .eq('status', 'activo');

  if (playersError) {
    console.error('❌ Error al obtener jugadores:', playersError.message);
    return;
  }

  console.log(`📊 Jugadores con es_portero=true: ${porteros?.length || 0}`);
  if (porteros && porteros.length > 0) {
    console.log('   Jugadores:', porteros.map(p => p.nombre).join(', '));
  }
  console.log('');

  if (!porteros || porteros.length === 0) {
    console.log('ℹ️  No hay jugadores marcados como porteros');
    return;
  }

  // 3. Verificar cuántos están asignados
  const { data: asignaciones, error: pcError } = await sb
    .from('player_categories')
    .select('player_id')
    .eq('category_id', categoriaPorteros.id);

  console.log(`📊 Ya asignados a categoría Porteros: ${asignaciones?.length || 0}\n`);

  const asignadosIds = new Set(asignaciones?.map(a => a.player_id) || []);
  const sinAsignar = porteros.filter(p => !asignadosIds.has(p.id));

  if (sinAsignar.length === 0) {
    console.log('✅ Todos los porteros ya están asignados correctamente!');
    return;
  }

  console.log(`⚠️  Porteros SIN asignar: ${sinAsignar.length}`);
  console.log('   Jugadores:', sinAsignar.map(p => p.nombre).join(', '));
  console.log('\n🔧 ARREGLANDO ASIGNACIONES...\n');

  // 4. Asignar porteros faltantes
  const asignacionesNuevas = sinAsignar.map(p => ({
    player_id: p.id,
    category_id: categoriaPorteros.id
  }));

  const { data: inserted, error: insertError } = await sb
    .from('player_categories')
    .upsert(asignacionesNuevas, { onConflict: 'player_id,category_id' })
    .select();

  if (insertError) {
    console.error('❌ Error al asignar:', insertError.message);
    console.error('   Detalles:', insertError);
    return;
  }

  console.log(`\n✅ ${sinAsignar.length} porteros asignados correctamente!`);
  console.log('   Jugadores asignados:', sinAsignar.map(p => p.nombre).join(', '));
  console.log('\n🎉 FIX COMPLETADO - Recarga la página (F5)');
  
  // Recargar automáticamente después de 2 segundos
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Ejecutar automáticamente
fixPorterosDesdeConsola();
