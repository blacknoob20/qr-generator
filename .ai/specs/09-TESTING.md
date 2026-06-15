# 09-TESTING: Estrategia de Pruebas

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Framework de Testing

El proyecto utiliza **Vitest** para testing unitario/integración y **Playwright** para testing E2E.

| Herramienta | Propósito | Versión |
|-------------|-----------|---------|
| `vitest` | Runner de tests unitarios e integración | ^2.1.9 |
| `@vitest/ui` | UI visual para ejecutar tests | ^2.1.9 |
| `jsdom` | Entorno DOM para component tests | ^29.1.1 |
| `@testing-library/preact` | Testing utilities para Preact | ^3.2.4 |
| `@playwright/test` | Testing E2E con navegador real | ^1.51.1 |

---

## 2. Estructura de Tests

```
qr-generator/
├── tests/
│   ├── unit/                # Tests unitarios e integración
│   │   └── qr-generator.test.ts   # Tests de utilidades
│   ├── playwright/          # Tests E2E con Playwright
│   │   ├── render.spec.ts         # Tests de renderizado
│   │   └── playwright.config.cjs  # Configuración de Playwright
│   ├── package.json         # Dependencias de tests
│   └── package-lock.json
├── src/
│   ├── utils/
│   │   └── qr-generator.ts
│   ├── hooks/
│   │   └── useQRCode.ts
│   └── components/
│       └── QRPreview/
│           └── QRPreview.tsx
└── vitest.config.ts         # Configuración de Vitest
```

---

## 3. Tipos de Tests

| Tipo | Alcance | Herramientas | Cobertura Mínima |
|------|---------|--------------|------------------|
| **Unitarios** | Funciones puras (utils, validaciones) | Vitest | > 80% |
| **Integración** | Hooks con estado | Vitest + @testing-library/preact | > 60% |
| **Componentes** | Renderizado y eventos | Vitest + jsdom + @testing-library/preact | > 50% |
| **E2E** | Flujo completo en navegador | Playwright | > 30% |

---

## 4. Scripts de Testing

**Importante:** El proyecto se ejecuta dentro de un contenedor Docker. No requiere Node.js en la máquina host.

### 4.1 Scripts en package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage",
    "test:e2e": "cd tests && npx playwright test"
  }
}
```

### 4.2 Ejecución dentro del contenedor

```bash
# Tests unitarios (Vitest)
docker compose exec app pnpm vitest run

# Tests con UI
docker compose exec app pnpm vitest --ui

# Tests con coverage
docker compose exec app pnpm vitest run --coverage

# Tests E2E (Playwright)
docker compose exec app sh -c "cd tests && npx playwright test"

# Tests E2E con UI
docker compose exec app sh -c "cd tests && npx playwright test --ui"
```

### 4.3 Ejecución CI/CD

```bash
# Pipeline de CI/CD
docker compose exec app pnpm vitest run
docker compose exec app sh -c "cd tests && npx playwright test"
```

---

## 5. Ejemplo: Test Unitario de Generación

```typescript
// tests/unit/qr-generator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateQRMetadata, detectEncoding } from '../../src/utils/qr-generator';

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
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/**/*.d.ts', 'tests/'],
    },
  },
});
```

---

## 7. Reglas de Testing

1. **Cobertura mínima:** Todo archivo en `utils/` (incluyendo `build-qr-options.ts`) debe tener tests unitarios con cobertura > 80%
2. **Tests antes de fix:** Al reportar un bug, se debe crear un test que reproduzca el error antes de aplicar el fix
3. **Mocking:** Las librerías externas (qr-code-styling, file-saver) deben ser mockeadas en tests de integración
4. **DOM:** Los tests de componentes deben usar `jsdom` y limpiar el DOM entre tests
5. **CI:** El pipeline de CI/CD debe ejecutar `docker compose exec app pnpm vitest run` antes de merge. No requiere Node.js en el runner.
6. **Estructura:** Los tests unitarios deben ubicarse en `tests/unit/`; los tests E2E en `tests/playwright/`
7. **Imports:** Los tests en `tests/unit/` deben importar desde `../../src/` en lugar de rutas relativas al archivo fuente
8. **Docker:** Todos los comandos de testing (unitarios, coverage, E2E) deben ejecutarse dentro del contenedor Docker. No requiere Node.js instalado en la máquina host

---

**FIN DE 09-TESTING**
