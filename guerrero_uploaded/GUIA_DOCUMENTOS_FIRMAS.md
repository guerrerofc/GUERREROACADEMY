# Sistema de Documentos y Firmas Digitales
## Guerrero Academy

---

## 1. CONFIGURACIÓN INICIAL

### Paso 1: Ejecutar SQL en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `SQL_DOCUMENTS_SIGNATURES.sql`
4. Haz clic en **Run**

Esto creará:
- Tabla `document_templates` (plantillas de documentos)
- Tabla `document_signatures` (firmas)
- Campos adicionales en `players`
- Triggers automáticos
- 5 documentos predeterminados

---

## 2. DOCUMENTOS INCLUIDOS

| Documento | Tipo | Descripción |
|-----------|------|-------------|
| Reglamento Interno | reglamento | Normas de conducta, asistencia, equipamiento |
| Autorización Médica | medico | Declaración de salud, contactos de emergencia |
| Uso de Imagen | imagen | Consentimiento para fotos/videos |
| Descargo de Responsabilidad | responsabilidad | Asunción de riesgos deportivos |
| Compromiso de Pago | pago | Montos, fechas y políticas de pago |

---

## 3. CONFIGURACIÓN DE MONTOS

Los montos predeterminados están en el archivo `documents-system.js`:

```javascript
const CONFIG = {
    INSCRIPTION_AMOUNT: 3500,  // RD$ 3,500
    MONTHLY_AMOUNT: 4000,      // RD$ 4,000
    PAYMENT_DAY: 30            // Día 30 de cada mes
};
```

Para cambiarlos, edita estos valores en el archivo.

---

## 4. USO DEL SISTEMA

### Para Padres/Tutores:

1. Inicia sesión en el **Panel de Padres**
2. Ve a la sección **Documentos** en el menú lateral
3. Selecciona el hijo correspondiente
4. Haz clic en **Firmar Documentos Pendientes**
5. Sigue el wizard paso a paso:
   - Lee cada documento completo
   - Marca la casilla de aceptación
   - Ingresa tu nombre completo y cédula
   - Dibuja tu firma digital
   - Continúa al siguiente documento
6. Al finalizar, todos los documentos quedan registrados

### Para Administradores:

Los administradores pueden ver el estado de documentos de cada jugador:
- `documents_complete`: true/false
- Estados individuales: `regulations_status`, `medical_status`, etc.

---

## 5. CAMPOS AGREGADOS A PLAYERS

```sql
-- Estados de documentos
regulations_status       -- 'pending' | 'signed' | 'expired'
medical_status
image_consent_status
liability_status
payment_agreement_status

-- Indicador global
documents_complete       -- true cuando todos están firmados

-- Datos del compromiso de pago
agreed_monthly_fee       -- Monto acordado
agreed_payment_day       -- Día de pago acordado
payment_agreement_date   -- Fecha de firma
```

---

## 6. ARCHIVOS CREADOS

| Archivo | Descripción |
|---------|-------------|
| `SQL_DOCUMENTS_SIGNATURES.sql` | Script SQL para crear tablas |
| `documents-system.js` | Módulo JavaScript del sistema |
| `parent-panel.html` | Actualizado con sección de documentos |

---

## 7. PRÓXIMAS FUNCIONALIDADES (Fase 2-3)

- [ ] Generación de PDF de documentos firmados
- [ ] Almacenamiento en Supabase Storage
- [ ] Panel Admin para gestionar documentos
- [ ] Recordatorios automáticos
- [ ] Bloqueo de activación sin documentos
- [ ] Integración con sistema de pagos

---

## 8. SOLUCIÓN DE PROBLEMAS

### Error: "La tabla document_templates no existe"
→ Ejecuta el SQL en Supabase SQL Editor

### Error: "Error cargando documentos"
→ Verifica que el SQL se ejecutó correctamente
→ Revisa los logs en la consola del navegador (F12)

### Los documentos no aparecen
→ Asegúrate de tener hijos registrados con tu email como `tutor_email`

### El wizard no abre
→ Verifica que `documents-system.js` esté cargado correctamente

---

## 9. SOPORTE

Si necesitas ayuda adicional:
1. Revisa la consola del navegador (F12 > Console)
2. Verifica que todas las tablas existen en Supabase
3. Confirma que los RLS policies están configurados

---

*Última actualización: Diciembre 2025*
