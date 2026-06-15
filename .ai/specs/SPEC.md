# SPEC: QR Generator SPA

**Proyecto:** QR Generator SPA
**Stack:** Preact + TypeScript + Vite
**Alcance:** Single Page Application para generación de códigos QR configurables

---

## 1. Arquitectura General

### 1.1 Estructura de Carpetas

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
│   ├── styles/              # Tokens de diseño
│   │   └── design-tokens.css
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── SPEC.md
```

### 1.2 Módulos Principales

| Módulo | Responsabilidad |
|--------|----------------|
| `components/` | UI reusable y composición de vistas |
| `hooks/` | Lógica de negocio encapsulada (generación QR) |
| `types/` | Contratos de datos TypeScript |
| `utils/` | Funciones puras (validación, exportación) |
| `state/` | Estado reactivo global via Signals |

### 1.3 Librerías Externas Recomendadas

| Librería | Propósito | Versión Mínima |
|----------|-----------|----------------|
| `qr-code-styling` | Generación de QR con estilos | ^1.6.0 |
| `@preact/signals` | Estado reactivo global | ^1.2.0 |
| `file-saver` | Exportación a PNG/SVG | ^2.0.5 |
| `vitest` | Framework de testing | ^2.1.9 |
| `@vitest/ui` | Interfaz gráfica para tests | ^2.1.9 |
| `jsdom` | Entorno DOM para tests | ^29.1.1 |
| `@testing-library/preact` | Testing utilities para Preact | ^3.2.4 |

### 1.4 Flujo de Datos

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  ConfigPanel │────▶│   qr-store   │────▶│  QRPreview   │
│  (signals)   │     │   (state)    │     │  (render)    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  QRCanvas    │
                     │  (output)    │
                     └──────────────┘
```

### 1.5 Estado Global (Signals)

```typescript
// qr-store.ts - Contrato
interface QRStore {
  content: Signal<string>;
  config: Signal<QRConfig>;
  warnings: Signal<ValidationWarning[]>;
  isValid: Signal<boolean>;
}
```

### 1.6 Infraestructura Docker

El proyecto se ejecuta completamente en contenedores Docker. No requiere instalación local de Node.js.

#### 1.6.1 Imagen Base

| Servicio | Imagen | Versión |
|----------|--------|---------|
| **app** | `node` | `alpine` (ligera y segura) |

#### 1.6.2 Docker Compose

```yaml
services:
  app:
    image: node:alpine
    container_name: qr-generator
    working_dir: /app
    tty: true
    stdin_open: true
    volumes:
      - ./:/app
    ports:
      - "5173:5173"
    command: sh -c "npm install -g pnpm && pnpm install && pnpm dev"
    environment:
      - NODE_ENV=development
    restart: unless-stopped
    healthcheck:
      test: [ "CMD-SHELL", "wget -q --spider http://127.0.0.1:5173/ || exit 1" ]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - net

networks:
  net:
    driver: bridge
```

#### 1.6.3 Volúmenes

| Volumen | Ruta host | Propósito |
|---------|----------|-----------|
| `./:/app` | raíz del proyecto | Sincronización de código fuente |

#### 1.6.4 Variables de Entorno

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `development` | Modo de ejecución |

#### 1.6.5 Puertos

| Puerto Host | Puerto Contenedor | Servicio |
|-------------|-------------------|----------|
| `5173` | `5173` | Vite Dev Server |

#### 1.6.6 Comandos Docker

```bash
# Iniciar la aplicación
docker compose up -d

# Ver logs
docker compose logs -f

# Detener la aplicación
docker compose down

# Reconstruir contenedores
docker compose up -d --build
```

---

## 2. Componentes UI

### 2.1 QRCanvas

**Props:**
```typescript
interface QRCanvasProps {
  content: string;
  config: QRConfig;
  size: number;
}
```

**Responsabilidades:**
- Renderizar el código QR en canvas (PNG) o SVG
- Manejar re-renderizado ante cambios de configuración
- Escalar correctamente según el tamaño solicitado

**Eventos emitidos:** Ninguno (componente presentacional)

**Contrato de datos de salida:**
```typescript
interface QRCanvasOutput {
  dataUrl: string;  // Base64 PNG/SVG
  svgString?: string;
}
```

---

### 2.2 QRPreview

**Props:**
```typescript
interface QRPreviewProps {
  content: string;
  config: QRConfig;
  size?: number;  // default: 300
}
```

