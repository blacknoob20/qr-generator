import { useEffect, useRef, useState } from 'preact/hooks';
import QRCodeStyling from 'qr-code-styling';
import type { QRConfig } from '../../types/qr.types';
import { buildQROptions } from '../../utils/build-qr-options';

interface QRCanvasProps {
  content: string;
  config: QRConfig;
  size: number;
  format: 'png' | 'svg';
}

export function QRCanvas({ content, config, size, format: _format }: QRCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!content) return;

    let cancelled = false;

    const initQR = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (cancelled) return;

        if (!containerRef.current) return;

        const options = buildQROptions(config, size, size, content);

        if (instanceRef.current) {
          instanceRef.current.update(options);
        } else {
          instanceRef.current = new QRCodeStyling(options);
          instanceRef.current.append(containerRef.current);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initQR();

    return () => {
      cancelled = true;
    };
  }, [content, config, size]);

  if (error) {
    return (
      <div class="qr-canvas-container">
        <div class="qr-preview__warning qr-preview__warning--error">
          <span class="qr-preview__warning-icon">⚠️</span>
          <span class="qr-preview__warning-message">{error}</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div class="qr-canvas-container">
        <div class="qr-preview__placeholder">
          <div class="qr-preview__placeholder-icon">⏳</div>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} class="qr-canvas-container" />;
}