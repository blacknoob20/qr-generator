import type { QRConfig } from '../types/qr.types';

interface QROptions {
  width: number;
  height: number;
  data: string;
  margin: number;
  qrOptions: { errorCorrectionLevel: string; };
  dotsOptions: { color: string; type: string; };
  cornersSquareOptions: { color: string; type: string; };
  cornersDotOptions: { color: string; type: string; };
  backgroundOptions: { color: string; };
  image?: string;
  imageOptions?: {
    crossOrigin: string;
    margin: number;
    imageSize: number;
    hideBackgroundDots: boolean;
  };
}

export function buildQROptions(
  config: QRConfig,
  width: number = 300,
  height: number = 300,
  data?: string
): QROptions {
  const fg = config.style.color.foreground;
  const dotStyle = config.style.dotStyle?.shape || 'square';
  const cornerStyle = config.style.cornerStyle?.shape || 'square';
  const foregroundColor = typeof fg === 'string' ? fg : fg.colors[0];

  const options: QROptions = {
    width,
    height,
    data: data || config.content,
    margin: config.advanced.margin,
    qrOptions: { errorCorrectionLevel: config.advanced.errorCorrectionLevel, },
    dotsOptions: { color: foregroundColor, type: dotStyle, },
    cornersSquareOptions: { color: foregroundColor, type: cornerStyle, },
    cornersDotOptions: { color: foregroundColor, type: cornerStyle, },
    backgroundOptions: { color: config.style.color.background, },
  };

  if (config.style.logo?.src) {
    options.image = config.style.logo.src;
    options.imageOptions = {
      crossOrigin: 'anonymous',
      margin: 4,
      imageSize: config.style.logo.size / 100,
      hideBackgroundDots: config.style.logo.hideBackground,
    };
  }

  return options;
}
