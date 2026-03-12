# 🎟️ GUÍA COMPLETA: OFERTAS ASIGNABLES + CUPONES
# Guerrero Academy

## ✅ NUEVAS FUNCIONALIDADES IMPLEMENTADAS

### 1️⃣ **OFERTAS ASIGNABLES A JUGADORES**
Ahora puedes crear ofertas y asignarlas a jugadores específicos.

### 2️⃣ **SISTEMA DE CUPONES/CÓDIGOS DE DESCUENTO**
Los padres pueden ingresar códigos como `VERANO2024` al pagar y recibir descuentos automáticamente.

---

## 📝 PASO 1: EJECUTAR SQL

**Ve a Supabase Dashboard → SQL Editor y ejecuta:**
```
SQL_OFERTAS_Y_CUPONES.sql
```

Esto creará:
- `offer_assignments` - Asignaciones de ofertas a jugadores
- `discount_coupons` - Cupones de descuento
- `coupon_usage` - Historial de uso de cupones
- Funciones: `validate_coupon()` y `apply_coupon()`

---

## 🎁 OFERTAS ASIGNABLES

### Caso de Uso:
Quieres dar un descuento del 20% solo a 3 jugadores específicos (hermanos, por ejemplo).

### Cómo Hacerlo:

1. **Super Admin → Ofertas → + Nueva Oferta**

2. **Completa los datos:**
   - Título: "Descuento Hermanos"
   - Descripción: "20% de descuento para hermanos"
   - Tipo: Porcentaje
   - Valor: 20
   - ⬜ NO marcar "Mostrar en Landing" (es solo para jugadores específicos)
   - ✅ MARCAR "Asignar a Jugadores Específicos"

3. **Busca y selecciona jugadores:**
   - Escribe el nombre en "Buscar Jugadores"
   - Haz clic en cada jugador que quieres incluir
   - Aparecerán como badges azules abajo
   - Puedes agregar cuantos quieras

4. **Guardar**

### ¿Dónde verán los jugadores sus ofertas?
- **Panel de Padres** (próximamente implementado)
- Se aplicarán automáticamente en pagos

---

## 🎟️ SISTEMA DE CUPONES

### Caso de Uso:
Quieres crear códigos que los padres puedan usar al pagar:
- `VERANO2024` = 25% OFF
- `HERMANOS` = RD$ 500 de descuento
- `PROMO10` = 10% OFF (solo 50 usos)

### Cómo Hacerlo:

#### **A) Crear Cupón Simple**

1. **Super Admin → Cupones → + Nuevo Cupón**

2. **Completa:**
   - Código: `VERANO2024` (se convierte auto a mayúsculas)
   - Descripción: "Promoción de verano 2024"
   - Tipo: Porcentaje
   - Valor: 25
   - Límite de Usos: Dejar vacío = ilimitado
   - Fecha de Expiración: Dejar vacío = no expira
   - ✅ Cupón Activo

3. **Guardar**

#### **B) Crear Cupón con Límite**

Ejemplo: Solo 50 personas pueden usarlo

```
Código: PROMO50
Tipo: Porcentaje
Valor: 15
Límite de Usos: 50 ← Solo 50 personas
Fecha de Expiración: 31/12/2024
```

#### **C) Crear Cupón Temporal**

Ejemplo: Solo válido por 1 semana

```
Código: SEMANA1
Tipo: Fijo
Valor: 300 (RD$ 300 de descuento)
Fecha de Expiración: 7 días desde hoy
```

### Gestionar Cupones:

- **▶️ Activar/⏸️ Pausar**: Sin eliminar, puedes pausar temporalmente
- **✏️ Editar**: Cambiar valor, límite, fecha
- **🗑️ Eliminar**: Eliminar permanentemente
- **📊 Ver Estadísticas**: Cuántas veces se usó cada cupón

---

## 💡 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Descuento para Familia con 3 Hermanos

**Opción A: Usar Ofertas Asignables**
```
Crear oferta "Descuento Familiar"
- Tipo: Porcentaje
- Valor: 30
- Asignar a: Juan, Pedro y María Pérez
```

**Opción B: Usar Cuotas Personalizadas**
```
Super Admin → Cuotas → Cuotas Personalizadas
Para cada hermano:
- Cuota: RD$ 2,450 (en vez de 3,500)
- Razón: "Descuento familiar - 3 hermanos"
```

