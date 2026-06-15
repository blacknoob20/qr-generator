import { useState } from 'preact/hooks';
import type { QRConfig } from '../../types/qr.types';
import type { ValidationResult } from '../../types/validation.types';
import { QRCanvas } from '../QRCanvas';
import { saveAs } from 'file-saver';

interface QRPreviewProps {
  content: string;
  config: QRConfig;
  size?: number;
  validationResult: ValidationResult;
}

function detectContentType(content: string): { type: string; icon: string; label: string; destination: string } {
  if (!content) return { type: 'vacio', icon: '✎', label: 'Esperando contenido...', destination: '' };
  
  const trimmed = content.trim();
  
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return { type: 'url', icon: '🔗', label: 'URL', destination: url.hostname };
    } catch {
      return { type: 'url', icon: '🔗', label: 'URL', destination: trimmed };
    }
  }
  
  if (/^mailto:/i.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    const email = trimmed.replace(/^mailto:/i, '');
    return { type: 'email', icon: '✉', label: 'Correo electrónico', destination: email };
  }
  
  if (/^tel:/i.test(trimmed) || /^\+?[\d\s\-\(\)\.]+$/.test(trimmed)) {
    const phone = trimmed.replace(/^tel:/i, '');
    return { type: 'phone', icon: '☎', label: 'Teléfono', destination: phone };
  }
  
  if (/^wifi:/i.test(trimmed) || /^WIFI:/i.test(trimmed)) {
    return { type: 'wifi', icon: '◉', label: 'WiFi', destination: 'Red inalámbrica' };
  }
  
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(trimmed) || /^whatsapp:/i.test(trimmed)) {
    return { type: 'whatsapp', icon: '✆', label: 'WhatsApp', destination: trimmed };
  }
  
  if (/^geo:/i.test(trimmed) || /^[\d\-\+\.]+\s*,\s*[\d\-\+\.]+$/.test(trimmed)) {
    return { type: 'location', icon: '◎', label: 'Ubicación', destination: trimmed };
  }
  
  return { type: 'texto', icon: '✎', label: 'Texto libre', destination: trimmed.length > 40 ? trimmed.slice(0, 40) + '...' : trimmed };
}

