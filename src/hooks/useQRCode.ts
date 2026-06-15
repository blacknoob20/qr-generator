import { useEffect, useRef, useCallback, useState } from 'preact/hooks';
import type { QRConfig } from '../types/qr.types';
import type { QRMetadata } from '../types/validation.types';
import { calculateQRMetadata } from '../utils/qr-generator';
import { buildQROptions } from '../utils/build-qr-options';

interface UseQRCodeResult {
  qrData: QRMetadata;
  isGenerating: boolean;
  error: QRCodeError | null;
  updateConfig: (config: Partial<QRConfig>) => void;
  resetConfig: () => void;
  toDataURL: (format: 'png' | 'svg', quality?: number) => Promise<string>;
  toBlob: (format: 'png', quality?: number) => Promise<Blob>;
  getRawData: (format: 'svg' | 'png') => Promise<ArrayBuffer>;
  qrCodeRef: any;
}

interface QRCodeError {
  code: 'CONTENT_TOO_LONG' | 'INVALID_ENCODING' | 'GENERATION_FAILED' | 'INVALID_CONFIG';
  message: string;
  details?: {
    maxCapacity?: number;
    usedCapacity?: number;
    requiredVersion?: number;
  };
}

declare global {
  interface Window {
    QRCodeStyling: any;
  }
}

export function useQRCode(initialConfig?: Partial<QRConfig>): UseQRCodeResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<QRCodeError | null>(null);
  const qrCodeInstanceRef = useRef<any>(null);
  const configRef = useRef<Partial<QRConfig>>(initialConfig || {});

  const [qrData, setQRData] = useState<QRMetadata>(() => {
    if (!initialConfig) {
      return {
        version: 1,
        capacity: 0,
        used: 0,
        modules: 21,
        encoding: 'byte',
      };
    }
    return calculateQRMetadata({
      content: initialConfig.content || '',
      encoding: initialConfig.encoding || 'byte',
      style: initialConfig.style || { color: { foreground: '#000000', background: '#ffffff' } },
      advanced: initialConfig.advanced || { version: 'auto', errorCorrectionLevel: 'M', margin: 4, marginColor: '#ffffff', debugView: false },
    });
  });

  const buildQRCodeOptions = useCallback((config: QRConfig) => {
    return buildQROptions(config, 300, 300);
  }, []);

  useEffect(() => {
    const initQRCode = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        if (!window.QRCodeStyling) await loadQRCodeStyling();

        const fullConfig: QRConfig = {
          content: configRef.current.content || '',
          encoding: configRef.current.encoding || 'byte',
          style: configRef.current.style || { color: { foreground: '#000000', background: '#ffffff' } },
          advanced: configRef.current.advanced || { version: 'auto', errorCorrectionLevel: 'M', margin: 4, marginColor: '#ffffff', debugView: false },
        };

        if (fullConfig.content) {
          const metadata = calculateQRMetadata(fullConfig);
          setQRData(metadata);

          if (metadata.used > metadata.capacity) {
            setError({
              code: 'CONTENT_TOO_LONG',
              message: 'El contenido excede la capacidad del código QR',
              details: {
                maxCapacity: metadata.capacity,
                usedCapacity: metadata.used,
              },
            });
          }
        }

        const options = buildQRCodeOptions(fullConfig);
        qrCodeInstanceRef.current = new window.QRCodeStyling(options);

      } catch (err) {
        setError({ code: 'GENERATION_FAILED', message: 'Error al generar el código QR', });
      } finally {
        setIsGenerating(false);
      }
    };

    initQRCode();
  }, [buildQRCodeOptions]);

  const loadQRCodeStyling = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.QRCodeStyling) return resolve();

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load QR Code Styling library'));
      document.head.appendChild(script);
    });
  };

  const updateConfig = useCallback((newConfig: Partial<QRConfig>) => {
    configRef.current = { ...configRef.current, ...newConfig };

    const fullConfig: QRConfig = {
      content: configRef.current.content || '',
      encoding: configRef.current.encoding || 'byte',
      style: configRef.current.style || { color: { foreground: '#000000', background: '#ffffff' } },
      advanced: configRef.current.advanced || { version: 'auto', errorCorrectionLevel: 'M', margin: 4, marginColor: '#ffffff', debugView: false },
    };

    const metadata = calculateQRMetadata(fullConfig);
    setQRData(metadata);

    if (qrCodeInstanceRef.current && fullConfig.content) {
      const options = buildQRCodeOptions(fullConfig);
      qrCodeInstanceRef.current.update(options);
    }
  }, [buildQRCodeOptions]);

  const resetConfig = useCallback(() => {
    configRef.current = {};
    setQRData({
      version: 1,
      capacity: 0,
      used: 0,
      modules: 21,
      encoding: 'byte',
    });
    setError(null);
  }, []);

  const getInstance = useCallback(() => {
    const instance = qrCodeInstanceRef.current;
    if (!instance) throw new Error('QR Code not initialized');
    return instance;
  }, []);

  const toDataURL = useCallback(async (format: 'png' | 'svg', quality: number = 1): Promise<string> => {
    return await getInstance().toDataURL(format, quality);
  }, [getInstance]);

  const toBlob = useCallback(async (format: 'png', quality: number = 1): Promise<Blob> => {
    return await getInstance().toBlob(format, quality);
  }, [getInstance]);

  const getRawData = useCallback(async (format: 'svg' | 'png'): Promise<ArrayBuffer> => {
    return await getInstance().getRawData(format);
  }, [getInstance]);

  return {
    qrData,
    isGenerating,
    error,
    updateConfig,
    resetConfig,
    toDataURL,
    toBlob,
    getRawData,
    qrCodeRef: qrCodeInstanceRef,
  };
}