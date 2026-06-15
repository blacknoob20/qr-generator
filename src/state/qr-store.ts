import { signal, computed } from '@preact/signals';
import type { QRConfig, QRStyle, QRAdvancedConfig, EncodingMode, GradientConfig, DotShape, CornerShape } from '../types/qr.types';
import type { ValidationResult, QRMetadata } from '../types/validation.types';
import { qrValidator } from '../utils/qr-validator';
import { calculateQRMetadata, detectEncoding } from '../utils/qr-generator';
import type { ThemeMode } from '../types/style.types';

const DEFAULT_QR_STYLE: QRStyle = {
  color: {
    foreground: '#000000',
    background: '#ffffff',
  },
};

const DEFAULT_ADVANCED_CONFIG: QRAdvancedConfig = {
  version: 'auto',
  errorCorrectionLevel: 'M',
  margin: 4,
  marginColor: '#ffffff',
  debugView: false,
};

export const contentSignal = signal<string>('');
export const encodingSignal = signal<EncodingMode>('byte');
export const styleSignal = signal<QRStyle>(DEFAULT_QR_STYLE);
export const advancedSignal = signal<QRAdvancedConfig>(DEFAULT_ADVANCED_CONFIG);
export const themeSignal = signal<ThemeMode>('light');
export const isGeneratingSignal = signal<boolean>(false);
export const isExportingSignal = signal<boolean>(false);
export const drawerOpenSignal = signal<boolean>(false);

export function toggleDrawer(): void {
  drawerOpenSignal.value = !drawerOpenSignal.value;
}

export function closeDrawer(): void {
  drawerOpenSignal.value = false;
}

export const configSignal = computed<QRConfig>(() => ({
  content: contentSignal.value,
  encoding: encodingSignal.value,
  style: styleSignal.value,
  advanced: advancedSignal.value,
}));

export const metadataSignal = computed<QRMetadata>(() => {
  return calculateQRMetadata(configSignal.value);
});

export const validationSignal = computed<ValidationResult>(() => {
  return qrValidator(configSignal.value);
});

export const isValidSignal = computed<boolean>(() => validationSignal.value.isValid);

export function setContent(content: string): void {
  contentSignal.value = content;
  const detected = detectEncoding(content);
  if (encodingSignal.value !== detected && content.length > 0) {
  }
}

export function setEncoding(encoding: EncodingMode): void {
  encodingSignal.value = encoding;
}

export function setStyle(style: QRStyle): void {
  styleSignal.value = style;
}

export function setAdvanced(advanced: QRAdvancedConfig): void {
  advancedSignal.value = advanced;
}

export function setTheme(theme: ThemeMode): void {
  themeSignal.value = theme;
  localStorage.setItem('theme', theme);
  applyTheme(theme);
}

export function updateForegroundColor(color: string | GradientConfig): void {
  styleSignal.value = {
    ...styleSignal.value,
    color: {
      ...styleSignal.value.color,
      foreground: color,
    },
  };
}

export function updateBackgroundColor(color: string): void {
  styleSignal.value = {
    ...styleSignal.value,
    color: {
      ...styleSignal.value.color,
      background: color,
    },
  };
}

export function updateDotStyle(shape: DotShape, radius?: number): void {
  styleSignal.value = {
    ...styleSignal.value,
    dotStyle: {
      shape,
      radius,
    },
  };
}

export function updateCornerStyle(shape: CornerShape, radius?: number): void {
  styleSignal.value = {
    ...styleSignal.value,
    cornerStyle: {
      shape,
      radius,
    },
  };
}

export function updateLogo(src: string, size: number, hideBackground: boolean): void {
  styleSignal.value = {
    ...styleSignal.value,
    logo: {
      src,
      size,
      hideBackground,
    },
  };
}

export function removeLogo(): void {
  const { logo, ...rest } = styleSignal.value;
  styleSignal.value = rest as QRStyle;
}

export function resetConfig(): void {
  contentSignal.value = '';
  encodingSignal.value = 'byte';
  styleSignal.value = DEFAULT_QR_STYLE;
  advancedSignal.value = DEFAULT_ADVANCED_CONFIG;
}

export function initTheme(): void {
  const stored = localStorage.getItem('theme') as ThemeMode | null;
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (systemPrefersDark ? 'dark' : 'light');
  setTheme(theme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function applyTheme(theme: ThemeMode): void {
  const actualTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.setAttribute('data-theme', actualTheme);
}