**Responsabilidades:**
- Contenedor visual del QR generado
- Mostrar advertencias de validación
- Overlay para logo (si aplica)
- Indicador de estado de descarga

**Eventos emitidos:**
| Evento | Payload | Descripción |
|--------|---------|-------------|
| `onDownloadPNG` | `Blob` | Solicitud de descarga PNG |
| `onDownloadSVG` | `string` | Solicitud de descarga SVG |
| `onCopy` | `string` | Contenido copiado al portapapeles |

**Contrato de datos de salida:**
```typescript
interface QRPreviewOutput {
  pngBlob: Blob;
  svgString: string;
  copySuccess: boolean;
}
```

---

### 2.3 ConfigPanel

Contenedor principal de configuración. Renderiza tabs o acordeón con subcomponentes.

**Props:**
```typescript
interface ConfigPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
  validationResult: ValidationResult;
}
```

---

### 2.3.1 DataConfig

**Props:**
```typescript
interface DataConfigProps {
  content: string;
  onChange: (content: string) => void;
}
```

**Responsabilidades:**
- Input de texto/URL para contenido QR
- Selector de modo de codificación (Byte, Numeric, Alphanumeric, Kanji)
- Indicador de capacidad restante

**Eventos emitidos:**
| Evento | Payload |
|--------|---------|
| `onContentChange` | `string` |
| `onEncodingChange` | `EncodingMode` |

---

### 2.3.2 StyleConfig

**Props:**
```typescript
interface StyleConfigProps {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
}
```

**Responsabilidades:**
- Color de primer plano (fillable, gradient, transparent)
- Color de fondo
- Selector de degradado (linear/radial/none)
- Forma de módulos (square, rounded, circle, star, heart, diamond)
- Radio de esquina
- Logo upload y configuración

**Eventos emitidos:**
| Evento | Payload |
|--------|---------|
| `onStyleChange` | `QRStyle` |
| `onLogoUpload` | `File` |
| `onLogoRemove` | `void` |

**Contrato de datos:**
```typescript
interface QRStyle {
  color: {
    foreground: string | GradientConfig;
    background: string;
  };
  dotStyle?: {
    shape: 'square' | 'rounded' | 'circle' | 'star' | 'heart' | 'diamond';
    radius?: number;
  };
  cornerStyle?: {
    shape: 'square' | 'rounded' | 'circle';
    radius?: number;
  };
  logo?: {
    src: string;
    size: number;  // porcentaje (0-20)
    hideBackground: boolean;
  };
}
```

---

### 2.3.3 AdvancedConfig

**Props:**
```typescript
interface AdvancedConfigProps {
  advanced: QRAdvancedConfig;
  onChange: (config: QRAdvancedConfig) => void;
}
```

**Responsabilidades:**
- Selector de versión QR (1-40, auto)
- Nivel de corrección (L, M, Q, H)
- Toggle de margen/quiet zone personalizado
- Toggle de modo debug (mostrar estructura modular)

**Eventos emitidos:**
| Evento | Payload |
|--------|---------|
| `onAdvancedChange` | `QRAdvancedConfig` |

**Contrato de datos:**
```typescript
interface QRAdvancedConfig {
  version: number | 'auto';  // 1-40
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;  // módulos (default: 4)
  marginColor: string;
  debugView: boolean;
}
```

---

## 3. Hooks

### 3.1 useQRCode

```typescript
function useQRCode(config: QRConfig): {
  qrData: QRCodeData;
  generate: () => Promise<void>;
  toDataURL: (format: 'png' | 'svg') => Promise<string>;
  toBlob: (format: 'png') => Promise<Blob>;
  isGenerating: boolean;
  error: QRCodeError | null;
}
```

**Entradas:**
```typescript
interface UseQRCodeInput {
  content: string;
  style: QRStyle;
  advanced: QRAdvancedConfig;
}
```

**Salidas:**
```typescript
interface QRCodeData {
  content: string;
  version: number;
  capacity: number;
  used: number;
  modules: number;  // tamaño en módulos (ej: 25x25)
}

interface QRCodeError {
  code: 'CONTENT_TOO_LONG' | 'INVALID_ENCODING' | 'GENERATION_FAILED';
  message: string;
  details?: unknown;
}
```

**Efectos colaterales:**
- Genera QR code internamente usando `qr-code-styling`
- Accede al DOM para renderizado en canvas
- No persiste datos fuera del componente