export function QRPreview({ content, config, size = 420, validationResult }: QRPreviewProps) {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isUpdating, setIsUpdating] = useState(false);

  const contentInfo = detectContentType(content);
  const metadata = validationResult.metadata;
  const hasContent = !!content;
  const isValid = validationResult.isValid;

  // Trigger micro-animation when content changes
  const handleContentUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 300);
  };

  // Watch for content changes to animate
  const prevContent = (QRPreview as any)._prevContent;
  if (prevContent !== content) {
    (QRPreview as any)._prevContent = content;
    if (hasContent) handleContentUpdate();
  }

  const getExportOptions = () => {
    const QRCodeStyling = (window as any).QRCodeStyling;
    const fg = config.style.color.foreground;
    const dotStyle = config.style.dotStyle?.shape || 'square';
    const cornerStyle = config.style.cornerStyle?.shape || 'square';

    const options: any = {
      width: 1024,
      height: 1024,
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

    return { QRCodeStyling, options };
  };

  const handleDownloadPNG = async () => {
    if (!content || !isValid) return;
    setDownloadStatus('loading');
    try {
      const { QRCodeStyling, options } = getExportOptions();
      const qr = new QRCodeStyling(options);
      const blob = await qr.getRawData('png');
      saveAs(blob, 'qr-code.png');
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    } catch (err) {
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    }
  };

  const handleDownloadSVG = async () => {
    if (!content || !isValid) return;
    setDownloadStatus('loading');
    try {
      const { QRCodeStyling, options } = getExportOptions();
      const qr = new QRCodeStyling({ ...options, type: 'svg' });
      const svgBlob = await qr.getRawData('svg');
      saveAs(svgBlob, 'qr-code.svg');
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    } catch (err) {
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!content || !navigator.share) return;
    try {
      await navigator.share({
        title: 'QR Code',
        text: content,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const usagePercent = metadata.capacity > 0 ? Math.round((metadata.used / metadata.capacity) * 100) : 0;

  return (
    <div class="qr-preview">
      {/* QR Hero Area */}
      <div class={`qr-preview__hero ${isUpdating ? 'qr-preview__hero--updating' : ''}`}>
        {hasContent ? (
          <div class="qr-preview__canvas-wrapper">
            <QRCanvas content={content} config={config} size={size} format="png" />
          </div>
        ) : (
          <div class="qr-preview__placeholder">
            <div class="qr-preview__placeholder-icon">◈</div>
            <span>Ingresa contenido para generar tu código QR</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div class="qr-preview__action-bar">
        <button
          class="qr-preview__action-btn qr-preview__action-btn--primary"
          onClick={handleDownloadPNG}
          disabled={!hasContent || !isValid || downloadStatus === 'loading'}
          title="Descargar PNG"
        >
          {downloadStatus === 'loading' ? 'Generando...' : '⬇ PNG'}
        </button>
        <button
          class="qr-preview__action-btn"
          onClick={handleDownloadSVG}
          disabled={!hasContent || !isValid || downloadStatus === 'loading'}
          title="Descargar SVG"
        >
          ⬇ SVG
        </button>
        <button
          class="qr-preview__action-btn"
          onClick={handleCopy}
          disabled={!hasContent || copyStatus === 'copied'}
          title="Copiar contenido"
        >
          {copyStatus === 'copied' ? '✓ Copiado' : '📋 Copiar'}
        </button>
        {typeof navigator.share === 'function' && (
          <button
            class="qr-preview__action-btn"
            onClick={handleShare}
            disabled={!hasContent}
            title="Compartir"
          >
            🔗 Compartir
          </button>
        )}
      </div>

      {/* Content Type Detection */}
      {hasContent && (
        <div class="qr-preview__info">
          <div class="qr-preview__info-row">
            <span class="qr-preview__info-label">Tipo detectado</span>
            <span class="qr-preview__info-value">
              <span class="qr-preview__info-icon">{contentInfo.icon}</span>
              {contentInfo.label}
            </span>
          </div>
          {contentInfo.destination && (
            <div class="qr-preview__info-row">
              <span class="qr-preview__info-label">Destino</span>
              <span class="qr-preview__info-value qr-preview__info-value--destination">{contentInfo.destination}</span>
            </div>
          )}
        </div>
      )}

      {/* QR Statistics */}
      {hasContent && isValid && (
        <div class="qr-preview__stats">
          <div class="qr-preview__stat">
            <span class="qr-preview__stat-label">Versión</span>
            <span class="qr-preview__stat-value">{metadata.version}</span>
          </div>
          <div class="qr-preview__stat">
            <span class="qr-preview__stat-label">Corrección</span>
            <span class="qr-preview__stat-value">{config.advanced.errorCorrectionLevel}</span>
          </div>
          <div class="qr-preview__stat">
            <span class="qr-preview__stat-label">Módulos</span>
            <span class="qr-preview__stat-value">{metadata.modules}×{metadata.modules}</span>
          </div>
          <div class="qr-preview__stat">
            <span class="qr-preview__stat-label">Capacidad</span>
            <span class="qr-preview__stat-value">{usagePercent}%</span>
          </div>
        </div>
      )}

      {/* Compatibility */}
      {hasContent && isValid && (
        <div class="qr-preview__compat">
          <span class="qr-preview__compat-label">Compatibilidad</span>
          <div class="qr-preview__compat-list">
            <span class="qr-preview__compat-item">✓ Android</span>
            <span class="qr-preview__compat-item">✓ iOS</span>
            <span class="qr-preview__compat-item">✓ Cámara estándar</span>
          </div>
        </div>
      )}

      {/* Scan Preview */}
      {hasContent && isValid && (
        <div class="qr-preview__scan-preview">
          <span class="qr-preview__scan-label">Lo que verá el usuario al escanear:</span>
          <span class="qr-preview__scan-value">{content}</span>
        </div>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <div class="qr-preview__warnings">
          {validationResult.warnings.map((warning) => (
            <div
              key={warning.id}
              class={`qr-preview__warning qr-preview__warning--${warning.severity}`}
            >
              <span class="qr-preview__warning-icon">
                {warning.severity === 'error' ? '✕' : warning.severity === 'warning' ? '⚠' : 'ℹ'}
              </span>
              <span class="qr-preview__warning-message">{warning.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
