# 06-VALIDATIONS: Sistema de Validación

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Arquitectura de Validaciones

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

---

## 2. Reglas de Validación

### 2.1 Tabla Resumen

| Regla | Condición | Severidad | Previene Export | Mensaje |
|-------|-----------|----------|-----------------|---------|
| `CONTENT_LENGTH` | contenido > capacidad versión | `error` | ✅ | "El contenido excede la capacidad del código QR" |
| `MIN_CONTRAST` | ratio < 4.5:1 | `warning` | ❌ | "Contraste bajo. Se recomienda un ratio mínimo de 4.5:1 para escaneo óptimo" |
| `LOGO_SIZE` | logo > 20% | `error` | ✅ | "El logo no debe superar el 20% del tamaño del código QR" |
| `QUIET_ZONE` | margen < 4 módulos | `warning` | ❌ | "Zona de silencio menor a 4 módulos puede afectar el escaneo" |
| `ENCODING_MODE` | modo incompatible con contenido | `error` | ✅ | "El modo de codificación seleccionado no es compatible con el contenido" |
| `GRADIENT_WARNING` | gradiente aplicado | `info` | ❌ | "Los degradados pueden reducir la tasa de escaneo exitoso" |
| `CUSTOM_SHAPE_WARNING` | forma personalizada activa | `info` | ❌ | "Las formas personalizadas pueden afectar la legibilidad del código QR" |
| `VERSION_AUTO` | versión auto con contenido límite | `warning` | ❌ | "Considere fijar una versión mayor para mejor tolerancia a errores" |

---

### 2.2 CONTENT_LENGTH

```typescript
const CONTENT_LENGTH_RULE = {
  id: 'CONTENT_LENGTH',
  severity: 'error' as const,
  validate: (config: QRConfig, metadata: QRMetadata) => {
    if (metadata.used > metadata.capacity) {
      return {
        id: 'CONTENT_LENGTH',
        code: 'CONTENT_LENGTH',
        severity: 'error' as const,
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

### 2.3 MIN_CONTRAST

```typescript
function calculateContrast(fg: string, bg: string): number {
  const fgLum = getLuminance(fg);
  const bgLum = getLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

const MIN_CONTRAST_RULE = {
  id: 'MIN_CONTRAST',
  severity: 'warning' as const,
  validate: (config: QRConfig) => {
    const fg = config.style.color.foreground;
    const bg = config.style.color.background;
    const fgColor = typeof fg === 'string' ? fg : fg.colors[0];
    const ratio = calculateContrast(fgColor, bg);

    if (ratio < 4.5) {
      return {
        id: 'MIN_CONTRAST',
        code: 'MIN_CONTRAST',
        severity: 'warning' as const,
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

**Constantes:**
```typescript
const MIN_CONTRAST_RATIO = 4.5;      // WCAG AA para texto grande
const RECOMMENDED_CONTRAST_RATIO = 7; // WCAG AAA
```

---

### 2.4 LOGO_SIZE

```typescript
const MAX_LOGO_PERCENTAGE = 20;

const LOGO_SIZE_RULE = {
  id: 'LOGO_SIZE',
  severity: 'error' as const,
  validate: (config: QRConfig) => {
    if (config.style.logo && config.style.logo.size > MAX_LOGO_PERCENTAGE) {
      return {
        id: 'LOGO_SIZE',
        code: 'LOGO_SIZE',
        severity: 'error' as const,
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

### 2.5 QUIET_ZONE

```typescript
const MIN_QUIET_ZONE = 4;  // módulos

const QUIET_ZONE_RULE = {
  id: 'QUIET_ZONE',
  severity: 'warning' as const,
  validate: (config: QRConfig) => {
    if (config.advanced.margin < MIN_QUIET_ZONE) {
      return {
        id: 'QUIET_ZONE',
        code: 'QUIET_ZONE',
        severity: 'warning' as const,
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

### 2.6 ENCODING_MODE

```typescript
const ENCODING_MODE_RULE = {
  id: 'ENCODING_MODE',
  severity: 'error' as const,
  validate: (config: QRConfig) => {
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
        severity: 'error' as const,
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

### 2.7 GRADIENT_WARNING

```typescript
const GRADIENT_WARNING_RULE = {
  id: 'GRADIENT_WARNING',
  severity: 'info' as const,
  validate: (config: QRConfig) => {
    const fg = config.style.color.foreground;
    if (typeof fg !== 'string' && (fg.type === 'linear' || fg.type === 'radial')) {
      return {
        id: 'GRADIENT_WARNING',
        code: 'GRADIENT_WARNING',
        severity: 'info' as const,
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

### 2.8 CUSTOM_SHAPE_WARNING

```typescript
const CUSTOM_SHAPE_WARNING_RULE = {
  id: 'CUSTOM_SHAPE_WARNING',
  severity: 'info' as const,
  validate: (config: QRConfig) => {
    const shapes: DotShape[] = ['circle', 'star', 'heart', 'diamond'];
    if (config.style.dotStyle && shapes.includes(config.style.dotStyle.shape)) {
      return {
        id: 'CUSTOM_SHAPE_WARNING',
        code: 'CUSTOM_SHAPE_WARNING',
        severity: 'info' as const,
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

### 2.9 VERSION_AUTO_WARNING

```typescript
const VERSION_AUTO_WARNING_RULE = {
  id: 'VERSION_AUTO',
  severity: 'warning' as const,
  validate: (config: QRConfig, metadata: QRMetadata) => {
    if (config.advanced.version === 'auto' && metadata.used > metadata.capacity * 0.9) {
      return {
        id: 'VERSION_AUTO',
        code: 'VERSION_AUTO',
        severity: 'warning' as const,
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

## 3. Algoritmo de Validación

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

---

## 4. Contratos de Validación

```typescript
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

interface ValidationRule {
  id: string;
  severity: ValidationSeverity;
  validate: (config: QRConfig, metadata: QRMetadata) => ValidationWarning | null;
}
```

---

## 5. Logo

- **Tamaño máximo:** 20% del área total del QR
- **Posición:** Centro del QR
- **HideBackground:** Dependiendo del logo, puede ser necesario para contraste

---

## 6. Quiet Zone (Zona de Silencio)

- **Mínimo:** 4 módulos en cada lado
- **Default:** 4 módulos
- **Color:** Recomendado blanco o color de fondo

---

**FIN DE 06-VALIDATIONS**