### Ejemplo 2: Promoción de Inscripción

**Crear cupón:**
```
Código: INSCRIPCION2024
Tipo: Fijo
Valor: 1000
Límite: 20 (solo las primeras 20 personas)
Expiración: 15 días
```

**Promocionar:**
- Publica en redes: "Usa el código INSCRIPCION2024 y ahorra RD$ 1,000"
- Los primeros 20 padres lo usan al pagar

### Ejemplo 3: Oferta de Verano General

**Crear oferta:**
```
Título: "Verano 2024 - 20% OFF"
Tipo: Porcentaje
Valor: 20
✅ Mostrar en Landing
Inicio: 01/06/2024
Fin: 31/08/2024
```

Aparece automáticamente en el landing durante el verano.

---

## 🔄 FLUJO COMPLETO: PADRE USA CUPÓN

### Flujo Futuro (cuando integre en pagos):

1. **Padre va a pagar** (Panel de Padres → Pagos)
2. **Ve su cuota**: RD$ 3,500
3. **Ingresa cupón**: `VERANO2024` (25% OFF)
4. **Sistema valida**:
   - ✅ ¿Cupón existe? ✅ Sí
   - ✅ ¿Está activo? ✅ Sí
   - ✅ ¿Expiró? ✅ No
   - ✅ ¿Alcanzó límite? ✅ No
5. **Aplica descuento**: RD$ 3,500 → RD$ 2,625
6. **Padre paga**: RD$ 2,625
7. **Sistema registra**:
   - Incrementa contador de uso del cupón
   - Guarda en `coupon_usage`

---

## 📊 DIFERENCIAS ENTRE SISTEMAS

| Característica | Ofertas Generales | Ofertas Asignables | Cuotas Personalizadas | Cupones |
|---|---|---|---|---|
| **Público objetivo** | Todos (Landing) | Jugadores específicos | Jugadores específicos | Cualquier padre |
| **Requiere selección** | No | Sí (manual) | Sí (manual) | No (código público) |
| **Expira** | Sí | Sí | No (o con fecha) | Sí |
| **Uso limitado** | No | No | No | Sí (opcional) |
| **Código ingresado** | No | No | No | Sí |
| **Mejor para** | Marketing | Casos puntuales | Descuentos permanentes | Promociones masivas |

---

## ⚙️ INTEGRACIONES PENDIENTES

### 🔜 Próximos Pasos (que implementaré si quieres):

1. **Integrar cupones en flujo de pago de Stripe**
   - Campo para ingresar código
   - Validación en tiempo real
   - Aplicar descuento automáticamente

2. **Mostrar ofertas activas en Panel de Padres**
   - Los jugadores ven sus ofertas asignadas
   - Badge: "Tienes 1 oferta activa"

3. **Reportes de cupones**
   - ¿Cuál cupón se usó más?
   - ¿Cuánto dinero se descontó?
   - Análisis de efectividad

---

## 🧪 PROBAR AHORA

### 1. Ejecuta el SQL
```sql
-- En Supabase SQL Editor:
-- Ejecuta SQL_OFERTAS_Y_CUPONES.sql
```

### 2. Espera deployment (30-60 seg)

### 3. Prueba:
- **Cupones**: Super Admin → Cupones → Crear `TEST2024`
- **Ofertas**: Super Admin → Ofertas → Asignar a jugador

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### "No veo la opción de Cupones"
- Espera 1 minuto después del deployment
- Recarga: Ctrl+Shift+R

### "Error al crear cupón: duplicate key"
- Ya existe un cupón con ese código
- Usa otro código

### "No puedo seleccionar jugadores en ofertas"
- Asegúrate de marcar ✅ "Asignar a Jugadores Específicos"
- La sección aparecerá debajo

---

## 📝 ARCHIVOS NUEVOS

```
guerrero_uploaded/
├── SQL_OFERTAS_Y_CUPONES.sql (Tablas y funciones)
├── coupons-system.js (Sistema de cupones)
├── offers-system.js (Actualizado con asignación)
└── GUIA_OFERTAS_Y_CUPONES.md (Este archivo)
```

---

**¿Listo para probar? Ejecuta el SQL y empieza a crear cupones! 🚀**

**¿Quieres que integre los cupones en el flujo de pago de Stripe?**
