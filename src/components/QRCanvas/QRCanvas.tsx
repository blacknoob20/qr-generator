import { useEffect, useRef, useState } from 'preact/hooks';
import type { QRConfig } from '../../types/qr.types';
import { buildQROptions } from '../../utils/build-qr-options';

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

const LIBRARY_URL = 'https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js';
const LOAD_TIMEOUT = 10000;
const MAX_RETRIES = 2;

function loadScriptWithTimeout(url: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => {
      reject(new Error('Timeout: la librería no pudo cargarse'));
    }, timeoutMs);

    script.src = url;
    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Error al cargar la librería de generación de QR'));
    };
    document.head.appendChild(script);
  });
}

async function loadLibrary(retries: number = MAX_RETRIES): Promise<void> {
  if (window.QRCodeStyling) return;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await loadScriptWithTimeout(LIBRARY_URL, LOAD_TIMEOUT);
      return;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError!;
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
        await loadLibrary();
        if (cancelled) return;

        if (!containerRef.current) return;

        const options = buildQROptions(config, size, size, content);

        if (instanceRef.current) {
          instanceRef.current.update(options);
        } else {
          instanceRef.current = new window.QRCodeStyling(options);
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