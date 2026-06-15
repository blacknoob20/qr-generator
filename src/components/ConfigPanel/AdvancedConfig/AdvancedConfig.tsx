import type { QRAdvancedConfig, QRVersion } from '../../../types/qr.types';

interface AdvancedConfigProps {
  advanced: QRAdvancedConfig;
  onChange: (advanced: QRAdvancedConfig) => void;
}

export function AdvancedConfig({ advanced, onChange }: AdvancedConfigProps) {
  const handleVersionChange = (version: QRVersion | 'auto') => {
    onChange({
      ...advanced,
      version,
    });
  };

  const handleErrorCorrectionChange = (errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H') => {
    onChange({
      ...advanced,
      errorCorrectionLevel,
    });
  };

  const handleMarginChange = (margin: number) => {
    onChange({
      ...advanced,
      margin,
    });
  };

  const handleMarginColorChange = (marginColor: string) => {
    onChange({
      ...advanced,
      marginColor,
    });
  };

  const handleDebugToggle = () => {
    onChange({
      ...advanced,
      debugView: !advanced.debugView,
    });
  };

  const eclOptions = [
    { value: 'L', label: 'L', recovery: '~7%', description: 'Entornos controlados' },
    { value: 'M', label: 'M', recovery: '~15%', description: 'Uso general' },
    { value: 'Q', label: 'Q', recovery: '~25%', description: 'Industrial' },
    { value: 'H', label: 'H', recovery: '~30%', description: 'Logos/decorativo' },
  ];

  const versions: (QRVersion | 'auto')[] = [
    'auto', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  ];

  return (
    <div class="advanced-config">
      <div class="advanced-config__section">
        <h3 class="advanced-config__title">Versión QR</h3>
        <div class="advanced-config__field">
          <select
            class="advanced-config__select"
            value={advanced.version}
            onChange={(e) => {
              const value = (e.target as HTMLSelectElement).value;
              handleVersionChange(value === 'auto' ? 'auto' : parseInt(value) as QRVersion);
            }}
          >
            {versions.map((v) => (
              <option key={v} value={v}>
                {v === 'auto' ? 'Automático (recomendado)' : `Versión ${v}`}
              </option>
            ))}
          </select>
        </div>
        <p class="advanced-config__hint">
          La versión determina el tamaño del código QR (21×21 hasta 177×177 módulos)
        </p>
      </div>

      <div class="advanced-config__section">
        <h3 class="advanced-config__title">Nivel de Corrección de Errores</h3>
        <div class="advanced-config__ecl-grid">
          {eclOptions.map((option) => (
            <button
              key={option.value}
              class={`advanced-config__ecl-option ${advanced.errorCorrectionLevel === option.value ? 'advanced-config__ecl-option--active' : ''}`}
              onClick={() => handleErrorCorrectionChange(option.value as 'L' | 'M' | 'Q' | 'H')}
            >
              <span class="advanced-config__ecl-label">{option.label}</span>
              <span class="advanced-config__ecl-recovery">{option.recovery}</span>
              <span class="advanced-config__ecl-desc">{option.description}</span>
            </button>
          ))}
        </div>
        <p class="advanced-config__hint advanced-config__hint--ecl">
          Niveles más altos permiten logos más grandes pero reducen la capacidad de datos
        </p>
      </div>

      <div class="advanced-config__section">
        <h3 class="advanced-config__title">Zona de Silencio (Margin)</h3>
        <div class="advanced-config__field">
          <label>Margen: {advanced.margin} módulos</label>
          <input
            type="range"
            min="0"
            max="8"
            value={advanced.margin}
            onChange={(e) => handleMarginChange(parseInt((e.target as HTMLInputElement).value))}
            class="advanced-config__slider"
          />
        </div>
        <p class="advanced-config__hint">Mínimo recomendado: 4 módulos</p>
      </div>

      <div class="advanced-config__section">
        <h3 class="advanced-config__title">Color del Margen</h3>
        <div class="advanced-config__field">
          <input
            type="color"
            value={advanced.marginColor}
            onChange={(e) => handleMarginColorChange((e.target as HTMLInputElement).value)}
            class="advanced-config__color-input"
          />
          <span class="advanced-config__color-value">{advanced.marginColor}</span>
        </div>
      </div>

      <div class="advanced-config__section">
        <h3 class="advanced-config__title">Vista de Depuración</h3>
        <div class="advanced-config__field">
          <label class="advanced-config__checkbox-label">
            <input
              type="checkbox"
              checked={advanced.debugView}
              onChange={handleDebugToggle}
            />
            Mostrar estructura de módulos
          </label>
        </div>
      </div>
    </div>
  );
}