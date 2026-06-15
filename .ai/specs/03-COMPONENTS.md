# 03-COMPONENTS: Diseño de Componentes UI

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. QRCanvas

**Ubicación:** `src/components/QRCanvas/`

### 1.1 Props

```typescript
interface QRCanvasProps {
  content: string;
  config: QRConfig;
  size: number;
  format: 'png' | 'svg';
}
```

### 1.2 Estado Interno

```typescript
interface QRCanvasState {
  canvasElement: HTMLCanvasElement | null;
  svgElement: SVGElement | null;
  isReady: boolean;
  error: QRCodeError | null;
}
```

### 1.3 Responsabilidades

- Crear y mantener instancia de QRCodeStyling
- Renderizar QR en canvas (PNG) o SVG
- Manejar re-renderizado eficiente ante cambios de configuración
- Exponer métodos para exportación (toDataURL, toBlob, getRawData)
- Escalar correctamente según el tamaño solicitado
- Aplicar estilos (colores, gradientes, formas)

### 1.4 Eventos Emitidos

Ninguno (componente puramente presentacional)

### 1.5 Contrato de Entrada

```typescript
// Parent debe proporcionar:
{
  content: "https://example.com",
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
  size: 300,
  format: 'png'
}
```

### 1.6 Contrato de Salida

```typescript
// Métodos expuestos via ref o callback
interface QRCanvasOutput {
  toDataURL: (format: 'png' | 'svg', quality?: number) => Promise<string>;
  toBlob: (format: 'png', quality?: number) => Promise<Blob>;
  getRawData: (format: 'svg' | 'png') => Promise<ArrayBuffer>;
}
```

---

## 2. QRPreview

**Ubicación:** `src/components/QRPreview/`

### 2.1 Props

```typescript
interface QRPreviewProps {
  content: string;
  config: QRConfig;
  size?: number;  // default: 420
}
```

### 2.2 Estado Interno

```typescript
interface QRPreviewState {
  downloadStatus: 'idle' | 'loading' | 'success' | 'error';
  copyStatus: 'idle' | 'copied';
  isUpdating: boolean;  // para microanimación
}
```

### 2.3 Responsabilidades

- Contenedor visual del QR generado (protagonista, 420px)
- Microanimación suave al actualizar contenido
- Barra de acciones compacta: PNG, SVG, Copiar, Compartir
- Detección y visualización del tipo de contenido
- Panel de estadísticas QR (versión, ECL, módulos, capacidad)
- Panel de compatibilidad (Android, iOS, Cámara)
- Preview de lo que verá el usuario al escanear
- Mostrar advertencias de validación de forma prominente

### 2.4 Eventos Emitidos

| Evento | Payload | Condición de Emisión |
|--------|---------|---------------------|
| `onDownloadPNG` | `Blob` | Click en botón PNG |
| `onDownloadSVG` | `string` | Click en botón SVG |
| `onCopy` | `string` | Click en botón copiar |
| `onShare` | `void` | Click en botón compartir (Web Share API) |

### 2.5 Contrato de Salida

```typescript
interface QRPreviewOutput {
  downloadPNG: () => Promise<void>;
  downloadSVG: () => Promise<void>;
  copyToClipboard: () => Promise<boolean>;
  shareContent: () => Promise<void>;
}
```

---

## 3. ConfigPanel

**Ubicación:** `src/components/ConfigPanel/`

### 3.1 Props

```typescript
interface ConfigPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
  validationResult: ValidationResult;
}
```

### 3.2 Estado Interno

```typescript
interface ConfigPanelState {
  expandedSection: string | null;  // 'content' | 'style' | 'advanced'
}
```

### 3.3 Responsabilidades

- Contenedor principal de configuración
- Navegación entre sub-secciones vía acordeón expandible
- Coordinar cambios entre sub-componentes
- Persistir configuración en localStorage (opcional)
- Proveer botón de reset global

### 3.4 Eventos Emitidos

| Evento | Payload |
|--------|---------|
| `onConfigChange` | `Partial<QRConfig>` |
| `onReset` | `void` |