**Ejemplo de uso:**
```typescript
const { toDataURL, toBlob, isGenerating } = useQRCode({
  content: 'https://example.com',
  style: { color: { foreground: '#000000', background: '#ffffff' } },
  advanced: { version: 'auto', errorCorrectionLevel: 'M' }
});
```

---

## 4. Tipos TypeScript

### 4.1 Tipos para Configuración QR

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
```

### 4.2 Tipos para Estilos

```typescript
// style.types.ts

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

### 4.3 Tipos para Validaciones

```typescript
// validation.types.ts

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

## 5. Validaciones

### 5.1 Reglas de Validación

| Regla | Condición | Severidad | Mensaje |
|-------|-----------|----------|---------|
| `CONTENT_LENGTH` | contenido > capacidad versión | `error` | "El contenido excede la capacidad del código QR" |
| `MIN_CONTRAST` | ratio < 4.5:1 | `warning` | "Contraste bajo. Se recomienda un ratio mínimo de 4.5:1 para escaneo óptimo" |
| `LOGO_SIZE` | logo > 20% | `error` | "El logo no debe superar el 20% del tamaño del código QR" |
| `QUIET_ZONE` | margen < 4 módulos | `warning` | "Zona de silencio menor a 4 módulos puede afectar el escaneo" |
| `ENCODING_MODE` | modo incompatible con contenido | `error` | "El modo de codificación seleccionado no es compatible con el contenido" |
| `GRADIENT_WARNING` | gradiente aplicado | `info` | "Los degradados pueden reducir la tasa de escaneo exitoso" |
| `CUSTOM_SHAPE_WARNING` | forma personalizada activa | `info` | "Las formas personalizadas pueden afectar la legibilidad del código QR" |
| `VERSION_AUTO` | versión auto con contenido límite | `warning` | "Considere fijar una versión mayor para mejor tolerancia a errores" |

### 5.2 Contrastes de Color

```typescript
function calculateContrast(fg: string, bg: string): number {
  // Algoritmo WCAG 2.1 para calcular ratio de contraste
  // Retorna ratio (ej: 21 para negro sobre blanco)
}

