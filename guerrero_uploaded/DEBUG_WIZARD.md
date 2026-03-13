# 🐛 DEBUG: Wizard de Inscripción

## 🎯 Problema Reportado
El wizard del formulario de inscripción salta del Paso 1 (Tutor) directo al Paso 3 (Confirmar), omitiendo el Paso 2 (Datos del Jugador).

---

## 🔧 Cambios de Debug Implementados

He agregado logs detallados en el código para identificar el problema:

### **Logs Agregados:**
1. ✅ Cuando carga el wizard: muestra cuántas páginas detectó y su orden
2. ✅ Cuando haces clic en "Continuar": muestra paso actual
3. ✅ Durante validación: muestra cada campo validado
4. ✅ Cuando cambia de paso: muestra cuál página se activa/desactiva

---

## 🧪 Cómo Probar y Recopilar Logs

### **PASO 1: Esperar Deploy**
```
Vercel está desplegando los cambios (2-3 minutos)
```

### **PASO 2: Abrir Consola ANTES de Usar el Formulario**
```
1. Ve a: https://guerreroacademy.vercel.app

2. Presiona F12 (abrir DevTools)

3. Ve a la pestaña "Console"

4. IMPORTANTE: Deja la consola abierta todo el tiempo
```

### **PASO 3: Llenar el Formulario Paso a Paso**
```
1. Scroll hasta el formulario de inscripción

2. Llena el Paso 1 (Datos del Tutor):
   - Nombre del tutor
   - Email
   - WhatsApp

3. HAZ CLIC EN "Continuar"

4. Observa los logs en la consola
```

---

## 📊 Logs Esperados (Normal)

### **Al cargar la página:**
```
📄 Páginas del wizard cargadas: 3
  Página 0: 0 Datos del tutor
  Página 1: 1 Datos del jugador
  Página 2: 2 Confirmación
```

### **Al hacer clic en "Continuar" del Paso 1:**
```
➡️ Botón CONTINUAR clickeado, paso actual: 0
🔍 Validando paso: 0
  - Padre: ✅ Diego Guerrero
  - WhatsApp: ✅ 8296396001
  - Email: ✅ diego@gmail.com
  ✅ Validación del paso 0 exitosa
✅ Validación pasó, avanzando a paso: 1
🔄 setStep llamado: paso 1 → idx final: 1
  Página 0 (0): ❌ inactiva
  Página 1 (1): ✅ ACTIVA      ← Aquí debería mostrar Paso 2
  Página 2 (2): ❌ inactiva
```

---

## 🔴 Logs Anormales (Si Hay Problema)

### **Problema 1: Solo detecta 2 páginas**
```
📄 Páginas del wizard cargadas: 2   ← ❌ Debería ser 3
  Página 0: 0 Datos del tutor
  Página 1: 2 Confirmación          ← ❌ Falta Página 1
```

### **Problema 2: Salta al paso 2 directamente**
```
🔄 setStep llamado: paso 1 → idx final: 1
  Página 0 (0): ❌ inactiva
  Página 1 (2): ✅ ACTIVA      ← ❌ Muestra data-step="2" en vez de "1"
```

### **Problema 3: Validación falla pero avanza igual**
```
❌ Validación falló: Email inválido.
✅ Validación pasó, avanzando...   ← ❌ Esto no debería pasar
```

---

## 📸 Qué Necesito que Compartas

Haz lo siguiente y comparte capturas:

### **Captura 1: Logs al cargar**
```
Refresca la página con F12 abierto
Busca los logs que empiezan con "📄 Páginas del wizard"
Toma captura
```

### **Captura 2: Logs al hacer clic en "Continuar"**
```
Llena el Paso 1
Haz clic en "Continuar"
Busca los logs que empiezan con "➡️ Botón CONTINUAR"
Toma captura de TODOS los logs que aparezcan
```

### **Captura 3: Qué página se ve**
```
Después de hacer clic en "Continuar"
Toma captura de qué paso del formulario se muestra
¿Es el Paso 2 o el Paso 3?
```

---

## 🎯 Con Esos Logs Sabré:

1. ✅ Si las 3 páginas se están detectando correctamente
2. ✅ Si la validación está funcionando
3. ✅ Si el problema es en setStep() o en el CSS
4. ✅ Exactamente dónde está el bug

---

## ⏱️ Timeline

1. **Ahora**: Vercel está desplegando (~2 min)
2. **En 2 min**: Refresca la app y prueba con F12 abierto
3. **Comparte**: Los 3 tipos de capturas de arriba
4. **Yo arreglo**: El problema específico que detectemos

---

**Una vez tengas los logs, compártelos y te doy la solución exacta en minutos.** 🔍