### 3.5 Contrato de Salida

```typescript
interface ConfigPanelOutput {
  getConfig: () => QRConfig;
  resetToDefaults: () => void;
}
```

---

## 4. DataConfig

**Ubicación:** `src/components/ConfigPanel/DataConfig/`

### 4.1 Props

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

### 4.2 Estado Interno

```typescript
interface DataConfigState {
  activeType: ContentType;
  fieldValues: Record<string, string>;
  detectedEncoding: EncodingMode | null;
}

type ContentType = 'url' | 'whatsapp' | 'email' | 'wifi' | 'phone' | 'location' | 'text';
```

### 4.3 Responsabilidades

- Selector de tipo de contenido (URL, WhatsApp, Correo, WiFi, Teléfono, Ubicación, Texto)
- Campos contextuales dinámicos según el tipo seleccionado
- Input de texto/URL para contenido QR
- Detección automática de modo de codificación
- Selector manual de modo de codificación (avanzado)
- Indicador visual de capacidad restante
- Preview de contenido codificado raw
- Validación en tiempo real del contenido

### 4.4 Eventos Emitidos

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `onContentChange` | `string` | Contenido modificado |
| `onEncodingChange` | `EncodingMode` | Encoding manual cambiado |

### 4.5 Contrato de Datos

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

### 4.6 Tipos de Contenido y Campos

| Tipo | Campos | QR generado |
|------|--------|-------------|
| URL | Input de URL | URL directa |
| WhatsApp | Número + Mensaje opcional | `wa.me` link |
| Correo | Destinatario + Asunto + Cuerpo | `mailto:` link |
| WiFi | SSID + Contraseña + Seguridad | `WIFI:` schema |
| Teléfono | Número | `tel:` link |
| Ubicación | Latitud + Longitud | `geo:` link |
| Texto libre | Textarea | Texto plano |

---

## 5. StyleConfig

**Ubicación:** `src/components/ConfigPanel/StyleConfig/`

### 5.1 Props

```typescript
interface StyleConfigProps {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
  validationResult?: ValidationResult;
}
```

### 5.2 Estado Interno

```typescript
interface StyleConfigState {
  activeColorTab: 'solid' | 'gradient';
  logoPreview: string | null;
  isDraggingLogo: boolean;
}
```

### 5.3 Responsabilidades

- Selector de color de primer plano (sólido o degradado)
- Selector de color de fondo
- Selector de tipo de degradado (linear/radial)
- Selector de colores de degradado
- Selector de forma de módulos (dot style)
- Selector de forma de esquinas (corner style)
- Configuración de radio de redondeo
- Upload y preview de logo
- Validación de contraste en tiempo real

### 5.4 Eventos Emitidos

| Evento | Payload |
|--------|---------|
| `onStyleChange` | `Partial<QRStyle>` |
| `onLogoUpload` | `File` |
| `onLogoRemove` | `void` |
| `onContrastWarning` | `boolean` |

### 5.5 Contrato de Datos

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

---

## 6. AdvancedConfig

**Ubicación:** `src/components/ConfigPanel/AdvancedConfig/`

### 6.1 Props

```typescript
interface AdvancedConfigProps {
  advanced: QRAdvancedConfig;
  onChange: (config: QRAdvancedConfig) => void;
}
```

### 6.2 Estado Interno

```typescript
interface AdvancedConfigState {
  isDebugMode: boolean;
  marginPresets: { label: string; value: number }[];
}
```

### 6.3 Responsabilidades

- Selector de versión QR (1-40, auto)
- Selector de nivel de corrección (L, M, Q, H)
- Configuración de margen/quiet zone
- Color del margen
- Toggle de modo debug (ver estructura modular)
- Información educativa sobre ECL

### 6.4 Eventos Emitidos

| Evento | Payload |
|--------|---------|
| `onAdvancedChange` | `Partial<QRAdvancedConfig>` |
| `onDebugToggle` | `boolean` |

### 6.5 Contrato de Datos

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
```

---

**FIN DE 03-COMPONENTS**
