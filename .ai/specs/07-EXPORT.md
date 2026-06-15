# 07-EXPORT: Sistema de Exportación

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Sistema de Exportación

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXPORT SYSTEM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ExportService                            │  │
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

---

## 2. PNG

### 2.1 Parámetros

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `width` | `number` | 1024 | Ancho en píxeles |
| `height` | `number` | 1024 | Alto en píxeles |
| `scale` | `number` | 4 | Multiplicador de escala (1-10) |
| `margin` | `number` | 4 | Módulos de margen |
| `quality` | `number` | 1.0 | Calidad JPEG (0-1, ignorado en PNG) |

### 2.2 Escalado

```typescript
interface PNGExportOptions {
  width: number;   // múltiplo de modules * scale
  height: number;
  scale: number;    // 1-10, default 4
  margin: number;   // incluido en dimensions
}
```

### 2.3 Proceso

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
    image: logoDataUrl,
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

### 2.4 Reglas de Calidad PNG

| Aspecto | Regla |
|---------|-------|
| Formato | PNG-24 con canal alfa |
| Compresión | Sin pérdida (deflate) |
| Tamaño mínimo | 256×256px |
| Tamaño máximo | 4096×4096px |
| DPI para impresión | 300 DPI (metadata opcional) |
| Metadata | Sin EXIF, XMP para minimizar tamaño |

---

## 3. SVG

### 3.1 Parámetros

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `width` | `number` | auto | Ancho (módulos * 10) |
| `height` | `number` | auto | Alto (módulos * 10) |
| `margin` | `number` | 4 | Módulos de margen |

### 3.2 Proceso

```typescript
async function exportSVG(options: SVGExportOptions): Promise<string> {
  const { margin = 4 } = options;

  // 1. Obtener SVG string del QR engine
  const svgString = await qrCodeStyling.toDataURL({
    type: 'svg',
    margin,
  });

  // 2. Optimizar SVG
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

### 3.3 Reglas de Calidad SVG

| Aspecto | Regla |
|---------|-------|
| Formato | SVG 1.1 válido |
| Elementos | `<rect>`, `<path>` solo |
| IDs | Sin IDs o únicos por elemento |
| Colores | Atributos inline |
| ViewBox | Correcto y proporcional |
| Namespace | SVG correcto |

---

## 4. Escalado y DPI

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

---

## 5. Contrato de Exportación

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

**FIN DE 07-EXPORT**
