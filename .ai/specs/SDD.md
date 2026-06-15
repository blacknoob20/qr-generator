# SDD: QR Generator SPA

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## Tabla de Contenidos

1. [Introducción](#1-introduccion)
2. [Arquitectura General](#2-arquitectura-general)
3. [Diseño de Componentes](#3-diseño-de-componentes)
4. [Hooks](#4-hooks)
5. [Diseño de Validaciones](#5-diseño-de-validaciones)
6. [Límites de la Tecnología QR](#6-límites-de-la-tecnología-qr)
7. [Flujos de Usuario](#7-flujos-de-usuario)
8. [Diseño de Exportación](#8-diseño-de-exportación)
9. [Diseño UI/UX](#9-diseño-uiux)
10. [Decisiones Técnicas (ADR)](#10-decisiones-técnicas-adr)
11. [Riesgos y Consideraciones](#11-riesgos-y-consideraciones)
12. [Apéndices](#12-apéndices)

---

## 1. Introducción

### 1.1 Propósito del Documento

Este documento (SDD - System Design Document) tiene como propósito proporcionar una especificación técnica exhaustiva y detallada para la implementación de la Single Page Application (SPA) **QR-GENERATOR**. El documento complementa el SPEC.md existente y profundiza en las decisiones de diseño, arquitectura, componentes, validaciones y flujos de datos.

El SDD serve como guía canonical para que cualquier agente desarrollador pueda implementar la aplicación sin ambigüedades.

### 1.2 Alcance

El alcance de este documento incluye:

- Arquitectura completa de la aplicación SPA
- Diseño detallado de todos los componentes UI
- Contratos de datos entre componentes
- Sistema de validaciones y advertencias
- Límites técnicos de la tecnología QR
- Flujos de usuario principales y alternos
- Sistema de exportación (PNG/SVG)
- Diseño visual y tokens de diseño
- Decisiones técnicas y sus justificaciones
- Identificación de riesgos y mitigaciones

### 1.3 Definiciones y Contexto

| Término | Definición |
|---------|------------|
| **SPA** | Single Page Application - Aplicación web que carga una sola página HTML y actualiza dinámicamente el contenido |
| **QR Code** | Código de respuesta rápida - Código de barras matricial bidimensional |
| **Module** | Cada celda negra o blanca individual en un código QR |
| **Quiet Zone** | Zona de silencio - Margen en blanco alrededor del QR |
| **Version** | Tamaño del QR (1-40), determina la capacidad de datos |
| **ECL** | Error Correction Level - Nivel de corrección de errores (L/M/Q/H) |
| **Signal** | Mecanismo de estado reactivo en Preact |
| **Dot Style** | Forma visual de los módulos de datos |

### 1.4 Referencias Cruzadas

| Documento | Relación |
|-----------|----------|
| `SPEC.md` | Especificación de alto nivel, requisitos del proyecto |
| `SDD.md` | Este documento - Diseño técnico detallado |

---

## 2. Arquitectura General

### 2.1 Diagrama de Arquitectura

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

### 2.2 Vista en Capas

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

### 2.3 Flujo de Datos

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

### 2.4 Jerarquía de Componentes

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

### 2.5 Estado Global (Signals)

```typescript
// qr-store.ts - Estado global de la aplicación

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

**Diagrama de Señales:**

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

### 2.6 Librerías Externas y Justificación

| Librería | Versión | Justificación de Uso | Alternativas Consideradas |
|----------|---------|---------------------|--------------------------|
| `qr-code-styling` | ^1.6.0 | Biblioteca madura con soporte para estilos, logos, gradientes y exportación PNG/SVG | `qrcode`, `qrcode-generator`, `node-qrcode` |
| `@preact/signals` | ^1.2.0 | Estado reactivo granular, mejor performance que Context API, sintaxis simple | `zustand`, `jotai`, `valtio` |
| `file-saver` | ^2.0.5 | Abstracción cross-browser para descarga de archivos | Implementación nativa con `URL.createObjectURL` |
| `qr-code-styling` | ^1.6.0 | Tipos TypeScript incluidos | `@types/qr-code-styling` (innecesario) |

---

## 3. Diseño de Componentes

### 3.1 QRCanvas

**Ubicación:** `src/components/QRCanvas/`

**Props:**
```typescript
interface QRCanvasProps {
  content: string;
  config: QRConfig;
  size: number;
  format: 'png' | 'svg';
}
```

**Estado Interno:**
```typescript
interface QRCanvasState {
  canvasElement: HTMLCanvasElement | null;
  svgElement: SVGElement | null;
  isReady: boolean;
  error: QRCodeError | null;
}
```

**Responsabilidades:**
- Crear y mantener instancia de QRCodeStyling
- Renderizar QR en canvas (PNG) o SVG
- Manejar re-renderizado eficiente ante cambios de configuración
- Exponer métodos para exportación (toDataURL, toBlob, getRawData)
- Escalar correctamente según el tamaño solicitado
- Aplicar estilos (colores, gradientes, formas)

**Eventos Emitidos:** Ninguno (componente puramente presentacional)

**Contrato de Entrada:**
```typescript
// Parent debe proporcionar:
{
  content: "https://example.com",        // Contenido válido del QR
  config: {
    style: {
      color: { foreground: "#000000", background: "#ffffff" },
      dotStyle: { shape: "square" },
      logo: { src: "...", size: 10, hideBackground: true }
    },
    advanced: {
      version: 'auto',
      errorCorrectionLevel: 'M',
      margin: 4
    }
  },
  size: 300,     // píxeles
  format: 'png'  // o 'svg'
}
```

**Contrato de Salida:**
```typescript
// Métodos expuestos via ref o callback
interface QRCanvasOutput {
  toDataURL: (format: 'png' | 'svg', quality?: number) => Promise<string>;
  toBlob: (format: 'png', quality?: number) => Promise<Blob>;
  getRawData: (format: 'svg' | 'png') => Promise<ArrayBuffer>;
}
```

**Diagrama de Interacción:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        QRCanvas                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Props ──────────┐                                              │
│   content ────────┼──▶┌─────────────────────────────────────┐   │
│   config ─────────┼──▶│     QRCodeStyling Instance          │   │
│   size ───────────┼──▶│                                     │   │
│   format ─────────┼──▶│  • update(content, options)         │   │
│                   │    │  • toDataURL()                      │   │
│                   │    │  • toBlob()                         │   │
│                   │    │  • getRawData()                     │   │
│                   │    └──────────────────┬──────────────────┘   │
│                   │                       │                    │
│                   │                       ▼                    │
│                   │    ┌─────────────────────────────────────┐ │
│                   │    │       Canvas / SVG Element          │ │
│                   │    │                                     │ │
│                   │    │    [QR Code Rendered Output]        │ │
│                   │    │                                     │ │
│                   │    └─────────────────────────────────────┘ │
│                                                                  │
│   Methods ◀───────┼─── toDataURL()                             │
│   (exposed) ─────┼─── toBlob()                                │
│                   └─── getRawData()                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.2 QRPreview

**Ubicación:** `src/components/QRPreview/`

**Props:**
```typescript
interface QRPreviewProps {
  content: string;
  config: QRConfig;
  size?: number;  // default: 420
}
```

**Estado Interno:**
```typescript
interface QRPreviewState {
  downloadStatus: 'idle' | 'loading' | 'success' | 'error';
  copyStatus: 'idle' | 'copied';
  isUpdating: boolean;  // para microanimación
}
```

**Responsabilidades:**
- Contenedor visual del QR generado (protagonista, 420px)
- Microanimación suave al actualizar contenido
- Barra de acciones compacta: PNG, SVG, Copiar, Compartir
- Detección y visualización del tipo de contenido
- Panel de estadísticas QR (versión, ECL, módulos, capacidad)
- Panel de compatibilidad (Android, iOS, Cámara)
- Preview de lo que verá el usuario al escanear
- Mostrar advertencias de validación de forma prominente

**Eventos Emitidos:**

| Evento | Payload | Condición de Emisión |
|--------|---------|---------------------|
| `onDownloadPNG` | `Blob` | Click en botón PNG |
| `onDownloadSVG` | `string` | Click en botón SVG |
| `onCopy` | `string` | Click en botón copiar |
| `onShare` | `void` | Click en botón compartir (Web Share API) |

**Contrato de Salida:**
```typescript
interface QRPreviewOutput {
  downloadPNG: () => Promise<void>;
  downloadSVG: () => Promise<void>;
  copyToClipboard: () => Promise<boolean>;
  shareContent: () => Promise<void>;
}
```

**Diagrama de Interacción:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        QRPreview                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    QR HERO (420px)                         │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                                                    │  │  │
│  │  │                    QRCanvas                         │  │  │
│  │  │                                                    │  │  │
│  │  │              ████████████████                       │  │  │
│  │  │              ████████████████                       │  │  │
│  │  │              ████████████████                       │  │  │
│  │  │                                                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  Animación: pulse 0.3s al cambiar contenido              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Action Bar                                             │  │
│  │  [⬇ PNG]  [⬇ SVG]  [📋 Copiar]  [🔗 Compartir]       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Info Contextual                                        │  │
│  │  Tipo: 🔗 URL         Destino: web.whatsapp.com          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Estadísticas QR                                        │  │
│  │  Versión: 1  ECL: M  Módulos: 21×21  Capacidad: 8%      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Compatibilidad                                         │  │
│  │  ✓ Android  ✓ iOS  ✓ Cámara estándar                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Preview de Escaneo                                     │  │
│  │  https://web.whatsapp.com                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ⚠️ Warnings (si hay)                                   │  │
│  │  "Contraste bajo" - "Logo muy grande"                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Events ──▶ onDownloadPNG(blob)                                │
│         ──▶ onDownloadSVG(svgString)                           │
│         ──▶ onCopy(content)                                     │
│         ──▶ onShare()                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.3 ConfigPanel

**Ubicación:** `src/components/ConfigPanel/`

**Props:**
```typescript
interface ConfigPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
  validationResult: ValidationResult;
}
```

**Estado Interno:**
```typescript
interface ConfigPanelState {
  expandedSection: string | null;  // 'content' | 'style' | 'advanced'
}
```

**Responsabilidades:**
- Contenedor principal de configuración
- Navegación entre sub-secciones vía acordeón expandible
- Coordinar cambios entre sub-componentes
- Persistir configuración en localStorage (opcional)
- Proveer botón de reset global

**Eventos Emitidos:**

| Evento | Payload |
|--------|---------|
| `onConfigChange` | `Partial<QRConfig>` |
| `onReset` | `void` |

**Contrato de Salida:**
```typescript
interface ConfigPanelOutput {
  getConfig: () => QRConfig;
  resetToDefaults: () => void;
}
```

**Diagrama de Composición:**

```
┌─────────────────────────────────────────────────────────────────┐
│                       ConfigPanel                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ✎ Contenido                              [−]            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │   DataConfig (campos contextuales)                   │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ◈ Estilo                                   [+]            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │   StyleConfig (colores, formas, logo)                │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  (collapsed)                                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ⚙ Avanzado                                 [+]            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │   AdvancedConfig (versión, ECL, margen, debug)        │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  (collapsed)                                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ✓ Configuración válida / ✕ Revisa los errores            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.3.1 DataConfig

**Ubicación:** `src/components/ConfigPanel/DataConfig/`

**Props:**
```typescript
interface DataConfigProps {
  content: string;
  onChange: (content: string) => void;
  onEncodingChange?: (encoding: EncodingMode) => void;
  metadata?: {
    version: number;
    capacity: number;
    used: number;
    modules: number;
  };
}
```

**Estado Interno:**
```typescript
interface DataConfigState {
  activeType: ContentType;
  fieldValues: Record<string, string>;
  detectedEncoding: EncodingMode | null;
}

type ContentType = 'url' | 'whatsapp' | 'email' | 'wifi' | 'phone' | 'location' | 'text';
```

**Responsabilidades:**
- Selector de tipo de contenido (URL, WhatsApp, Correo, WiFi, Teléfono, Ubicación, Texto)
- Campos contextuales dinámicos según el tipo seleccionado
- Input de texto/URL para contenido QR
- Detección automática de modo de codificación
- Selector manual de modo de codificación (avanzado)
- Indicador visual de capacidad restante
- Preview de contenido codificado raw
- Validación en tiempo real del contenido

**Eventos Emitidos:**

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `onContentChange` | `string` | Contenido modificado |
| `onEncodingChange` | `EncodingMode` | Encoding manual cambiado |

**Contrato de Datos:**

```typescript
interface DataConfigOutput {
  content: string;
  encoding: EncodingMode;
  metadata: {
    version: number;
    capacity: number;
    used: number;
    modules: number;
  };
}
```

**Diagrama de Interacción:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        DataConfig                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tipo de contenido                                        │  │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  │
│  │  │ 🔗 │ │ ✆  │ │ ✉  │ │ ◉  │ │ ☎  │ │ ◎  │ │ ✎  │       │  │
│  │  │URL │ │WApp│ │Mail│ │WiFi│ │Tel │ │Loc │ │Txt │       │  │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Campos contextuales (ejemplo: WhatsApp)                │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Número: +1234567890                               │ │  │
│  │  │  Mensaje: Hola, me interesa...                      │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Contenido codificado:                                    │  │
│  │  https://wa.me/1234567890?text=Hola...                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  47 caracteres / 2,089 máximo                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Modo: Automático  Detectado: BYTE                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Events ──▶ onContentChange("https://wa.me/...")             │
│         ──▶ onEncodingChange("byte")                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.3.2 StyleConfig

**Ubicación:** `src/components/ConfigPanel/StyleConfig/`

**Props:**
```typescript
interface StyleConfigProps {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
  validationResult?: ValidationResult;
}
```

**Estado Interno:**
```typescript
interface StyleConfigState {
  activeColorTab: 'solid' | 'gradient';
  logoPreview: string | null;
  isDraggingLogo: boolean;
}
```

**Responsabilidades:**
- Selector de color de primer plano (sólido o degradado)
- Selector de color de fondo
- Selector de tipo de degradado (linear/radial)
- Selector de colores de degradado
- Selector de forma de módulos (dot style)
- Selector de forma de esquinas (corner style)
- Configuración de radio de redondeo
- Upload y preview de logo
- Validación de contraste en tiempo real

**Eventos Emitidos:**

| Evento | Payload |
|--------|---------|
| `onStyleChange` | `Partial<QRStyle>` |
| `onLogoUpload` | `File` |
| `onLogoRemove` | `void` |
| `onContrastWarning` | `boolean` |

**Contrato de Datos:**

```typescript
interface StyleConfigOutput {
  style: QRStyle;
}

interface QRStyle {
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
  logo?: {
    src: string;
    size: number;
    hideBackground: boolean;
  };
}
```

**Diagrama de Interacción:**

```
┌─────────────────────────────────────────────────────────────────┐
│                       StyleConfig                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │   COLOR FOREGROUND   │  │      COLOR PREVIEW (live)        │ │
│  │  ┌────────────────┐  │  │                                  │ │
│  │  │ ○ Solid       │  │  │      ┌────────────────────┐       │ │
│  │  │ ● Gradient    │  │  │      │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │       │ │
│  │  └────────────────┘  │  │      │  ▓▓░░░░░░░░░░▓▓  │       │ │
│  │                      │  │      │  ▓▓░░▓▓▓▓░░░▓▓  │       │ │
│  │  [Color Picker]      │  │      │  ▓▓░░▓▓▓▓░░░▓▓  │       │ │
│  │  #3B82F6            │  │      │  ▓▓░░░░░░░░░░▓▓  │       │ │
│  │                      │  │      │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │       │ │
│  │  Gradient:           │  │      └────────────────────┘       │ │
│  │  ┌──────────────┐   │  │                                  │ │
│  │  │ Type: Linear │   │  │      Ratio: 4.5:1 ✓              │ │
│  │  │ From: #3B82F6│   │  │                                  │ │
│  │  │ To:   #8B5CF6│   │  └──────────────────────────────────┘ │
│  │  │ Angle: 45°   │   │  │                                    │
│  │  └──────────────┘   │  │                                    │
│  └──────────────────────┘  │                                    │
│                            │                                    │
│  ┌──────────────────────┐  │                                    │
│  │   COLOR BACKGROUND   │  │                                    │
│  │  ┌────────────────┐  │  │                                    │
│  │  │ [Color Picker] │  │  │                                    │
│  │  │ #FFFFFF        │  │  │                                    │
│  │  └────────────────┘  │  │                                    │
│  └──────────────────────┘  │                                    │
│                            │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DOT STYLE                                                 │  │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │  │
│  │  │ ■  │ │ ○  │ │ ◆  │ │ ★  │ │ ♥  │ │ ♦  │               │  │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘               │  │
│  │  Square Rounded Circle Star  Heart Diamond                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LOGO (opcional)                                          │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │     Drag & drop image or click to upload          │   │  │
│  │  │     Max size: 20% of QR                           │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │  Size: [====●========] 15%  ☐ Hide background             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.3.3 AdvancedConfig

**Ubicación:** `src/components/ConfigPanel/AdvancedConfig/`

**Props:**
```typescript
interface AdvancedConfigProps {
  advanced: QRAdvancedConfig;
  onChange: (advanced: QRAdvancedConfig) => void;
}
```

**Estado Interno:**
```typescript
interface AdvancedConfigState {
  isDebugMode: boolean;
  marginPresets: { label: string; value: number }[];
}
```

**Responsabilidades:**
- Selector de versión QR (1-40, auto)
- Selector de nivel de corrección (L, M, Q, H)
- Configuración de margen/quiet zone
- Color del margen
- Toggle de modo debug (ver estructura modular)
- Información educativa sobre ECL

**Eventos Emitidos:**

| Evento | Payload |
|--------|---------|
| `onAdvancedChange` | `Partial<QRAdvancedConfig>` |
| `onDebugToggle` | `boolean` |

**Contrato de Datos:**

```typescript
interface AdvancedConfigOutput {
  advanced: QRAdvancedConfig;
}

interface QRAdvancedConfig {
  version: QRVersion | 'auto';
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  marginColor: string;
  debugView: boolean;
}

type QRVersion = 1 | 2 | 3 | ... | 40;
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
```

**Diagrama de Interacción:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     AdvancedConfig                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  QR VERSION                                               │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  ● Auto (recommended)                              │  │  │
│  │  │  ○ Manual: [Version 5 ▼] (37×37 modules)           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ℹ️ Auto seleccionará la versión mínima necesaria para   │  │
│  │     almacenar el contenido.                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ERROR CORRECTION LEVEL                                  │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  L  │  M  │  Q  │  H                            │  │  │
│  │  │  7% │ 15% │ 25% │ 30%                           │  │  │
│  │  │     │     │     │                               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  M (Medium) - Recommended                          │  │  │
│  │  │  15% recovery • 26% redundancy • General use       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ℹ️ Higher levels allow logos but reduce capacity        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  QUIET ZONE (Margin)                                    │  │
│  │                                                           │  │
│  │  Margin: [====●====] 4 modules (minimum recommended)     │  │
│  │  Range: 0 - 8 modules                                    │  │
│  │                                                           │  │
│  │  Margin Color: [FFFFFF] (white)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DEBUG VIEW                                              │  │
│  │                                                           │  │
│  │  ☐ Show module structure (for development)              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Hooks

### 4.1 useQRCode

**Ubicación:** `src/hooks/useQRCode.ts`

**Firma del Hook:**
```typescript
function useQRCode(initialConfig?: Partial<QRConfig>): {
  // Estado
  qrData: QRCodeData;
  isGenerating: boolean;
  error: QRCodeError | null;

  // Configuración
  updateConfig: (config: Partial<QRConfig>) => void;
  resetConfig: () => void;

  // Generación
  regenerate: () => Promise<void>;

  // Exportación
  toDataURL: (format: 'png' | 'svg', quality?: number) => Promise<string>;
  toBlob: (format: 'png', quality?: number) => Promise<Blob>;
  getRawData: (format: 'svg' | 'png') => Promise<ArrayBuffer>;
}
```

**Entradas (Parámetros):**

```typescript
interface UseQRCodeInput {
  content?: string;
  style?: QRStyle;
  advanced?: QRAdvancedConfig;
  encoding?: EncodingMode;
}

interface QRStyle {
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

interface QRAdvancedConfig {
  version: QRVersion | 'auto';
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  marginColor: string;
  debugView: boolean;
}
```

**Salidas (Retorno):**

```typescript
interface QRCodeData {
  content: string;
  version: number;
  capacity: number;      // en bytes
  used: number;          // bytes utilizados
  modules: number;       // tamaño en módulos (ej: 25)
  encoding: EncodingMode;
}

interface QRCodeError {
  code: 'CONTENT_TOO_LONG' | 'INVALID_ENCODING' | 'GENERATION_FAILED' | 'INVALID_CONFIG';
  message: string;
  details?: {
    maxCapacity?: number;
    usedCapacity?: number;
    requiredVersion?: number;
  };
}
```

**Efectos Colaterales:**

1. **Inicialización:** Crea instancia de QRCodeStyling en mount
2. **Actualización de config:** Llama `update()` en la instancia cuando cambia content/style
3. **Renderizado:** Accede al DOM para renderizar en canvas/SVG
4. **Limpieza:** Cancela instancias pendientes en unmount
5. **Persistencia:** No persiste datos fuera del componente

**Diagrama de Flujo:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         useQRCode hook                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │   START     │                                                │
│  │  (mount)    │                                                │
│  └──────┬──────┘                                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                            │
│  │ Initialize      │                                            │
│  │ QRCodeStyling   │                                            │
│  │ instance        │                                            │
│  └──────┬──────────┘                                            │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                            │
│  │ Create signals   │──▶ qrData, isGenerating, error            │
│  │ for state       │                                            │
│  └──────┬──────────┘                                            │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                            │
│  │    Watch for    │◀─────────────────────────┐                  │
│  │    config       │                           │                  │
│  │    changes      │                           │                  │
│  └──────┬──────────┘                           │                  │
│         │                                       │                  │
│         │ config changed                        │                  │
│         ▼                                       │                  │
│  ┌─────────────────┐                           │                  │
│  │ Validate        │                           │                  │
│  │ content         │                           │                  │
│  └──────┬──────────┘                           │                  │
│         │                                       │                  │
│         │ valid                                │                  │
│         ▼                                       │                  │
│  ┌─────────────────┐                           │                  │
│  │ Call instance   │                           │                  │
│  │ .update()       │                           │                  │
│  └──────┬──────────┘                           │                  │
│         │                                       │                  │
│         │ success                              │                  │
│         ▼                                       │                  │
│  ┌─────────────────┐                           │                  │
│  │ Update qrData   │───────────────────────────┘                  │
│  │ signal          │       (re-render triggers)                    │
│  └──────┬──────────┘                                            │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                            │
│  │ Return state & │                                            │
│  │ methods         │                                            │
│  │ to component    │                                            │
│  └─────────────────┘                                            │
│                                                                  │
│  EXPORT METHODS:                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  toDataURL(format, quality)  ──▶  instance.toDataURL()  │   │
│  │  toBlob(format, quality)    ──▶  instance.toBlob()     │   │
│  │  getRawData(format)          ──▶  instance.getRawData()  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Ejemplo de Uso:**

```typescript
function MyComponent() {
  const {
    qrData,
    isGenerating,
    error,
    updateConfig,
    toDataURL,
    toBlob,
  } = useQRCode({
    content: 'https://example.com',
    style: { color: { foreground: '#000000', background: '#ffffff' } },
    advanced: { version: 'auto', errorCorrectionLevel: 'M', margin: 4 }
  });

  const handleExportPNG = async () => {
    const blob = await toBlob('png');
    saveAs(blob, 'qr-code.png');
  };

  return (
    <div>
      <p>Version: {qrData.version}</p>
      <p>Capacity: {qrData.used}/{qrData.capacity} bytes</p>
      <button onClick={handleExportPNG} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Export PNG'}
      </button>
    </div>
  );
}
```

---

## 5. Diseño de Validaciones

### 5.1 Arquitectura de Validaciones

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Validator Engine                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  validate(config: QRConfig): ValidationResult     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                           │                              │  │
│  │         ┌─────────────────┼─────────────────┐             │  │
│  │         ▼                 ▼                 ▼             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Rules     │  │   Rules     │  │   Rules     │      │  │
│  │  │  (content)  │  │  (style)   │  │ (advanced)  │      │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │  │
│  │         │                 │                 │             │  │
│  │         └─────────────────┼─────────────────┘             │  │
│  │                           ▼                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           ValidationResult                         │  │  │
│  │  │  { isValid, errors[], warnings[], metadata }       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Reglas de Validación

#### 5.2.1 CONTENT_LENGTH

```typescript
interface ContentLengthRule {
  id: 'CONTENT_LENGTH';
  severity: 'error';
  validate: (config: QRConfig, metadata: QRMetadata) => ValidationWarning | null;
}

const CONTENT_LENGTH_RULE: ContentLengthRule = {
  id: 'CONTENT_LENGTH',
  severity: 'error',
  validate: (config, metadata) => {
    if (metadata.used > metadata.capacity) {
      return {
        id: 'CONTENT_LENGTH',
        code: 'CONTENT_LENGTH',
        severity: 'error',
        message: `Contenido excede la capacidad. Se requieren ${metadata.used} bytes pero la versión ${metadata.version} solo soporta ${metadata.capacity} bytes.`,
        reference: '#capacity-table'
      };
    }
    return null;
  }
};
```

**Condición:** `metadata.used > metadata.capacity`

**Acción:** Previene exportación, muestra error

---

#### 5.2.2 MIN_CONTRAST

```typescript
interface MinContrastRule {
  id: 'MIN_CONTRAST';
  severity: 'warning';
  validate: (config: QRConfig) => ValidationWarning | null;
}

function calculateContrast(fg: string, bg: string): number {
  const fgLum = getLuminance(fg);
  const bgLum = getLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

const MIN_CONTRAST_RULE: MinContrastRule = {
  id: 'MIN_CONTRAST',
  severity: 'warning',
  validate: (config) => {
    const fg = config.style.color.foreground;
    const bg = config.style.color.background;

    // Si es gradiente, usar color inicial
    const fgColor = typeof fg === 'string' ? fg : fg.colors[0];
    const ratio = calculateContrast(fgColor, bg);

    if (ratio < 4.5) {
      return {
        id: 'MIN_CONTRAST',
        code: 'MIN_CONTRAST',
        severity: 'warning',
        message: `Contraste bajo (${ratio.toFixed(1)}:1). Se recomienda mínimo 4.5:1 para escaneo óptimo.`,
        reference: '#contrast-requirements'
      };
    }
    return null;
  }
};
```

**Condición:** `contrastRatio < 4.5`

**Acción:** Muestra warning, no previene exportación

---

#### 5.2.3 LOGO_SIZE

```typescript
interface LogoSizeRule {
  id: 'LOGO_SIZE';
  severity: 'error';
  validate: (config: QRConfig) => ValidationWarning | null;
}

const MAX_LOGO_PERCENTAGE = 20;

const LOGO_SIZE_RULE: LogoSizeRule = {
  id: 'LOGO_SIZE',
  severity: 'error',
  validate: (config) => {
    if (config.style.logo && config.style.logo.size > MAX_LOGO_PERCENTAGE) {
      return {
        id: 'LOGO_SIZE',
        code: 'LOGO_SIZE',
        severity: 'error',
        message: `Logo demasiado grande (${config.style.logo.size}%). Máximo permitido: ${MAX_LOGO_PERCENTAGE}%.`,
        reference: '#logo-size-limit'
      };
    }
    return null;
  }
};
```

**Condición:** `logo.size > 20`

**Acción:** Previene exportación si logo > 20%

---

#### 5.2.4 QUIET_ZONE

```typescript
interface QuietZoneRule {
  id: 'QUIET_ZONE';
  severity: 'warning';
  validate: (config: QRConfig) => ValidationWarning | null;
}

const MIN_QUIET_ZONE = 4;  // módulos

const QUIET_ZONE_RULE: QuietZoneRule = {
  id: 'QUIET_ZONE',
  severity: 'warning',
  validate: (config) => {
    if (config.advanced.margin < MIN_QUIET_ZONE) {
      return {
        id: 'QUIET_ZONE',
        code: 'QUIET_ZONE',
        severity: 'warning',
        message: `Zona de silencio pequeña (${config.advanced.margin} módulos). Mínimo recomendado: ${MIN_QUIET_ZONE} módulos.`,
        reference: '#quiet-zone'
      };
    }
    return null;
  }
};
```

**Condición:** `margin < 4`

**Acción:** Muestra warning

---

#### 5.2.5 ENCODING_MODE

```typescript
interface EncodingModeRule {
  id: 'ENCODING_MODE';
  severity: 'error';
  validate: (config: QRConfig) => ValidationWarning | null;
}

const ENCODING_MODE_RULE: EncodingModeRule = {
  id: 'ENCODING_MODE',
  severity: 'error',
  validate: (config) => {
    const content = config.content;
    const encoding = config.encoding;

    const isValidForEncoding = {
      'numeric': /^\d*$/,
      'alphanumeric': /^[A-Z0-9 $%*+\-./:]*$/i,
      'byte': /.*/,
      'kanji': /^[一-龯]*$/,
    };

    if (!isValidForEncoding[encoding].test(content)) {
      return {
        id: 'ENCODING_MODE',
        code: 'ENCODING_MODE',
        severity: 'error',
        message: `El contenido no es válido para el modo de codificación "${encoding}".`,
        reference: '#encoding-modes'
      };
    }
    return null;
  }
};
```

**Condición:** Contenido no compatible con encoding seleccionado

**Acción:** Previene exportación

---

#### 5.2.6 GRADIENT_WARNING

```typescript
interface GradientWarningRule {
  id: 'GRADIENT_WARNING';
  severity: 'info';
  validate: (config: QRConfig) => ValidationWarning | null;
}

const GRADIENT_WARNING_RULE: GradientWarningRule = {
  id: 'GRADIENT_WARNING',
  severity: 'info',
  validate: (config) => {
    const fg = config.style.color.foreground;
    if (typeof fg !== 'string' && fg.type === 'linear' || fg.type === 'radial') {
      return {
        id: 'GRADIENT_WARNING',
        code: 'GRADIENT_WARNING',
        severity: 'info',
        message: 'Los degradados pueden reducir la tasa de escaneo exitoso. Se recomienda usar colores sólidos.',
        reference: '#gradients'
      };
    }
    return null;
  }
};
```

**Condición:** `foreground` es un `GradientConfig`

**Acción:** Muestra información

---

#### 5.2.7 CUSTOM_SHAPE_WARNING

```typescript
interface CustomShapeWarningRule {
  id: 'CUSTOM_SHAPE_WARNING';
  severity: 'info';
  validate: (config: QRConfig) => ValidationWarning | null;
}

const CUSTOM_SHAPE_WARNING_RULE: CustomShapeWarningRule = {
  id: 'CUSTOM_SHAPE_WARNING',
  severity: 'info',
  validate: (config) => {
    const shapes: DotShape[] = ['circle', 'star', 'heart', 'diamond'];
    if (config.style.dotStyle && shapes.includes(config.style.dotStyle.shape)) {
      return {
        id: 'CUSTOM_SHAPE_WARNING',
        code: 'CUSTOM_SHAPE_WARNING',
        severity: 'info',
        message: 'Las formas personalizadas pueden afectar la legibilidad del código QR.',
        reference: '#custom-shapes'
      };
    }
    return null;
  }
};
```

**Condición:** `dotStyle.shape` es una forma no cuadrada

**Acción:** Muestra información

---

#### 5.2.8 VERSION_AUTO_WARNING

```typescript
interface VersionAutoWarningRule {
  id: 'VERSION_AUTO';
  severity: 'warning';
  validate: (config: QRConfig, metadata: QRMetadata) => ValidationWarning | null;
}

const VERSION_AUTO_WARNING_RULE: VersionAutoWarningRule = {
  id: 'VERSION_AUTO',
  severity: 'warning',
  validate: (config, metadata) => {
    if (config.advanced.version === 'auto' && metadata.used > metadata.capacity * 0.9) {
      return {
        id: 'VERSION_AUTO',
        code: 'VERSION_AUTO',
        severity: 'warning',
        message: 'El contenido está cerca del límite de capacidad. Considere fijar una versión mayor para mejor tolerancia a errores.',
        reference: '#version-selection'
      };
    }
    return null;
  }
};
```

**Condición:** Versión auto y uso > 90% de capacidad

**Acción:** Muestra warning

---

### 5.3 Tabla Resumen de Validaciones

| ID | Severidad | Previene Export | Dependencias | Mensaje Típico |
|----|-----------|-----------------|--------------|----------------|
| `CONTENT_LENGTH` | error | ✅ | metadata.capacity | "Contenido excede capacidad" |
| `MIN_CONTRAST` | warning | ❌ | colors | "Contraste bajo" |
| `LOGO_SIZE` | error | ✅ | logo.size | "Logo muy grande" |
| `QUIET_ZONE` | warning | ❌ | margin | "Margen pequeño" |
| `ENCODING_MODE` | error | ✅ | content, encoding | "Encoding incompatible" |
| `GRADIENT_WARNING` | info | ❌ | foreground type | "Degradados pueden afectar" |
| `CUSTOM_SHAPE_WARNING` | info | ❌ | dotStyle.shape | "Formas personalizadas..." |
| `VERSION_AUTO` | warning | ❌ | metadata | "Considere versión mayor" |

### 5.4 Algoritmo de Validación

```typescript
function validateQRConfig(
  config: QRConfig,
  metadata: QRMetadata
): ValidationResult {
  const rules = [
    CONTENT_LENGTH_RULE,
    MIN_CONTRAST_RULE,
    LOGO_SIZE_RULE,
    QUIET_ZONE_RULE,
    ENCODING_MODE_RULE,
    GRADIENT_WARNING_RULE,
    CUSTOM_SHAPE_WARNING_RULE,
    VERSION_AUTO_WARNING_RULE,
  ];

  const errors: ValidationWarning[] = [];
  const warnings: ValidationWarning[] = [];
  const infos: ValidationWarning[] = [];

  for (const rule of rules) {
    const result = rule.validate(config, metadata);
    if (result) {
      if (result.severity === 'error') errors.push(result);
      else if (result.severity === 'warning') warnings.push(result);
      else infos.push(result);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [...warnings, ...infos],
    metadata: {
      version: metadata.version,
      capacity: metadata.capacity,
      used: metadata.used,
      modules: metadata.modules,
    }
  };
}
```

### 5.5 Contratos de Validación

```typescript
// Tipos completos de validación

type ValidationSeverity = 'error' | 'warning' | 'info';

interface ValidationWarning {
  id: string;
  code: string;
  severity: ValidationSeverity;
  message: string;
  reference?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationWarning[];    // severity === 'error'
  warnings: ValidationWarning[];  // severity === 'warning' | 'info'
  metadata: {
    version: number;
    capacity: number;
    used: number;
    modules: number;
  };
}

interface QRMetadata {
  version: number;
  capacity: number;
  used: number;
  modules: number;
  encoding: EncodingMode;
}
```

---

## 6. Límites de la Tecnología QR

### 6.1 Capacidad por Versión (Completa)

| Ver | Tamaño | Numeric | Alphanumeric | Byte | Kanji |
|-----|--------|---------|--------------|------|-------|
| 1 | 21×21 | 7089 | 4296 | 2953 | 1817 |
| 2 | 25×25 | 4296 | 2612 | 1796 | 1103 |
| 3 | 29×29 | 7089 | 4296 | 2953 | 1817 |
| 4 | 33×33 | 14132 | 8592 | 5914 | 3639 |
| 5 | 37×37 | 23330 | 14168 | 9753 | 5999 |
| 6 | 41×41 | 31130 | 18917 | 13012 | 8005 |
| 7 | 45×45 | 43369 | 26350 | 18124 | 11149 |
| 8 | 49×49 | 55913 | 33976 | 23364 | 14374 |
| 9 | 53×53 | 69936 | 42499 | 29229 | 17974 |
| 10 | 57×57 | 85880 | 52196 | 35903 | 22083 |
| 11 | 61×61 | 103864 | 63139 | 43429 | 26716 |
| 12 | 65×65 | 124364 | 75599 | 52003 | 31990 |
| 13 | 69×69 | 146452 | 88982 | 61211 | 37658 |
| 14 | 73×73 | 170162 | 103412 | 71135 | 43760 |
| 15 | 77×77 | 195728 | 118942 | 81829 | 50342 |
| 16 | 81×81 | 223492 | 135837 | 93459 | 57507 |
| 17 | 85×85 | 253664 | 154159 | 106087 | 65257 |
| 18 | 89×89 | 285584 | 173618 | 119436 | 73471 |
| 19 | 93×93 | 319560 | 194260 | 133634 | 82198 |
| 20 | 97×97 | 355816 | 216292 | 148758 | 91532 |
| 21 | 101×101 | 394628 | 239872 | 165001 | 101503 |
| 22 | 105×105 | 436616 | 265312 | 182480 | 112264 |
| 23 | 109×109 | 481608 | 292776 | 201374 | 123867 |
| 24 | 113×113 | 530176 | 322308 | 221725 | 136385 |
| 25 | 117×117 | 582596 | 354008 | 243454 | 149785 |
| 26 | 121×121 | 638656 | 387960 | 266852 | 164171 |
| 27 | 125×125 | 698336 | 424560 | 292012 | 179649 |
| 28 | 129×129 | 762336 | 463360 | 318720 | 196094 |
| 29 | 133×133 | 829892 | 504508 | 347026 | 213510 |
| 30 | 137×137 | 901120 | 547696 | 376787 | 231781 |
| 31 | 141×141 | 976048 | 593212 | 408050 | 251003 |
| 32 | 145×145 | 1055504 | 641428 | 441216 | 271377 |
| 33 | 149×149 | 1138864 | 692556 | 476448 | 293068 |
| 34 | 153×153 | 1226212 | 745848 | 513000 | 315593 |
| 35 | 157×157 | 1317636 | 800760 | 550958 | 338965 |
| 36 | 161×161 | 1413248 | 858808 | 590712 | 363359 |
| 37 | 165×165 | 1513132 | 919440 | 632404 | 389017 |
| 38 | 169×169 | 1617632 | 983288 | 676329 | 416115 |
| 39 | 173×173 | 1726844 | 1049928 | 722772 | 444567 |
| 40 | 177×177 | 1840964 | 1119160 | 770112 | 473767 |

**Nota:** Los valores están en **caracteres**, no bytes. Para bytes, multiplicar por 1 para Byte, 2 para caracteres multibyte.

### 6.2 Niveles de Corrección de Error (ECL)

```
┌─────────────────────────────────────────────────────────────────┐
│                 ERROR CORRECTION LEVELS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  LEVEL  │  RECOVERY  │  REDUNDANCY  │  USE CASE         │   │
│   ├─────────┼────────────┼──────────────┼───────────────────┤   │
│   │    L    │    ~7%     │    ~19%      │  Entornos         │   │
│   │         │            │              │  controlados      │   │
│   ├─────────┼────────────┼──────────────┼───────────────────┤   │
│   │    M    │    ~15%    │    ~26%      │  Uso general  ★   │   │
│   │         │            │              │  (Recomendado)   │   │
│   ├─────────┼────────────┼──────────────┼───────────────────┤   │
│   │    Q    │    ~25%    │    ~38%      │  Industrial,      │   │
│   │         │            │              │  superficies      │   │
│   ├─────────┼────────────┼──────────────┼───────────────────┤   │
│   │    H    │    ~30%    │    ~50%      │  Logos, decorativ.│   │
│   │         │            │              │  Alta tolerancia  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   CAPACITY IMPACT (ejemplo con 1000 bytes):                      │
│                                                                  │
│   L: 1000 bytes → 1234 bytes total (1000 + 19% redundancia)     │
│   M: 1000 bytes → 1260 bytes total (1000 + 26% redundancia)     │
│   Q: 1000 bytes → 1380 bytes total (1000 + 38% redundancia)     │
│   H: 1000 bytes → 1500 bytes total (1000 + 50% redundancia)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Quiet Zone (Zona de Silencio)

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUIET ZONE DIAGRAM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────────────────────────────────────────┐          │
│    │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 4 modules
│    │ ░┌───────────────────────────────────────────┐░ │          │
│    │ ░│                                           │░ │          │
│    │ ░│          finder patterns                 │░ │          │
│    │ ░│              ■ ■ ■                       │░ │          │
│    │ ░│              ■   ■                       │░ │          │
│    │ ░│              ■ ■ ■                       │░ │          │
│    │ ░│                                           │░ │          │
│    │ ░│     ┌───────────────────────────────┐     │░ │          │
│    │ ░│     │                               │     │░ │          │
│    │ ░│     │        DATA MODULES          │     │░ │          │
│    │ ░│     │                               │     │░ │          │
│    │ ░│     │                               │     │░ │          │
│    │ ░│     └───────────────────────────────┘     │░ │          │
│    │ ░│                                           │░ │          │
│    │ ░│              ■ ■ ■                       │░ │          │
│    │ ░│              ■   ■                       │░ │          │
│    │ ░│              ■ ■ ■                       │░ │          │
│    │ ░│                                           │░ │          │
│    │ ░└───────────────────────────────────────────┘░ │          │
│    │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │          │
│    └─────────────────────────────────────────────────┘          │
│                                                                  │
│    Minimum: 4 modules on all sides                               │
│    Recommended: 4 modules (white space)                         │
│    Color: Should match background or be white                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Contraste

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTRAST REQUIREMENTS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   WCAG 2.1 Contrast Ratio Formula:                              │
│                                                                  │
│                    (L1 + 0.05)                                  │
│   Ratio =  ────────────────                                      │
│                    (L2 + 0.05)                                  │
│                                                                  │
│   Where L1 = lighter luminance, L2 = darker luminance           │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  RATIO    │  WCAG LEVEL  │  SUITABILITY                  │   │
│   ├───────────┼──────────────┼──────────────────────────────┤   │
│   │  21:1     │  AAA         │  ✓ Excellent (black/white)   │   │
│   │  7:1      │  AAA         │  ✓ Great                     │   │
│   │  4.5:1    │  AA          │  ✓ Minimum for QR codes      │   │
│   │  3:1      │  AA Large    │  ⚠️ Risky for QR              │   │
│   │  < 3:1    │  Fail        │  ✗ Will likely fail scan      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   RECOMMENDATION: Maintain minimum 4.5:1 for reliable scanning  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.5 Riesgos por Degradados

```
┌─────────────────────────────────────────────────────────────────┐
│                    GRADIENT RISKS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SOLID COLOR (Recommended):                                    │
│   ┌─────────────────────┐                                       │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  Clear distinction between           │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  modules - easy to scan              │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │                                       │
│   └─────────────────────┘                                       │
│                                                                  │
│   LINEAR GRADIENT (Risky):                                      │
│   ┌─────────────────────┐                                       │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  Module boundaries become            │
│   │ ░░░░░░░░░░░░░░░░░░ │  ambiguous - may confuse             │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  scanner algorithms                  │
│   │ ░░░░░░░░░░░░░░░░░░ │                                       │
│   └─────────────────────┘                                       │
│                                                                  │
│   RISKS:                                                        │
│   • Scanner may interpret gradient as noise                     │
│   • Low contrast areas may fail to scan                         │
│   • Color transitions confuse thresholding algorithms            │
│                                                                  │
│   MITIGATION:                                                   │
│   • Use high contrast gradients (dark → light)                 │
│   • Always pair with Error Correction Level H                    │
│   • Test with multiple scanner apps/devices                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.6 Riesgos por Logos

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOGO RISKS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SAFE ZONE (≤20%):                                             │
│   ┌─────────────────────┐                                       │
│   │ ■ ■ ■      ■ ■ ■  │                                       │
│   │ ■   ■      ■   ■  │         ┌─────┐                        │
│   │ ■ ■ ■  →  ■ ■ ■  │         │LOGO │  ← Logo covers         │
│   │         ■ ■ ■    │         │20%  │    data area           │
│   │ ■ ■ ■ ■ ■ ■ ■ ■ │         └─────┘                        │
│   │ ■ ■ ■ ■ ■ ■ ■ ■ │                                       │
│   └─────────────────────┘                                       │
│                                                                  │
│   DANGER ZONE (>20%):                                           │
│   ┌─────────────────────┐                                       │
│   │ ■ ■ ■      ■ ■ ■  │                                       │
│   │ ■   ■      ■   ■  │         ┌─────────┐                    │
│   │ ■ ■ ■  →  ■ ■ ■  │         │  LOGO   │                    │
│   │ ■   ■      ■   ■  │         │  >30%   │  ← Will likely    │
│   │ ■ ■ ■      ■ ■ ■  │         └─────────┘    fail to scan  │
│   └─────────────────────┘                                       │
│                                                                  │
│   REQUIREMENTS FOR LOGOS:                                       │
│   • Maximum size: 20% of QR area                               │
│   • Minimum Error Correction: Level H (30%)                     │
│   • High contrast with QR background                            │
│   • HideBackground: recommended                                 │
│   • Test with real scanner devices                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.7 Riesgos por Formas Personalizadas

```
┌─────────────────────────────────────────────────────────────────┐
│                  CUSTOM SHAPE RISKS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SQUARE (DEFAULT - SAFE):                                      │
│   ┌─────────────────────┐                                       │
│   │ ■ ■ ■ ■ ■ ■ ■ ■ ■ │                                       │
│   │ ■ ■ ■ ■ ■ ■ ■ ■ ■ │  Clear module boundaries              │
│   │ ■ ■ ■ ■ ■ ■ ■ ■ ■ │  Maximum readability                  │
│   └─────────────────────┘                                       │
│                                                                  │
│   ROUNDED (ACCEPTABLE):                                         │
│   ┌─────────────────────┐                                       │
│   │ ○ ○ ○ ○ ○ ○ ○ ○ ○ │                                       │
│   │ ○ ○ ○ ○ ○ ○ ○ ○ ○ │  Slight reduction in contrast        │
│   │ ○ ○ ○ ○ ○ ○ ○ ○ ○ │  but generally scannable              │
│   └─────────────────────┘                                       │
│                                                                  │
│   CIRCLE/STAR/HEART (RISKY):                                    │
│   ┌─────────────────────┐                                       │
│   │ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ │                                       │
│   │ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ │  Significant loss of definition      │
│   │ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ ◇ │  May fail with some scanners         │
│   └─────────────────────┘                                       │
│                                                                  │
│   MITIGATION:                                                   │
│   • Use Error Correction Level H                               │
│   • Limit custom shapes to decorative QRs                       │
│   • Always test with multiple scanners                         │
│   • Avoid in professional/industrial use                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.8 Tabla Comparativa de Riesgos

| Factor | Riesgo | Impacto | Mitigación |
|--------|--------|---------|------------|
| **Logo > 20%** | Alto | QR no escaneable | Usar ≤20%, ECL H |
| **Contraste < 4.5:1** | Alto | Escaneo parcial/fallido | Validar ratio WCAG |
| **Degradados** | Medio | Reducción tasa éxito | ECL H, test multi-device |
| **Formas circulares** | Medio | Pérdida definición | ECL H, evitar industrial |
| **Quiet zone < 4** | Bajo | Escaneo difícil bordes | Mantener ≥4 módulos |
| **ECL L con logo** | Alto | Logo destruye datos | Usar ECL H |
| **Versión muy baja** | Alto | Overflow datos | Calcular versión mínima |

---

## 7. Flujos de Usuario

### 7.1 Flujo Principal (Happy Path)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         MAIN USER FLOW                                    │
└──────────────────────────────────────────────────────────────────────────┘

   ┌─────────┐
   │  START  │
   └────┬────┘
        │
        ▼
   ┌─────────────────┐
   │  Open App       │  ←── Landing en http://localhost:5173
   │  Load defaults  │
   └──────┬──────────┘
          │
          ▼
   ┌─────────────────┐
   │  Enter Content  │  ←── Text input en DataConfig
   │  URL/Text       │
   └──────┬──────────┘
          │
          ▼
   ┌─────────────────┐     ┌─────────────────┐
   │  System         │────▶│  Show version   │
   │  detects        │     │  & capacity     │
   │  encoding       │     │  indicator      │
   └──────┬──────────┘     └─────────────────┘
          │
          ▼
   ┌─────────────────┐
   │  Preview QR     │  ←── QRPreview actualiza en tiempo real
   │  (default style)│
   └──────┬──────────┘
          │
          ▼
   ┌─────────────────┐     ┌─────────────────┐
   │  Customize      │────▶│  Live preview   │
   │  Style          │     │  updates        │
   └──────┬──────────┘     └─────────────────┘
          │
          ▼
   ┌─────────────────┐     ┌─────────────────┐
   │  Adjust         │────▶│  Validation    │
   │  Advanced      │     │  warnings show  │
   └──────┬──────────┘     └─────────────────┘
          │
          ▼
   ┌─────────────────┐
   │  Validation     │  ←── Sistema valida config completa
   │  Check          │
   └──────┬──────────┘
          │
    ┌─────┴─────┐
    │ isValid?  │
    └─────┬─────┘
         │
    YES  │  NO
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────────────┐
│Export │ │ Show errors    │
│Buttons│ │ & fix options  │
│enabled│ └────────┬────────┘
└───┬───┘          │
    │              │
    ▼              │
┌───────────────────┐ │
│  User clicks      │ │
│  PNG or SVG       │ │
└────────┬──────────┘ │
         │              │
         ▼              │
┌───────────────────┐   │
│  System generates│   │
│  file (blob/url) │   │
└────────┬──────────┘   │
         │              │
         ▼              │
┌───────────────────┐   │
│  Browser downloads│   │
│  file             │   │
└────────┬──────────┘   │
         │              │
         ▼              │
   ┌─────────┐          │
   │  DONE   │◀─────────┘
   └─────────┘
```

### 7.2 Flujo Alterno: Logo Upload

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGO UPLOAD FLOW                              │
└─────────────────────────────────────────────────────────────────┘

   ┌─────────┐
   │ START   │
   └────┬────┘
        │
        ▼
   ┌─────────────────┐
   │  StyleConfig    │
   │  Logo section   │
   └──────┬──────────┘
          │
          ▼
   ┌─────────────────┐
   │  Click upload   │
   │  or drag/drop   │
   └──────┬──────────┘
          │
          ▼
   ┌─────────────────┐
   │  File selected  │  ←── Accept: image/png, image/jpeg, image/svg
   └──────┬──────────┘
          │
          ▼
   ┌─────────────────┐     ┌─────────────────┐
   │  Validate file  │────▶│  Show preview   │
   │  (type, size)   │     │  of logo        │
   └──────┬──────────┘     └─────────────────┘
          │
    ┌─────┴─────┐
    │  Valid?   │
    └─────┬─────┘
         │
    YES  │  NO
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────────────┐
│Show   │ │  Show error    │
│size   │ │  "File too big"│
│slider │ │  or "Invalid"  │
└───┬───┘ └─────────────────┘
    │
    ▼
┌─────────────────┐
│  Set logo size  │  ←── Default: 15%, Max: 20%
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Check size ≤20%│
└──────┬──────────┘
       │
 ┌─────┴─────┐
 │ ≤ 20%?    │
 └─────┬─────┘
       │
  YES  │  NO (error)
   ┌───┴───┐
   │       │
   ▼       ▼
┌───────┐ ┌─────────────────┐
│Update │ │  Show error    │
│QR with│ │  "Logo must be  │
│logo   │ │   ≤ 20%"       │
└───┬───┘ └─────────────────┘
    │
    ▼
┌─────────────────┐
│  QR re-renders  │
│  with logo      │
└─────────────────┘
```

### 7.3 Flujo Alterno: Validación de Contraste

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTRAST VALIDATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

   ┌─────────┐
   │ User    │
   │ changes │
   │ colors  │
   └────┬────┘
        │
        ▼
   ┌─────────────────┐
   │  Calculate     │
   │  contrast ratio│
   └────┬──────────┘
        │
  ┌─────┴─────┐
  │ ratio     │
  │ ≥ 4.5:1?  │
  └─────┬─────┘
        │
   YES  │  NO
   ┌────┴────┐
   │         │
   ▼         ▼
┌───────┐ ┌─────────────────┐
│Green  │ │ Yellow/Red     │
│✓ OK   │ │ ⚠️ Warning      │
└───┬───┘ └──────┬──────────┘
    │             │
    │             ▼
    │ ┌─────────────────┐
    │ │ Show warning   │
    │ │ "Low contrast  │
    │ │ may affect     │
    │ │ scanning"      │
    │ └──────┬──────────┘
    │         │
    │         ▼
    │ ┌─────────────────┐
    │ │ Export still   │──┐
    │ │ allowed (warning│  │
    │ │ doesn't block) │  │
    │ └─────────────────┘  │
    │                     │
    ▼                     ▼
┌─────────────────────────────┐
│     Continue to export     │
│     or adjust colors       │
└─────────────────────────────┘
```

### 7.4 Flujo Alterno: Contenido Muy Largo

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONTENT LENGTH ERROR FLOW                       │
└─────────────────────────────────────────────────────────────────┘

   ┌─────────┐
   │ User    │
   │ enters  │
   │ content │
   └────┬────┘
        │
        ▼
   ┌─────────────────┐
   │  Calculate     │
   │  required      │
   │  version       │
   └────┬──────────┘
        │
  ┌─────┴─────┐
  │ Version   │
  │ needed ≤40│
  └─────┬─────┘
        │
   YES  │  NO
   ┌────┴────┐
   │         │
   ▼         ▼
┌───────┐ ┌─────────────────┐
│Version │ │  Show error    │
│auto   │ │  "Content too  │
│or      │ │   long for     │
│manual │ │   any version" │
└───┬───┘ └─────────────────┘
    │
    ▼
┌─────────────────┐
│ Check capacity │
│ for version    │
└────┬──────────┘
     │
┌────┴────────────┐
│ content ≤       │
│ capacity?       │
└────┬────────────┘
     │
YES  │  NO
┌────┴────┐
│         │
▼         ▼
┌───────┐ ┌─────────────────┐
│✓ OK   │ │  Show error     │
│       │ │  "Exceeds       │
│       │ │   capacity by   │
│       │ │   X bytes"      │
│       │ │                 │
│       │ │ Disable export  │
│       │ │ Suggest:        │
│       │ │ - Shorten URL   │
│       │ │ - Use URL short │
│       │ │   service       │
│       │ │ - Manual version│
│       │ │   (not possible) │
└───────┘ └─────────────────┘
```

### 7.5 Diagrama de Estados de Validación

```
┌─────────────────────────────────────────────────────────────────┐
│                   VALIDATION STATE MACHINE                       │
└─────────────────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────────────────┐
        │                                                 │
        ▼                                                 │
   ┌─────────┐                                           │
   │  IDLE   │  (no content)                             │
   └───┬─────┘                                           │
       │ content entered                                   │
       ▼                                                  │
   ┌─────────────────┐                                    │
   │  VALIDATING     │  (running all rules)               │
   └────────┬────────┘                                    │
            │                                              │
     ┌──────┴──────┐                                       │
     │             │                                        │
     ▼             ▼                                        │
┌────────┐   ┌───────────┐                                 │
│ VALID  │   │ INVALID   │                                 │
│        │   │           │                                 │
│ • isValid                                              │
│   = true                                               │
│ • errors                                              │
│   = []                                                 │
└────────┘   └───────────┘                                 │
                    │                                       │
                    ▼                                       │
          ┌─────────────────────┐                           │
          │   ERRORS present    │                           │
          │                     │                           │
          │ • isValid = false   │                           │
          │ • Export disabled   │                           │
          │ • Show error msgs   │                           │
          └─────────────────────┘                           │
                    │                                       │
                    │ user fixes errors                      │
                    ▼                                       │
          ┌─────────────────────┐                           │
          │   BACK TO          │                           │
          │   VALIDATING       │───────────────────────────┘
          └─────────────────────┘
```

---

## 8. Diseño de Exportación

### 8.1 Sistema de Exportación

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXPORT SYSTEM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ExportService                          │  │
│  │  ┌────────────────┐  ┌────────────────┐                 │  │
│  │  │  toPNG()       │  │  toSVG()       │                 │  │
│  │  │                │  │                │                 │  │
│  │  │  1. Get blob   │  │  1. Get string │                 │  │
│  │  │  2. Validate   │  │  2. Validate   │                 │  │
│  │  │  3. Create URL │  │  3. Create     │                 │  │
│  │  │  4. Trigger    │  │     download   │                 │  │
│  │  │     download   │  │  4. Trigger    │                 │  │
│  │  └────────────────┘  │     download   │                 │  │
│  │                      └────────────────┘                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Exportación PNG

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `width` | `number` | 1024 | Ancho en píxeles |
| `height` | `number` | 1024 | Alto en píxeles |
| `scale` | `number` | 4 | Multiplicador de escala (1-10) |
| `margin` | `number` | 4 | Módulos de margen |
| `quality` | `number` | 1.0 | Calidad JPEG (0-1, ignorado en PNG) |

**Proceso:**

```typescript
async function exportPNG(options: PNGExportOptions): Promise<Blob> {
  const { width = 1024, height = 1024, scale = 4, margin = 4, quality = 1.0 } = options;

  // 1. Validar parámetros
  if (width < 256 || width > 4096) throw new Error('Width must be 256-4096');
  if (height < 256 || height > 4096) throw new Error('Height must be 256-4096');
  if (scale < 1 || scale > 10) throw new Error('Scale must be 1-10');

  // 2. Obtener blob del QR engine
  const blob = await qrCodeStyling.toBlob({
    width,
    height,
    margin,
    image: logoDataUrl,  // si hay logo
    dotsOptions: { ... },
    cornersSquareOptions: { ... },
    cornersDotOptions: { ... },
  }, 'png');

  // 3. Validar blob
  if (!blob || blob.size === 0) throw new Error('Failed to generate PNG');

  // 4. Retornar blob
  return blob;
}
```

**Reglas de Calidad PNG:**

| Aspecto | Regla |
|---------|-------|
| Formato | PNG-24 con canal alfa |
| Compresión | Sin pérdida (deflate) |
| Tamaño mínimo | 256×256px |
| Tamaño máximo | 4096×4096px |
| DPI para impresión | 300 DPI (metadata opcional) |
| Metadata | Sin EXIF, XMP para minimizar tamaño |

### 8.3 Exportación SVG

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `width` | `number` | auto | Ancho (módulos * 10) |
| `height` | `number` | auto | Alto (módulos * 10) |
| `margin` | `number` | 4 | Módulos de margen |

**Proceso:**

```typescript
async function exportSVG(options: SVGExportOptions): Promise<string> {
  const { margin = 4 } = options;

  // 1. Obtener SVG string del QR engine
  const svgString = await qrCodeStyling.toDataURL({
    type: 'svg',
    margin,
  });

  // 2. Optimizar SVG (remover IDs innecesarios, minificar)
  const optimized = optimizeSVG(svgString);

  // 3. Retornar string
  return optimized;
}

function optimizeSVG(svg: string): string {
  // Remover comentarios
  // Remover espacios en blanco innecesarios
  // Combinar paths donde sea posible
  // Usar viewBox correcto
  return svg;
}
```

**Reglas de Calidad SVG:**

| Aspecto | Regla |
|---------|-------|
| Formato | SVG 1.1 válido |
| Elementos | `<rect>`, `<path>` solo |
| IDs | Sin IDs o únicos por elemento |
| Colores | Atributos inline |
| ViewBox | Correcto y proporcional |
| Namespace | SVG correcto |

### 8.4 Escalado y DPI

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALE/DPI REFERENCE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Scale │ Pixels │ Modules │ DPI (at 1x1 module=10px)  │  │
│   ├─────────┼────────┼─────────┼──────────────────────────┤  │
│   │    1    │   256  │   ~21   │  26 DPI                   │  │
│   │    2    │   512  │   ~21   │  51 DPI                   │  │
│   │    3    │   768  │   ~21   │  77 DPI                   │  │
│   │    4    │  1024  │   ~21   │ 102 DPI                   │  │
│   │    5    │  1280  │   ~21   │ 128 DPI                   │  │
│   │    8    │  2048  │   ~21   │ 205 DPI                   │  │
│   │   10    │  2560  │   ~21   │ 256 DPI                   │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   PRINT REQUIREMENTS:                                          │
│   • Minimum for print: 300 DPI                                 │
│   • At 300 DPI, module size ≈ 0.85mm                          │
│   • Typical print size: 30mm × 30mm                           │
│   • Recommended export for print: 1024px @ 4x scale           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Contrato de Exportación

```typescript
interface ExportService {
  toPNG(options: PNGExportOptions): Promise<Blob>;
  toSVG(options?: SVGExportOptions): Promise<string>;
  toDataURL(format: 'png' | 'svg'): Promise<string>;
}

interface PNGExportOptions {
  width?: number;    // default: 1024
  height?: number;   // default: 1024
  scale?: number;    // default: 4, range: 1-10
  margin?: number;   // default: 4
  quality?: number;  // default: 1.0 (ignored for PNG)
}

interface SVGExportOptions {
  margin?: number;   // default: 4
}

interface DownloadOptions {
  filename: string;  // sin extensión
  format: 'png' | 'svg';
  blob?: Blob;
  dataUrl?: string;
}
```

---

## 9. Diseño UI/UX

### 9.1 Layout General

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              HEADER                                      │
│  ┌─────────────────┐                               ┌──────────────────┐  │
│  │  ◈ QR Studio    │  Generador profesional       │  🌙  GitHub      │  │
│  └─────────────────┘                               └──────────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                    QR HERO (420px)                               │   │
│  │                                                                  │   │
│  │              ┌────────────────────────────┐                      │   │
│  │              │                            │                      │   │
│  │              │        ██████████          │                      │   │
│  │              │        ██████████          │                      │   │
│  │              │        ██████████          │                      │   │
│  │              │                            │                      │   │
│  │              └────────────────────────────┘                      │   │
│  │                                                                  │   │
│  │         ⬇ PNG    ⬇ SVG    📋 Copiar    🔗 Compartir             │   │
│  │                                                                  │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  Tipo: 🔗 URL    Destino: web.whatsapp.com                       │   │
│  │  Versión: 1  ECL: M  Módulos: 21×21  Capacidad: 8%              │   │
│  │  ✓ Android  ✓ iOS  ✓ Cámara estándar                            │   │
│  │  Escaneo: https://web.whatsapp.com                              │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │  ⚠️ Warnings (si aplica)                                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ✎ Contenido                                         [−]       │   │
│  │     🔗 URL  ✆ WhatsApp  ✉ Correo  ◉ WiFi  ☎ Teléfono  ...     │   │
│  │     [Campos dinámicos según tipo seleccionado]                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ◈ Estilo                                            [+]       │   │
│  │     Color · Forma · Degradado · Logo                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ⚙ Avanzado                                          [+]       │   │
│  │     Versión · Corrección · Margen · Debug                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│              ↺ Restaurar valores por defecto                             │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                              FOOTER (optional)                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Responsive Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSIVE BREAKPOINTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   MOBILE (< 640px)                                              │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │  ◈ QR Studio                    🌙  GitHub              │    │
│   ├─────────────────────────────────────────────────────────┤    │
│   │                                                         │    │
│   │              ┌─────────────────────────┐                 │    │
│   │              │      QR PREVIEW         │                 │    │
│   │              │      (max 320px)        │                 │    │
│   │              └─────────────────────────┘                 │    │
│   │                                                         │    │
│   │         ⬇ PNG   ⬇ SVG   📋 Copiar   🔗 Compartir       │    │
│   │                                                         │    │
│   │  ┌─────────────────────────────────────────────────┐    │    │
│   │  │  Tipo: 🔗 URL    Capacidad: 8%                 │    │    │
│   │  │  ✓ Android  ✓ iOS  ✓ Cámara                    │    │    │
│   │  └─────────────────────────────────────────────────┘    │    │
│   │                                                         │    │
│   │  ┌─────────────────────────────────────────────────┐    │    │
│   │  │  ✎ Contenido                          [−]       │    │    │
│   │  │  🔗 URL ✆ WhatsApp ✉ Correo ◉ WiFi ...         │    │    │
│   │  │  [Campos según tipo]                             │    │    │
│   │  └─────────────────────────────────────────────────┘    │    │
│   │  ┌─────────────────────────────────────────────────┐    │    │
│   │  │  ◈ Estilo                             [+]       │    │    │
│   │  └─────────────────────────────────────────────────┘    │    │
│   │  ┌─────────────────────────────────────────────────┐    │    │
│   │  │  ⚙ Avanzado                           [+]       │    │    │
│   │  └─────────────────────────────────────────────────┘    │    │
│   │                                                         │    │
│   │           ↺ Restaurar valores por defecto               │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│   TABLET (640px - 1024px)                                        │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │  ◈ QR Studio — Generador profesional    🌙  GitHub      │    │
│   ├─────────────────────────────────────────────────────────┤    │
│   │                                                         │    │
│   │              ┌─────────────────────────┐                 │    │
│   │              │      QR PREVIEW         │                 │    │
│   │              │      (400px)            │                 │    │
│   │              └─────────────────────────┘                 │    │
│   │                                                         │    │
│   │  ┌─────────────────────────────────────────────────┐    │    │
│   │  │  Info contextual + Stats + Compatibilidad      │    │    │
│   │  └─────────────────────────────────────────────────┘    │    │
│   │                                                         │    │
│   │  ┌─────────────────────────────────────────────────┐    │    │
│   │  │  Configuración (acordeón)                       │    │    │
│   │  └─────────────────────────────────────────────────┘    │    │
│   │                                                         │    │
│   │           ↺ Restaurar valores por defecto               │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│   DESKTOP (> 1024px)                                             │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │  ◈ QR Studio — Generador profesional    🌙  GitHub      │    │
│   ├─────────────────────────────────────────────────────────┤    │
│   │                                                         │    │
│   │         ┌─────────────────────────────────────┐          │    │
│   │         │         QR PREVIEW (420px)        │          │    │
│   │         │                                     │          │    │
│   │         ├─────────────────────────────────────┤          │    │
│   │         │  Info · Stats · Compat · Scan     │          │    │
│   │         ├─────────────────────────────────────┤          │    │
│   │         │  Contenido  Estilo  Avanzado      │          │    │
│   │         │  (Acordeón expandible)            │          │    │
│   │         └─────────────────────────────────────┘          │    │
│   │                                                         │    │
│   │         ↺ Restaurar valores por defecto                     │    │
│   │                                                         │    │
│   │  [max-width: 720px, centrado]                           │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Tokens de Diseño

#### 9.3.1 Spacing

```css
:root {
  /* Spacing Scale (base: 4px) */
  --space-1: 0.25rem;   /* 4px  - xs */
  --space-2: 0.5rem;    /* 8px  - sm */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px - md */
  --space-5: 1.5rem;    /* 24px - lg */
  --space-6: 2rem;      /* 32px - xl */
  --space-8: 3rem;      /* 48px - 2xl */
  --space-10: 4rem;     /* 64px - 3xl */
  --space-12: 6rem;     /* 96px - 4xl */

  /* Layout */
  --header-height: 64px;
  --content-max-width: 720px;
  --preview-max-width: 520px;
}
```

#### 9.3.2 Colors

```css
:root {
  /* Primary Palette */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;  /* Main */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Neutral Palette */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Semantic Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Light Mode */
  --color-bg: #ffffff;
  --color-surface: #f9fafb;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-border-focus: #3b82f6;
}

[data-theme="dark"] {
  /* Dark Mode */
  --color-bg: #111827;
  --color-surface: #1f2937;
  --color-text: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-border: #374151;
  --color-border-focus: #60a5fa;

  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;
}
```

#### 9.3.3 Typography

```css
:root {
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Font Size Scale */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */

  /* Font Weight */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Height */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

#### 9.3.4 Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-md: 0.375rem;    /* 6px */
  --radius-lg: 0.5rem;      /* 8px */
  --radius-xl: 0.75rem;     /* 12px */
  --radius-2xl: 1rem;       /* 16px */
  --radius-full: 9999px;
}
```

#### 9.3.5 Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Focus Ring */
  --ring-width: 2px;
  --ring-color: var(--color-primary-500);
}
```

### 9.4 Tema Claro/Oscuro

```typescript
type ThemeMode = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initTheme() {
  const stored = localStorage.getItem('theme') as ThemeMode | null;
  const system = getSystemTheme();
  const theme = stored || 'system';

  applyTheme(theme === 'system' ? system : theme);

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'system') {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}
```

### 9.5 Reglas de Accesibilidad

| Regla | Criterio | Implementación |
|-------|----------|----------------|
| Contraste texto | 4.5:1 mínimo | Validación en color picker |
| Contraste UI | 3:1 mínimo | Botones, inputs |
| Focus visible | Siempre visible | `focus-visible` con outline |
| Labels | Todos los inputs etiquetados | `aria-label` o `<label>` |
| Error messages | Asociados al input | `aria-describedby` |
| Keyboard nav | Todos los elementos navegables | `tabindex`, `Enter`, `Space` |
| Screen reader | Contenido dinámico anunciado | `aria-live` regions |
| Touch targets | Mínimo 44×44px | Botones, controles |

---

## 10. Decisiones Técnicas (ADR)

### 10.1 ADR-001: Uso de Preact sobre React

**Contexto:** Necesitamos una SPA ligera con rendimiento óptimo.

**Decisión:** Usar Preact en lugar de React.

**Justificación:**
- Preact pesa ~3KB vs React ~45KB
- API compatible con React (fácil migración)
- Signals integration nativa con @preact/signals
- Rendimiento superior en mobile

**Alternativas descartadas:**
- React: Demasiado peso para SPA simple
- Solid: Ecosistema menor, curva de aprendizaje
- Svelte: Bundle size bajo pero ecosistema diferente

**Consecuencias:**
- Posible necesidad de aliases para react → preact/compat
- Verificar compatibilidad de librerías

---

### 10.2 ADR-002: Estado con Signals sobre Context/Redux

**Contexto:** Estado global necesario para configuración QR.

**Decisión:** Usar @preact/signals para estado reactivo.

**Justificación:**
- Actualizaciones granulares (solo componentes que usan el signal)
- No hay re-renders innecesarios
- API simple e intuitiva
- Integración native con Preact

**Alternativas descartadas:**
- Context API: Re-renders excesivos
- Redux: Overkill para estado simple
- Zustand: Dependencia adicional, menos performant que signals

**Consecuencias:**
- Signals reemplazan props para estado global
- Posible confusión con hooks tradicionales

---

### 10.3 ADR-003: qr-code-styling para generación QR

**Contexto:** Necesitamos generar QRs con estilos, logos y exportación.

**Decisión:** Usar qr-code-styling library.

**Justificación:**
- Soporte nativo para estilos (colores, gradientes, formas)
- Logo overlay integrado
- Exportación PNG/SVG incluida
- Typescript types incluidos
- Mantenida activamente

**Alternativas descartadas:**
- `qrcode` (npm): No soporta estilos avanzados
- `qrcode-generator`: Solo generación básica
- Implementación manual: Tiempo excesivo, complejo

**Consecuencias:**
- Dependencia de libreria externa
- Posibles breaking changes en updates

---

### 10.4 ADR-004: Vite como bundler

**Contexto:** Necesitamos dev server rápido y build optimizado.

**Decisión:** Usar Vite.

**Justificación:**
- HMR instantáneo en dev
- Build rápido con esbuild
- Optimización automática de producción
- Configuración minimalista

**Alternativas descartadas:**
- Create React App: Deprecated, lento
- Webpack: Configuración compleja
- Parcel: Menos flexible

**Consecuencias:**
- Configuración Preact en vite.config.ts
- Alias para react → preact/compat

---

### 10.5 ADR-005: Docker para desarrollo

**Contexto:** Consistencia de entorno y portabilidad.

**Decisión:** Contenedor Docker con node:alpine.

**Justificación:**
- Mismo entorno en todos los desarrolladores
- No requiere instalación local de Node
- Fácil onboarding
- Integración con docker-compose

**Alternativas descartadas:**
- Node local: Inconsistencias entre versiones/SO
- Devcontainer: Requiere VS Code + extensión

**Consecuencias:**
- Tiempo extra en inicialización
- Recursos de Docker necesarios

---

### 10.6 ADR-006: file-saver para descargas

**Contexto:** Necesitamos exportar PNG/SVG.

**Decisión:** Usar file-saver.js.

**Justificación:**
- Abstracción cross-browser
- Manejo de blobs/DOMException
- Soporte para Safari blob workaround

**Alternativas descartadas:**
- `URL.createObjectURL` + click: Funciona pero más código
- `download` attribute: Limitado

**Consecuencias:**
- Dependencia adicional (~4KB)

---

## 11. Riesgos y Consideraciones

### 11.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Librería qr-code-styling descontinuada | Baja | Medio | Forkear si necesario, documentación de reemplazo |
| Compatibilidad Preact con librerías React | Media | Bajo | Usar preact/compat alias |
| Memory leaks en canvas/SVG | Baja | Alto | Cleanup en useEffect |
| XSS en content input | Baja | Alto | Sanitizar y validar input |
| Browser no soporta Canvas | Muy baja | Alto | Feature detection |

### 11.2 Riesgos de UX

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Usuario sube logo muy grande | Media | Medio | Validación + warning claro |
| Contraste bajo pasa desapercibido | Media | Medio | Indicador visual prominente |
| Contenido muy largo sin feedback | Media | Alto | Indicador de capacidad en tiempo real |
| QR no escaneable post-exportación | Baja | Alto | Disclaimer + testing guide |

### 11.3 Riesgos de Performance

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Regeneración QR en cada keystroke | Media | Bajo | Debounce de 300ms |
| Memory leak por blobs no liberados | Baja | Medio | Revocar URLs |
| Bundle size excesivo | Baja | Bajo | Tree shaking, code splitting |

### 11.4 Riesgos de Mantenibilidad

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Documentación desactualizada | Media | Medio | SDD/SPEC en repo |
| Tests faltantes | Media | Medio | Coverage > 80% |
| Dependencias desactualizadas | Baja | Bajo | Dependabot alerts |

---

## 12. Apéndices

### 12.1 Tipos TypeScript Completos

```typescript
// qr.types.ts

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
  angle?: number;  // 0-360 for linear
}

export interface LogoConfig {
  src: string;
  size: number;  // 0-20 percentage
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

```typescript
// validation.types.ts

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

export interface QRMetadata {
  version: number;
  capacity: number;
  used: number;
  modules: number;
}

export interface ValidationRule {
  id: string;
  severity: ValidationSeverity;
  validate: (config: QRConfig, metadata: QRMetadata) => ValidationWarning | null;
}
```

```typescript
// style.types.ts

export type ThemeMode = 'light' | 'dark' | 'system';

export interface DesignTokens {
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
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
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
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

### 12.2 Glosario

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

### 12.3 Recursos Externos

| Recurso | URL |
|---------|-----|
| QR Code Specification (ISO 18004) | https://www.iso.org/standard/62021.html |
| WCAG Contrast Calculator | https://webaim.org/resources/contrastchecker/ |
| qr-code-styling Docs | https://qr-code-styling.com/ |
| Preact Docs | https://preactjs.com/ |
| Vite Docs | https://vitejs.dev/ |

---

**FIN DEL SDD**
**Versión:** 1.0
**Fecha:** 2026-06-14