# 02-ARCHITECTURE: Arquitectura, Capas y Estado

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Estructura de Carpetas

```
qr-generator/
├── src/
│   ├── components/          # Componentes UI
│   │   ├── QRCanvas/
│   │   ├── QRPreview/
│   │   └── ConfigPanel/
│   │       ├── DataConfig/
│   │       ├── StyleConfig/
│   │       └── AdvancedConfig/
│   ├── hooks/               # Custom hooks
│   │   └── useQRCode.ts
│   ├── types/               # Definiciones TypeScript
│   │   ├── qr.types.ts
│   │   ├── style.types.ts
│   │   └── validation.types.ts
│   ├── utils/               # Utilidades
│   │   ├── qr-validator.ts
│   │   ├── qr-generator.ts
│   │   └── export.ts
│   ├── state/               # Estado global (signals)
│   │   └── qr-store.ts
│   ├── styles/              # Estilos modulares por dominio
│   │   ├── design-tokens.css        # Tokens CSS globales
│   │   ├── 00-base.css              # Reset, body, scrollbar, animaciones
│   │   ├── 01-header.css            # Header component
│   │   ├── 02-studio.css            # Studio layout
│   │   ├── 03-qr-preview.css        # QR preview, canvas, actions
│   │   ├── 04-config-panel.css      # Config panel accordion
│   │   ├── 05-data-config.css       # Data config inputs
│   │   ├── 06-style-config.css      # Style config colors, shapes
│   │   ├── 07-advanced-config.css   # Advanced config ECL, sliders
│   │   ├── 08-drawer.css            # Mobile drawer
│   │   └── 09-responsive.css        # Media queries
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .ai/specs/
```

### 1.1 Módulos Principales

| Módulo | Responsabilidad |
|--------|----------------|
| `components/` | UI reusable y composición de vistas |
| `hooks/` | Lógica de negocio encapsulada (generación QR) |
| `types/` | Contratos de datos TypeScript |
| `utils/` | Funciones puras (validación, exportación) |
| `state/` | Estado reactivo global via Signals |

---

## 2. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              QR-GENERATOR SPA                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         RENDER LAYER                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │   Header    │  │   Sidebar   │  │   Preview   │  │   Footer    │ │   │
│  │  │  Component  │  │   Config    │  │    Area     │  │  Component  │ │   │
│  │  └─────────────┘  └──────┬──────┘  └──────┬──────┘  └─────────────┘ │   │
│  │                          │                │                             │   │
│  │         ┌────────────────┼────────────────┘                             │   │
│  │         ▼                ▼                                             │   │
│  │  ┌──────────────────────────────────────────────────────────────┐     │   │
│  │  │                    ConfigPanel                                │     │   │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐     │     │   │
│  │  │  │ DataConfig │  │StyleConfig │  │  AdvancedConfig    │     │     │   │
│  │  │  └──────┬─────┘  └──────┬─────┘  └─────────┬──────────┘     │     │   │
│  │  └─────────┼───────────────┼──────────────────┼────────────────┘     │   │
│  │            │               │                  │                       │   │
│  └────────────┼───────────────┼──────────────────┼───────────────────────┘   │
│               │               │                  │                               │
│               ▼               ▼                  ▼                               │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                      STATE LAYER (Signals)                          │     │
│  │  ┌─────────────────────────────────────────────────────────────┐    │     │
│  │  │                      QR-Store                                  │    │     │
│  │  │  • content: Signal<string>                                   │    │     │
│  │  │  • config: Signal<QRConfig>                                 │    │     │
│  │  │  • warnings: Signal<ValidationWarning[]>                     │    │     │
│  │  │  • isValid: Signal<boolean>                                 │    │     │
│  │  │  • theme: Signal<ThemeMode>                                 │    │     │
│  │  └─────────────────────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                      LOGIC LAYER                                    │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │     │
│  │  │  useQRCode   │  │qr-validator  │  │   export     │              │     │
│  │  │    hook      │  │   utility    │  │   utility    │              │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                   EXTERNAL DEPENDENCIES                               │     │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │     │
│  │  │ qr-code-styling │  │  @preact/signals │  │   file-saver    │   │     │
│  │  │   library       │  │     library      │  │    library      │   │     │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Vista en Capas

```
┌────────────────────────────────────────┐
│          PRESENTATION LAYER            │
│  Components: QRCanvas, QRPreview,     │
│  ConfigPanel, DataConfig, StyleConfig,│
│  AdvancedConfig, Header, Footer       │
└────────────────────┬───────────────────┘
                     │ props/events
                     ▼
┌────────────────────────────────────────┐
│           STATE LAYER                  │
│  Preact Signals (qr-store)            │
│  Reactive state management             │
└────────────────────┬───────────────────┘
                     │ hooks/consumers
                     ▼
┌────────────────────────────────────────┐
│            LOGIC LAYER                 │
│  useQRCode hook, validators,          │
│  export utilities                      │
└────────────────────┬───────────────────┘
                     │ dependencies
                     ▼
┌────────────────────────────────────────┐
│          EXTERNAL LAYER                │
│  qr-code-styling, file-saver          │
│  Browser APIs (Canvas, Clipboard)     │
└────────────────────────────────────────┘
```

