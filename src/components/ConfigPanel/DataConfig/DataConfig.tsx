import { useState } from 'preact/hooks';
import type { QRMetadata } from '../../../types/validation.types';
import type { EncodingMode } from '../../../types/qr.types';

interface DataConfigProps {
  content: string;
  onChange: (content: string) => void;
  onEncodingChange: (encoding: EncodingMode) => void;
  metadata: QRMetadata;
}

type ContentType = 'url' | 'whatsapp' | 'email' | 'wifi' | 'phone' | 'location' | 'text';

interface ContentTypeOption {
  value: ContentType;
  icon: string;
  label: string;
  placeholder: string;
}

const contentTypes: ContentTypeOption[] = [
  { value: 'url', icon: '🔗', label: 'URL', placeholder: 'https://ejemplo.com' },
  { value: 'whatsapp', icon: '✆', label: 'WhatsApp', placeholder: 'Número: +1234567890' },
  { value: 'email', icon: '✉', label: 'Correo', placeholder: 'correo@ejemplo.com' },
  { value: 'wifi', icon: '◉', label: 'WiFi', placeholder: 'Nombre de red' },
  { value: 'phone', icon: '☎', label: 'Teléfono', placeholder: '+1234567890' },
  { value: 'location', icon: '◎', label: 'Ubicación', placeholder: 'Latitud, Longitud' },
  { value: 'text', icon: '✎', label: 'Texto libre', placeholder: 'Cualquier texto...' },
];

function detectTypeFromContent(content: string): ContentType {
  if (!content) return 'url';
  const trimmed = content.trim();
  
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(trimmed) || /^whatsapp:/i.test(trimmed)) return 'whatsapp';
  if (/^https?:\/\//i.test(trimmed)) return 'url';
  if (/^mailto:/i.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'email';
  if (/^tel:/i.test(trimmed) || /^\+?[\d\s\-\(\)\.]+$/.test(trimmed)) return 'phone';
  if (/^wifi:/i.test(trimmed) || /^WIFI:/i.test(trimmed)) return 'wifi';
  if (/^geo:/i.test(trimmed) || /^[\d\-\+\.]+\s*,\s*[\d\-\+\.]+$/.test(trimmed)) return 'location';
  
  return 'text';
}

function buildContent(type: ContentType, values: Record<string, string>): string {
  switch (type) {
    case 'url':
      return values.url || '';
    case 'whatsapp': {
      const num = values.phone || '';
      const msg = values.message || '';
      if (!num) return '';
      return msg ? `https://wa.me/${num.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}` : `https://wa.me/${num.replace(/\D/g, '')}`;
    }
    case 'email': {
      const to = values.to || '';
      const subject = values.subject || '';
      const body = values.body || '';
      if (!to) return '';
      let mailto = `mailto:${to}`;
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) mailto += '?' + params.join('&');
      return mailto;
    }
    case 'wifi': {
      const ssid = values.ssid || '';
      const password = values.password || '';
      const security = values.security || 'WPA';
      if (!ssid) return '';
      return `WIFI:T:${security};S:${ssid};P:${password};;`;
    }
    case 'phone':
      return values.phone ? `tel:${values.phone}` : '';
    case 'location': {
      const lat = values.lat || '';
      const lng = values.lng || '';
      if (!lat || !lng) return '';
      return `geo:${lat},${lng}`;
    }
    case 'text':
      return values.text || '';
    default:
      return '';
  }
}

