import type { QRConfig } from '../types/qr.types';
import type { Options } from 'qr-code-styling';

type QROptions = Options;

export function buildQROptions(
  config: QRConfig,
  width: number = 300,
  height: number = 300,
  data?: string
): QROptions {
  const fg = config.style.color.foreground;
  const dotShape = config.style.dotStyle?.shape || 'square';
  const cornerShape = config.style.cornerStyle?.shape || 'square';
  const foregroundColor = typeof fg === 'string' ? fg : fg.colors[0];

  const options: QROptions = {
    width,
    height,
    data: data || config.content,
    margin: config.advanced.margin,
    qrOptions: { errorCorrectionLevel: config.advanced.errorCorrectionLevel },
    dotsOptions: { color: foregroundColor, type: dotShape },
    cornersSquareOptions: { color: foregroundColor, type: cornerShape },
    cornersDotOptions: { color: foregroundColor, type: cornerShape },
    backgroundOptions: { color: config.style.color.background },
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
