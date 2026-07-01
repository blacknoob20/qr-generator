# 05-TYPES: Contratos TypeScript

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Tipos para Configuración QR

**Archivo:** `src/types/qr.types.ts`

```typescript
export type EncodingMode = 'numeric' | 'alphanumeric' | 'byte' | 'kanji';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QRVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
                        11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
                        21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
                        31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;

export type DotShape = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerShape = 'square' | 'dot' | 'extra-rounded' | 'rounded' | 'dots' | 'classy' | 'classy-rounded';

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: [string, string, ...string[]];
  angle?: number;  // para linear: 0-360
}

export interface LogoConfig {
  src: string;  // data URL o URL externa
  size: number;  // porcentaje del QR (0-20)
  hideBackground: boolean;
}

export interface QRStyle {
  color: {
    foreground: string | GradientConfig;
    background: string;
  };
  dotStyle?: {
    shape: DotShape;
    radius?: number;
  };
  cornerStyle?: {
    shape: CornerShape;
    radius?: number;
  };
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

---

## 2. Tipos para Estilos

**Archivo:** `src/types/style.types.ts`

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';

export interface DesignTokens {
  spacing: {
    xs: string;   // 4px
    sm: string;   // 8px
    md: string;   // 16px
    lg: string;   // 24px
    xl: string;   // 32px
    xxl: string;  // 48px
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  radius: {
    sm: string;   // 4px
    md: string;   // 8px
    lg: string;   // 12px
    xl: string;   // 16px
    full: string; // 9999px
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;   // 12px
      sm: string;   // 14px
      md: string;   // 16px
      lg: string;   // 18px
      xl: string;   // 24px
      xxl: string;  // 32px
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
}
```

---

## 3. Tipos para Validaciones

**Archivo:** `src/types/validation.types.ts`

```typescript
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationWarning {
  id: string;
  code: string;
  severity: ValidationSeverity;
  message: string;
  reference?: string;  // link a documentación
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationWarning[];
  warnings: ValidationWarning[];
  metadata: {
    version: number;
    capacity: number;
    used: number;
    modules: number;
  };
}

export interface ValidationRule {
  id: string;
  validate: (config: QRConfig) => ValidationWarning | null;
  severity: ValidationSeverity;
}
```

---

## 4. Tipos para Exportación

**Archivo:** `src/types/export.types.ts` (opcional, o incluir en `qr.types.ts`)

```typescript
export interface ExportService {
  toPNG(options: PNGExportOptions): Promise<Blob>;
  toSVG(): Promise<string>;
  toDataURL(format: 'png' | 'svg'): Promise<string>;
}

export interface PNGExportOptions {
  width?: number;    // default: 1024
  height?: number;   // default: 1024
  scale?: number;    // default: 4, range: 1-10
  margin?: number;   // default: 4
  quality?: number;  // default: 1.0 (ignored for PNG)
}

export interface SVGExportOptions {
  margin?: number;   // default: 4
}

export interface DownloadOptions {
  filename: string;  // sin extensión
  format: 'png' | 'svg';
  blob?: Blob;
  dataUrl?: string;
}
```

---

## 5. Tipos para Componentes

**Archivo:** `src/types/component.types.ts` (opcional)

```typescript
export interface QRCanvasProps {
  content: string;
  config: QRConfig;
  size: number;
}

export interface QRCanvasOutput {
  dataUrl: string;
  svgString?: string;
}

export interface QRPreviewProps {
  content: string;
  config: QRConfig;
  size?: number;
}

export interface QRPreviewOutput {
  pngBlob: Blob;
  svgString: string;
  copySuccess: boolean;
}

export interface ConfigPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
  validationResult: ValidationResult;
}

export interface DataConfigProps {
  content: string;
  onChange: (content: string) => void;
}

export interface StyleConfigProps {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
}

export interface AdvancedConfigProps {
  advanced: QRAdvancedConfig;
  onChange: (config: QRAdvancedConfig) => void;
}
```

---

## 6. Mapa de Tipos por Archivo

| Tipo | Archivo definido | Usado por |
|------|-----------------|-----------|
| `QRConfig` | `qr.types.ts` | Todos los componentes |
| `QRStyle` | `qr.types.ts` | `StyleConfig`, `QRCanvas` |
| `QRAdvancedConfig` | `qr.types.ts` | `AdvancedConfig` |
| `ValidationResult` | `validation.types.ts` | `ConfigPanel`, `QRPreview` |
| `ValidationWarning` | `validation.types.ts` | `qr-store`, `QRPreview` |
| `ThemeMode` | `style.types.ts` | `App`, `Header` |
| `DesignTokens` | `style.types.ts` | CSS/estilos |
| `ExportService` | `export.types.ts` | `utils/export.ts` |

---

**FIN DE 05-TYPES**
