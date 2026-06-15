import { describe, it, expect } from 'vitest';
import { calculateQRMetadata, detectEncoding, calculateContrast } from './qr-generator';
import type { QRConfig } from '../types/qr.types';

const defaultConfig: QRConfig = {
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

describe('detectEncoding', () => {
  it('should detect numeric encoding for numbers only', () => {
    expect(detectEncoding('1234567890')).toBe('numeric');
  });

  it('should detect alphanumeric encoding for mixed case', () => {
    expect(detectEncoding('HELLO123')).toBe('alphanumeric');
  });

  it('should detect alphanumeric encoding for URLs with allowed chars', () => {
    expect(detectEncoding('HTTPS://EXAMPLE.COM')).toBe('alphanumeric');
  });

  it('should detect byte encoding for special characters', () => {
    expect(detectEncoding('hello@world.com')).toBe('byte');
  });

  it('should detect kanji encoding for Chinese characters', () => {
    expect(detectEncoding('你好世界')).toBe('kanji');
  });

  it('should detect numeric encoding for empty string', () => {
    expect(detectEncoding('')).toBe('numeric');
  });
});

describe('calculateQRMetadata', () => {
  it('should return default metadata for empty content', () => {
    const metadata = calculateQRMetadata(defaultConfig);
    expect(metadata.version).toBe(1);
    expect(metadata.modules).toBe(21);
    expect(metadata.used).toBe(0);
    expect(metadata.capacity).toBe(0);
  });

  it('should calculate correct metadata for short byte text', () => {
    const config = { ...defaultConfig, content: 'Hello' };
    const metadata = calculateQRMetadata(config);
    expect(metadata.version).toBe(1);
    expect(metadata.modules).toBe(21);
    expect(metadata.used).toBeGreaterThan(0);
    expect(metadata.capacity).toBeGreaterThan(metadata.used);
  });

  it('should calculate correct metadata for numeric content', () => {
    const config = { ...defaultConfig, content: '1234567890', encoding: 'numeric' as const };
    const metadata = calculateQRMetadata(config);
    expect(metadata.version).toBe(1);
    expect(metadata.modules).toBe(21);
    expect(metadata.used).toBeGreaterThan(0);
  });

  it('should auto-detect version for longer content', () => {
    // 500 bytes of content with byte encoding and ECL M should need version > 1
    const config = { ...defaultConfig, content: 'x'.repeat(500) };
    const metadata = calculateQRMetadata(config);
    expect(metadata.version).toBeGreaterThan(1);
    expect(metadata.modules).toBeGreaterThan(21);
  });

  it('should use fixed version when specified', () => {
    const config = {
      ...defaultConfig,
      content: 'Hello',
      advanced: { ...defaultConfig.advanced, version: 5 as const },
    };
    const metadata = calculateQRMetadata(config);
    expect(metadata.version).toBe(5);
    expect(metadata.modules).toBe(37);
  });

  it('should return the minimum required version for very long content', () => {
    const config = { ...defaultConfig, content: 'x'.repeat(10000) };
    const metadata = calculateQRMetadata(config);
    // 10000 bytes with ECL M fits in version 17
    expect(metadata.version).toBe(17);
    expect(metadata.modules).toBe(85);
  });
});

describe('calculateContrast', () => {
  it('should return high contrast for black on white', () => {
    const contrast = calculateContrast('#000000', '#ffffff');
    expect(contrast).toBe(21);
  });

  it('should return low contrast for similar colors', () => {
    const contrast = calculateContrast('#777777', '#888888');
    expect(contrast).toBeLessThan(2);
  });

  it('should return 1 for identical colors', () => {
    const contrast = calculateContrast('#ff0000', '#ff0000');
    expect(contrast).toBe(1);
  });

  it('should return high contrast for complementary colors', () => {
    const contrast = calculateContrast('#0000ff', '#ffff00');
    expect(contrast).toBeGreaterThan(4.5);
  });
});
