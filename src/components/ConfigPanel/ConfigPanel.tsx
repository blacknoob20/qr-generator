import { useState } from 'preact/hooks';
import type { QRConfig, EncodingMode } from '../../types/qr.types';
import type { ValidationResult } from '../../types/validation.types';
import { DataConfig } from './DataConfig';
import { StyleConfig } from './StyleConfig';
import { AdvancedConfig } from './AdvancedConfig';

interface ConfigPanelProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
  validationResult: ValidationResult;
  flat?: boolean;
}

export function ConfigPanel({ config, onChange, validationResult, flat = false }: ConfigPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('content');

  const handleContentChange = (content: string) => {
    onChange({ ...config, content });
  };

  const handleEncodingChange = (encoding: EncodingMode) => {
    onChange({ ...config, encoding });
  };

  const handleStyleChange = (style: typeof config.style) => {
    onChange({ ...config, style });
  };

  const handleAdvancedChange = (advanced: typeof config.advanced) => {
    onChange({ ...config, advanced });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    { id: 'content', label: 'Contenido', icon: '✎' },
    { id: 'style', label: 'Estilo', icon: '◈' },
    { id: 'advanced', label: 'Avanzado', icon: '⚙' },
  ];

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'content':
        return (
          <DataConfig
            content={config.content}
            onChange={handleContentChange}
            onEncodingChange={handleEncodingChange}
            metadata={validationResult.metadata}
          />
        );
      case 'style':
        return (
          <StyleConfig
            style={config.style}
            onChange={handleStyleChange}
          />
        );
      case 'advanced':
        return (
          <AdvancedConfig
            advanced={config.advanced}
            onChange={handleAdvancedChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div class={`config-panel ${flat ? 'config-panel--flat' : ''}`}>
      {sections.map((section) => (
        <div
          key={section.id}
          class={`config-panel__section ${flat || expandedSection === section.id ? 'config-panel__section--expanded' : ''}`}
        >
          {!flat && (
            <button
              class="config-panel__header"
              onClick={() => toggleSection(section.id)}
              aria-expanded={expandedSection === section.id}
            >
              <span class="config-panel__header-icon">{section.icon}</span>
              <span class="config-panel__header-label">{section.label}</span>
              <span class="config-panel__header-chevron">
                {expandedSection === section.id ? '−' : '+'}
              </span>
            </button>
          )}

          {flat && (
            <div class="config-panel__section-title">
              <span class="config-panel__header-icon">{section.icon}</span>
              <span class="config-panel__header-label">{section.label}</span>
            </div>
          )}

          <div class="config-panel__body">
            {renderSectionContent(section.id)}
          </div>
        </div>
      ))}

      <div class="config-panel__footer">
        <div class={`config-panel__status config-panel__status--${validationResult.isValid ? 'valid' : 'invalid'}`}>
          {validationResult.isValid ? '✓ Configuración válida' : '✕ Revisa los errores'}
        </div>
      </div>
    </div>
  );
}