function parseContent(type: ContentType, content: string): Record<string, string> {
  switch (type) {
    case 'url':
      return { url: content };
    case 'whatsapp': {
      const match = content.match(/https:\/\/wa\.me\/([^?]+)(?:\?text=(.+))?/);
      if (match) {
        return { phone: match[1], message: match[2] ? decodeURIComponent(match[2]) : '' };
      }
      return { phone: content.replace(/\D/g, ''), message: '' };
    }
    case 'email': {
      const match = content.match(/^mailto:([^?]+)(?:\?(.+))?/);
      if (match) {
        const params = new URLSearchParams(match[2] || '');
        return { to: match[1], subject: params.get('subject') || '', body: params.get('body') || '' };
      }
      return { to: content, subject: '', body: '' };
    }
    case 'wifi': {
      const match = content.match(/WIFI:T:([^;]+);S:([^;]+);P:([^;]*);;/);
      if (match) {
        return { security: match[1], ssid: match[2], password: match[3] };
      }
      return { ssid: '', password: '', security: 'WPA' };
    }
    case 'phone':
      return { phone: content.replace(/^tel:/, '') };
    case 'location': {
      const match = content.match(/geo:([^,]+),(.+)/);
      if (match) return { lat: match[1], lng: match[2] };
      return { lat: '', lng: '' };
    }
    case 'text':
      return { text: content };
    default:
      return {};
  }
}

