# 04-HOOKS: Lógica de Negocio y Custom Hooks

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. useQRCode

**Ubicación:** `src/hooks/useQRCode.ts`

### 1.1 Firma

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

### 1.2 Entradas (Parámetros)

```typescript
interface UseQRCodeInput {
  content?: string;
  style?: QRStyle;
  advanced?: QRAdvancedConfig;
  encoding?: EncodingMode;
}
```

### 1.3 Salidas (Retorno)

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

### 1.4 Efectos Colaterales

1. **Inicialización:** Crea instancia de QRCodeStyling en mount
2. **Actualización de config:** Llama `update()` en la instancia cuando cambia content/style
3. **Renderizado:** Accede al DOM para renderizar en canvas/SVG
4. **Limpieza:** Cancela instancias pendientes en unmount
5. **Persistencia:** No persiste datos fuera del componente

### 1.5 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                         useQRCode hook                           │
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
│  │ Return state &  │                                            │
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

### 1.6 Ejemplo de Uso

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

## 2. Dependencias de Hooks

| Hook | Depende de | Usado por |
|------|-----------|-----------|
| `useQRCode` | `qr-code-styling`, `qr-store` | `QRPreview`, `QRCanvas` |

---

**FIN DE 04-HOOKS**
