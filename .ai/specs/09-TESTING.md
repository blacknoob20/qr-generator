# 09-TESTING: Estrategia de Pruebas

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Framework de Testing

El proyecto utiliza **Vitest** como framework de testing principal.

| Herramienta | Propósito | Versión |
|-------------|-----------|---------|
| `vitest` | Runner de tests | ^2.1.9 |
| `@vitest/ui` | UI visual para ejecutar tests | ^2.1.9 |
| `jsdom` | Entorno DOM para component tests | ^29.1.1 |
| `@testing-library/preact` | Testing utilities para Preact | ^3.2.4 |

---

## 2. Estructura de Tests

```
qr-generator/
├── src/
│   ├── utils/               # Funciones puras
│   │   ├── qr-generator.ts
│   │   └── qr-generator.test.ts   # Tests unitarios
│   ├── hooks/               # Custom hooks
│   │   └── useQRCode.test.ts      # Tests de hooks
│   └── components/          # Componentes UI
│       └── QRPreview/
│           └── QRPreview.test.tsx # Tests de componentes
└── vitest.config.ts         # Configuración de Vitest
```

---

## 3. Tipos de Tests

| Tipo | Alcance | Herramientas | Cobertura Mínima |
|------|---------|--------------|------------------|
| **Unitarios** | Funciones puras (utils, validaciones) | Vitest | > 80% |
| **Integración** | Hooks con estado | Vitest + @testing-library/preact | > 60% |
| **Componentes** | Renderizado y eventos | Vitest + jsdom + @testing-library/preact | > 50% |

---

## 4. Scripts de Testing

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage"
  }
}
```

---

## 5. Ejemplo: Test Unitario de Generación

```typescript
// src/utils/qr-generator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateQRMetadata, detectEncoding } from './qr-generator';

describe('QR Generation', () => {
  it('should detect byte encoding for URLs', () => {
    expect(detectEncoding('https://example.com')).toBe('byte');
  });

  it('should calculate correct metadata for short text', () => {
    const config = {
      content: 'Hello World',
      encoding: 'byte' as const,
      style: { color: { foreground: '#000000', background: '#ffffff' } },
      advanced: { version: 'auto', errorCorrectionLevel: 'M', margin: 4, marginColor: '#ffffff', debugView: false },
    };
    const metadata = calculateQRMetadata(config);
    expect(metadata.version).toBe(1);
    expect(metadata.modules).toBe(21);
    expect(metadata.used).toBeGreaterThan(0);
    expect(metadata.capacity).toBeGreaterThan(metadata.used);
  });
});
```

---

## 6. Configuración de Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/**/*.d.ts'],
    },
  },
});
```

---

## 7. Reglas de Testing

1. **Cobertura mínima:** Todo archivo en `utils/` debe tener tests unitarios con cobertura > 80%
2. **Tests antes de fix:** Al reportar un bug, se debe crear un test que reproduzca el error antes de aplicar el fix
3. **Mocking:** Las librerías externas (qr-code-styling, file-saver) deben ser mockeadas en tests de integración
4. **DOM:** Los tests de componentes deben usar `jsdom` y limpiar el DOM entre tests
5. **CI:** El comando `vitest run` debe ejecutarse en el pipeline de CI/CD antes de merge

---

**FIN DE 09-TESTING**
