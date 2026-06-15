import { useEffect, useRef } from 'preact/hooks';
import type { QRConfig } from '../../types/qr.types';

interface QRCanvasProps {
  content: string;
  config: QRConfig;
  size: number;
  format: 'png' | 'svg';
}

declare global {
  interface Window {
    QRCodeStyling: any;
  }
}

export function QRCanvas({ content, config, size, format: _format }: QRCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    const loadLibrary = async () => {
      if (!window.QRCodeStyling) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load library'));
          document.head.appendChild(script);
        });
      }
    };

    const initQR = async () => {
      await loadLibrary();

      if (!containerRef.current) return;

      const fg = config.style.color.foreground;
      const dotStyle = config.style.dotStyle?.shape || 'square';
      const cornerStyle = config.style.cornerStyle?.shape || 'square';

      const options: any = {
        width: size,
        height: size,
        data: content,
        margin: config.advanced.margin,
        qrOptions: {
          errorCorrectionLevel: config.advanced.errorCorrectionLevel,
        },
        dotsOptions: {
          color: typeof fg === 'string' ? fg : fg.colors[0],
          type: dotStyle,
        },
        cornersSquareOptions: {
          color: typeof fg === 'string' ? fg : fg.colors[0],
          type: cornerStyle,
        },
        cornersDotOptions: {
          color: typeof fg === 'string' ? fg : fg.colors[0],
          type: cornerStyle,
        },
        backgroundOptions: {
          color: config.style.color.background,
        },
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

      if (instanceRef.current) {
        instanceRef.current.update(options);
      } else {
        instanceRef.current = new window.QRCodeStyling(options);
        instanceRef.current.append(containerRef.current);
      }
    };

    if (content) {
      initQR();
    }
  }, [content, config, size]);

  return <div ref={containerRef} class="qr-canvas-container" />;
}