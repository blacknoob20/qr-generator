# 13-APPENDIX: Apéndices, Glosario y Recursos

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Tipos TypeScript Completos

### 1.1 qr.types.ts

```typescript
export type EncodingMode = 'numeric' | 'alphanumeric' | 'byte' | 'kanji';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QRVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
                        11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
                        21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
                        31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;

export type DotShape = 'square' | 'rounded' | 'circle' | 'star' | 'heart' | 'diamond';
export type CornerShape = 'square' | 'rounded' | 'circle';

export type GradientType = 'linear' | 'radial';

export interface GradientConfig {
  type: GradientType;
  colors: [string, string, ...string[]];
  angle?: number;
}

export interface LogoConfig {
  src: string;
  size: number;
  hideBackground: boolean;
}

export interface DotStyleConfig {
  shape: DotShape;
  radius?: number;
}

export interface CornerStyleConfig {
  shape: CornerShape;
  radius?: number;
}

export interface QRStyle {
  color: {
    foreground: string | GradientConfig;
    background: string;
  };
  dotStyle?: DotStyleConfig;
  cornerStyle?: CornerStyleConfig;
  logo?: LogoConfig;
}

export interface QRAdvancedConfig {
  version: QRVersion | 'auto';
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  marginColor: string;
  debugView: boolean;
}

export interface QRConfig {
  content: string;
  encoding: EncodingMode;
  style: QRStyle;
  advanced: QRAdvancedConfig;
}

export interface QRMetadata {
  version: number;
  capacity: number;
  used: number;
  modules: number;
  encoding: EncodingMode;
}
```

### 1.2 validation.types.ts

```typescript
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationWarning {
  id: string;
  code: string;
  severity: ValidationSeverity;
  message: string;
  reference?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationWarning[];
  warnings: ValidationWarning[];
  metadata: QRMetadata;
}

export interface ValidationRule {
  id: string;
  severity: ValidationSeverity;
  validate: (config: QRConfig, metadata: QRMetadata) => ValidationWarning | null;
}
```

### 1.3 style.types.ts

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';

export interface DesignTokens {
  spacing: {
    xs: string; sm: string; md: string; lg: string; xl: string; xxl: string;
  };
  colors: {
    primary: string; secondary: string; success: string; warning: string;
    error: string; background: string; surface: string; text: string;
    textSecondary: string; border: string;
  };
  radius: {
    sm: string; md: string; lg: string; xl: string; full: string;
  };
  shadows: {
    sm: string; md: string; lg: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string; sm: string; md: string; lg: string; xl: string; xxl: string;
    };
    fontWeight: {
      normal: number; medium: number; semibold: number; bold: number;
    };
  };
}
```

---

## 2. Glosario

| Término | Definición |
|---------|------------|
| **ADR** | Architecture Decision Record - Documento de decisión arquitectónica |
| **Blob** | Binary Large Object - Representación binaria de datos |
| **Canvas** | API HTML5 para renderizado de gráficos 2D |
| **CLI** | Command Line Interface - Interfaz de línea de comandos |
| **DOM** | Document Object Model - Representación en memoria del documento HTML |
| **ECL** | Error Correction Level - Nivel de corrección de errores QR |
| **HMR** | Hot Module Replacement - Actualización de módulos en tiempo real |
| **QR** | Quick Response - Código de respuesta rápida |
| **SDD** | System Design Document - Documento de diseño de sistema |
| **SPA** | Single Page Application - Aplicación de página única |
| **SVG** | Scalable Vector Graphics - Gráficos vectoriales escalables |
| **WCAG** | Web Content Accessibility Guidelines - Guías de accesibilidad web |

---

## 3. Recursos Externos

| Recurso | URL |
|---------|-----|
| QR Code Specification (ISO 18004) | https://www.iso.org/standard/62021.html |
| WCAG Contrast Calculator | https://webaim.org/resources/contrastchecker/ |
| qr-code-styling Docs | https://qr-code-styling.com/ |
| Preact Docs | https://preactjs.com/ |
| Vite Docs | https://vitejs.dev/ |

---

**FIN DE 13-APPENDIX**
