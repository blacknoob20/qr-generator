import { describe, it, expect } from 'vitest';
import { buildQROptions } from '../../src/utils/build-qr-options';
import type { QRConfig } from '../../src/types/qr.types';

const defaultConfig: QRConfig = {
  content: 'https://example.com',
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

describe('buildQROptions', () => {
  it('should build basic options with defaults', () => {
    const options = buildQROptions(defaultConfig);

    expect(options.data).toBe('https://example.com');
    expect(options.width).toBe(300);
    expect(options.height).toBe(300);
    expect(options.margin).toBe(4);
    expect(options.qrOptions.errorCorrectionLevel).toBe('M');
    expect(options.dotsOptions.color).toBe('#000000');
    expect(options.dotsOptions.type).toBe('square');
    expect(options.cornersSquareOptions.color).toBe('#000000');
    expect(options.cornersSquareOptions.type).toBe('square');
    expect(options.cornersDotOptions.color).toBe('#000000');
    expect(options.cornersDotOptions.type).toBe('square');
    expect(options.backgroundOptions.color).toBe('#ffffff');
    expect(options.image).toBeUndefined();
    expect(options.imageOptions).toBeUndefined();
  });

  it('should build options with custom dimensions', () => {
    const options = buildQROptions(defaultConfig, 1024, 1024);

    expect(options.width).toBe(1024);
    expect(options.height).toBe(1024);
    expect(options.data).toBe('https://example.com');
  });

  it('should override data when provided', () => {
    const options = buildQROptions(defaultConfig, 300, 300, 'custom-data');

    expect(options.data).toBe('custom-data');
  });

  it('should build options with gradient foreground', () => {
    const config: QRConfig = {
      ...defaultConfig,
      style: {
        ...defaultConfig.style,
        color: {
          foreground: {
            type: 'linear',
            colors: ['#ff0000', '#0000ff'],
            angle: 45,
          },
          background: '#ffffff',
        },
      },
    };

    const options = buildQROptions(config);

    expect(options.dotsOptions.color).toBe('#ff0000');
    expect(options.cornersSquareOptions.color).toBe('#ff0000');
    expect(options.cornersDotOptions.color).toBe('#ff0000');
  });

  it('should build options with custom dot and corner shapes', () => {
    const config: QRConfig = {
      ...defaultConfig,
      style: {
        ...defaultConfig.style,
        dotStyle: {
          shape: 'rounded',
          radius: 0.5,
        },
        cornerStyle: {
          shape: 'circle',
          radius: 0.5,
        },
      },
    };

    const options = buildQROptions(config);

    expect(options.dotsOptions.type).toBe('rounded');
    expect(options.cornersSquareOptions.type).toBe('circle');
    expect(options.cornersDotOptions.type).toBe('circle');
  });

  it('should build options with logo', () => {
    const config: QRConfig = {
      ...defaultConfig,
      style: {
        ...defaultConfig.style,
        logo: {
          src: 'data:image/png;base64,abc123',
          size: 15,
          hideBackground: true,
        },
      },
    };

    const options = buildQROptions(config);

    expect(options.image).toBe('data:image/png;base64,abc123');
    expect(options.imageOptions).toBeDefined();
    expect(options.imageOptions!.crossOrigin).toBe('anonymous');
    expect(options.imageOptions!.margin).toBe(4);
    expect(options.imageOptions!.imageSize).toBe(0.15);
    expect(options.imageOptions!.hideBackgroundDots).toBe(true);
  });

  it('should calculate correct imageSize from logo percentage', () => {
    const config: QRConfig = {
      ...defaultConfig,
      style: {
        ...defaultConfig.style,
        logo: {
          src: 'https://example.com/logo.png',
          size: 20,
          hideBackground: false,
        },
      },
    };

    const options = buildQROptions(config);

    expect(options.imageOptions!.imageSize).toBe(0.2);
  });

  it('should not include image options when logo is not provided', () => {
    const options = buildQROptions(defaultConfig);

    expect(options.image).toBeUndefined();
    expect(options.imageOptions).toBeUndefined();
  });

  it('should build options with default shapes when not specified', () => {
    const config: QRConfig = {
      ...defaultConfig,
      style: {
        ...defaultConfig.style,
        dotStyle: undefined,
        cornerStyle: undefined,
      },
    };

    const options = buildQROptions(config);

    expect(options.dotsOptions.type).toBe('square');
    expect(options.cornersSquareOptions.type).toBe('square');
    expect(options.cornersDotOptions.type).toBe('square');
  });
});