### 2.2 Flujo de Datos

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE DATOS PRINCIPAL                        │
└──────────────────────────────────────────────────────────────────────────┘

   USUARIO                    SISTEMA                         QR ENGINE
      │                          │                                │
      │  1. Input contenido     │                                │
      │─────────────────────────▶│                                │
      │                          │                                │
      │                          │  2. Valida contenido           │
      │                          │───────────────────────────────▶│
      │                          │                                │
      │                          │  3. Calcula versión/encoding   │
      │                          │◀──────────────────────────────│
      │                          │                                │
      │                          │  4. Actualiza signals         │
      │                          │────────────────────────────────▶
      │                          │                                │
      │                          │  5. Re-render QRPreview       │
      │  6. Preview actualizado  │                                │
      │◀─────────────────────────│                                │
      │                          │                                │
      │  7. Ajusta estilo        │                                │
      │─────────────────────────▶│                                │
      │                          │  8. Valida estilo (contraste)  │
      │                          │                                │
      │                          │  9. Actualiza preview         │
      │ 10. Preview estilizado    │                                │
      │◀─────────────────────────│                                │
      │                          │                                │
      │ 11. Exportar PNG/SVG     │                                │
      │─────────────────────────▶│                                │
      │                          │ 12. Genera blob/dataURL        │
      │                          │───────────────────────────────▶│
      │                          │                                │
      │                          │ 13. Retorna blob/dataURL       │
      │ 14. Descarga iniciada    │◀──────────────────────────────│
      │◀─────────────────────────│                                │
```

---

## 3. Estado Global (Signals)

```typescript
// qr-store.ts - Contrato
interface QRStore {
  content: Signal<string>;
  config: Signal<QRConfig>;
  warnings: Signal<ValidationWarning[]>;
  isValid: Signal<boolean>;
}
```

### 3.1 Diagrama de Señales

```
┌─────────────────────────────────────────────────────────────┐
│                      QR-STORE (Signals)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   content ──────────┬─────────────────────────────────┐    │
│   (string)          │                                 │    │
│                     │                                 │    │
│   config ───────────┼──▶ QRPreview ──▶ QRCanvas      │    │
│   (QRConfig)        │                                 │    │
│                     │                                 │    │
│   warnings ─────────┼──▶ ValidationWarnings           │    │
│   (Warning[])       │                                 │    │
│                     │                                 │    │
│   isValid ──────────┼──▶ ExportButtons (disabled?)    │    │
│   (boolean)         │                                 │    │
│                     │                                 │    │
│   theme ────────────┴──▶ App (data-theme attribute)  │    │
│   (ThemeMode)                                            │    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Estado Interno Completo

```typescript
interface QRStoreState {
  // Contenido del QR
  content: string;

  // Configuración completa del QR
  config: QRConfig;

  // Warnings de validación
  warnings: ValidationWarning[];

  // Flags de estado
  isValid: boolean;
  isGenerating: boolean;
  isExporting: boolean;

  // Tema
  theme: ThemeMode;
}

interface QRConfig {
  content: string;
  encoding: EncodingMode;
  style: QRStyle;
  advanced: QRAdvancedConfig;
}
```

---

## 4. Jerarquía de Componentes

```
App
├── Header
│   ├── Logo
│   ├── ThemeToggle
│   └── GitHubLink
├── MainLayout
│   ├── Sidebar
│   │   └── ConfigPanel
│   │       ├── DataConfig
│   │       │   ├── ContentInput
│   │       │   ├── EncodingSelector
│   │       │   └── CapacityIndicator
│   │       ├── StyleConfig
│   │       │   ├── ColorPicker (foreground)
│   │       │   ├── ColorPicker (background)
│   │       │   ├── GradientSelector
│   │       │   ├── DotShapeSelector
│   │       │   ├── CornerShapeSelector
│   │       │   └── LogoUploader
│   │       └── AdvancedConfig
│   │           ├── VersionSelector
│   │           ├── ErrorCorrectionSelector
│   │           ├── MarginSlider
│   │           └── DebugToggle
│   └── PreviewArea
│       ├── QRPreview
│       │   ├── QRCanvas
│       │   ├── LogoOverlay
│       │   └── ValidationWarnings
│       ├── ExportButtons
│       │   ├── DownloadPNGButton
│       │   ├── DownloadSVGButton
│       │   └── CopyButton
│       └── ResetButton
└── Footer (opcional)
```

---

## 5. Librerías Externas y Justificación

| Librería | Versión | Justificación de Uso | Alternativas Consideradas |
|----------|---------|---------------------|--------------------------|
| `qr-code-styling` | ^1.6.0 | Biblioteca madura con soporte para estilos, logos, gradientes y exportación PNG/SVG | `qrcode`, `qrcode-generator`, `node-qrcode` |
| `@preact/signals` | ^1.2.0 | Estado reactivo granular, mejor performance que Context API, sintaxis simple | `zustand`, `jotai`, `valtio` |
| `file-saver` | ^2.0.5 | Abstracción cross-browser para descarga de archivos | Implementación nativa con `URL.createObjectURL` |

---

**FIN DE 02-ARCHITECTURE**