const MIN_CONTRAST_RATIO = 4.5;  // WCAG AA para texto grande
const RECOMMENDED_CONTRAST_RATIO = 7;  // WCAG AAA
```

### 5.3 Logo

- **Tamaño máximo:** 20% del área total del QR
- **Posición:** Centro del QR
- **HideBackground:** Dependiendo del logo, puede ser necesario para contraste

### 5.4 Quiet Zone (Zona de Silencio)

- **Mínimo:** 4 módulos en cada lado
- **Default:** 4 módulos
- **Color:** Recomendado blanco o color de fondo

---

## 6. Límites Reales de la Tecnología QR

### 6.1 Capacidad por Versión

| Versión | Dimensiones | Bits (Byte/L) | Bits (Byte/M) | Bits (Byte/Q) | Bits (Byte/H) |
|---------|-------------|---------------|---------------|---------------|---------------|
| 1 | 21×21 | 17 | 14 | 11 | 7 |
| 2 | 25×25 | 32 | 26 | 20 | 14 |
| 3 | 29×29 | 53 | 42 | 32 | 24 |
| 4 | 33×33 | 78 | 62 | 46 | 34 |
| 5 | 37×37 | 106 | 84 | 60 | 44 |
| 10 | 57×57 | 354 | 282 | 208 | 154 |
| 20 | 97×97 | 1853 | 1480 | 1096 | 816 |
| 30 | 137×137 | 4196 | 3357 | 2493 | 1867 |
| 40 | 177×177 | 7089 | 5663 | 4211 | 3153 |

**Referencia:** Los valores superiores interpolan geométricamente.

### 6.2 Niveles de Corrección de Error

| Nivel | Capacidad de recuperación | Uso de redundancia | Aplicación recomendada |
|-------|---------------------------|-------------------|------------------------|
| **L** (Low) | ~7% | ~19% | Entornos controlados, QR cortos |
| **M** (Medium) | ~15% | ~26% | Uso general (recomendado) |
| **Q** (Quartile) | ~25% | ~38% | Entornos industriales, superficies irregulares |
| **H** (High) | ~30% | ~50% | Logos, decorativos, superficies problemáticas |

**Implicaciones:**
- Mayor corrección = menor capacidad de datos
- Logos **requieren** nivel H para funcionar correctamente
- Versiones superiores permiten más datos con misma corrección

### 6.3 Riesgos Documentados

#### 6.3.1 Logos Grandes
- **Riesgo:** Si el logo supera el 20%, el QR puede volverse no escaneable
- **Mitigación:** Usar nivel de corrección H y garantizar contraste

#### 6.3.2 Colores No Contrastantes
- **Riesgo:** El escaneo falla con ratios de contraste < 3:1
- **Mitigación:** Validar contraste WCAG y mostrar warning

#### 6.3.3 Degradados
- **Riesgo:** El lector QR puede interpretar el degradado como ruido
- **Mitigación:** Usar solo degradados sutiles y siempre con nivel H

#### 6.3.4 Formas Redondeadas
- **Riesgo:** Redondear módulos excesivamente reduce la definición del patrón
- **Mitigación:** Limitar radio de redondeo al 20% del módulo

#### 6.3.5 Falta de Cifrado
- **Riesgo:** Los datos del QR son **siempre públicos**
- **Mitigación:** No almacenar información sensible en el QR
- **Alternativa:** Para datos sensibles, usar un short link que apunte a un recurso autenticado

---

## 7. Flujo de Usuario

### 7.1 Flujo Principal

```
┌──────────────────────────────────────────────────────────────────┐
│                      QR STUDIO — GENERADOR PROFESIONAL            │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   1. QR Protagonista  │
                    │   (420px, centrado)   │
                    │   - Preview en vivo   │
                    │   - Botones de acción │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   2. Info Contextual  │
                    │   - Tipo detectado    │
                    │   - Estadísticas QR   │
                    │   - Compatibilidad    │
                    │   - Preview de escaneo│
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   3. Ingreso de datos │
                    │   (DataConfig)        │
                    │   - Seleccionar tipo  │
                    │   - URL/WhatsApp/etc  │
                    │   - Modo encoding     │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   4. Configuración    │
                    │   (StyleConfig)       │
                    │   - Colores, formas   │
                    │   - Logo (opcional)   │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   5. Config. Avanzada │
                    │   (AdvancedConfig)    │
                    │   - Versión, ECL      │
                    │   - Margen, debug     │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   6. Exportar         │
                    │   (QRPreview)         │
                    │   - PNG/SVG/Copiar    │
                    │   - Compartir         │
                    └───────────────────────┘
```

### 7.2 Reglas de UX

1. **QR como protagonista:** Ocupa el centro visual, 2-3× más grande que diseños tradicionales
2. **Feedback inmediato:** El preview se actualiza en tiempo real con microanimación suave
3. **Configuración contextual:** Acordeón expandible debajo del QR, no sidebar lateral
4. **Tipos de contenido:** URL, WhatsApp, Correo, WiFi, Teléfono, Ubicación, Texto libre
5. **Información útil:** Estadísticas, compatibilidad, y preview de escaneo visible
6. **Validación proactiva:** Los errores/warnings aparecen antes de que el usuario intente exportar
7. **Defaults sensatos:**
   - Versión: `auto`
   - Corrección: `M`
   - Margen: `4`
   - Encoding: `auto`
8. **Undo/Reset:** Botón para restaurar configuración por defecto
9. **Copy-to-clipboard:** Copiar contenido directamente
10. **Compartir nativo:** Web Share API cuando esté disponible
11. **Responsive:** Layout vertical centrado en móvil, máximo 720px de ancho en desktop

---

## 8. Exportación

### 8.1 PNG

| Parámetro | Valor | Notas |
|-----------|-------|-------|
| Formato | PNG-24 | Con canal alfa |
| DPI | 300 | Para impresión de calidad |
| Tamaño base | 1024×1024px | Escalable |
| Fondo | Incluido | Transparente u/opaco según config |
| Metadata | Excluida | Minimizar tamaño |

**Escalado:**
```typescript
interface PNGExportOptions {
  width: number;   // múltiplo de modules * scale
  height: number;
  scale: number;    // 1-10, default 4
  margin: number;   // incluido en dimensions
}
```

### 8.2 SVG

| Parámetro | Valor | Notas |
|-----------|-------|-------|
| Formato | SVG 1.1 | Válido y bien formado |
| Elementos | `<rect>`, `<path>` | Optimizado, sin IDs innecesarios |
| Colores | inline | Sin referencias externas |
| ViewBox | Dinámico | Adaptado al QR |

### 8.3 Contrato de Exportación

```typescript
interface ExportService {
  toPNG(options: PNGExportOptions): Promise<Blob>;
  toSVG(): Promise<string>;
  toDataURL(format: 'png' | 'svg'): Promise<string>;
}

