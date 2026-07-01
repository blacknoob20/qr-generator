import type { QRConfig, DotShape } from '../types/qr.types';
import type { ValidationWarning, ValidationResult, ValidationRule, QRMetadata } from '../types/validation.types';
import { calculateContrast, calculateQRMetadata } from './qr-generator';

const CONTENT_LENGTH_RULE: ValidationRule = {
  id: 'CONTENT_LENGTH',
  severity: 'error',
  validate: (_config: QRConfig, metadata: QRMetadata): ValidationWarning | null => {
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

const MIN_CONTRAST_RULE: ValidationRule = {
  id: 'MIN_CONTRAST',
  severity: 'warning',
  validate: (config: QRConfig): ValidationWarning | null => {
    const fg = config.style.color.foreground;
    const bg = config.style.color.background;
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

const LOGO_SIZE_RULE: ValidationRule = {
  id: 'LOGO_SIZE',
  severity: 'error',
  validate: (config: QRConfig): ValidationWarning | null => {
    const MAX_LOGO_PERCENTAGE = 20;
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

const QUIET_ZONE_RULE: ValidationRule = {
  id: 'QUIET_ZONE',
  severity: 'warning',
  validate: (config: QRConfig): ValidationWarning | null => {
    const MIN_QUIET_ZONE = 4;
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

const ENCODING_MODE_RULE: ValidationRule = {
  id: 'ENCODING_MODE',
  severity: 'error',
  validate: (config: QRConfig): ValidationWarning | null => {
    const content = config.content;
    const encoding = config.encoding;

    const isValidForEncoding: Record<string, RegExp> = {
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

const GRADIENT_WARNING_RULE: ValidationRule = {
  id: 'GRADIENT_WARNING',
  severity: 'info',
  validate: (config: QRConfig): ValidationWarning | null => {
    const fg = config.style.color.foreground;
    if (typeof fg !== 'string' && (fg.type === 'linear' || fg.type === 'radial')) {
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

const CUSTOM_SHAPE_WARNING_RULE: ValidationRule = {
  id: 'CUSTOM_SHAPE_WARNING',
  severity: 'info',
  validate: (config: QRConfig): ValidationWarning | null => {
    const shapes: DotShape[] = ['dots', 'classy', 'classy-rounded', 'extra-rounded'];
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

const VERSION_AUTO_WARNING_RULE: ValidationRule = {
  id: 'VERSION_AUTO',
  severity: 'warning',
  validate: (config: QRConfig, metadata: QRMetadata): ValidationWarning | null => {
    if (config.advanced.version === 'auto' && metadata.capacity > 0 && metadata.used > metadata.capacity * 0.9) {
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

const RULES: ValidationRule[] = [
  CONTENT_LENGTH_RULE,
  MIN_CONTRAST_RULE,
  LOGO_SIZE_RULE,
  QUIET_ZONE_RULE,
  ENCODING_MODE_RULE,
  GRADIENT_WARNING_RULE,
  CUSTOM_SHAPE_WARNING_RULE,
  VERSION_AUTO_WARNING_RULE,
];

export function qrValidator(config: QRConfig): ValidationResult {
  const metadata = calculateQRMetadata(config);

  const errors: ValidationWarning[] = [];
  const warnings: ValidationWarning[] = [];

  for (const rule of RULES) {
    const result = rule.validate(config, metadata);
    if (result) {
      if (result.severity === 'error') {
        errors.push(result);
      } else {
        warnings.push(result);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      version: metadata.version,
      capacity: metadata.capacity,
      used: metadata.used,
      modules: metadata.modules,
      encoding: metadata.encoding,
    }
  };
}
