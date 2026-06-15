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
  angle?: number;
}

export interface LogoConfig {
  src: string;
  size: number;
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

export const DEFAULT_QR_CONFIG: QRConfig = {
  content: '',
  encoding: 'byte',
  style: {
    color: {
      foreground: '#000000',
      background: '#ffffff',
    },
  },
  advanced: {
    version: 'auto',
    errorCorrectionLevel: 'M',
    margin: 4,
    marginColor: '#ffffff',
    debugView: false,
  },
};