interface DownloadOptions {
  filename: string;  // sin extensión
  format: 'png' | 'svg';
}
```

---

## 9. UI/UX

### 9.1 Diseño Centrado con QR Protagonista

```
┌────────────────────────────────────────────────────────────┐
│  ◈ QR Studio — Generador profesional    🌙  GitHub         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                                                            │
│                    ┌──────────────────┐                    │
│                    │                  │                    │
│                    │   QR GRANDE      │                    │
│                    │   (420px)        │                    │
│                    │                  │                    │
│                    └──────────────────┘                    │
│                                                            │
│         ⬇ PNG    ⬇ SVG    📋 Copiar    🔗 Compartir       │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  Tipo detectado: 🔗 URL                                    │
│  Destino: web.whatsapp.com                                 │
│  Versión: 1  Corrección: M  Módulos: 21×21  Capacidad: 8%│
│  ✓ Android  ✓ iOS  ✓ Cámara estándar                       │
│  Lo que verá el usuario: https://web.whatsapp.com          │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✎ Contenido                              [+]      │  │
│  │     🔗 URL  ✆ WhatsApp  ✉ Correo  ◉ WiFi  ...    │  │
│  │     [Campos contextuales según tipo]               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ◈ Estilo                               [+]        │  │
│  │     Color · Forma · Degradado · Logo               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚙ Avanzado                             [+]        │  │
│  │     Versión · Corrección · Margen · Debug          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│              ↺ Restaurar valores por defecto               │
└────────────────────────────────────────────────────────────┘
```

### 9.1.1 Principios de Diseño

| Principio | Aplicación |
|-----------|-----------|
| **QR como héroe** | Ocupa el centro visual, 2-3× más grande que el diseño anterior |
| **Configuración contextual** | No hay sidebar; la config aparece debajo en acordeón |
| **Sin cajas anidadas** | El QR vive en un fondo limpio, no dentro de múltiples tarjetas |
| **Microinteracciones** | Animación suave al actualizar el QR; transiciones 0.3s |
| **Información útil** | Estadísticas, compatibilidad, y preview de escaneo en el área vacía |
| **Tipos de contenido** | URL, WhatsApp, Correo, WiFi, Teléfono, Ubicación, Texto libre |
| **Lenguaje visual unificado** | Header limpio sin barras de color; tipografía profesional |

### 9.2 Tokens de Diseño

```css
:root {
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Colors - Light Mode */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);

  /* Typography */
  --font-family: system-ui, -apple-system, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
}

[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
}
```

### 9.3 Modo Claro/Oscuro

- **Toggle:** Switch en header, persiste en localStorage
- **System preference:** Al cargar, detecta `prefers-color-scheme`
- **Transición:** 300ms ease para cambio de colores

### 9.4 Nuevos Componentes y Patrones

#### 9.4.1 Acordeón de Configuración

Reemplaza el sistema de tabs/tab sidebar. Cada sección (`Contenido`, `Estilo`, `Avanzado`) es un panel expandible con animación `max-height` 0.3s ease.

#### 9.4.2 Selector de Tipos de Contenido

Grid de botones tipo chips con icono + label. Al seleccionar, se muestran campos contextuales específicos:

| Tipo | Campos | QR generado |
|------|--------|-------------|
| URL | Input de URL | URL directa |
| WhatsApp | Número + Mensaje opcional | `wa.me` link |
| Correo | Destinatario + Asunto + Cuerpo | `mailto:` link |
| WiFi | SSID + Contraseña + Seguridad | `WIFI:` schema |
| Teléfono | Número | `tel:` link |
| Ubicación | Latitud + Longitud | `geo:` link |
| Texto libre | Textarea | Texto plano |

#### 9.4.3 Microanimaciones

- **QR updating:** `scale(0.98) + opacity(0.7)` durante 0.3s al cambiar contenido
- **Hover botones:** `translateY(-1px) + shadow-sm`
- **Acordeón:** `max-height` 0.3s ease
- **Cambio tema:** `background-color` 0.3s ease

#### 9.4.4 Área de Información Contextual

Debajo del QR, paneles con datos útiles:

- **Tipo detectado:** Icono + label (URL, WhatsApp, etc.)
- **Estadísticas:** Versión, ECL, Módulos, Capacidad usada
- **Compatibilidad:** Android, iOS, Cámara estándar
- **Preview de escaneo:** Código monoespaciado con fondo oscuro

---

## 10. ¿Backend Necesario?

### 10.1 Sin Backend (Default)

El proyecto **no requiere backend** para:
- ✅ Generar códigos QR (todo el procesamiento es client-side)
- ✅ Aplicar estilos y configuraciones
- ✅ Exportar PNG/SVG
- ✅ Validar contenido

### 10.2 Casos donde Backend Sería Necesario

| Funcionalidad | Justificación | Complejidad |
|---------------|---------------|-------------|
| **Historial de QRs** | Persistencia de configuraciones anteriores | Media |
| **Estadísticas de escaneo** | Tracking de scans (URLs dinámicas) | Alta |
| **Short links** | Redirecciones con analytics | Alta |
| **Autenticación** | Usuarios con perfiles y guardado | Media-Alta |
| **QR dinámicos** | Contenido que cambia post-generación | Alta |

### 10.3 Arquitectura Híbrida (Opcional)

Si se implementa backend futuro:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                        │
│   - UI/UX completa                                      │
│   - Lógica de generación QR                            │
│   - Exportación                                        │
└───────────────────────┬─────────────────────────────────┘
                        │ API REST / GraphQL (opcional)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (opcional)                    │
│   - POST /api/qrs          → Guardar QR                 │
│   - GET  /api/qrs/:id      → Obtener configuración     │
│   - GET  /api/qrs/:id/stats → Estadísticas de scan     │
│   - POST /api/shortlinks   → Crear short link          │
└─────────────────────────────────────────────────────────┘
```

