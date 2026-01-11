# Tests - Paradise Point

## 📊 Resumen de Tests

✅ **55 tests pasando** en 5 suites

## 🧪 Suites de Tests

### 1. **Authentication Tests** (`__tests__/lib/auth.test.js`)
Tests para las utilidades de autenticación JWT:
- ✅ Generación de tokens válidos
- ✅ Verificación de tokens
- ✅ Manejo de tokens inválidos
- ✅ Expiración de tokens

**Cobertura**: 6 tests

### 2. **Date Calculations Tests** (`__tests__/lib/dateCalculations.test.js`)
Tests para el cálculo de días en reservas:
- ✅ Cálculo correcto de días (12-16 = 5 días)
- ✅ Manejo de fechas ISO con hora
- ✅ Validación de fechas inválidas
- ✅ Fechas que cruzan meses/años
- ✅ Checkout antes de checkin

**Cobertura**: 10 tests

### 3. **Reservations API Tests** (`__tests__/api/reservations.test.js`)
Tests para validaciones de reservas:
- ✅ Validación de rangos de fechas
- ✅ Validación de montos (pagado ≤ total)
- ✅ Estados de reserva válidos
- ✅ Validación de emails
- ✅ Depósito por defecto (60000)
- ✅ Cálculo de montos pendientes
- ✅ Estados de días del calendario
- ✅ Generación de rangos de fechas

**Cobertura**: 19 tests

### 4. **Payments API Tests** (`__tests__/api/payments.test.js`)
Tests para el sistema de pagos:
- ✅ Validación de campos requeridos
- ✅ Métodos de pago válidos (EFECTIVO, TRANSFERENCIA)
- ✅ Receptores válidos (Martin, Julieta)
- ✅ Conceptos de pago
- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño (5MB)
- ✅ Suma de pagos múltiples
- ✅ Manejo de fechas

**Cobertura**: 11 tests

### 5. **PaymentsModal Component Tests** (`__tests__/components/PaymentsModal.test.js`)
Tests para el componente de gestión de pagos:
- ✅ Estructura del modal
- ✅ Campos del formulario
- ✅ Opciones de métodos y receptores
- ✅ Cálculos de totales
- ✅ Formateo de moneda
- ✅ Validación de formulario
- ✅ Restricciones de upload
- ✅ Estados de botones

**Cobertura**: 9 tests

## 🚀 Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

## 📋 Tests por Funcionalidad

### **Sistema de Reservas**
- Validación de fechas ✅
- Cálculo de días ✅
- Validación de montos ✅
- Estados de reserva ✅
- Información de cliente ✅

### **Sistema de Pagos**
- CRUD de pagos ✅
- Métodos de pago ✅
- Receptores ✅
- Conceptos ✅
- Upload de comprobantes ✅
- Cálculo de totales ✅

### **Autenticación**
- Generación de tokens ✅
- Verificación de tokens ✅
- Expiración ✅
- Manejo de errores ✅

### **Calendario**
- Estados de días ✅
- Generación de rangos ✅
- Actualización al crear/cancelar ✅

## 🎯 Cobertura de Código

Los tests cubren:
- ✅ Validaciones de negocio
- ✅ Cálculos matemáticos
- ✅ Formateo de datos
- ✅ Manejo de errores
- ✅ Estados de componentes
- ✅ Restricciones de archivos

## 📝 Notas Técnicas

- **Framework**: Jest + React Testing Library
- **Entorno**: jsdom (simula navegador)
- **Alias**: `@/` apunta a la raíz del proyecto
- **Configuración**: `jest.config.js` y `jest.setup.js`

## 🔍 Ejemplo de Uso

```bash
# Desarrollo con auto-reload
npm run test:watch

# Ver qué está cubierto
npm run test:coverage

# CI/CD
npm test
```

## ✨ Tests Destacados

### **Test del Bug de 5 Días** 
```javascript
it('should calculate correct days for 5-day reservation (Jan 12-16)', () => {
  const days = calculateDays('2026-01-12', '2026-01-16')
  expect(days).toBe(5) // ✅ PASA
})
```

### **Test de Suma de Pagos**
```javascript
it('should correctly sum multiple payments', () => {
  const payments = [
    { amount: 60000 },
    { amount: 125000 },
    { amount: 65000 },
  ]
  const total = payments.reduce((sum, p) => sum + p.amount, 0)
  expect(total).toBe(250000) // ✅ PASA
})
```

### **Test de Validación de Email**
```javascript
it('should validate email format', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  expect(emailRegex.test('test@example.com')).toBe(true) // ✅ PASA
  expect(emailRegex.test('invalid-email')).toBe(false) // ✅ PASA
})
```

---

**Última actualización**: 10 de Enero, 2026
**Tests totales**: 55 ✅
**Fallos**: 0 ❌