export function DataConfig({ content, onChange, onEncodingChange, metadata }: DataConfigProps) {
  const detectedType = detectTypeFromContent(content);
  const [activeType, setActiveType] = useState<ContentType>(detectedType);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => parseContent(detectedType, content));

  const handleTypeChange = (type: ContentType) => {
    setActiveType(type);
    setFieldValues(parseContent(type, content));
  };

  const handleFieldChange = (field: string, value: string) => {
    const newValues = { ...fieldValues, [field]: value };
    setFieldValues(newValues);
    const newContent = buildContent(activeType, newValues);
    onChange(newContent);
  };

  const handleEncodingChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    onEncodingChange(target.value as EncodingMode);
  };

  const renderFields = () => {
    switch (activeType) {
      case 'url':
        return (
          <div class="data-config__field">
            <label class="data-config__label">Dirección web</label>
            <input
              type="url"
              class="data-config__input"
              value={fieldValues.url || ''}
              onInput={(e) => handleFieldChange('url', (e.target as HTMLInputElement).value)}
              placeholder="https://ejemplo.com"
            />
          </div>
        );
      case 'whatsapp':
        return (
          <>
            <div class="data-config__field">
              <label class="data-config__label">Número de teléfono</label>
              <input
                type="tel"
                class="data-config__input"
                value={fieldValues.phone || ''}
                onInput={(e) => handleFieldChange('phone', (e.target as HTMLInputElement).value)}
                placeholder="+1234567890"
              />
            </div>
            <div class="data-config__field">
              <label class="data-config__label">Mensaje opcional</label>
              <input
                type="text"
                class="data-config__input"
                value={fieldValues.message || ''}
                onInput={(e) => handleFieldChange('message', (e.target as HTMLInputElement).value)}
                placeholder="Hola, me interesa..."
              />
            </div>
          </>
        );
      case 'email':
        return (
          <>
            <div class="data-config__field">
              <label class="data-config__label">Destinatario</label>
              <input
                type="email"
                class="data-config__input"
                value={fieldValues.to || ''}
                onInput={(e) => handleFieldChange('to', (e.target as HTMLInputElement).value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div class="data-config__field">
              <label class="data-config__label">Asunto</label>
              <input
                type="text"
                class="data-config__input"
                value={fieldValues.subject || ''}
                onInput={(e) => handleFieldChange('subject', (e.target as HTMLInputElement).value)}
                placeholder="Asunto del correo"
              />
            </div>
            <div class="data-config__field">
              <label class="data-config__label">Mensaje</label>
              <textarea
                class="data-config__textarea"
                value={fieldValues.body || ''}
                onInput={(e) => handleFieldChange('body', (e.target as HTMLTextAreaElement).value)}
                placeholder="Contenido del mensaje..."
                rows={3}
              />
            </div>
          </>
        );
      case 'wifi':
        return (
          <>
            <div class="data-config__field">
              <label class="data-config__label">Nombre de la red (SSID)</label>
              <input
                type="text"
                class="data-config__input"
                value={fieldValues.ssid || ''}
                onInput={(e) => handleFieldChange('ssid', (e.target as HTMLInputElement).value)}
                placeholder="MiRedWiFi"
              />
            </div>
            <div class="data-config__field">
              <label class="data-config__label">Contraseña</label>
              <input
                type="text"
                class="data-config__input"
                value={fieldValues.password || ''}
                onInput={(e) => handleFieldChange('password', (e.target as HTMLInputElement).value)}
                placeholder="Contraseña de la red"
              />
            </div>
            <div class="data-config__field">
              <label class="data-config__label">Seguridad</label>
              <select
                class="data-config__select"
                value={fieldValues.security || 'WPA'}
                onChange={(e) => handleFieldChange('security', (e.target as HTMLSelectElement).value)}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Sin contraseña</option>
              </select>
            </div>
          </>
        );
      case 'phone':
        return (
          <div class="data-config__field">
            <label class="data-config__label">Número de teléfono</label>
            <input
              type="tel"
              class="data-config__input"
              value={fieldValues.phone || ''}
              onInput={(e) => handleFieldChange('phone', (e.target as HTMLInputElement).value)}
              placeholder="+1234567890"
            />
          </div>
        );
      case 'location':
        return (
          <>
            <div class="data-config__field">
              <label class="data-config__label">Latitud</label>
              <input
                type="text"
                class="data-config__input"
                value={fieldValues.lat || ''}
                onInput={(e) => handleFieldChange('lat', (e.target as HTMLInputElement).value)}
                placeholder="-33.4489"
              />
            </div>
            <div class="data-config__field">
              <label class="data-config__label">Longitud</label>
              <input
                type="text"
                class="data-config__input"
                value={fieldValues.lng || ''}
                onInput={(e) => handleFieldChange('lng', (e.target as HTMLInputElement).value)}
                placeholder="-70.6693"
              />
            </div>
          </>
        );
      case 'text':
        return (
          <div class="data-config__field">
            <label class="data-config__label">Texto libre</label>
            <textarea
              class="data-config__textarea"
              value={fieldValues.text || ''}
              onInput={(e) => handleFieldChange('text', (e.target as HTMLTextAreaElement).value)}
              placeholder="Cualquier texto que quieras codificar..."
              rows={4}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div class="data-config">
      {/* Content Type Selector */}
      <div class="data-config__type-grid">
        {contentTypes.map((type) => (
          <button
            key={type.value}
            class={`data-config__type-btn ${activeType === type.value ? 'data-config__type-btn--active' : ''}`}
            onClick={() => handleTypeChange(type.value)}
            title={type.label}
          >
            <span class="data-config__type-icon">{type.icon}</span>
            <span class="data-config__type-label">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Fields */}
      <div class="data-config__fields">
        {renderFields()}
      </div>

      {/* Raw content preview */}
      {content && (
        <div class="data-config__raw">
          <span class="data-config__raw-label">Contenido codificado:</span>
          <code class="data-config__raw-value">{content.length > 60 ? content.slice(0, 60) + '...' : content}</code>
        </div>
      )}

      {/* Character counter */}
      <div class="data-config__counter">
        <span>{content.length} caracteres</span>
        {metadata.capacity > 0 && (
          <span class={content.length > metadata.capacity ? 'data-config__counter--error' : ''}>
            {' / '}{metadata.capacity} máximo
          </span>
        )}
      </div>

      {/* Encoding selector */}
      <div class="data-config__field">
        <label class="data-config__label">Modo de codificación</label>
        <select
          class="data-config__select"
          value={metadata.encoding}
          onChange={handleEncodingChange}
        >
          <option value="auto">Automático</option>
          <option value="numeric">Numérico</option>
          <option value="alphanumeric">Alfanumérico</option>
          <option value="byte">Byte</option>
          <option value="kanji">Kanji</option>
        </select>
        <div class="data-config__info">
          <span>Detectado: {metadata.encoding.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