**Recomendación:** Iniciar sin backend. Diseñar la UI para que sea posible agregarlo posteriormente sin refactorizaciones mayores.

---

## Resumen de Contratos Principales

```typescript
// QRConfig - Contrato principal
interface QRConfig {
  content: string;
  encoding: EncodingMode;
  style: QRStyle;
  advanced: QRAdvancedConfig;
}

// ValidationResult - Resultado de validación
interface ValidationResult {
  isValid: boolean;
  errors: ValidationWarning[];
  warnings: ValidationWarning[];
  metadata: { version: number; capacity: number; used: number; modules: number };
}

// ExportOptions - Opciones de exportación
interface ExportOptions {
  format: 'png' | 'svg';
  width?: number;
  height?: number;
  scale?: number;
  filename: string;
}
```

---

## 11. Testing

### 11.1 Framework de Testing

El proyecto utiliza **Vitest** como framework de testing principal. Vitest es la elección recomendada por su integración nativa con Vite, configuración mínima, soporte para TypeScript y rendimiento superior.

| Herramienta | Propósito | Versión |
|-------------|-----------|---------|
| `vitest` | Runner de tests | ^2.0.0 |
| `@vitest/ui` | UI visual para ejecutar tests | ^2.0.0 |
| `jsdom` | Entorno DOM para component tests | ^24.0.0 |
| `@testing-library/preact` | Queries y utilities para Preact | ^3.0.0 |

### 11.2 Estructura de Tests

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

### 11.3 Tipos de Tests

| Tipo | Alcance | Herramientas | Cobertura Mínima |
|------|---------|--------------|------------------|
| **Unitarios** | Funciones puras (utils, validaciones) | Vitest | > 80% |
| **Integración** | Hooks con estado | Vitest + @testing-library/preact | > 60% |
| **Componentes** | Renderizado y eventos | Vitest + jsdom + @testing-library/preact | > 50% |

### 11.4 Scripts de Testing

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage"
  }
}
```

### 11.5 Ejemplos de Tests

#### Test Unitario: Generación de QR

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

### 11.6 Configuración de Vitest

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

### 11.7 Reglas de Testing

1. **Cobertura mínima:** Todo archivo en `utils/` debe tener tests unitarios con cobertura > 80%
2. **Tests antes de fix:** Al reportar un bug, se debe crear un test que reproduzca el error antes de aplicar el fix
3. **Mocking:** Las librerías externas (qr-code-styling, file-saver) deben ser mockeadas en tests de integración
4. **DOM:** Los tests de componentes deben usar `jsdom` y limpiar el DOM entre tests
5. **CI:** El comando `vitest run` debe ejecutarse en el pipeline de CI/CD antes de merge

---

**FIN DEL SPEC**